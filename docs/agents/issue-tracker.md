# Issue tracker: Jira (GAUZ)

Issues and specs for this repo live as Jira tickets in project **GAUZ**, accessed through the Atlassian Rovo MCP (`mcp__atlassian-rovo-mcp__*`). GitHub Issues are **not** used.

## Connection rules

- `cloudId`: `https://ibanfr.atlassian.net`. Never call `getAccessibleAtlassianResources`.
- `projectKey`: `GAUZ`.
- JQL searches: pass `maxResults: 50` (the tool's minimum) and a narrow `fields` list.
- Ticket URL: `https://ibanfr.atlassian.net/browse/<KEY>`.
- If an operation isn't a primary tool, find it with `discover` and run it with the matching `executeRead` / `executeWrite` / `executeDestructive` tool. Never guess operation names.

## Conventions

- **Create an issue**: `createJiraIssue` with `issueType` `Task` (or `Story` / `Bug` / `Epic` as fits), markdown `description`, optional `labels`.
- **Read an issue**: `getJiraIssue` with the issue key.
- **List issues**: `searchJiraIssuesUsingJql`, e.g. `project = GAUZ AND labels = "needs-triage" AND statusCategory != Done ORDER BY updated DESC`.
- **Make an issue a child of a parent**: set `parent` to the parent key on create, or edit the `parent` field later with `editJiraIssue`.
- **Comment on an issue**: `addOrEditJiraIssueComment`.
- **Apply / remove labels**: `editJiraIssue` on the `labels` field. Read current labels first and write back the full list. Jira creates labels on first use.
- **Close**: comment with the outcome, then `transitionJiraIssue` to Done.

## Pull requests as a triage surface

**PRs as a request surface: no.** Triage runs on Jira tickets only.

## When a skill says "publish to the issue tracker"

Create a GAUZ ticket.

## When a skill says "fetch the relevant ticket"

Take the key from the branch name (`GAUZ-<n>-<description>`) and read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Epic, and its **child** tickets are the work items.

- **Map**: a GAUZ Epic labelled `wayfinder:map`. Its description holds the Notes, Decisions-so-far and Fog sections.
- **Child ticket**: a GAUZ ticket with `parent` set to the map Epic and labelled `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Once claimed, it is assigned to the driving dev.
- **Blocking**: a Jira "Blocks" issue link from blocker to blocked, created with the link operation found via `discover`. A ticket is unblocked when every blocker is Done.
- **Frontier query**: `project = GAUZ AND parent = <map> AND statusCategory != Done AND assignee IS EMPTY`, then drop tickets that have an unresolved "is blocked by" link. The first in rank order wins.
- **Claim**: assign the ticket to the current user (`accountId` from `atlassianUserInfo`) with `editJiraIssue`. This is the session's first write.
- **Resolve**: comment with the answer, `transitionJiraIssue` to Done, then add a context pointer (gist + ticket link) under the map's Decisions-so-far.
