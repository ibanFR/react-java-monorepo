---
title: Technology Stack
layout: default
parent: Reference
grand_parent: Architecture
---

# Technology Stack

{: .no_toc }

The stack prioritizes **minimal learning curve**, **code reusability**, and **cloud-native principles**. {: .fs-6
.fw-300 }

This document describes the recommended technology stack for this React-Java monorepo, designed to provide a natural
migration path from traditional Java EE (JSF/CDI) environments to modern, cloud-native development. The stack
prioritizes **minimal learning curve**, **code reusability**, and **cloud-native principles**.

**Target Audience:** Java developers transitioning from JSF/CDI/EJB to modern frameworks.

## Table of Contents

{: .no_toc .text-delta }

1. TOC 
{:toc}

## Full Recommended Stack

### Backend

| Layer                    | Technology              | Version       | Purpose                                                             |
|--------------------------|-------------------------|---------------|---------------------------------------------------------------------|
| **Framework**            | Quarkus                 | 3.8.3+        | Cloud-native Java framework with CDI, REST, ORM built-in            |
| **Language**             | Java                    | 21 LTS        | Modern JVM with virtual threads (Project Loom) and pattern matching |
| **REST API**             | RESTEasy Reactive       | (via Quarkus) | Stateless REST endpoints (replaces JSF)                             |
| **ORM**                  | Hibernate ORM + Panache | (via Quarkus) | Simplified JPA with less boilerplate                                |
| **Dependency Injection** | CDI (ArC)               | (via Quarkus) | Same as Java EE CDI — `@Inject`, `@ApplicationScoped`, etc.         |
| **Bean Validation**      | Hibernate Validator     | (via Quarkus) | Same JSR-380 validation as Java EE                                  |
| **API Documentation**    | SmallRye OpenAPI        | (via Quarkus) | Auto-generated Swagger UI and OpenAPI specs                         |
| **Database**             | PostgreSQL              | 14+           | Production database (H2 for local development)                      |
| **Migrations**           | Flyway                  | 9.0+          | Database versioning and migrations                                  |
| **Security**             | SmallRye JWT / OIDC     | (via Quarkus) | Token-based auth (replaces container-managed security)              |
| **Testing**              | JUnit 5 + REST Assured  | (via Quarkus) | Integration and REST API testing                                    |
| **Build Tool**           | Maven                   | 3.8+          | Same as Java EE projects                                            |

### Frontend

| Layer           | Technology                     | Version | Purpose                                                 |
|-----------------|--------------------------------|---------|---------------------------------------------------------|
| **Framework**   | React                          | 19+     | Component-based UI (replaces JSF server-side rendering) |
| **Language**    | TypeScript                     | 5.9+    | Type-safe JavaScript development                        |
| **Routing**     | React Router                   | 6+      | Client-side routing (replaces JSF navigation rules)     |
| **Build Tool**  | Vite                           | 8+      | Ultra-fast development server and production bundler    |
| **HTTP Client** | axios / fetch                  | -       | REST API communication with backend                     |
| **Styling**     | CSS Modules / Tailwind         | -       | Component-scoped or utility-first styling               |
| **Testing**     | Vitest + React Testing Library | -       | Unit and component testing                              |
| **Linting**     | ESLint                         | 9+      | Code quality and consistency                            |

### DevOps & Deployment

| Layer                    | Technology                                 | Purpose                                    |
|--------------------------|--------------------------------------------|--------------------------------------------|
| **Containerization**     | Docker                                     | Multi-stage builds for JVM/native binaries |
| **Orchestration**        | Kubernetes (optional)                      | Production deployment and scaling          |
| **Container Registry**   | Docker Hub / ECR / Harbor                  | Image storage and distribution             |
| **Database Persistence** | PostgreSQL + Persistent Volumes            | Stateful database in containers            |
| **Monitoring**           | Micrometer / Prometheus (Quarkus built-in) | Application metrics and health checks      |

---

