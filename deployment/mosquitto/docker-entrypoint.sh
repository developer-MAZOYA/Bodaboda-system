#!/bin/sh
PORT=${PORT:-9001}
cat > /mosquitto/config/mosquitto.conf << EOF
listener $PORT 0.0.0.0
protocol websockets
allow_anonymous true
persistence false
log_dest stdout
EOF
exec mosquitto -c /mosquitto/config/mosquitto.conf