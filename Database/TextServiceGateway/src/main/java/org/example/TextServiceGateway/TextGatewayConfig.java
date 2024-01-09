package org.example.TextServiceGateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TextGatewayConfig {
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("TextServiceFollower", r -> r.method("GET")
                        .uri("http://localhost:8081"))
                .route("TextServiceLeader", r -> r.method("POST", "PUT", "DELETE")
                        .uri("http://localhost:8082"))
                .build();
    }
}
