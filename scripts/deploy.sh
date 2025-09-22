#!/bin/bash

# Deployment script for Algorithmic Trading Platform

set -e

echo "🚀 Starting deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🗄️ Starting database services..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npm run migrate

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "🔍 Checking service health..."
sleep 30

# Check if services are healthy
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy\|Exit"; then
    echo "❌ Some services are not healthy. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3001/api"
echo "🏥 Health check: http://localhost:3001/api/health"

echo ""
echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps