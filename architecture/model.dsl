model {

    user = person "User" "A person who authenticates via the login page."

    authSystem = softwareSystem "react-java-monorepo" "Full-stack authentication system." {

        spa = container "React SPA" "Login UI built with React 19 and Vite." "React + TypeScript" {
            tags "Frontend"
        }

        api = container "Quarkus API" "REST API that handles authentication." "Java 25 + Quarkus 3" {
            tags "Backend"

            restAdapter = component "AuthResource" "JAX-RS inbound adapter. Exposes POST /api/auth/login." "JAX-RS"
            authService = component "AuthService" "Login use-case orchestration." "CDI Bean"
            userRepo = component "UserRepository" "Domain repository (JPA/Panache implementation)." "JPA/Panache"
        }

        db = container "H2 / PostgreSQL" "Stores user credentials. H2 in-memory for dev/test; PostgreSQL for production." "RDBMS" {
            tags "Database"
        }
    }

    user -> spa "Opens login page in browser"
    spa  -> restAdapter "Invokes REST endpoint /api/auth/login" "JSON / HTTPS"

    restAdapter -> authService "Delegates login use-case"
    authService -> userRepo   "Looks up user by username"
    userRepo    -> db         "Reads from and writes to" "JDBC"

}
