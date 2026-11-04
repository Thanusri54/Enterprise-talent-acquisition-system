package com.enterprise.gateway.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/validate",
            "/eureka"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow OPTIONS requests (CORS preflight) and open endpoints
        if ("OPTIONS".equalsIgnoreCase(request.getMethod().name()) || isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isTokenValid(token)) {
            return onError(exchange, "Invalid or Expired JWT Token", HttpStatus.UNAUTHORIZED);
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        if (!isAuthorized(path, request.getMethod().name(), role)) {
            return onError(exchange, "Access Denied: Role " + role + " is not authorized for this resource", HttpStatus.FORBIDDEN);
        }

        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Email", username)
                .header("X-User-Roles", role)
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    private boolean isAuthorized(String path, String method, String role) {
        if (role == null) return false;
        String r = role.toUpperCase();

        // ADMIN has access to all endpoints
        if ("ADMIN".equals(r)) {
            return true;
        }

        // HR / HR_MANAGER has access to all recruitment, candidate, job, application, pipeline, interview, notification, and user management
        if ("HR".equals(r) || "HR_MANAGER".equals(r)) {
            return true;
        }

        // RECRUITER
        if ("RECRUITER".equals(r)) {
            // Cannot access user governance (Admin/HR only)
            if (path.startsWith("/api/auth/users")) {
                return false;
            }
            return true;
        }

        // INTERVIEWER
        if ("INTERVIEWER".equals(r)) {
            // Cannot access HR-specific endpoints: user governance, creating/deleting jobs or candidates
            if (path.startsWith("/api/auth/users")) {
                return false;
            }
            if (("DELETE".equalsIgnoreCase(method) || "POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) && path.startsWith("/api/jobs")) {
                return false;
            }
            if ("DELETE".equalsIgnoreCase(method) && (path.startsWith("/api/candidates") || path.startsWith("/api/applications"))) {
                return false;
            }
            return true;
        }

        // CANDIDATE
        if ("CANDIDATE".equals(r)) {
            // Candidate accessing recruiter/management endpoints is forbidden
            if (path.matches("^/api/pipeline/\\d+/move.*") || path.startsWith("/api/pipeline/kanban") || path.startsWith("/api/pipeline/history") || (path.equals("/api/pipeline") && "GET".equalsIgnoreCase(method))) {
                return false;
            }
            if (path.startsWith("/api/applications") && path.contains("/status")) {
                return false;
            }
            if (path.startsWith("/api/applications") && path.contains("/assign")) {
                return false;
            }
            if (path.equals("/api/applications") && "GET".equalsIgnoreCase(method)) {
                return false;
            }
            if (path.startsWith("/api/jobs") && !"GET".equalsIgnoreCase(method)) {
                return false;
            }
            if (path.startsWith("/api/candidates") && "DELETE".equalsIgnoreCase(method)) {
                return false;
            }
            if (path.startsWith("/api/auth/users")) {
                return false;
            }
            return true;
        }

        return false;
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String errMessage, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String jsonResponse = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                java.time.Instant.now().toString(),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                errMessage
        );

        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    @Override
    public int getOrder() {
        return -1; // Highest priority filter
    }
}
