# MQTT Integration

## Feature Implemented

Ride Request Broadcasting. When a customer books a ride, the backend saves the ride and publishes a JSON event to MQTT so driver clients can receive the request in real time.

## Topic Used

`ride/request`

The topic can be changed with `MQTT_RIDE_REQUEST_TOPIC`.

## Message Format

```json
{
  "rideId": "b3f0fb34-5c53-4976-8301-4246c4b19931",
  "customerId": "d3f4ad39-05b0-492a-93d3-0b3d6b3d44ad",
  "pickup": "Nyerere Square",
  "dropoff": "Mlimani City",
  "fare": 2500,
  "status": "REQUESTED",
  "requestedAt": "2026-05-26T09:00:00Z"
}
```

## How It Works

Docker Compose starts an Eclipse Mosquitto broker as the `mqtt` service on port `1883`. The backend connects to `tcp://mqtt:1883` inside Docker and publishes to `ride/request` after `RideService.book(...)` creates a `REQUESTED` ride.

To demonstrate message exchange:

```sh
docker compose up -d mqtt backend
./scripts/mqtt/subscribe-ride-requests.sh
```

In another terminal, either book a ride through the app or publish a sample message:

```sh
./scripts/mqtt/publish-sample-ride-request.sh
```

The subscriber prints the topic and JSON payload immediately.
