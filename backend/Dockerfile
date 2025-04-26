FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better cache utilization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose the port that Django will run on
EXPOSE 8000

# Use entrypoint script to handle migrations and startup
ENTRYPOINT ["./entrypoint.sh"]

# Run command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "neurasec.wsgi:application"] 