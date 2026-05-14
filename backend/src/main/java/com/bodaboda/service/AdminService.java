package com.bodaboda.service;

import com.bodaboda.dto.AdminDtos.*;
import com.bodaboda.entity.Ride;
import com.bodaboda.repository.RideRepository;
import com.bodaboda.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
  private static final Logger log = LoggerFactory.getLogger(AdminService.class);
  private final RideRepository rides;
  private final UserRepository users;

  public AdminService(RideRepository r, UserRepository u) {
    this.rides = r;
    this.users = u;
  }

  public AllRequestsResponse getAllRequests() {
    log.info("Fetching all ride requests");
    List<Ride> allRides = rides.findAll();
    
    long pending = allRides.stream().filter(r -> "REQUESTED".equals(r.getStatus())).count();
    long accepted = allRides.stream().filter(r -> "ACCEPTED".equals(r.getStatus())).count();
    long completed = allRides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();

    List<RideDetail> rideDetails = allRides.stream()
        .map(r -> {
          String riderName = r.getRiderId() != null 
              ? users.findById(r.getRiderId()).map(u -> u.getFullName()).orElse("Unassigned")
              : "Unassigned";
          return new RideDetail(
              r.getId().toString(),
              r.getCustomerId().toString(),
              r.getPickup(),
              r.getDropoff(),
              r.getStatus(),
              r.getFare(),
              r.getCreatedAt().toString(),
              r.getUpdatedAt().toString(),
              riderName);
        })
        .collect(Collectors.toList());

    log.info("Total requests: {}, Pending: {}, Accepted: {}, Completed: {}", 
        allRides.size(), pending, accepted, completed);

    return new AllRequestsResponse(allRides.size(), pending, accepted, completed, rideDetails);
  }

  public EarningsSummary getEarningsSummary() {
    log.info("Fetching earnings summary");
    List<Ride> completedRides = rides.findAll().stream()
        .filter(r -> "COMPLETED".equals(r.getStatus()))
        .collect(Collectors.toList());

    BigDecimal totalEarnings = completedRides.stream()
        .map(Ride::getFare)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Group earnings by rider
    Map<UUID, List<Ride>> ridesByRider = completedRides.stream()
        .filter(r -> r.getRiderId() != null)
        .collect(Collectors.groupingBy(Ride::getRiderId));

    List<RiderEarnings> riderEarnings = ridesByRider.entrySet().stream()
        .map(entry -> {
          UUID riderId = entry.getKey();
          List<Ride> riderRides = entry.getValue();
          BigDecimal earnings = riderRides.stream()
              .map(Ride::getFare)
              .reduce(BigDecimal.ZERO, BigDecimal::add);
          String riderName = users.findById(riderId)
              .map(u -> u.getFullName())
              .orElse("Unknown");
          return new RiderEarnings(riderId.toString(), riderName, riderRides.size(), earnings);
        })
        .sorted(Comparator.comparing(RiderEarnings::totalEarnings).reversed())
        .limit(10)
        .collect(Collectors.toList());

    long totalActiveRiders = users.findAll().stream()
        .filter(u -> "RIDER".equals(u.getRole()))
        .count();

    log.info("Total system earnings: {}, Total completed rides: {}, Active riders: {}", 
        totalEarnings, completedRides.size(), totalActiveRiders);

    return new EarningsSummary(totalEarnings, completedRides.size(), riderEarnings, totalActiveRiders);
  }

  public RideStats getRideStats() {
    log.info("Fetching ride statistics");
    List<Ride> allRides = rides.findAll();
    
    long requested = allRides.stream().filter(r -> "REQUESTED".equals(r.getStatus())).count();
    long accepted = allRides.stream().filter(r -> "ACCEPTED".equals(r.getStatus())).count();
    long completed = allRides.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();

    BigDecimal totalEarnings = allRides.stream()
        .filter(r -> "COMPLETED".equals(r.getStatus()))
        .map(Ride::getFare)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal avgFare = allRides.isEmpty() ? BigDecimal.ZERO 
        : totalEarnings.divide(BigDecimal.valueOf(completed > 0 ? completed : 1));

    log.info("Ride stats - Total: {}, Requested: {}, Accepted: {}, Completed: {}, Total earnings: {}", 
        allRides.size(), requested, accepted, completed, totalEarnings);

    return new RideStats(allRides.size(), requested, accepted, completed, totalEarnings, avgFare);
  }
}
