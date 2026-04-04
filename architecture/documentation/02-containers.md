## Containers

### React SPA

The Single-Page Application is a pure client-side app. It renders a login form and sends a `POST /api/auth/login` request to the Quarkus API when the user submits their credentials.

Technology choices:
- **React 19** – component-based UI
- **TypeScript** – type safety
- **Vite** – development server and production bundler

### Quarkus API

The REST API exposes a single endpoint and implements the login use-case using a layered hexagonal (ports-and-adapters) architecture:

| Layer | Artefact | Responsibility |
|---|---|---|
| Inbound adapter | `AuthResource` | JAX-RS resource at `POST /api/auth/login` |
| Application | `AuthService` | Orchestrates the login use-case |
| Domain port | `UserRepository` | Interface defining what persistence the domain needs |
| Outbound adapter | `JpaUserRepository` | Panache/Hibernate implementation of `UserRepository` |

### Database

- **Development / test**: H2 in-memory database, auto-created on startup from `import.sql`.
- **Production**: PostgreSQL — swap `quarkus.datasource.*` properties, no code changes required.
