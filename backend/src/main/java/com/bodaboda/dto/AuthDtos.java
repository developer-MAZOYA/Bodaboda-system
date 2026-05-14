package com.bodaboda.dto;
import jakarta.validation.constraints.*;
public class AuthDtos {
  public record RegisterRequest(
      @NotBlank String fullName,
      @Email @NotBlank String email,
      String phone,
      @NotBlank @Size(min=6) String password,
      String role) {}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
  public record AuthResponse(String token, String email, String role, String fullName) {}
}
