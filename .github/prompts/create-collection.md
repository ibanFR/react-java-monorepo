---
mode: 'agent'
description: 'Add a new Jekyll just-the-docs collection to the documentation site'
---

Add a **`${input:collection-name}`** collection to the Jekyll documentation site under `docs/`.

Follow every step below exactly. Do not skip any step.

---

## Step 1 — Create the folder structure

Create the following directories inside `docs/`:

```
docs/_${input:collection-name}/
docs/_${input:collection-name}/explanation/
docs/_${input:collection-name}/how-to/
docs/_${input:collection-name}/reference/
```

---

## Step 2 — Create the landing pages

Create one Markdown landing page per subfolder. Use the exact filenames and front matter shown below.

### `docs/_${input:collection-name}/explanation/${input:collection-name}-explanation.md`

```markdown
---
title: ${input:collection-name} Concepts
nav_order: 1
---

# ${input:collection-name} Concepts
{: .no_toc }

Explanation of ${input:collection-name} concepts, practices, and principles.
{: .fs-6 .fw-300 }
```

### `docs/_${input:collection-name}/how-to/${input:collection-name}-how-to.md`

```markdown
---
title: ${input:collection-name} How-To
nav_order: 2
---

# ${input:collection-name} How-To Guides
{: .no_toc }

Step-by-step guides for ${input:collection-name} tasks and workflows.
{: .fs-6 .fw-300 }
```

### `docs/_${input:collection-name}/reference/${input:collection-name}-reference.md`

```markdown
---
title: ${input:collection-name} Reference
nav_order: 3
---

# ${input:collection-name} Reference
{: .no_toc }

Reference material for ${input:collection-name} concepts, patterns, and practices.
{: .fs-6 .fw-300 }
```

---

## Step 3 — Register the collection in `docs/_config.yml`

Open `docs/_config.yml` and make **three** additions:

### 3a. Under `collections:` — enable output

```yaml
collections:
  # ...existing entries...
  ${input:collection-name}:
    output: true
```

### 3b. Under `just_the_docs: collections:` — set the display name

```yaml
just_the_docs:
  collections:
    # ...existing entries...
    ${input:collection-name}:
      name: ${input:collection-name}
```

### 3c. Under `defaults:` — apply the default layout

```yaml
defaults:
  # ...existing entries...
  - scope:
      path: ""
      type: "${input:collection-name}"
    values:
      layout: default
```

---

## Step 4 — Verify the site builds without errors

Start the Jekyll development server from the `docs/` directory and check the console output for errors:

```bash
cd docs && bundle exec jekyll serve --trace 2>&1
```

- Wait for the line `Server address: http://127.0.0.1:4000` to confirm the server started successfully.
- If the build fails, read the full error output and fix the root cause before proceeding.
- Common errors to watch for:
  - **`Unknown tag`** — a Liquid tag is missing or misspelled in a Markdown file.
  - **`Invalid date`** — a page is missing required front matter fields.
  - **`Could not find collection`** — the collection is not registered in `_config.yml`.
  - **`Layout does not exist`** — the `layout` value in `defaults` does not match a file in `_layouts/`.
- Once the server is running cleanly, stop it with `Ctrl+C`.

---

## Naming conventions

- Collection folder name: `_${input:collection-name}` (lowercase, hyphen-separated).
- Landing page filenames: `${input:collection-name}-explanation.md`, `${input:collection-name}-how-to.md`, `${input:collection-name}-reference.md`.
- Front matter `title` values: title-cased, space-separated (e.g. `My Collection Reference`).
- Child pages added later must include `parent: ${input:collection-name} <Section>` to nest correctly in the sidebar.

