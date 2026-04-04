---
title: Structurizr
parent: Architecture Reference
---

# Structurizr for Architecture Documentation
{: .no_toc }

Research findings, recommended workspace folder structure, and open-source examples for adopting Structurizr Lite in this monorepo.
{: .fs-6 .fw-300 }

---

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## What is Structurizr?

[Structurizr](https://structurizr.com/) is a set of tooling for creating software architecture diagrams and documentation based on the [C4 model](https://c4model.com/). Rather than drawing diagrams by hand, you define a single architecture **model** in the [Structurizr DSL](https://github.com/structurizr/dsl) and Structurizr generates multiple views (diagrams) from it automatically.

**Structurizr Lite** is the self-hosted, free version. It reads a `workspace.dsl` file from a local directory and provides a browser-based UI for viewing and editing diagrams.

Reference: [https://docs.structurizr.com/local/quickstart](https://docs.structurizr.com/local/quickstart)

---

## Folder Structure

This monorepo already has a `docs/` directory for the Jekyll-based documentation site. The Structurizr workspace lives in a separate top-level `architecture/` directory to keep it self-contained and mountable as a single Docker volume without coupling to the Jekyll site.

The supplementary Markdown folder inside the workspace is named `supplementary/` (not `docs/`) to avoid any ambiguity with the site's `docs/` directory.

```
react-java-monorepo/
├── backend/                           # Java / Quarkus API
├── frontend/                          # React / Vite SPA
├── docs/                              # Jekyll documentation site
│   └── _architecture/
│       └── reference/
│           └── structurizr.md         # ← this file
├── architecture/                      # Structurizr workspace
│   ├── workspace.dsl                  # Main entry point (required by Structurizr Lite)
│   ├── model.dsl                      # !include – people, systems, containers, components
│   ├── views.dsl                      # !include – system context, container, component views
│   ├── styles.dsl                     # !include – element / relationship styles & themes
│   ├── decisions/                     # Architecture Decision Records (ADRs)
│   │   ├── 0001-use-quarkus.md
│   │   └── 0002-use-react-vite.md
│   └── supplementary/                 # Supplementary Markdown documentation
│       ├── 01-context.md
│       └── 02-containers.md
├── docker-compose.yml
└── README.md
```

### Key design decisions

| Decision | Rationale |
|---|---|
| Top-level `architecture/` directory | Keeps Structurizr workspace isolated from the Jekyll site and from source code. Structurizr Lite expects a single directory to mount. |
| Split `workspace.dsl` into `model.dsl`, `views.dsl`, `styles.dsl` via `!include` | Follows the DSL best practice of separating concerns; each file has a single responsibility and stays readable as the model grows. |
| `decisions/` inside `architecture/` | ADRs are referenced directly from the DSL (`!adrs`) so Structurizr Lite can render them alongside diagrams. |
| `supplementary/` instead of `docs/` | Supplementary Markdown sections for the Structurizr UI (`!docs`) are stored under `supplementary/` to avoid confusion with the repo's `docs/` Jekyll site. |

### `workspace.dsl`

```dsl
workspace "react-java-monorepo" "Authentication monorepo – React SPA + Quarkus API" {

    !adrs decisions
    !docs supplementary

    !include model.dsl
    !include views.dsl
    !include styles.dsl
}
```

---

## Running Structurizr Lite Locally

Structurizr Lite is included as a service in `docker-compose.yml`. It is available on port **8090** to avoid conflicting with the Quarkus API on port 8080 and the Quarkus test HTTP port on port 8081.

### Start only Structurizr

```bash
docker compose up structurizr
```

Open [http://localhost:8090](http://localhost:8090) in your browser.

### Start the full stack (backend + frontend + Structurizr)

```bash
# Build the backend JAR first (required for the backend Docker image)
cd backend && mvn package -DskipTests && cd ..

docker compose up
```

| Service | URL |
|---|---|
| React SPA | http://localhost:5173 |
| Quarkus API | http://localhost:8080 |
| Structurizr Lite | http://localhost:8090 |

### Useful Structurizr Lite URLs

| Page | URL |
|---|---|
| Diagrams | http://localhost:8090/workspace/diagrams |
| Documentation | http://localhost:8090/workspace/documentation |
| Decisions (ADRs) | http://localhost:8090/workspace/decisions |

### Without Docker

If you have Java 17+ available locally, you can run Structurizr Lite as a standalone JAR:

```bash
# Download the latest release
curl -L -o /tmp/structurizr-lite.jar \
  https://github.com/structurizr/lite/releases/latest/download/structurizr-lite.jar

# Run it, pointing at the architecture directory
java -jar /tmp/structurizr-lite.jar ./architecture
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Open-Source Examples on GitHub

The following open-source projects demonstrate Structurizr DSL usage in different contexts.

### 1. masad – Minimal Approach to Software Architecture Documentation

- **Repo:** [max-arshinov/masad](https://github.com/max-arshinov/masad) ⭐ 88
- **What it shows:** A concrete implementation of Simon Brown's "minimal approach" combining Structurizr Lite + Arc42 + ADR Tools. The workspace is split across `workspace.dsl`, `model.dsl`, `views.dsl`, and `archetypes.dsl` using `!include`. Multiple workspaces coexist in the same repo (`baseline/`, `target/`, `copilot/`).
- **Notable pattern:** Each workspace lives in its own subfolder with its own `workspace.dsl`, making it easy to evolve the architecture model alongside the code.

```
masad/
├── baseline/
│   ├── workspace.dsl
│   ├── model.dsl
│   ├── views.dsl
│   ├── archetypes.dsl
│   └── adrs/
├── target/
│   └── workspace.dsl
├── copilot/
│   └── workspace.dsl
└── docker-compose.yml
```

### 2. arc42-c4-software-architecture-documentation-example

- **Repo:** [bitsmuggler/arc42-c4-software-architecture-documentation-example](https://github.com/bitsmuggler/arc42-c4-software-architecture-documentation-example) ⭐ 190
- **What it shows:** Combines the Arc42 documentation template with Structurizr DSL and ADRs in a `documentation/` folder. The DSL file (`bank.dsl`) embeds `!docs` and `!adrs` references to pull in Arc42 sections and decision records into the Structurizr UI.
- **Notable pattern:** Architecture artefacts (DSL, docs, ADRs) are co-located in a single `documentation/` directory, keeping them close together.

```
arc42-c4-software-architecture-documentation-example/
└── documentation/
    ├── bank.dsl
    ├── arc42/          # Arc42 Markdown sections
    ├── adrs/           # Architecture Decision Records
    └── tdrs/           # Technical Design Records
```

### 3. structurizr-site-generatr

- **Repo:** [avisi-cloud/structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr) ⭐ 316
- **What it shows:** A static site generator (Kotlin/Gradle) that reads a Structurizr DSL workspace and produces a full documentation website with diagrams, decision records, and markdown pages. Useful when the goal is to publish architecture as a standalone site (similar to the existing Jekyll docs site in this repo).
- **Notable pattern:** Demonstrates how Structurizr models can be the source for a published documentation site, not just a local viewer.

### 4. goadesign/model

- **Repo:** [goadesign/model](https://github.com/goadesign/model) ⭐ 456
- **What it shows:** An alternative Go-based DSL for C4 models that generates Structurizr-compatible workspaces. Useful as a reference for how C4 model concepts map to DSL elements, even if using the official Structurizr DSL.

---

## Comparison of Workspace Organisation Patterns

| Pattern | Example | Best for |
|---|---|---|
| Single flat `workspace.dsl` | Most tutorials | Small projects, getting started |
| Split by concern (`model.dsl`, `views.dsl`, `styles.dsl`) | masad, this recommendation | Medium–large projects, team collaboration |
| Architecture in `documentation/` subfolder | bitsmuggler example | Projects combining Arc42 + ADR + DSL |
| Architecture as a standalone repo | Enterprise multi-team setups | When multiple teams share the same architecture model |
| Generated documentation site | structurizr-site-generatr | When architecture docs are published as a website |

---

## References

- [Structurizr Lite Quickstart](https://docs.structurizr.com/local/quickstart)
- [Structurizr DSL Language Reference](https://github.com/structurizr/dsl/blob/master/docs/language-reference.md)
- [C4 Model](https://c4model.com/)
- [Simon Brown – A Minimal Approach to Software Architecture Documentation](https://dev.to/simonbrown/a-minimal-approach-to-software-architecture-documentation-4k6k)
- [Getting Started with Structurizr Lite](https://dev.to/simonbrown/getting-started-with-structurizr-lite-27d0)
