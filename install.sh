#!/bin/bash

# WhatsApp Bulk Sender - Installation Script for Linux/macOS
# This script installs and sets up the WhatsApp Bulk Sender application

set -e

echo "🚀 WhatsApp Bulk Sender - Installation Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    print_status "Checking MongoDB installation..."
    if command -v mongod &> /dev/null; then
        print_status "MongoDB found"
        return 0
    else
        print_warning "MongoDB is not installed. The application requires MongoDB to run."
        echo "Please install MongoDB from https://www.mongodb.com/try/download/community"
        echo "Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
        read -p "Do you want to continue without MongoDB? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs uploads sessions backend/logs backend/uploads
    print_status "Directories created successfully"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_status "Environment file created from template"
        else
            print_warning "No environment template found. Creating basic .env file..."
            cat > .env << EOF
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/whatsapp_bulk
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
DEFAULT_MESSAGE_DELAY=10
MAX_RETRY_ATTEMPTS=3
EOF
        fi
    else
        print_status "Environment file already exists"
    fi
}

# Start MongoDB if available
start_mongodb() {
    if command -v mongod &> /dev/null; then
        print_status "Starting MongoDB..."
        if ! pgrep -x "mongod" > /dev/null; then
            mongod --fork --logpath logs/mongodb.log --dbpath ./data/db 2>/dev/null || {
                print_warning "Could not start MongoDB automatically. Please start it manually."
            }
        else
            print_status "MongoDB is already running"
        fi
    fi
}

# Main installation function
main() {
    echo "Starting installation process..."
    echo
    
    check_nodejs
    check_npm
    check_mongodb
    create_directories
    install_dependencies
    setup_environment
    
    echo
    print_status "Installation completed successfully! 🎉"
    echo
    echo "Next steps:"
    echo "1. Make sure MongoDB is running"
    echo "2. Start the application with: npm start"
    echo "3. Open your browser to: http://localhost:3000"
    echo
    echo "For development mode, use: npm run dev"
    echo
    print_warning "Remember: This is an educational application only!"
    echo "Do not use for actual bulk messaging or spam."
}

# Run main function
main "$@"
