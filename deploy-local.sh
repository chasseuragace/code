#!/usr/bin/env bash
set -euo pipefail

# Simple local "prod-like" deploy script
# - Builds the NestJS server
# - Builds a Docker image
# - Removes dangling Docker images
# - Runs the image as a fresh container

IMAGE_NAME="agency-service"
IMAGE_TAG="local-prod"
FULL_TAG="$IMAGE_NAME:$IMAGE_TAG"
CONTAINER_NAME="agency_service_local"

# Optional: env file to mimic production envs
# You can override with: ENV_FILE=./.env.docker ./deploy-local.sh
ENV_FILE="${ENV_FILE:-.env.docker}"

echo "[deploy-local] Building app (npm run build)..."
npm install
npm run build

echo "[deploy-local] Building Docker image: $FULL_TAG ..."
docker build -t "$FULL_TAG" .

echo "[deploy-local] Removing dangling Docker images..."
docker image prune -f

echo "[deploy-local] Stopping existing container (if any): $CONTAINER_NAME ..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Build docker run args
DOCKER_RUN_ARGS=("--name" "$CONTAINER_NAME" "-p" "3000:3000")

if [ -f "$ENV_FILE" ]; then
  echo "[deploy-local] Using env file: $ENV_FILE"
  DOCKER_RUN_ARGS+=("--env-file" "$ENV_FILE")
else
  echo "[deploy-local] No env file found at $ENV_FILE (continuing without --env-file)"
fi

echo "[deploy-local] Running container: $FULL_TAG ..."
docker run "${DOCKER_RUN_ARGS[@]}" "$FULL_TAG"
