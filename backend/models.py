from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    access_token: str
    token_type: str


# Prediction Models (Legacy - keep for backward compatibility)
class PredictionCreate(BaseModel):
    input_data: Dict[str, Any]


class PredictionResponse(BaseModel):
    id: str
    user_id: str
    input_data: Dict[str, Any]
    prediction_result: Dict[str, Any]
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}


# Audio Prediction Models (New)
class AudioPredictionCreate(BaseModel):
    """Model for creating audio prediction with results"""
    audio_filename: str
    audio_size: Optional[int] = None
    audio_duration: Optional[float] = None
    prediction_result: Dict[str, Any]
    
    class Config:
        json_encoders = {ObjectId: str}


class AudioPredictionResponse(BaseModel):
    """Model for audio prediction response"""
    id: str
    user_id: str
    audio_filename: str
    audio_url: str
    audio_size: Optional[int] = None
    audio_duration: Optional[float] = None
    prediction_result: Dict[str, Any]
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}


class AudioPredictionListResponse(BaseModel):
    """Model for listing audio predictions"""
    id: str
    audio_filename: str
    audio_url: str
    predicted_label: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime

    class Config:
        json_encoders = {ObjectId: str}
