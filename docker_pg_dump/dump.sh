#!/usr/bin/env bash
set -euo pipefail

# Dump the Postgres database from the running Docker container.
#
# Usage:
#   ./dump.sh [output-file]
#
# If no output file is provided, a timestamped file will be created in this directory.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUTPUT_FILE="${1:-}" 
if [[ -z "${OUTPUT_FILE}" ]]; then
  TS="$(date +"%Y%m%d_%H%M%S")"
  OUTPUT_FILE="${SCRIPT_DIR}/pg_dump_${TS}.sql"
fi

echo "Creating dump: ${OUTPUT_FILE}" >&2

# Run pg_dump inside the db service container using its environment variables.
# This assumes docker-compose.yml defines a service named "db" with POSTGRES_USER and POSTGRES_DB.

# Prefer `docker compose` but allow overriding via DOCKER_COMPOSE_CMD if needed.
DOCKER_COMPOSE_CMD=${DOCKER_COMPOSE_CMD:-"docker compose"}

${DOCKER_COMPOSE_CMD} exec -T db bash -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "${OUTPUT_FILE}"

echo "Dump completed." >&2
