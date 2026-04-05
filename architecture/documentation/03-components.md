## Components

![](embed:Components)

### Overview

The Quarkus API is structured around a **hexagonal (ports-and-adapters)** architecture. All source lives under
`backend/src/main/java/com/ibanfr/auth/` and is organised into three layers:

| Layer              | Package                                    | Responsibility                                         |
|--------------------|--------------------------------------------|--------------------------------------------------------|
| **Infrastructure** | `infrastructure.adapters.in.rest`          | Inbound (primary) adapter — HTTP entry point           |
| **Application**    | `application`                              | Use-case orchestration — no infrastructure concerns    |
| **Domain**         | `domain`                                   | Aggregate root, repository port — pure business logic  |
| **Infrastructure** | `infrastructure.adapters.out.jpa`          | Outbound (secondary) adapter — persistence             |

---

### Components

#### `AuthResource`

**Package:** `infrastructure.adapters.in.rest`
**Type:** JAX-RS resource — primary (inbound) adapter

The HTTP entry point for the authentication use-case. It is annotated with `@Path("/api/auth")` and exposes a single
endpoint:

```
POST /api/auth/login
Content-Type: application/json
```

Responsibilities:
- Deserialises the incoming JSON payload into a `LoginRequest` DTO and applies Bean Validation (`@Valid`).
- Delegates to `AuthService.login()`.
- Maps the `LoginResult` value object to an HTTP response — `200 OK` on success, `401 Unauthorized` on failure.

`AuthResource` has no knowledge of persistence or business rules; it only translates between HTTP and the application layer.

---

#### `AuthService`

**Package:** `application`
**Type:** CDI application-scoped bean (`@ApplicationScoped`)

Orchestrates the login use-case. It receives the username and password supplied by `AuthResource`, delegates
the user look-up to `UserRepository`, and returns a `LoginResult`.

```
AuthResource → AuthService.login(username, password) → UserRepository.findByUsername(username)
```

Current behaviour: password verification is a stub — any password is accepted for a matching username.
This is intentional and documented in the source code.

---

#### `UserRepository`

**Package:** `domain`
**Type:** Java interface — repository port (outbound)

The domain's declaration of what persistence it needs. It is a pure Java interface with no framework imports,
keeping the domain layer free of infrastructure concerns.

```java
Optional<User> findByUsername(String username);
void save(User user);
```

`AuthService` depends on this interface, not on any JPA class, which makes it independently testable and allows the
persistence technology to be swapped without touching the domain or application layers.

---

#### `JpaUserRepository`

**Package:** `infrastructure.adapters.out.jpa`
**Type:** CDI application-scoped bean — secondary (outbound) adapter

Implements `UserRepository` using Quarkus Hibernate ORM Panache. It satisfies the domain port at runtime via CDI
injection.

```java
public class JpaUserRepository implements UserRepository, PanacheRepository<User> {
    public Optional<User> findByUsername(String username) {
        return find("username", username).firstResultOptional();
    }
}
```

---

### Supporting Types

| Class          | Package                     | Role                                                                          |
|----------------|-----------------------------|-------------------------------------------------------------------------------|
| `LoginRequest` | `infrastructure…in.rest`    | REST-layer DTO with `@NotBlank` validation on `username` and `password`       |
| `LoginResult`  | `application`               | Value object returned by `AuthService`; carries a `success` flag and message  |
| `User`         | `domain`                    | JPA entity and aggregate root; holds `username` and `password` fields         |

---

### Request Flow

```
Browser
  └─▶ POST /api/auth/login (JSON)
        └─▶ AuthResource           [infrastructure – inbound adapter]
              └─▶ AuthService      [application layer]
                    └─▶ UserRepository.findByUsername()   [domain port]
                          └─▶ JpaUserRepository           [infrastructure – outbound adapter]
                                └─▶ H2 / PostgreSQL
```

