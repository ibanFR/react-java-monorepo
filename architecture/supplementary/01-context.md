# 01 – System Context

## Purpose

This monorepo implements a full-stack **authentication system** composed of two independently deployable services:

- **React SPA** – a browser-based login interface built with React 19 + Vite.
- **Quarkus API** – a REST API that validates credentials and returns an authentication result.

## Users

A single external actor interacts with the system: the **User**, who opens the login page in a browser, enters their credentials, and receives either a success or an error response.

## External Dependencies

| Dependency | Role |
|---|---|
| Browser | Renders and runs the React SPA |
| H2 (dev) / PostgreSQL (prod) | Stores user credentials |

The system has no external identity provider in the current scope; authentication is handled internally by the Quarkus API against the application database.
