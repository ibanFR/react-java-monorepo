package com.ibanfr.auth.infrastructure;

import com.ibanfr.auth.domain.User;
import com.ibanfr.auth.domain.UserRepository;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

/**
 * JPA-backed implementation of the UserRepository domain interface.
 * Acts as the persistence adapter in the hexagonal architecture.
 */
@ApplicationScoped
public class JpaUserRepository implements UserRepository, PanacheRepository<User> {

    @Override
    public Optional<User> findByUsername(String username) {
        return find("username", username).firstResultOptional();
    }

    @Override
    public void save(User user) {
        persist(user);
    }
}
