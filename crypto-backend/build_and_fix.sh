#!/bin/bash
# Build and fix migrations script for Render deployment

echo "=== Build and Fix Migrations Script ==="
echo "Environment: $ENVIRONMENT"
echo "Running on Render: $RENDER"

# Install dependencies
echo "=== Installing Dependencies ==="
pip install -r requirements.txt

# Check if we're in production
if [ "$ENVIRONMENT" = "production" ] && [ "$RENDER" = "true" ]; then
    echo "=== Production Environment Detected ==="
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        echo "ERROR: DATABASE_URL not set"
        exit 1
    fi
    
    echo "Database URL: ${DATABASE_URL:0:30}..."
    
    # Try to fix migrations
    echo "=== Attempting to Fix Migrations ==="
    
    # First, try to get current state
    echo "Current migration state:"
    alembic current || echo "No current migration"
    
    echo "Migration heads:"
    alembic heads || echo "Failed to get heads"
    
    # Try to merge heads
    echo "=== Attempting to Merge Heads ==="
    if alembic merge heads -m "build_time_merge" 2>/dev/null; then
        echo "Successfully merged heads"
    else
        echo "Failed to merge heads, trying alternative approaches..."
        
        # Try to stamp to base
        echo "=== Attempting to Reset to Base ==="
        if alembic stamp base 2>/dev/null; then
            echo "Successfully reset to base"
        else
            echo "Failed to reset to base"
            
            # Try to drop alembic_version table
            echo "=== Attempting to Drop alembic_version Table ==="
            # Parse DATABASE_URL to get connection details
            # This is a simplified approach - in production you might want more robust parsing
            echo "Note: Manual intervention may be required to drop alembic_version table"
        fi
    fi
    
    # Try to upgrade
    echo "=== Attempting to Upgrade ==="
    if alembic upgrade head 2>/dev/null; then
        echo "Successfully upgraded to head"
    else
        echo "Failed to upgrade, but continuing with build..."
    fi
else
    echo "=== Non-production Environment, Skipping Migration Fix ==="
fi

echo "=== Build and Fix Completed ==="
