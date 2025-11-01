#!/bin/bash

# NeoParental iOS Setup Script
# This script helps set up the app for iOS development

echo "================================================"
echo "   NeoParental App - iOS Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: This script is for macOS only${NC}"
    echo "   iOS development requires a Mac computer"
    exit 1
fi

echo -e "${BLUE}📱 Checking prerequisites...${NC}"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✅ Node.js installed:${NC} $(node -v)"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm installed:${NC} $(npm -v)"
fi

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${YELLOW}⚠️  Xcode is not installed${NC}"
    echo "   Install Xcode from the Mac App Store"
    echo "   Then run: xcode-select --install"
else
    echo -e "${GREEN}✅ Xcode installed:${NC} $(xcodebuild -version | head -n 1)"
fi

# Check for CocoaPods
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠️  CocoaPods is not installed${NC}"
    echo "   Installing CocoaPods..."
    sudo gem install cocoapods
else
    echo -e "${GREEN}✅ CocoaPods installed:${NC} $(pod --version)"
fi

echo ""
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

# Get local IP address
echo ""
echo -e "${BLUE}🌐 Network Information${NC}"
LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not determine local IP address${NC}"
    echo "   Run 'ifconfig' to find your IP address manually"
else
    echo -e "${GREEN}   Your local IP address: ${LOCAL_IP}${NC}"
    echo "   Use this for physical device testing:"
    echo "   http://${LOCAL_IP}:8000"
fi

echo ""
echo -e "${BLUE}🎯 Setup Options${NC}"
echo ""
echo "Choose your setup:"
echo "1) iOS Simulator (recommended for development)"
echo "2) Physical iPhone (requires Expo Go app)"
echo "3) Skip and show instructions"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Starting Expo for iOS Simulator...${NC}"
        echo ""
        echo "The iOS Simulator will launch automatically."
        echo "If it doesn't open, press 'i' in the Expo terminal."
        echo ""
        npm run ios
        ;;
    2)
        echo ""
        echo -e "${BLUE}📱 Setting up for Physical Device${NC}"
        echo ""
        echo "Follow these steps:"
        echo ""
        echo "1. Install 'Expo Go' from the App Store on your iPhone"
        echo ""
        echo "2. Make sure your iPhone and Mac are on the same WiFi"
        echo ""
        echo "3. Update backend URL in the app (if needed):"
        echo "   - Open app/login.tsx"
        echo "   - Update BACKEND_URL to: http://${LOCAL_IP}:8000"
        echo ""
        echo "4. Start Expo server:"
        echo "   npm start"
        echo ""
        echo "5. Scan QR code with your iPhone camera"
        echo ""
        read -p "Press Enter to start Expo server..." 
        npm start
        ;;
    3)
        echo ""
        echo -e "${GREEN}📚 Setup Complete!${NC}"
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice${NC}"
        ;;
esac

echo ""
echo "================================================"
echo -e "${GREEN}✨ Setup Information${NC}"
echo "================================================"
echo ""
echo "📖 Documentation:"
echo "   - IOS_SETUP_GUIDE.md - Complete iOS setup guide"
echo "   - AUTH_FLOW_REFERENCE.md - Authentication flow reference"
echo ""
echo "🚀 Quick Commands:"
echo "   npm start          - Start Expo development server"
echo "   npm run ios        - Run on iOS Simulator"
echo "   npm run android    - Run on Android Emulator"
echo "   npm run web        - Run in web browser"
echo ""
echo "🔧 Backend Setup:"
echo "   cd backend"
echo "   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "📱 Physical Device:"
echo "   1. Install Expo Go on iPhone"
echo "   2. Connect to same WiFi as Mac"
echo "   3. Update backend URL to: http://${LOCAL_IP}:8000"
echo "   4. Scan QR code with camera"
echo ""
echo "🆘 Need Help?"
echo "   - Check IOS_SETUP_GUIDE.md for troubleshooting"
echo "   - Review AUTH_FLOW_REFERENCE.md for auth issues"
echo "   - Expo docs: https://docs.expo.dev/"
echo ""
echo "================================================"
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo "================================================"
