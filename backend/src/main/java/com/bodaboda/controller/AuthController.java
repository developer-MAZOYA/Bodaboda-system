package com.bodaboda.controller;
import com.bodaboda.dto.AuthDtos.*;
import com.bodaboda.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
  private final AuthService auth;
  
  public AuthController(AuthService a) { this.auth = a; }
  
  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r) {
    logger.debug("POST /api/auth/register - fullName: {}, email: {}, role: {}", 
                 r.fullName(), r.email(), r.role());
    AuthResponse response = auth.register(r);
    logger.debug("Registration response sent for: {}", r.email());
    return ResponseEntity.ok(response);
  }
  
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest r) {
    logger.debug("POST /api/auth/login - email: {}", r.email());
    AuthResponse response = auth.login(r);
    logger.debug("Login response sent for: {}", r.email());
    return ResponseEntity.ok(response);
  }
}
