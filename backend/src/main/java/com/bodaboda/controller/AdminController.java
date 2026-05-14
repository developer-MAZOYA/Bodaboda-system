package com.bodaboda.controller;
import com.bodaboda.dto.AdminDtos.*;
import com.bodaboda.entity.LogEntry;
import com.bodaboda.repository.LogRepository;
import com.bodaboda.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
  private static final Logger log = LoggerFactory.getLogger(AdminController.class);
  private final LogRepository logs;
  private final AdminService admin;

  public AdminController(LogRepository l, AdminService a) { 
    this.logs = l; 
    this.admin = a;
  }

  @GetMapping("/logs")
  public ResponseEntity<List<LogEntry>> logs() { 
    log.info("Admin accessed logs");
    return ResponseEntity.ok(logs.findAll()); 
  }

  @GetMapping("/requests")
  public ResponseEntity<AllRequestsResponse> allRequests() {
    log.info("Admin requested all ride requests");
    return ResponseEntity.ok(admin.getAllRequests());
  }

  @GetMapping("/earnings")
  public ResponseEntity<EarningsSummary> earningsSummary() {
    log.info("Admin requested earnings summary");
    return ResponseEntity.ok(admin.getEarningsSummary());
  }

  @GetMapping("/stats")
  public ResponseEntity<RideStats> rideStats() {
    log.info("Admin requested ride statistics");
    return ResponseEntity.ok(admin.getRideStats());
  }
}
