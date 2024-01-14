package org.example.APIGateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class APIGatewayConfig {
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                //angular-application route
                .route("angular-application", r -> r.path("/")
                        .uri("http://angular-application:80"))
                //UserService route
                .route("UserService", r -> r.path("/user/**")
                        .uri("http://UserService:8080"))
                //FollowerTextService route
                .route("FollowerTextService", r -> r.path("/text/**")
                        .uri("http://TextServiceFollower:8083"))
                //transcription routes
                .route("transcription_join", r -> r.path("/join/**")
                        .uri("http://transcription:2700"))
                .route("transcription_create", r -> r.path("/create/**")
                        .uri("http://transcription:2700"))
                //translation route
                .route("translation", r -> r.path("/translate/**")
                        .uri("http://translation:5000"))
                .build();
    }
}
