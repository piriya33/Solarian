# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build and Run FastAPI Backend
# ==========================================
FROM python:3.11-slim

# Install system build dependencies for pyswisseph
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and ephemeris tables
COPY backend/ ./backend/
COPY ephe/ ./ephe/

# Copy built frontend assets to the directory mounted in backend/main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (default 8000, compatible with PORT env on Railway / Render / Fly)
EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Command to run uvicorn (exec form with shell expansion for PORT)
CMD ["sh", "-c", "exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
