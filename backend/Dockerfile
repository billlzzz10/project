# Dockerfile for Flask backend (AI Business App)
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Flask port
EXPOSE 5001

# Set environment variables (override in production as needed)
ENV FLASK_APP=run.py
ENV FLASK_ENV=production

# Run the Flask app
CMD ["python", "run.py"]
