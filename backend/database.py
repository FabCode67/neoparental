from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")


def get_database():
    """Get MongoDB database connection"""
    try:
        client = MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            tls=True,
            tlsAllowInvalidCertificates=True
        )
        # Test connection
        client.server_info()
        db = client[DB_NAME]
        return db
    except ServerSelectionTimeoutError as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


def init_database():
    """Initialize database collections and indexes"""
    db = get_database()
    
    # Create collections if they don't exist
    if "users" not in db.list_collection_names():
        db.create_collection("users")
        # Create unique index on email
        db.users.create_index("email", unique=True)
    
    if "predictions" not in db.list_collection_names():
        db.create_collection("predictions")
        # Create index on user_id for faster queries
        db.predictions.create_index("user_id")
    
    if "audio_predictions" not in db.list_collection_names():
        db.create_collection("audio_predictions")
        # Create index on user_id for faster queries
        db.audio_predictions.create_index("user_id")
        # Create index on created_at for sorting
        db.audio_predictions.create_index([("created_at", -1)])
    
    return db
