#!/bin/bash

# Run migrations
echo "Applying database migrations..."
python manage.py migrate

# Create admin user if it doesn't exist
echo "Creating admin user if needed..."
python manage.py create_admin

# Start server
echo "Starting server..."
exec "$@" 