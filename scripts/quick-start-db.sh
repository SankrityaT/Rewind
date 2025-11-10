#!/bin/bash
# Quick start script for PostgreSQL database setup

echo "🚀 Setting up PostgreSQL database for MemoryOS..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if container already exists
if [ "$(docker ps -aq -f name=memoryos-postgres)" ]; then
    echo "⚠️  Container 'memoryos-postgres' already exists."
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing container..."
        docker rm -f memoryos-postgres
    else
        echo "ℹ️  Keeping existing container. Starting it if stopped..."
        docker start memoryos-postgres
        exit 0
    fi
fi

# Generate random password
PASSWORD=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-16)

echo "📦 Starting PostgreSQL 17 container..."
docker run --name memoryos-postgres \
  -e POSTGRES_PASSWORD=$PASSWORD \
  -e POSTGRES_DB=memoryos \
  -e POSTGRES_USER=memoryos \
  -p 5432:5432 \
  -d postgres:17

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if container is running
if [ "$(docker ps -q -f name=memoryos-postgres)" ]; then
    echo ""
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "📝 Add this to your .env.local file:"
    echo ""
    echo "DATABASE_URL=postgresql://memoryos:${PASSWORD}@localhost:5432/memoryos"
    echo ""
    echo "🔧 Next steps:"
    echo "  1. Copy the DATABASE_URL above to your .env.local"
    echo "  2. Run: npm install pg @types/pg tsx"
    echo "  3. Run: npx tsx scripts/setup-database.ts"
    echo ""
    echo "🛑 To stop: docker stop memoryos-postgres"
    echo "🔄 To restart: docker start memoryos-postgres"
    echo "🗑️  To remove: docker rm -f memoryos-postgres"
else
    echo "❌ Failed to start PostgreSQL container"
    exit 1
fi
