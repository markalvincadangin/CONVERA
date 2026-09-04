# CONVERA Backend Service Dockerfile (Profile 3: Self-Hosted Container)
FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    SQLITE_PATH=/data/convera.db \
    PORT=8000 \
    HOST=0.0.0.0

# Install runtime system packages: sqlite3 for backups/integrity and curl for healthcheck probes
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Create directory for persistent SQLite database and WAL files
RUN mkdir -p /data

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY . .

# Expose HTTP port
EXPOSE 8000

# Container healthcheck probe against canonical API health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Launch uvicorn production server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
