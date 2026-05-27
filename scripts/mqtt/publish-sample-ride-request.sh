#!/usr/bin/env sh
set -eu

TOPIC="${MQTT_RIDE_REQUEST_TOPIC:-ride/request}"

docker compose exec mqtt mosquitto_pub -h localhost -t "$TOPIC" -m '{
  "rideId": "demo-ride-001",
  "customerId": "demo-customer-001",
  "pickup": "Nyerere Square",
  "dropoff": "Mlimani City",
  "fare": 2500,
  "status": "REQUESTED",
  "requestedAt": "2026-05-26T09:00:00Z"
}'
