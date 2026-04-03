package com.ibanfr.auth.infrastructure.adapters.in.rest;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for login requests received by the REST inbound adapter.
 */
public class LoginRequest {

    @NotBlank
    public String username;

    @NotBlank
    public String password;
}

