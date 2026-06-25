#!/usr/bin/env bash
# Deploy script for staging or production environments.
# Usage: deploy.sh <staging|production>
set -euo pipefail
ENV="${1:-staging}"
COMPOSE_FILE="deployment/${ENV}/docker-compose.yml"
echo "🚀 Deploying Bodaboda to ${ENV} (image tag: ${IMAGE_TAG:-latest})"
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi
if [[ ! -f "monitoring/prometheus.yml" ]]; then
  echo "Monitoring config not found at monitoring/prometheus.yml" >&2
  exit 1
fi
: "${REGISTRY:?REGISTRY is required, for example ghcr.io/owner}"
: "${JWT_SECRET:?JWT_SECRET is required}"
if [[ -n "${REGISTRY_USERNAME:-}" && -n "${REGISTRY_PASSWORD:-}" ]]; then
  echo "$REGISTRY_PASSWORD" | docker login ghcr.io -u "$REGISTRY_USERNAME" --password-stdin
fi
docker compose -f "$COMPOSE_FILE" config >/dev/null
docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
echo "⏳ Waiting for backend to become healthy..."
for i in $(seq 1 30); do
  if curl -fsS http://localhost:8080/actuator/health >/dev/null; then
    echo "✅ Backend is healthy."
    docker image prune -f >/dev/null || true
    echo "📋 Recent backend logs:"
    docker compose -f "$COMPOSE_FILE" logs --tail=30 backend || true
    echo "✅ Deployment to ${ENV} complete."
    exit 0
  fi
  sleep 3
done
echo "Backend did not become healthy in time." >&2
docker compose -f "$COMPOSE_FILE" logs --tail=30 backend || true
if [[ -n "${PREVIOUS_IMAGE_TAG:-}" ]]; then
  echo "↩️ Rolling back ${ENV} to previous image tag: ${PREVIOUS_IMAGE_TAG}" >&2
  export IMAGE_TAG="$PREVIOUS_IMAGE_TAG"
  docker compose -f "$COMPOSE_FILE" pull
  docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
  for i in $(seq 1 20); do
    if curl -fsS http://localhost:8080/actuator/health >/dev/null; then
      echo "✅ Rollback completed and backend is healthy."
      exit 0
    fi
    sleep 3
  done
  echo "Rollback attempted, but backend is still unhealthy." >&2
fi
exit 1
