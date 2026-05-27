package com.bodaboda.service;

import com.bodaboda.dto.RideRequestEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MqttRidePublisher {
  private static final Logger log = LoggerFactory.getLogger(MqttRidePublisher.class);

  private final ObjectMapper mapper;
  private final boolean enabled;
  private final String brokerUri;
  private final String rideRequestTopic;
  private MqttClient client;

  public MqttRidePublisher(
      ObjectMapper mapper,
      @Value("${app.mqtt.enabled:true}") boolean enabled,
      @Value("${app.mqtt.broker-uri:tcp://localhost:1883}") String brokerUri,
      @Value("${app.mqtt.ride-request-topic:ride/request}") String rideRequestTopic) {
    this.mapper = mapper;
    this.enabled = enabled;
    this.brokerUri = brokerUri;
    this.rideRequestTopic = rideRequestTopic;
  }

  public void publishRideRequest(RideRequestEvent event) {
    if (!enabled) {
      return;
    }
    try {
      MqttMessage message = new MqttMessage(mapper.writeValueAsBytes(event));
      message.setQos(1);
      getClient().publish(rideRequestTopic, message);
      log.info("Published ride request {} to MQTT topic {}", event.rideId(), rideRequestTopic);
    } catch (JsonProcessingException | MqttException ex) {
      log.warn("Could not publish ride request {} to MQTT broker {}", event.rideId(), brokerUri, ex);
    }
  }

  private synchronized MqttClient getClient() throws MqttException {
    if (client != null && client.isConnected()) {
      return client;
    }

    client = new MqttClient(brokerUri, "bodaboda-backend-" + UUID.randomUUID(), new MemoryPersistence());
    MqttConnectOptions options = new MqttConnectOptions();
    options.setAutomaticReconnect(true);
    options.setCleanSession(true);
    options.setConnectionTimeout(5);
    client.connect(options);
    return client;
  }

  public String rideRequestTopic() {
    return rideRequestTopic;
  }
}
