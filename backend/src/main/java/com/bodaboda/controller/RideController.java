package com.bodaboda.controller;
import com.bodaboda.dto.RideDtos.*;
import com.bodaboda.entity.Ride;
import com.bodaboda.service.RideService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rides")
public class RideController {
  private final RideService svc;
  public RideController(RideService s) { this.svc = s; }
  @PostMapping("/book")
  public ResponseEntity<Ride> book(@AuthenticationPrincipal String email, @Valid @RequestBody BookRequest r) {
    return ResponseEntity.ok(svc.book(email, r));
  }
  @GetMapping
  public ResponseEntity<List<Ride>> list(@AuthenticationPrincipal String email) {
    return ResponseEntity.ok(svc.listFor(email));
  }
  @PutMapping("/{id}/status")
  public ResponseEntity<Ride> updateStatus(@AuthenticationPrincipal String email,
                                           @PathVariable UUID id,
                                           @Valid @RequestBody StatusUpdate upd) {
    return ResponseEntity.ok(svc.updateStatus(email, id, upd));
  }
}
