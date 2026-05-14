#!/usr/bin/env bash
# Deploy script for staging or production environments.
# Usage: deploy.sh <staging|production>
set -euo pipefail
ENV="${1:-staging}"
COMPOSE_FILE="deployment/${ENV}/docker-compose.yml"
echo "🚀 Deploying Bodaboda to ${ENV} (image tag: ${IMAGE_TAG:-latest})"
docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
echo "⏳ Waiting for backend to become healthy..."
for i in $(seq 1 30); do
  if curl -fsS http://localhost:8080/actuator/health >/dev/null; then
    echo "✅ Backend is healthy."; break
  fi
  sleep 3
done
docker image prune -f >/dev/null || true
echo "📋 Recent backend logs:"
docker compose -f "$COMPOSE_FILE" logs --tail=30 backend || true
echo "✅ Deployment to ${ENV} complete."
