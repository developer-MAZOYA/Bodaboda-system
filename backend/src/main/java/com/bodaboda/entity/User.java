package com.bodaboda.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
  @Id @GeneratedValue private UUID id;
  @Column(name="full_name", nullable=false) private String fullName;
  @Column(unique=true, nullable=false) private String email;
  private String phone;
  @Column(name="password_hash", nullable=false) private String passwordHash;
  @Column(nullable=false) @Builder.Default private String role = "CUSTOMER";
  @Column(name="created_at", nullable=false) @Builder.Default private Instant createdAt = Instant.now();
}
