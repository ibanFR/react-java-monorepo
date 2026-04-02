package com.ibanfr.auth.domain;

import java.util.Optional;

/**
 * Repository interface for the User aggregate.
 * Defined in the domain layer as a port — the implementation lives in the infrastructure layer.
 */
public interface UserRepository {

    Optional<User> findByUsername(String username);

    void save(User user);
}
