package com.bodaboda.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public class RideDtos {
  public record BookRequest(
      @NotBlank String pickup,
      @NotBlank String dropoff,
      BigDecimal fare) {}
  public record StatusUpdate(@NotBlank String status) {}
}
