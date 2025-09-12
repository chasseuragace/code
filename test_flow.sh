    #!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

# Interactive prompts (with sensible defaults)
read -r -p "Rebuild server image? [y/N]: " REBUILD_INPUT || true
REBUILD_INPUT=${REBUILD_INPUT:-N}
read -r -p "Clear database (drop volumes)? [Y/n]: " CLEAR_DB_INPUT || true
CLEAR_DB_INPUT=${CLEAR_DB_INPUT:-Y}

# Normalize to uppercase portable way
REBUILD_UPPER=$(printf "%s" "$REBUILD_INPUT" | tr '[:lower:]' '[:upper:]')
CLEAR_DB_UPPER=$(printf "%s" "$CLEAR_DB_INPUT" | tr '[:lower:]' '[:upper:]')

if [[ "$CLEAR_DB_UPPER" == "Y" ]]; then
  echo "[1/4] Bringing stack down and clearing DB volumes..."
  docker compose down --volumes --remove-orphans
else
  echo "[1/4] Skipping DB clear (as requested). Bringing stack down (no volumes removed)..."
  docker compose down --remove-orphans || true
fi

if [[ "$REBUILD_UPPER" == "Y" ]]; then
  echo "[2/4] Starting stack with rebuild..."
  docker compose up -d --build
else
  echo "[2/4] Starting stack without rebuild..."
  docker compose up -d
fi

echo "[3/4] Waiting for Postgres to be healthy..."
# Wait until pg_isready succeeds inside the db service
for i in {1..60}; do
  if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
    echo "Postgres is healthy"
    break
  fi
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo "Database did not become healthy in time" >&2
    exit 1
  fi
done

echo "[4/4] Running production-like flow tests (E2E) ..."
# Run controller-level E2E flows
docker compose exec -T server npm test -- --runInBand e2e.flow.spec.ts

echo "All flow tests completed successfully."
