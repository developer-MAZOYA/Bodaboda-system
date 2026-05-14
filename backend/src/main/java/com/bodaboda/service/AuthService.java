package com.bodaboda.service;
import com.bodaboda.dto.AuthDtos.*;
import com.bodaboda.entity.User;
import com.bodaboda.repository.UserRepository;
import com.bodaboda.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final AuditService audit;
  
  public AuthService(UserRepository u, PasswordEncoder e, JwtService j, AuditService a) {
    this.users = u; this.encoder = e; this.jwt = j; this.audit = a;
  }
  
  public AuthResponse register(RegisterRequest r) {
    logger.info("Registration attempt for email: {}", r.email());
    
    if (users.existsByEmail(r.email())) {
      logger.warn("Registration failed: Email already registered - {}", r.email());
      audit.logRegistrationFailure(r.email(), "Email already registered");
      throw new IllegalArgumentException("Email already registered");
    }
    
    String role = (r.role()==null||r.role().isBlank()) ? "CUSTOMER" : r.role().toUpperCase();
    logger.debug("Registering user with role: {}", role);
    
    try {
      String encodedPassword = encoder.encode(r.password());
      User u = User.builder()
          .fullName(r.fullName()).email(r.email()).phone(r.phone())
          .passwordHash(encodedPassword).role(role).build();
      
      logger.debug("Saving user to database: {} ({})", r.fullName(), r.email());
      users.save(u);
      
      String token = jwt.generate(u.getEmail(), u.getRole());
      logger.info("User registered successfully: {} ({})", r.fullName(), u.getId());
      audit.logRegistration(r.email(), role, r.fullName());
      
      return new AuthResponse(token, u.getEmail(), u.getRole(), u.getFullName());
    } catch (Exception e) {
      logger.error("Error during registration for email {}", r.email(), e);
      audit.logRegistrationFailure(r.email(), e.getMessage());
      throw e;
    }
  }
  
  public AuthResponse login(LoginRequest r) {
    logger.info("Login attempt for email: {}", r.email());
    
    try {
      User u = users.findByEmail(r.email())
          .orElseThrow(() -> {
            logger.warn("Login failed: User not found - {}", r.email());
            audit.logLoginFailure(r.email(), "User not found");
            return new IllegalArgumentException("Invalid credentials");
          });
      
      if (!encoder.matches(r.password(), u.getPasswordHash())) {
        logger.warn("Login failed: Invalid password for - {}", r.email());
        audit.logLoginFailure(r.email(), "Invalid password");
        throw new IllegalArgumentException("Invalid credentials");
      }
      
      String token = jwt.generate(u.getEmail(), u.getRole());
      logger.info("User logged in successfully: {} ({})", u.getFullName(), u.getId());
      audit.logLogin(r.email(), u.getFullName());
      
      return new AuthResponse(token, u.getEmail(), u.getRole(), u.getFullName());
    } catch (IllegalArgumentException e) {
      throw e;
    } catch (Exception e) {
      logger.error("Error during login for email {}", r.email(), e);
      audit.logLoginFailure(r.email(), e.getMessage());
      throw e;
    }
  }
}