## Why This Stack?

### For Java EE Developers (Migration Benefits)

#### 1. **Familiar Programming Model**

- **CDI remains unchanged**: `@Inject`, `@ApplicationScoped`, interceptors, events work identically
- **JPA/Hibernate**: Same ORM, just simpler with Panache (less boilerplate)
- **Bean Validation**: Same `@NotNull`, `@Size`, `@Email` annotations
- **Maven**: No build tool learning curve

**Translation:**

```
Java EE            →    Modern (Quarkus)
Managed Beans      →    CDI beans (@ApplicationScoped, @Inject)
EJB                →    CDI beans + @ApplicationScoped
JNDI               →    Constructor/field injection with @Inject
Session Beans      →    CDI application-scoped beans
Entity Beans       →    JPA @Entity (identical)
```

#### 2. **Stateless Thinking (REST over JSF)**

The main mental shift:

```
JSF (Stateful)              →    REST (Stateless)
JSF Managed Bean            →    @Path + @POST/@GET endpoint
JSF Form binding            →    JSON request body
JSF Session scope           →    JWT token in Authorization header
JSF Navigation rules        →    React Router client-side
FacesContext.addMessage()   →    HTTP response status + JSON error
```

#### 3. **Cloud-Native by Default**

- **Fast startup** (milliseconds vs seconds) — fits containerized environments
- **Low memory footprint** — optimized for cloud resource constraints
- **Native compilation** (GraalVM) — executable without JVM (~50MB vs 200MB+ with JVM)
- **Health checks** — Quarkus includes `/q/health` out of the box

#### 4. **Modern Frontend Separation**

- **React replaces JSF server-side rendering** — frontend is a separate SPA
- **Clear API boundary** — easier testing, scaling, and team separation
- **Better UX** — instant client-side navigation without page reloads
- **Flexible deployment** — frontend can be CDN-hosted; backend is pure API

---

## Current Project Alignment

### ✅ Already Implemented

The project is **~70% aligned** with the recommended stack:

| Component             | Status | Details                             |
|-----------------------|--------|-------------------------------------|
| Quarkus 3.8.3         | ✅      | Recent stable version               |
| RESTEasy Reactive     | ✅      | Endpoints wired up                  |
| Hibernate ORM Panache | ✅      | User domain entity in place         |
| CDI (ArC)             | ✅      | AuthService with @ApplicationScoped |
| Bean Validation       | ✅      | LoginRequest with @Valid            |
| OpenAPI/Swagger UI    | ✅      | Accessible at `/swagger-ui`         |
| React 19 + TypeScript | ✅      | Latest versions                     |
| Vite                  | ✅      | Modern build pipeline               |
| Docker Compose        | ✅      | Local orchestration working         |
| H2 (development)      | ✅      | Zero-config DB for dev              |

### 🔶 Partially Implemented (Gaps)

| Component        | Current                | Recommendation         | Priority |
|------------------|------------------------|------------------------|----------|
| Java version     | 17                     | Upgrade to 21 LTS      | Medium   |
| Database         | H2 in-memory           | PostgreSQL prod config | High     |
| Migrations       | `drop-and-create`      | Flyway versioning      | High     |
| Authentication   | Plain message response | JWT tokens             | High     |
| Frontend routing | Single page            | React Router           | Medium   |
| Security config  | None                   | SmallRye JWT extension | High     |

### ❌ Not Yet Implemented

- [ ] Flyway database migrations
- [ ] Production PostgreSQL configuration profile
- [ ] JWT token generation and validation
- [ ] React Router setup
- [ ] Error boundary and global error handling
- [ ] State management (Zustand/Redux) — *optional, add as needed*
- [ ] Component/unit test suite

---

## Migration Guide: From Java EE to Quarkus

### Phase 1: Foundation (Weeks 1-2)

- Understand REST-first thinking (no more stateful components)
- Read Quarkus documentation on CDI, JPA, REST
- Familiarize with Quarkus dev mode: `quarkus:dev`
- Practice: Convert one JSF backing bean to a REST endpoint

