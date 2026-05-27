#!/usr/bin/env sh
set -eu

TOPIC="${MQTT_RIDE_REQUEST_TOPIC:-ride/request}"

docker compose exec mqtt mosquitto_sub -h localhost -t "$TOPIC" -v
