package com.bodaboda.service;

import com.bodaboda.entity.LogEntry;
import com.bodaboda.repository.LogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
  private final LogRepository logs;

  public AuditService(LogRepository l) {
    this.logs = l;
  }

  public void logRegistration(String email, String role, String fullName) {
    try {
      LogEntry entry = LogEntry.builder()
          .level("INFO")
          .source("AUTH")
          .message(String.format("User registered: %s (%s) with role %s", fullName, email, role))
          .build();
      logs.save(entry);
      logger.debug("Audit log saved for registration: {}", email);
    } catch (Exception e) {
      logger.error("Failed to save audit log for registration", e);
    }
  }

  public void logRegistrationFailure(String email, String reason) {
    try {
      LogEntry entry = LogEntry.builder()
          .level("WARN")
          .source("AUTH")
          .message(String.format("Registration failed for %s: %s", email, reason))
          .build();
      logs.save(entry);
      logger.debug("Audit log saved for failed registration: {}", email);
    } catch (Exception e) {
      logger.error("Failed to save audit log for failed registration", e);
    }
  }

  public void logLogin(String email, String fullName) {
    try {
      LogEntry entry = LogEntry.builder()
          .level("INFO")
          .source("AUTH")
          .message(String.format("User logged in: %s (%s)", fullName, email))
          .build();
      logs.save(entry);
      logger.debug("Audit log saved for login: {}", email);
    } catch (Exception e) {
      logger.error("Failed to save audit log for login", e);
    }
  }

  public void logLoginFailure(String email, String reason) {
    try {
      LogEntry entry = LogEntry.builder()
          .level("WARN")
          .source("AUTH")
          .message(String.format("Login failed for %s: %s", email, reason))
          .build();
      logs.save(entry);
      logger.debug("Audit log saved for failed login: {}", email);
    } catch (Exception e) {
      logger.error("Failed to save audit log for failed login", e);
    }
  }
}
