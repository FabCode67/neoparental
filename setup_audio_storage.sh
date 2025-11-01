#!/bin/bash

# Setup Script for Audio Prediction Storage Feature
# Run this after implementing the new features

echo "🚀 Setting up Audio Prediction Storage..."
echo ""

# Navigate to backend directory
cd backend

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "🔧 Fixing bcrypt compatibility..."
pip install --upgrade bcrypt==4.0.1

echo ""
echo "📁 Creating uploads directory..."
mkdir -p uploads/audio

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update the BACKEND_API_URL in utils/api.ts with your backend URL"
echo "2. Start the backend server: python main.py"
echo "3. Test the endpoints at http://localhost:8000/docs"
echo "4. Run your Expo app and test recording/uploading audio"
echo ""
echo "📚 Read AUDIO_STORAGE_GUIDE.md for detailed documentation"
