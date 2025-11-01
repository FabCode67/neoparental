from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import os
import json
from pathlib import Path
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from models import (
    AudioPredictionCreate,
    AudioPredictionResponse,
    AudioPredictionListResponse
)
from database import get_database
from auth import get_current_user
from bson import ObjectId

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter(prefix="/audio-predictions", tags=["Audio Predictions"])

# Create uploads directory for temporary files (optional, can be removed if not needed)
UPLOAD_DIR = Path("uploads/audio")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/", response_model=AudioPredictionResponse, status_code=status.HTTP_201_CREATED)
async def save_audio_prediction(
    audio_file: UploadFile = File(...),
    prediction_result: str = Form(...),  # JSON string
    audio_size: Optional[int] = Form(None),
    audio_duration: Optional[float] = Form(None),
    user_id: str = Depends(get_current_user)
):
    """
    Save audio file to Cloudinary and its prediction result to database
    """
    db = get_database()
    
    try:
        # Parse prediction result JSON
        prediction_data = json.loads(prediction_result)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prediction_result JSON format"
        )
    
    # Generate unique public_id for Cloudinary
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(audio_file.filename).suffix.replace(".", "")
    public_id = f"audio_predictions/{user_id}_{timestamp}"
    
    # Read audio file content
    try:
        content = await audio_file.read()
        audio_size_bytes = audio_size or len(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read audio file: {str(e)}"
        )
    
    # Upload to Cloudinary
    try:
        # Upload audio file to Cloudinary
        upload_result = cloudinary.uploader.upload(
            content,
            resource_type="video",  # Cloudinary uses 'video' resource type for audio files
            public_id=public_id,
            folder="audio_predictions",
            format=file_extension,
            tags=[user_id, "audio_prediction"]
        )
        
        cloudinary_url = upload_result.get("secure_url")
        cloudinary_public_id = upload_result.get("public_id")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload audio to Cloudinary: {str(e)}"
        )
    
    # Save to database
    audio_prediction_doc = {
        "user_id": user_id,
        "audio_filename": audio_file.filename,
        "cloudinary_url": cloudinary_url,
        "cloudinary_public_id": cloudinary_public_id,
        "audio_size": audio_size_bytes,
        "audio_duration": audio_duration,
        "prediction_result": prediction_data,
        "created_at": datetime.utcnow()
    }
    
    result = db.audio_predictions.insert_one(audio_prediction_doc)
    
    return AudioPredictionResponse(
        id=str(result.inserted_id),
        user_id=user_id,
        audio_filename=audio_file.filename,
        audio_url=cloudinary_url,
        audio_size=audio_size_bytes,
        audio_duration=audio_duration,
        prediction_result=prediction_data,
        created_at=audio_prediction_doc["created_at"]
    )


@router.get("/", response_model=List[AudioPredictionListResponse])
async def get_audio_predictions(
    skip: int = 0,
    limit: int = 20,
    user_id: str = Depends(get_current_user)
):
    """
    Get all audio predictions for the current user
    """
    db = get_database()
    
    predictions = db.audio_predictions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).skip(skip).limit(limit)
    
    result = []
    for pred in predictions:
        # Extract predicted label and confidence from prediction result
        pred_result = pred.get("prediction_result", {})
        predicted_label = pred_result.get("predicted_label") or pred_result.get("output")
        confidence = pred_result.get("confidence")
        cloudinary_url = pred.get("cloudinary_url")
        
        result.append(
            AudioPredictionListResponse(
                id=str(pred["_id"]),
                audio_filename=pred["audio_filename"],
                audio_url=cloudinary_url or "",
                predicted_label=predicted_label,
                confidence=confidence,
                created_at=pred["created_at"]
            )
        )
    
    return result


@router.get("/{prediction_id}", response_model=AudioPredictionResponse)
async def get_audio_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get a specific audio prediction by ID
    """
    db = get_database()
    
    try:
        prediction = db.audio_predictions.find_one({
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
            detail="Audio prediction not found"
        )
    
    return AudioPredictionResponse(
        id=str(prediction["_id"]),
        user_id=prediction["user_id"],
        audio_filename=prediction["audio_filename"],
        audio_url=prediction.get("cloudinary_url"),
        audio_size=prediction.get("audio_size"),
        audio_duration=prediction.get("audio_duration"),
        prediction_result=prediction["prediction_result"],
        created_at=prediction["created_at"]
    )


@router.get("/{prediction_id}/audio")
async def get_audio_file(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Get the Cloudinary URL for the audio file
    """
    from fastapi.responses import RedirectResponse
    
    db = get_database()
    
    try:
        prediction = db.audio_predictions.find_one({
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
            detail="Audio prediction not found"
        )
    
    cloudinary_url = prediction.get("cloudinary_url")
    
    if not cloudinary_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file URL not found"
        )
    
    # Redirect to Cloudinary URL
    return RedirectResponse(url=cloudinary_url)


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_audio_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a specific audio prediction from database and Cloudinary
    """
    db = get_database()
    
    try:
        prediction = db.audio_predictions.find_one({
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
            detail="Audio prediction not found"
        )
    
    # Delete from Cloudinary
    cloudinary_public_id = prediction.get("cloudinary_public_id")
    if cloudinary_public_id:
        try:
            cloudinary.uploader.destroy(
                cloudinary_public_id,
                resource_type="video"
            )
        except Exception as e:
            print(f"Warning: Could not delete audio file from Cloudinary: {e}")
    
    # Delete from database
    db.audio_predictions.delete_one({"_id": ObjectId(prediction_id)})
    
    return None


@router.get("/stats/summary")
async def get_prediction_stats(
    user_id: str = Depends(get_current_user)
):
    """
    Get statistics about user's audio predictions
    """
    db = get_database()
    
    # Count total predictions
    total_count = db.audio_predictions.count_documents({"user_id": user_id})
    
    # Get predictions grouped by label
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$prediction_result.predicted_label",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    label_counts = list(db.audio_predictions.aggregate(pipeline))
    
    # Calculate average confidence
    pipeline_confidence = [
        {"$match": {"user_id": user_id, "prediction_result.confidence": {"$exists": True}}},
        {"$group": {
            "_id": None,
            "avg_confidence": {"$avg": "$prediction_result.confidence"}
        }}
    ]
    
    confidence_result = list(db.audio_predictions.aggregate(pipeline_confidence))
    avg_confidence = confidence_result[0]["avg_confidence"] if confidence_result else 0
    
    return {
        "total_predictions": total_count,
        "predictions_by_label": [
            {"label": item["_id"], "count": item["count"]}
            for item in label_counts
        ],
        "average_confidence": round(avg_confidence, 2) if avg_confidence else 0
    }
