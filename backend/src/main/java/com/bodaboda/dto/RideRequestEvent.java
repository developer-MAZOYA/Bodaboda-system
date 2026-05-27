package com.bodaboda.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RideRequestEvent(
    UUID rideId,
    UUID customerId,
    String pickup,
    String dropoff,
    BigDecimal fare,
    String status,
    Instant requestedAt
) {}
