## Transport Security (Future Iteration)

### Current State

All communication between the browser, the React SPA, and the Quarkus API currently travels over **plain HTTP** in both local development and the Docker Compose stack. No TLS termination is configured in the backend (`quarkus.http.ssl.*` is absent from `application.properties`) and the Docker Compose service does not expose an HTTPS port.

The `POST /api/auth/login` request body carries a username and password in plaintext JSON. Without transport encryption this is vulnerable to interception on any network that is not fully trusted.

---

### Plan

#### Phase 1 – TLS in Production (Reverse Proxy)

Terminate TLS at a reverse proxy or load balancer that sits in front of the Quarkus API container. The Quarkus service itself continues to listen on HTTP internally; HTTPS is enforced externally.

**Steps:**

1. Place an [nginx](https://nginx.org/) or [Traefik](https://traefik.io/) reverse proxy in front of the backend container.
2. Provision a TLS certificate:
   - **Cloud / production**: use a managed certificate (AWS ACM, GCP Certificate Manager, etc.) or Let's Encrypt via Certbot / Traefik's ACME provider.
   - **Internal / staging**: issue a certificate from an internal CA.
3. Configure the proxy to:
   - Listen on port 443 (HTTPS).
   - Redirect HTTP (port 80) to HTTPS permanently (`301`).
   - Forward decrypted traffic to the Quarkus container on port 8080.
4. Update `QUARKUS_HTTP_CORS_ORIGINS` to the HTTPS origin of the React SPA.
5. Set the `Strict-Transport-Security` (HSTS) response header in the proxy to enforce HTTPS in the browser cache.

No changes to Quarkus source code are required for this phase.

---

#### Phase 2 – TLS Directly on Quarkus (Optional / Defence-in-Depth)

If end-to-end encryption between the proxy and the backend is required (e.g., mutual TLS inside a service mesh), configure Quarkus to serve HTTPS natively.

**Quarkus configuration additions (`application.properties`):**

```properties
# Enable HTTPS on port 8443
quarkus.http.ssl-port=8443
quarkus.http.ssl.certificate.key-store-file=tls/keystore.p12
quarkus.http.ssl.certificate.key-store-password=${KEYSTORE_PASSWORD}
quarkus.http.ssl.certificate.key-store-file-type=PKCS12

# Optionally redirect HTTP to HTTPS
quarkus.http.insecure-requests=redirect
```

**Docker Compose update** — expose the HTTPS port and inject the keystore password:

```yaml
backend:
  ports:
    - "8443:8443"
  environment:
    KEYSTORE_PASSWORD: "${KEYSTORE_PASSWORD}"
  volumes:
    - ./tls:/deployments/tls:ro
```

Store `KEYSTORE_PASSWORD` in a secrets manager or `.env` file that is excluded from version control (add `tls/` and `.env` to `.gitignore`).

---

#### Phase 3 – React SPA Hardening

Once the API serves HTTPS:

1. Update the Vite proxy target (`vite.config.ts`) and any `fetch` base URLs to use `https://`.
2. Set the `Secure` flag on any cookies set by the API.
3. Add a `Content-Security-Policy` header that restricts `connect-src` to the HTTPS API origin.
4. Add `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` to all API responses (configure in `AuthResource` or a Quarkus HTTP filter).

---

### Acceptance Criteria

| # | Criterion |
|---|---|
| 1 | All browser → API traffic uses HTTPS in the production / staging environment |
| 2 | HTTP requests to the API are automatically redirected to HTTPS |
| 3 | The TLS certificate is valid, trusted, and renewed automatically |
| 4 | `Strict-Transport-Security` header is present on all HTTPS responses |
| 5 | No credentials appear in plain HTTP traffic in any non-local environment |
| 6 | Keystore passwords and private keys are not committed to the repository |

---

### Related

- ADR `0001-use-quarkus.md` — Quarkus was chosen partly for its native Quarkus Extensions ecosystem, which includes `quarkus-tls-registry` for certificate management.
- [Quarkus TLS documentation](https://quarkus.io/guides/tls-registry-reference)
- [OWASP Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
