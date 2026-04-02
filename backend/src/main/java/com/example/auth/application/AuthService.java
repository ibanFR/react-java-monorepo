package com.example.auth.application;

import com.example.auth.domain.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Application service that orchestrates the login use case.
 * Delegates to the domain UserRepository — no infrastructure concerns here.
 */
@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    /**
     * Attempts to authenticate a user.
     * Password verification is intentionally a stub for now.
     *
     * @param username the supplied username
     * @param password the supplied plain-text password
     * @return a LoginResult describing the outcome
     */
    public LoginResult login(String username, String password) {
        return userRepository.findByUsername(username)
                .map(user -> LoginResult.success())
                .orElse(LoginResult.failure("Invalid username or password"));
    }
}
