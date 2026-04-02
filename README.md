# react-java-monorepo

A full-stack enterprise application built with **React** (frontend) and **Jakarta EE / Quarkus** (backend), featuring a DDD-aligned persistence strategy.

---

## Architecture overview

```
react-java-monorepo/
├── frontend/          # React + TypeScript + Vite single-page application
├── backend/           # Jakarta EE application (Quarkus runtime)
│   └── src/main/java/com/example/auth/
│       ├── domain/            # Domain layer: entities & repository interfaces
│       ├── application/       # Application layer: use-case services
│       ├── infrastructure/    # Infrastructure layer: JPA repository adapters
│       └── api/               # REST resources (JAX-RS)
└── docker-compose.yml # Orchestrates both services for local development
```

### Persistence & DDD

Persistence follows the **Repository pattern** from Domain-Driven Design:

| Layer          | Artefact                  | Responsibility                             |
|----------------|---------------------------|--------------------------------------------|
| Domain         | `User`                    | Aggregate root; pure JPA entity            |
| Domain         | `UserRepository` (interface) | Port — defines what the domain needs    |
| Infrastructure | `JpaUserRepository`       | Adapter — Hibernate / Panache implementation |

**Development database**: H2 in-memory (zero-config, spun up on startup).  
**Production database**: swap `quarkus.datasource.*` properties to point at PostgreSQL — no code changes required.

---

## Prerequisites

| Tool    | Version (minimum) | Install guide                                    |
|---------|--------------------|--------------------------------------------------|
| Java    | 17                 | https://adoptium.net/                            |
| Maven   | 3.9                | https://maven.apache.org/install.html            |
| Node.js | 22                 | https://nodejs.org/                              |
| npm     | 10                 | bundled with Node.js                             |
| Docker  | 24 *(optional)*    | https://docs.docker.com/engine/install/          |

---

## Development setup

### Option A — run each service manually

#### 1. Start the backend in dev mode

```bash
cd backend
mvn quarkus:dev
```

The API is available at **http://localhost:8080**.  
Swagger UI is at **http://localhost:8080/swagger-ui**.

#### 2. Start the frontend dev server

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app is available at **http://localhost:5173**.

---

### Option B — Docker Compose (all-in-one)

> Requires the backend JAR to be built first:
> ```bash
> cd backend && mvn package -DskipTests
> ```

```bash
docker compose up
```

- Frontend: **http://localhost:5173**
- Backend:  **http://localhost:8080**

---

## Running the tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm test
```

---

## API reference

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| POST   | `/api/auth/login` | Authenticate a user           |

**POST `/api/auth/login`** request body:
```json
{ "username": "admin", "password": "secret" }
```

**200 OK** response:
```json
{ "message": "Login successful" }
```

**401 Unauthorized** response:
```json
{ "message": "Invalid username or password" }
```

---

## Project structure detail

### Frontend (`frontend/`)

| Path                          | Purpose                           |
|-------------------------------|-----------------------------------|
| `src/main.tsx`                | Application entry point           |
| `src/App.tsx`                 | Root component                    |
| `src/pages/LoginPage.tsx`     | Login page component              |
| `src/pages/LoginPage.css`     | Login page styles                 |

### Backend (`backend/`)

| Path                                        | Purpose                                      |
|---------------------------------------------|----------------------------------------------|
| `domain/User.java`                          | User aggregate root (JPA entity)             |
| `domain/UserRepository.java`                | Repository port (interface)                  |
| `infrastructure/JpaUserRepository.java`     | Panache JPA repository adapter               |
| `application/AuthService.java`              | Login use-case orchestration                 |
| `api/AuthResource.java`                     | JAX-RS REST resource                         |
| `resources/application.properties`         | Quarkus configuration                        |
| `resources/import.sql`                      | Development seed data                        |
