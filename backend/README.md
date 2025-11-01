# Neoparental Prediction API - Backend

A Python FastAPI application for user authentication and fraud detection predictions with MongoDB integration.

## Features

- ✅ User Registration & Login (JWT Authentication)
- ✅ CRUD Operations for Predictions
- ✅ Integration with External Prediction API
- ✅ MongoDB Database Storage
- ✅ Secure Password Hashing
- ✅ RESTful API Design

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The `.env` file is already configured with your MongoDB credentials. Update the `SECRET_KEY` for production:

```env
MONGODB_URI=mongodb+srv://fab:123@cluster0.iryvt6q.mongodb.net/
DB_NAME=fraud_detection_db
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PREDICTION_API_URL=https://neoparental-fast-api.onrender.com/predict
```

### 3. Run the Application

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <your_token>
```

### Predictions (All require Authentication)

#### Create Prediction
```http
POST /predictions/
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "input_data": {
    "feature1": "value1",
    "feature2": "value2"
  }
}
```

#### Get All Predictions
```http
GET /predictions/?skip=0&limit=10
Authorization: Bearer <your_token>
```

#### Get Single Prediction
```http
GET /predictions/{prediction_id}
Authorization: Bearer <your_token>
```

#### Update Prediction
```http
PUT /predictions/{prediction_id}
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "input_data": {
    "feature1": "new_value1",
    "feature2": "new_value2"
  }
}
```

#### Delete Prediction
```http
DELETE /predictions/{prediction_id}
Authorization: Bearer <your_token>
```

## Project Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── models.py                  # Pydantic models for request/response
├── database.py                # MongoDB connection and initialization
├── auth.py                    # Authentication utilities (JWT, passwords)
├── routes_auth.py             # Authentication routes (register, login)
├── routes_predictions.py      # Prediction CRUD routes
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## Database Collections

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "full_name": "John Doe",
  "hashed_password": "bcrypt_hash",
  "created_at": "datetime"
}
```

### Predictions Collection
```json
{
  "_id": "ObjectId",
  "user_id": "user_object_id",
  "input_data": {"feature1": "value1"},
  "prediction_result": {"prediction": "result"},
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Protected routes requiring authentication
- User-specific data isolation
- HTTPS/TLS support for MongoDB connection

## Testing

You can test the API using:
1. **Swagger UI**: http://localhost:8000/docs (Interactive)
2. **cURL**: Command line testing
3. **Postman**: API testing tool
4. **httpx** or **requests**: Python scripts

### Example Test Flow

1. Register a new user
2. Login to get JWT token
3. Use token to create predictions
4. Retrieve, update, or delete predictions

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (Delete)
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `503` - Service Unavailable (External API error)

## Production Deployment

For production:
1. Change `SECRET_KEY` to a strong random value
2. Set `DEBUG=False`
3. Configure specific CORS origins
4. Use environment variables for sensitive data
5. Set up proper SSL certificates
6. Use a production WSGI server (already using uvicorn)

## Troubleshooting

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check credentials in `.env` file
- Verify network connectivity

### External API Errors
- Check if the prediction API is accessible
- Verify the API URL is correct
- Check request/response format compatibility

## License

MIT
