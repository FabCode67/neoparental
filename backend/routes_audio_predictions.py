from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import os
import json
from pathlib import Path
from models import (
    AudioPredictionCreate,
    AudioPredictionResponse,
    AudioPredictionListResponse
)
from database import get_database
from auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/audio-predictions", tags=["Audio Predictions"])

# Create uploads directory if it doesn't exist
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
    Save audio file and its prediction result to database
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
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(audio_file.filename).suffix
    unique_filename = f"{user_id}_{timestamp}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save audio file
    try:
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save audio file: {str(e)}"
        )
    
    # Save to database
    audio_prediction_doc = {
        "user_id": user_id,
        "audio_filename": audio_file.filename,
        "audio_stored_filename": unique_filename,
        "audio_path": str(file_path),
        "audio_size": audio_size or len(content),
        "audio_duration": audio_duration,
        "prediction_result": prediction_data,
        "created_at": datetime.utcnow()
    }
    
    result = db.audio_predictions.insert_one(audio_prediction_doc)
    
    # Generate audio URL (you can customize this based on your setup)
    audio_url = f"/audio-predictions/{str(result.inserted_id)}/audio"
    
    return AudioPredictionResponse(
        id=str(result.inserted_id),
        user_id=user_id,
        audio_filename=audio_file.filename,
        audio_url=audio_url,
        audio_size=audio_prediction_doc["audio_size"],
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
        
        result.append(
            AudioPredictionListResponse(
                id=str(pred["_id"]),
                audio_filename=pred["audio_filename"],
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
    
    audio_url = f"/audio-predictions/{prediction_id}/audio"
    
    return AudioPredictionResponse(
        id=str(prediction["_id"]),
        user_id=prediction["user_id"],
        audio_filename=prediction["audio_filename"],
        audio_url=audio_url,
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
    Download the audio file for a specific prediction
    """
    from fastapi.responses import FileResponse
    
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
    
    audio_path = Path(prediction["audio_path"])
    
    if not audio_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found on server"
        )
    
    return FileResponse(
        path=audio_path,
        media_type="audio/mpeg",
        filename=prediction["audio_filename"]
    )


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_audio_prediction(
    prediction_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Delete a specific audio prediction and its file
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
    
    # Delete audio file
    audio_path = Path(prediction["audio_path"])
    if audio_path.exists():
        try:
            audio_path.unlink()
        except Exception as e:
            print(f"Warning: Could not delete audio file: {e}")
    
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
