# ADR-0001: Use Quarkus as the backend runtime

Date: 2024-01-01

## Status

Accepted

## Context

We need a JVM-based backend framework that starts fast, supports Jakarta EE APIs, and fits well in a containerised environment. The team is familiar with Java and standard CDI / JAX-RS conventions.

## Decision

We will use [Quarkus](https://quarkus.io/) as the runtime for the backend service.

## Consequences

- Fast startup time and low memory footprint enable efficient Docker-based local development.
- Native Panache support simplifies the Repository pattern implementation.
- Dev mode with live reload accelerates the inner development loop.
- The team must learn Quarkus-specific configuration (`application.properties`) but retains familiar Jakarta EE annotations.
