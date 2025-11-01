from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_database
from routes_auth import router as auth_router
from routes_predictions import router as predictions_router
from routes_audio_predictions import router as audio_predictions_router
import os
from dotenv import load_dotenv

load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Neoparental Prediction API",
    description="API for user authentication and audio cry predictions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_database()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Error initializing database: {e}")

# Include routers
app.include_router(auth_router)
app.include_router(predictions_router)
app.include_router(audio_predictions_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Neoparental Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth",
            "predictions": "/predictions",
            "audio_predictions": "/audio-predictions",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    debug = os.getenv("DEBUG", "False").lower() == "true"
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=debug
    )
