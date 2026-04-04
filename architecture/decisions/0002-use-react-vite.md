# ADR-0002: Use React with Vite as the frontend stack

Date: 2024-01-01

## Status

Accepted

## Context

We need a modern frontend stack for the single-page application. The UI is a login form today but must be easy to extend. TypeScript support, fast HMR, and a lean production build are key requirements.

## Decision

We will use [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/) as the build tool.

## Consequences

- Vite's native ESM dev server provides near-instant HMR during development.
- React's component model allows the login page to be composed from reusable pieces.
- TypeScript strict mode catches type errors at compile time, reducing runtime bugs.
- The `dist/` output is a static bundle that can be served from any CDN or web server.
