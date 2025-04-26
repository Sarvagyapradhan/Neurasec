#!/bin/bash

# Make sure the entrypoint script is executable
chmod +x entrypoint.sh

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
if [ -d "venv/bin" ]; then
    # Linux/macOS
    source venv/bin/activate
elif [ -d "venv/Scripts" ]; then
    # Windows with Git Bash
    source venv/Scripts/activate
else
    echo "Could not find virtual environment activation script."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists, if not, copy from example
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit the .env file with your settings."
fi

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create admin user
echo "Creating admin user if needed..."
python manage.py create_admin

echo "Setup complete! You can now run the server with:"
echo "python run.py" 