package com.bodaboda.repository;
import com.bodaboda.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface RideRepository extends JpaRepository<Ride, UUID> {
  List<Ride> findByCustomerId(UUID customerId);
  List<Ride> findByRiderId(UUID riderId);
}
