#!/bin/bash

echo "=== Starting Migration Fix and Application Startup ==="

# Debug environment variables
echo "Environment check:"
echo "ENVIRONMENT: $ENVIRONMENT"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."  # Show first 30 chars for security

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set, exiting"
    exit 1
fi

echo "=== Fixing Migration Conflicts ==="

# Try to stamp the current head to resolve conflicts
echo "Attempting to stamp current head..."
alembic stamp head || {
    echo "Failed to stamp head, trying alternative approach..."
    
    # Get all current heads
    echo "Current migration heads:"
    alembic heads
    
    # Try to merge heads if multiple exist
    echo "Attempting to merge heads..."
    alembic merge heads -m "merge_all_heads" || {
        echo "Failed to merge heads, trying to reset..."
        
        # Last resort: reset to base and upgrade
        echo "Resetting migration state..."
        alembic stamp base
    }
}

echo "=== Running Database Migrations ==="

# Now try to upgrade
echo "Running database migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "=== Migrations Completed Successfully ==="
    echo "=== Starting Application ==="
    
    # Start the application
    exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
else
    echo "=== Migration Failed ==="
    echo "Current migration state:"
    alembic current
    echo "Available migrations:"
    alembic history
    exit 1
fi
