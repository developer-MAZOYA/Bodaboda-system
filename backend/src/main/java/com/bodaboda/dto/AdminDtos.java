package com.bodaboda.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminDtos {
  public record RideStats(
      long totalRides,
      long requestedRides,
      long acceptedRides,
      long completedRides,
      BigDecimal totalEarnings,
      BigDecimal averageFare) {}

  public record RiderEarnings(
      String riderId,
      String riderName,
      long completedRides,
      BigDecimal totalEarnings) {}

  public record EarningsSummary(
      BigDecimal totalSystemEarnings,
      long totalCompletedRides,
      List<RiderEarnings> topRiders,
      long totalActiveRiders) {}

  public record RideDetail(
      String rideId,
      String customerId,
      String pickupLocation,
      String dropoffLocation,
      String status,
      BigDecimal fare,
      String createdAt,
      String updatedAt,
      String riderName) {}

  public record AllRequestsResponse(
      long totalRequests,
      long pending,
      long accepted,
      long completed,
      List<RideDetail> rides) {}
}
