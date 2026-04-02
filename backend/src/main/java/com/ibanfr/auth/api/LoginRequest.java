package com.ibanfr.auth.api;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for login requests.
 */
public class LoginRequest {

    @NotBlank
    public String username;

    @NotBlank
    public String password;
}
