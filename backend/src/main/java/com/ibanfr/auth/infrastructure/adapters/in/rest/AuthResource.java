package com.ibanfr.auth.infrastructure.adapters.in.rest;

import com.ibanfr.auth.application.AuthService;
import com.ibanfr.auth.application.LoginResult;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * JAX-RS inbound adapter exposing the authentication use-case over HTTP.
 * Acts as a primary (driving) adapter in the hexagonal architecture.
 */
@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        LoginResult result = authService.login(request.username, request.password);
        if (result.isSuccess()) {
            return Response.ok(new LoginResponse(result.getMessage())).build();
        }
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new LoginResponse(result.getMessage()))
                .build();
    }

    public record LoginResponse(String message) {
    }
}

