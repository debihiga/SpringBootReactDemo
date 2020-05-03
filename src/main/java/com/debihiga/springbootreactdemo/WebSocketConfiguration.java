package com.debihiga.springbootreactdemo;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// tag::code[]
/**
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */
@Component
@EnableWebSocketMessageBroker // turns on WebSocket support.
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    static final String MESSAGE_PREFIX = "/topic"; // prepend to every message’s route

    /**
     * Configure the endpoint on the backend for clients and server.
     * */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/payroll").withSockJS();
    }

    /**
     * Configure the broker used to relay messages between server and client.
     * */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(MESSAGE_PREFIX);
        registry.setApplicationDestinationPrefixes("/app");
    }
}
// end::code[]
