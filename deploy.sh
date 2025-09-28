#!/bin/bash

# Deployment script for Render
echo "🚀 Starting deployment process..."

# Build backend
echo "📦 Building backend..."
cd backend
npm ci --only=production
npm run build
cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "✅ Deployment build complete!"