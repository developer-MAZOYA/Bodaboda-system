package com.bodaboda.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="rides")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ride {
  @Id @GeneratedValue private UUID id;
  @Column(name="customer_id", nullable=false) private UUID customerId;
  @Column(name="rider_id") private UUID riderId;
  @Column(nullable=false) private String pickup;
  @Column(nullable=false) private String dropoff;
  @Column(nullable=false) @Builder.Default private String status = "REQUESTED";
  @Column(nullable=false) @Builder.Default private BigDecimal fare = BigDecimal.ZERO;
  @Column(name="created_at", nullable=false) @Builder.Default private Instant createdAt = Instant.now();
  @Column(name="updated_at", nullable=false) @Builder.Default private Instant updatedAt = Instant.now();
}
