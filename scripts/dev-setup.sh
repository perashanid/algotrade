#!/bin/bash

# Development setup script for Algorithmic Trading Platform

set -e

echo "🛠️ Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start development databases
echo "🗄️ Starting development databases..."
docker-compose up -d postgres redis

echo "⏳ Waiting for databases to be ready..."
sleep 10

# Run database migrations
echo "🔧 Running database migrations..."
cd backend
npm run migrate
cd ..

echo "✅ Development environment setup completed!"
echo ""
echo "🚀 To start development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:3001/api"
echo "🏥 Health check: http://localhost:3001/api/health"