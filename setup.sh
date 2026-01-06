#!/usr/bin/env bash
set -euo pipefail

# Simple production setup script
# Usage on server (in folder containing docker-compose.prod.yml and .env.prod):
#   chmod +x setup.sh
#   ./setup.sh

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[setup] ERROR: $COMPOSE_FILE not found in current directory" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[setup] WARNING: $ENV_FILE not found. Make sure required env vars are provided some other way." >&2
else
  echo "[setup] Using env file: $ENV_FILE"
fi

echo "[setup] Logging in to Docker Hub..."
if [ -z "$DOCKER_ACCESS_TOKEN" ] || [ "$DOCKER_ACCESS_TOKEN" = "change_me" ]; then
  echo "Error: DOCKER_ACCESS_TOKEN not set or still placeholder. Please set it in $ENV_FILE"
  exit 1
fi

echo "$DOCKER_ACCESS_TOKEN" | docker login -u chasseuragace --password-stdin

# Pull latest images defined in docker-compose.prod.yml
echo "[setup] Pulling images..."
docker compose -f "$COMPOSE_FILE" pull

# Start / update services in detached mode
# IMPORTANT: we do NOT use `down -v` anywhere to avoid volume/data loss.
echo "[setup] Starting services (up -d)..."
docker compose -f "$COMPOSE_FILE" up -d

# Show status
echo "[setup] Current service status:"
docker compose -f "$COMPOSE_FILE" ps

echo "[setup] Done. Backend and DB should now be running."
