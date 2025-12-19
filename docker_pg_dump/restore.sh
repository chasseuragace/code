#!/usr/bin/env bash
set -euo pipefail

# Restore a Postgres dump into the running Docker container database.
#
# Usage:
#   ./restore.sh <dump-file>

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump-file>" >&2
  exit 1
fi

DUMP_FILE="$1"

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "Dump file not found: ${DUMP_FILE}" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_PATH="${DUMP_FILE}"

# If a relative path is given, resolve it relative to the script directory for convenience.
if [[ "${DUMP_PATH}" != /* ]]; then
  DUMP_PATH="${SCRIPT_DIR}/${DUMP_PATH}"
fi

if [[ ! -f "${DUMP_PATH}" ]]; then
  echo "Resolved dump file not found: ${DUMP_PATH}" >&2
  exit 1
fi

echo "Restoring dump from: ${DUMP_PATH}" >&2

DOCKER_COMPOSE_CMD=${DOCKER_COMPOSE_CMD:-"docker compose"}

# Feed the dump into psql running inside the db service container.
${DOCKER_COMPOSE_CMD} exec -T db bash -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < "${DUMP_PATH}"

echo "Restore completed." >&2
