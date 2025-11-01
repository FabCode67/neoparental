from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from models import UserRegister, UserLogin, UserResponse, Token
from database import get_database
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user document
    user_doc = {
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    # Insert user
    result = db.users.insert_one(user_doc)
    
    # Return user response
    return UserResponse(
        id=str(result.inserted_id),
        email=user.email,
        full_name=user.full_name,
        created_at=user_doc["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """Login user and return JWT token"""
    db = get_database()
    
    # Find user
    db_user = db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user["_id"])},
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user_id: str = Depends(lambda x: x)):
    """Get current user information"""
    from auth import get_current_user
    user_id = Depends(get_current_user)
    
    db = get_database()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"]
    )
