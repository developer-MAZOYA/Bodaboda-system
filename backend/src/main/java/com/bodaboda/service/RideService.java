package com.bodaboda.service;
import com.bodaboda.dto.RideDtos.*;
import com.bodaboda.entity.Ride;
import com.bodaboda.entity.User;
import com.bodaboda.repository.RideRepository;
import com.bodaboda.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class RideService {
  private final RideRepository rides;
  private final UserRepository users;
  public RideService(RideRepository r, UserRepository u) { this.rides = r; this.users = u; }

  public Ride book(String email, BookRequest req) {
    User customer = users.findByEmail(email).orElseThrow();
    Ride ride = Ride.builder()
        .customerId(customer.getId())
        .pickup(req.pickup()).dropoff(req.dropoff())
        .fare(req.fare() == null ? BigDecimal.valueOf(150) : req.fare())
        .status("REQUESTED").build();
    return rides.save(ride);
  }
  public List<Ride> listFor(String email) {
    User u = users.findByEmail(email).orElseThrow();
    if ("ADMIN".equals(u.getRole())) return rides.findAll();
    if ("RIDER".equals(u.getRole())) {
      var mine = rides.findByRiderId(u.getId());
      var open = rides.findAll().stream().filter(r -> "REQUESTED".equals(r.getStatus())).toList();
      return java.util.stream.Stream.concat(mine.stream(), open.stream()).distinct().toList();
    }
    return rides.findByCustomerId(u.getId());
  }
  public Ride updateStatus(String email, UUID rideId, StatusUpdate upd) {
    User u = users.findByEmail(email).orElseThrow();
    Ride ride = rides.findById(rideId).orElseThrow();
    String s = upd.status().toUpperCase();
    if ("ACCEPTED".equals(s) && "RIDER".equals(u.getRole())) ride.setRiderId(u.getId());
    ride.setStatus(s);
    ride.setUpdatedAt(Instant.now());
    return rides.save(ride);
  }
}
