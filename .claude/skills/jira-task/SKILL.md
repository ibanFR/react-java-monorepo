---
name: jira-task
description: "Creates a Jira Task in the Gauzeder project. Accepts a single argument: the task summary. "
user-invocable: true
argument-hint: '<summary>'
allowed-tools:
  - AskUserQuestion
  - mcp__atlassian-rovo-mcp__atlassianUserInfo
  - mcp__atlassian-rovo-mcp__searchJiraIssuesUsingJql
  - mcp__atlassian-rovo-mcp__createJiraIssue
  - mcp__atlassian-rovo-mcp__createIssueLink
  - Bash
  - Glob
  - Grep
  - Read
---

# JIRA-TASK: Create a Jira Task

## Inputs

Parse the skill arguments:

- **summary** (required): the skill argument. If not provided, ask the user: "What should the task summary be?"

## Hardcoded values

- `cloudId`: `https://ibanfr.atlassian.net`
- `projectKey`: `GAUZ`
- `issueTypeName`: `Task`
- Never call `getAccessibleAtlassianResources`.

## Steps

1. **Ask the user which lookups to run** — use the `AskUserQuestion` tool with a single **multi-select** question ("Which lookups should I run before drafting the task?") offering these two options:

   - **Search the codebase** — "Search the codebase for relevant background"
   - **Search for related Jira issues** — "Search for related Jira issues in GAUZ"

   The tool also surfaces a built-in **"Other"** option, which here means **user-provided context**: free text the user types to supply background directly instead of (or in addition to) the lookups.

   Treat the response as follows: run lookup (a) only if **Search the codebase** was selected and lookup (b) only if **Search for related Jira issues** was selected. Run the enabled lookups below in parallel — do not wait for one before starting the others. The current-user lookup (c) always runs regardless of the answers. If the user supplies text via **"Other"**, use it as additional context when drafting the description in step 2 (feeding the `context` field), and still run whichever of (a)/(b) were also selected. If only **"Other"** is provided with no lookups selected, draft from the summary plus that user-provided context alone.

   **a. Search the codebase** — only if the user said yes. This is a full-stack monorepo with three independently built modules; pick the one(s) the summary touches:

   - `backend/` — Java 25 + Quarkus, hexagonal/DDD. Sources under `backend/src/main/java/com/ibanfr/`, layered (per bounded context) as `domain` (entities + repository ports), `application` (use-case services + value objects), `infrastructure.adapters.in.*` (inbound adapters, e.g. REST), `infrastructure.adapters.out.*` (outbound adapters, e.g. JPA). `auth` is the only context today, but search the whole `com/ibanfr/` tree so future contexts and adapter types are covered — never hardcode `auth`, `rest`, or `jpa`.
   - `frontend/` — React 19 + TypeScript + Vite. Components/pages under `frontend/src/` (e.g. `src/pages/`), tests co-located as `*.test.tsx`.
   - `docs/` — Jekyll documentation site; `architecture/` — Structurizr C4 model (`workspace.dsl`) and ADRs (`architecture/decisions/`).

   Strategy:

   1. **Identify candidate module(s)** — map key terms from the summary to `backend`, `frontend`, `docs`, or `architecture`. Most tasks touch one or two.
   2. **Find relevant code** — grep the chosen module(s) for key terms, working from the inside out for the backend (`domain` first, then `application`, then `infrastructure`):
      - Backend: `grep -rn "<key term>" backend/src/main/java/com/ibanfr/ --include="*.java" -l` — searches the entire source root so every current and future bounded context, layer, and adapter is included.
      - Frontend: `grep -rn "<key term>" frontend/src/ --include="*.ts" --include="*.tsx" -l`
      Keep the top 3–5 most relevant files (classes, interfaces, components) and their paths. Discard test files and generated/build output (`dist/`, `target/`).
   3. **Check architecture context** — if the task implies an architectural or schema change, skim `architecture/workspace.dsl`, `architecture/decisions/`, and (for persistence) `backend/src/main/resources/` (`import.sql`, `application.properties`).

   If no relevant module can be identified, skip silently.

   **b. Search for related Jira issues** — only if the user said yes. Call `mcp__atlassian-rovo-mcp__searchJiraIssuesUsingJql` with:
   - `cloudId`: `https://ibanfr.atlassian.net`
   - `jql`: `project = GAUZ AND text ~ "<key terms from summary>" ORDER BY updated DESC`
   - `maxResults`: `50` (the JQL tool enforces a 50–100 range; `50` is the minimum)
   - `fields`: `["summary", "status", "issuetype"]`

   Extract key terms from the summary (nouns, verbs, domain words — skip stop words). Keep only issues semantically related to the summary. Discard unrelated hits.

   **c. Resolve the current user** — always run. Call `mcp__atlassian-rovo-mcp__atlassianUserInfo` with no arguments. Extract and store the `accountId` for use as the assignee in step 3.

