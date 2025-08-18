#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Debug environment variables
echo "Environment check:"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."  # Show first 30 chars for security

# Run database migrations only if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Running database migrations..."
    alembic upgrade head
else
    echo "ERROR: DATABASE_URL not set, skipping migrations"
    exit 1
fi

# Start the application
echo "Starting MotionFalcon backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
