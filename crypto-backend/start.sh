#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting MotionFalcon backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
