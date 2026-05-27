package com.bodaboda.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MqttHealthIndicator implements HealthIndicator {
  private final boolean enabled;
  private final String brokerUri;

  public MqttHealthIndicator(
      @Value("${app.mqtt.enabled:true}") boolean enabled,
      @Value("${app.mqtt.broker-uri:tcp://localhost:1883}") String brokerUri) {
    this.enabled = enabled;
    this.brokerUri = brokerUri;
  }

  @Override
  public Health health() {
    if (!enabled) {
      return Health.up().withDetail("enabled", false).build();
    }

    try {
      MqttConnectOptions options = new MqttConnectOptions();
      options.setCleanSession(true);
      options.setConnectionTimeout(3);
      MqttClient client = new MqttClient(brokerUri, "bodaboda-health-" + UUID.randomUUID(), new MemoryPersistence());
      client.connect(options);
      client.disconnect();
      client.close();
      return Health.up().withDetail("broker", brokerUri).build();
    } catch (Exception ex) {
      return Health.down(ex).withDetail("broker", brokerUri).build();
    }
  }
}
