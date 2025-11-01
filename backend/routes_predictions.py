from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv
from models import PredictionCreate, PredictionResponse
from database import get_database
from auth import get_current_user
from bson import ObjectId

load_dotenv()

PREDICTION_API_URL = os.getenv("PREDICTION_API_URL")

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    prediction: PredictionCreate,
    user_id: str = Depends(get_current_user)
):
    """
    Create a new prediction by calling the external API and saving the result
    """
    db = get_database()
    
    try:
        # Call external prediction API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PREDICTION_API_URL,
                json=prediction.input_data
            )
            response.raise_for_status()
            prediction_result = response.json()
    
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to get prediction from API: {str(e)}"
        )
    
    # Save prediction to database
    prediction_doc = {
        "user_id": user_id,
        "input_data": prediction.input_data,
        "prediction_result": prediction_result,
        "created_at": datetime.utcnow()
    }
    
    result = db.predictions.insert_one(prediction_doc)
    
    return PredictionResponse(
        id=str(result.inserted_id),
        user_id=user_id,
        input_data=prediction.input_data,
        prediction_result=prediction_result,
        created_at=prediction_doc["created_at"]
    )


@router.get("/", response_model=List[PredictionResponse])
async def get_predictions(
    skip: int = 0,
    limit: int = 10,
    user_id: str = Depends(get_current_user)
):
    """
    Get all predictions for the current user
    """
    db = get_database()
    
    predictions = db.predictions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    return [
        PredictionResponse(
            id=str(pred["_id"]),
            user_id=pred["user_id"],
            input_data=pred["input_data"],
            prediction_result=pred["prediction_result"],
            created_at=pred["created_at"]
        )
        for pred in predictions
    ]


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get a specific prediction by ID
    """
    db = get_database()
    
    try:
        prediction = db.predictions.find_one({
            "_id": ObjectId(prediction_id),
            "user_id": user_id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction ID"
        )
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    return PredictionResponse(
        id=str(prediction["_id"]),
        user_id=prediction["user_id"],
        input_data=prediction["input_data"],
        prediction_result=prediction["prediction_result"],
        created_at=prediction["created_at"]
    )


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a specific prediction
    """
    db = get_database()
    
    try:
        result = db.predictions.delete_one({
            "_id": ObjectId(prediction_id),
            "user_id": user_id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    return None


@router.put("/{prediction_id}", response_model=PredictionResponse)
async def update_prediction(
    prediction_id: str,
    prediction: PredictionCreate,
    user_id: str = Depends(get_current_user)
):
    """
    Update a prediction (re-run with new input data)
    """
    db = get_database()
    
    # Check if prediction exists
    try:
        existing = db.predictions.find_one({
            "_id": ObjectId(prediction_id),
            "user_id": user_id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction ID"
        )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Call external prediction API with new data
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                PREDICTION_API_URL,
                json=prediction.input_data
            )
            response.raise_for_status()
            prediction_result = response.json()
    
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to get prediction from API: {str(e)}"
        )
    
    # Update prediction in database
    update_doc = {
        "input_data": prediction.input_data,
        "prediction_result": prediction_result,
        "updated_at": datetime.utcnow()
    }
    
    db.predictions.update_one(
        {"_id": ObjectId(prediction_id)},
        {"$set": update_doc}
    )
    
    # Fetch updated prediction
    updated_prediction = db.predictions.find_one({"_id": ObjectId(prediction_id)})
    
    return PredictionResponse(
        id=str(updated_prediction["_id"]),
        user_id=updated_prediction["user_id"],
        input_data=updated_prediction["input_data"],
        prediction_result=updated_prediction["prediction_result"],
        created_at=updated_prediction["created_at"]
    )
