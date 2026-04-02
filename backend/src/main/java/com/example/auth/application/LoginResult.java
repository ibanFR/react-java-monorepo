package com.example.auth.application;

/**
 * Represents the result of an authentication attempt.
 */
public class LoginResult {

    private final boolean success;
    private final String message;

    private LoginResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public static LoginResult success() {
        return new LoginResult(true, "Login successful");
    }

    public static LoginResult failure(String reason) {
        return new LoginResult(false, reason);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}
