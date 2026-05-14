package com.bodaboda.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogEntry {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false) private String level;
  private String source;
  @Column(nullable=false, columnDefinition="TEXT") private String message;
  @Column(name="created_at", nullable=false) @Builder.Default private Instant createdAt = Instant.now();
}
