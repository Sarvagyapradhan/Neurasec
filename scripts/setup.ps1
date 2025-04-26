# PowerShell Script for setting up the Django backend on Windows

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists, if not, copy from example
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from example..."
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit the .env file with your settings."
}

# Run migrations
Write-Host "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create admin user
Write-Host "Creating admin user if needed..."
python manage.py create_admin

Write-Host "Setup complete! You can now run the server with:"
Write-Host "python run.py" 