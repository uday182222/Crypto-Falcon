#!/bin/bash
# Quick migration fix script for Render deployment
# Run this in Render's shell if the Python scripts fail

echo "=== Quick Migration Fix Script ==="
echo "Environment: $ENVIRONMENT"
echo "Running on Render: $RENDER"

# Check if we're in the right directory
if [ ! -f "alembic.ini" ]; then
    echo "Error: Not in the right directory. Please run this from the crypto-backend directory."
    exit 1
fi

# Check current migration state
echo "=== Current Migration State ==="
alembic current
alembic heads

# Try to merge heads
echo "=== Attempting to Merge Heads ==="
if alembic merge heads -m "quick_fix_merge"; then
    echo "Successfully merged heads"
    
    # Now try to upgrade
    echo "=== Running Migrations ==="
    if alembic upgrade head; then
        echo "=== Migrations Completed Successfully ==="
        echo "You can now start the application with:"
        echo "uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
    else
        echo "=== Migration Failed After Merge ==="
        echo "Current state:"
        alembic current
        exit 1
    fi
else
    echo "=== Merge Failed, Trying Alternative Approach ==="
    
    # Get the latest revision
    LATEST_REV=$(alembic heads | tail -n 1 | awk '{print $1}')
    echo "Latest revision: $LATEST_REV"
    
    # Try to stamp to the latest revision
    if alembic stamp "$LATEST_REV"; then
        echo "Successfully stamped to $LATEST_REV"
        
        # Now try to upgrade
        if alembic upgrade head; then
            echo "=== Migrations Completed Successfully ==="
            echo "You can now start the application with:"
            echo "uvicorn app.main:app --host 0.0.0.0 --port \$PORT"
        else
            echo "=== Migration Failed After Stamping ==="
            exit 1
        fi
    else
        echo "=== All Automatic Fixes Failed ==="
        echo "Manual intervention required. Consider:"
        echo "1. Running: alembic stamp base"
        echo "2. Then: alembic upgrade head"
        echo "3. Or dropping alembic_version table and recreating"
        exit 1
    fi
fi