2. **Refine the summary, then generate description content** from the (refined) summary and lookup results:
   - **refinedSummary**: rewrite the user-provided summary for clarity — concise, imperative mood, no trailing period, leading with the action and its object (e.g. "logout endpoint" → "Add a logout endpoint to the auth API"). Preserve the original intent and any specific names/identifiers; do not invent scope. Use this refined summary in the confirmation preview (step 3) and as the `summary` when creating the issue (step 4). If the rewrite materially changes wording, note the original underneath the preview.
   - **objective**: 1–2 sentences stating what the task achieves and why.
   - **context**: 1–2 sentences of relevant background. If a module was identified in step 1a, name it and summarise its purpose using the files found. If key domain classes were found, mention them.
   - **relevantCode**: if codebase files were found in step 1a, a separate paragraph listing them as `"Relevant code: <path>, <path>, ..."`. Omit entirely if nothing was found.
   - **relatedIssues**: if Jira issues were found in step 1b, a separate paragraph starting with `"Related Jira issues: "` followed by one ADF link node per issue (text = KEY, href = `https://ibanfr.atlassian.net/browse/<KEY>`), separated by `", "` text nodes. Omit entirely if nothing was found.
   - **acceptanceCriteria**: 4–6 specific, testable bullet points derived from the summary.

3. **Present for confirmation** — display the following to the user and ask "Create this Jira task? (yes / no / edit)":

   ```
   **Summary**: <refinedSummary>
   **Project**: GAUZ
   
   ### Objective
   <generated objective>
   
   ### Context
   <generated context>
   <if relevant code found> Relevant code: <path>, <path>, ...
   <if related issues found> Related Jira issues: <KEY>, <KEY>, ...
   
   ### Acceptance Criteria
   <generated acceptance criteria as a bullet list>
   
   Related issues to link: <KEY>, <KEY>, … (or "None")
   
   <if reworded> Original summary: <summary>
   ```

   - If the user says **no**: abort and inform them no issue was created.
   - If the user says **edit**: ask what to change, update the content, and show the preview again.
   - If the user says **yes**: proceed to the next step.

4. **Create the issue** — call `mcp__atlassian-rovo-mcp__createJiraIssue` with:
   - `cloudId`: `https://ibanfr.atlassian.net`
   - `projectKey`: `GAUZ`
   - `summary`: the refined summary from step 2
   - `issueTypeName`: `Task`
   - `contentFormat`: `adf`
   - `assignee_account_id`: the `accountId` from step 1c
   - `description`: the ADF document below with generated content substituted in

5. **Link related issues** — for each related issue found in step 1b, call `mcp__atlassian-rovo-mcp__createIssueLink` with:
   - `cloudId`: `https://ibanfr.atlassian.net`
   - `type`: `Relates`
   - `inwardIssue`: the new issue key
   - `outwardIssue`: the related issue key

6. Output the following as plain text (no code block). Use the raw URL so the terminal auto-detects it as a clickable link:

Created: ISSUE_KEY — https://ibanfr.atlassian.net/browse/ISSUE_KEY
Related issues linked: KEY, KEY, … (or "None")

## Description ADF document

Use Atlassian Document Format (ADF). Substitute the generated content into the corresponding nodes:

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Objective" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "<generated objective>" }]
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Context" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "<generated context>" }]
    },
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Relevant code: <path>, <path>, ..." }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Related Jira issues: " },
        { "type": "text", "text": "<KEY>", "marks": [{ "type": "link", "attrs": { "href": "https://ibanfr.atlassian.net/browse/<KEY>" } }] }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "Acceptance Criteria" }]
    },
    {
      "type": "panel",
      "attrs": { "panelType": "info" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "List clear, verifiable conditions that must be met for the task to be considered complete. Use a bulleted list." }]
        }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        "<one listItem per generated acceptance criterion — each with type:listItem > type:paragraph > type:text>"
      ]
    }
  ]
}
```

> **Note on conditional ADF nodes**: The `Relevant code` paragraph and the `Related Jira issues` paragraph must be **omitted entirely** from the ADF `content` array if their respective data was not found. Do not include them as empty or placeholder nodes.
