# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/appuser/.local/bin:$PATH"

# Set work directory
WORKDIR /app


COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .


# Expose port
EXPOSE 8000

# Default command (use gunicorn in production, runserver only for dev)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
