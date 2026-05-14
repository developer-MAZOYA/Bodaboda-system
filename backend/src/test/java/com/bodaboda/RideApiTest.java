package com.bodaboda;
import com.bodaboda.dto.AuthDtos.RegisterRequest;
import com.bodaboda.dto.RideDtos.BookRequest;
import com.bodaboda.service.AuthService;
import com.bodaboda.service.RideService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test")
class RideApiTest {
  @Autowired AuthService auth;
  @Autowired RideService rides;
  @Test
  void customer_can_book_ride() {
    auth.register(new RegisterRequest("R Customer","r1@x.io","+254","password123","CUSTOMER"));
    var ride = rides.book("r1@x.io", new BookRequest("CBD","Westlands", BigDecimal.valueOf(200)));
    assertNotNull(ride.getId());
    assertEquals("REQUESTED", ride.getStatus());
  }
}
