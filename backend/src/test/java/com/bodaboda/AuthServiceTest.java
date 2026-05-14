package com.bodaboda;
import com.bodaboda.dto.AuthDtos.*;
import com.bodaboda.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test")
class AuthServiceTest {
  @Autowired AuthService auth;
  @Test
  void register_and_login_returns_token() {
    var reg = auth.register(new RegisterRequest("Test User","test1@x.io","+254700","password123","CUSTOMER"));
    assertNotNull(reg.token());
    var log = auth.login(new LoginRequest("test1@x.io","password123"));
    assertNotNull(log.token());
    assertEquals("CUSTOMER", log.role());
  }
}