### Phase 2: Authentication & Security (Weeks 3-4)

- **Implement JWT flow** (replace form authentication)
    - Backend: Generate JWT on login
    - Frontend: Store token in localStorage, send in Authorization header
    - Backend: Validate token on protected endpoints
- Remove session/stateful auth assumptions

### Phase 3: Frontend Migration (Weeks 5-8)

- Add React Router for navigation
- Implement HTTP client (axios/fetch) for API calls
- Migrate JSF pages to React components
- Test React components with Vitest/React Testing Library

### Phase 4: Data Persistence (Weeks 9-10)

- Set up PostgreSQL locally (Docker)
- Create Flyway migration for schema
- Replace H2 with PostgreSQL in dev environment
- Test data migrations

### Phase 5: Observability & DevOps (Weeks 11+)

- Add Prometheus metrics
- Configure health checks
- Set up centralized logging
- Prepare Kubernetes manifests

---

## Best Practices by Layer

### Backend (Quarkus)

#### Project Structure

```
src/main/java/com/example/
├── domain/              # Pure business logic, no framework deps
│   ├── User.java
│   └── UserRepository.java (interface)
├── application/         # Use cases, orchestration
│   └── AuthService.java
├── infrastructure/      # Tech-specific implementations
│   ├── JpaUserRepository.java
│   └── SecurityConfig.java
└── api/                 # REST endpoints (thin layer)
    ├── AuthResource.java
    └── dto/
        ├── LoginRequest.java
        └── LoginResponse.java
```

#### Dependency Injection

```java
// ✅ Good: Constructor injection (Quarkus)
@ApplicationScoped
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// ⚠️ Avoid: Field injection (harder to test)
@ApplicationScoped
public class AuthService {
    @Inject
    UserRepository userRepository;
}
```

#### REST Endpoints

```java

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        LoginResult result = authService.login(request.username(), request.password());
        if (result.isSuccess()) {
            // Return JWT token, not just a message
            String token = generateJWT(result.userId());
            return Response.ok(new LoginResponse(token))
                    .build();
        }
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity(new LoginResponse("Invalid credentials"))
                .build();
    }
}
```

#### Panache ORM

```java
// ✅ Good: Use Panache repository methods
User user = User.find("username", username)
                .firstResult();

// Instead of traditional JPA boilerplate
User user = em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
        .setParameter("username", username)
        .getSingleResult();
```

### Frontend (React)

#### Component Structure

```typescript
// Keep components small and focused
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        navigate('/dashboard');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* form JSX */}
    </form>
  );
}
```

#### HTTP Client Setup

```typescript
// src/api/client.ts
export const apiClient = {
  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  },
};

// Usage in components
const { token } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
```

### DevOps

