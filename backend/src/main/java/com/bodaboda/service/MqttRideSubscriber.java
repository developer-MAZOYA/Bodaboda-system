package com.bodaboda.service;

import com.bodaboda.dto.RideRequestEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class MqttRideSubscriber {
  private static final Logger log = LoggerFactory.getLogger(MqttRideSubscriber.class);

  private final ObjectMapper mapper;
  private final boolean enabled;
  private final String brokerUri;
  private final String rideRequestTopic;

  private MqttClient client;

  public MqttRideSubscriber(
      ObjectMapper mapper,
      @Value("${app.mqtt.enabled:true}") boolean enabled,
      @Value("${app.mqtt.broker-uri:tcp://localhost:1883}") String brokerUri,
      @Value("${app.mqtt.ride-request-topic:ride/request}") String rideRequestTopic) {
    this.mapper = mapper;
    this.enabled = enabled;
    this.brokerUri = brokerUri;
    this.rideRequestTopic = rideRequestTopic;
  }

  @PostConstruct
  public void start() {
    if (!enabled) {
      log.info("MQTT subscriber disabled (app.mqtt.enabled=false)");
      return;
    }

    try {
      client = new MqttClient(brokerUri, "bodaboda-ride-subscriber-" + UUID.randomUUID(), new MemoryPersistence());

      MqttConnectOptions options = new MqttConnectOptions();
      options.setAutomaticReconnect(true);
      options.setCleanSession(true);
      options.setConnectionTimeout(5);

      client.setCallback(new InternalCallback());
      client.connect(options);

      int qos = 1;
      client.subscribe(rideRequestTopic, qos);
      log.info("MQTT subscriber connected to {} and subscribed to topic {} (qos={})", brokerUri, rideRequestTopic, qos);
    } catch (MqttException ex) {
      log.warn("Failed to start MQTT subscriber. brokerUri={}, topic={}", brokerUri, rideRequestTopic, ex);
    }
  }

  @PreDestroy
  public void stop() {
    if (client == null) return;
    try {
      if (client.isConnected()) {
        client.disconnect();
      }
      client.close();
    } catch (MqttException ex) {
      log.debug("Error while stopping MQTT subscriber", ex);
    }
  }

  private class InternalCallback implements MqttCallback {
    @Override
    public void connectionLost(Throwable cause) {
      log.warn("MQTT subscriber connection lost", cause);
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
      try {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        RideRequestEvent event = mapper.readValue(payload, RideRequestEvent.class);
        log.info("MQTT message received on topic {}: rideId={}, customerId={}, status={}",
            topic, event.rideId(), event.customerId(), event.status());
      } catch (Exception ex) {
        log.warn("Failed to deserialize MQTT message on topic {}", topic, ex);
      }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
      // no-op (subscriber)
    }
  }
}