#### Docker Multi-Stage Build (JVM)

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /build/target/*-runner.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Kubernetes Deployment (Optional)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: myregistry/backend:latest
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /q/health/live
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
```

---

## Common Pitfalls & Solutions

### 1. Trying to Keep JSF Session State

**Problem:** Expecting `@SessionScoped` or `FacesContext` to work.  
**Solution:** Embrace statelessness. Use JWT tokens and store state on the client.

### 2. Returning Entities Directly from REST Endpoints

**Problem:** Circular references, N+1 queries, exposing internal structure.  
**Solution:** Use DTOs (Data Transfer Objects) and Panache `@Query` with `fetch=FetchType.EAGER`.

```java
// ❌ Bad
@POST
public User createUser(User user) { ...}

// ✅ Good
@POST
public Response createUser(CreateUserRequest request) {
    User user = new User(request.username(), request.email());
    user.persist();
    return Response.created(URI.create("/users/" + user.id))
            .entity(new UserResponse(user.id(), user.username()))
            .build();
}
```

### 3. Mixing Business Logic in REST Endpoints

**Problem:** Controllers become god objects.  
**Solution:** Keep the REST layer thin; push logic to services (application layer).

### 4. Not Validating on Frontend

**Problem:** Poor UX, assuming backend validation catches everything.  
**Solution:** Validate client-side with React forms + server-side with Bean Validation.

### 5. Hardcoding API URLs

**Problem:** Different URLs for dev/prod break deployments.  
**Solution:** Use environment variables or relative URLs.

```typescript
// ✅ Good: Use relative URLs
const API_BASE = '/api';

// ✅ Better: Use env variables
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

---

## Next Steps: Roadmap

### Short-term (Months 1-2)

- [ ] Upgrade Java to 21 LTS
- [ ] Implement JWT authentication in AuthService
- [ ] Add SmallRye JWT extension to `pom.xml`
- [ ] Create Flyway migration for initial schema
- [ ] Add PostgreSQL configuration profile
- [ ] Install React Router and set up routing
- [ ] Connect LoginPage to backend API

### Medium-term (Months 3-4)

- [ ] Add role-based access control (RBAC) with JWT claims
- [ ] Create additional REST endpoints (user management, profile, etc.)
- [ ] Build React pages for new endpoints
- [ ] Add integration tests (JUnit 5 + REST Assured)
- [ ] Set up centralized error handling (backend + frontend)
- [ ] Add Prometheus metrics and health checks

### Long-term (Months 5+)

- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline (GitHub Actions / GitLab CI)
- [ ] OpenTelemetry tracing
- [ ] Rate limiting and API gateway
- [ ] Advanced security (mTLS, OAuth2 flows)
- [ ] Performance optimization (caching, indexing)

---

## Learning Resources

### Quarkus

- [Quarkus Official Guide](https://quarkus.io/guides/)
- [Quarkus CDI Guide](https://quarkus.io/guides/cdi)
- [Quarkus REST Guide](https://quarkus.io/guides/resteasy-reactive)
- [Quarkus Panache Guide](https://quarkus.io/guides/hibernate-orm-panache)

### React & TypeScript

- [React Official Docs](https://react.dev)
- [React Router v6 Guide](https://reactrouter.com/6/start/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Security

- [JWT.io Introduction](https://jwt.io/introduction)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [SmallRye JWT Guide](https://smallrye.io/smallrye-jwt/)

### DevOps

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- [Flyway Documentation](https://flywaydb.org/documentation/)

---

## FAQ

**Q: Can I use Spring Boot instead of Quarkus?**  
A: Yes, but you lose the cloud-native advantages (fast startup, memory efficiency, native compilation). For a Java EE
background, Quarkus is more natural.

**Q: Do I need to learn reactive programming (Mutiny)?**  
A: No, not initially. Quarkus works fine with traditional imperative style. Reactive becomes valuable for
high-concurrency APIs.

**Q: When should I use PostgreSQL instead of H2?**  
A: Immediately in any environment beyond local dev (staging, production). H2 is for development only.

**Q: How do I handle CORS in production?**  
A: Configure it in `application.properties` with specific origins, not `*`. Use environment variables for different
environments.

**Q: Can I deploy both backend and frontend together?**  
A: Yes, serve the React build as static files from Quarkus. But separate deployments (frontend on CDN, backend on
Kubernetes) is more scalable.

---

## Conclusion

This stack provides a **natural evolution** from Java EE to modern, cloud-native development. The core Java concepts (
CDI, JPA, Bean Validation) remain unchanged, but you gain:

- ⚡ **Performance**: Fast startup, low memory
- ☁️ **Cloud-ready**: Docker + Kubernetes native
- 🧪 **Testability**: Stateless APIs, no session complexity
- 🚀 **Developer experience**: Hot reload, instant feedback
- 📈 **Scalability**: Horizontal scaling without session affinity

Start with the fundamentals (CDI, REST, Panache), master JWT authentication, then scale to reactive patterns and
distributed tracing as your needs grow.
