# Issue tracker: Jira (GAUZ)

Issues and specs for this repo live as Jira tickets in project **GAUZ**, accessed through the Atlassian Rovo MCP (`mcp__atlassian-rovo-mcp__*`). Triage, specs and tickets all go through Jira.

## Atlassian Rovo MCP rules

These apply to every Rovo MCP call, Jira or Confluence:

- **MUST** pass `cloudId: "https://ibanfr.atlassian.net"`. It is fixed, so skip `getAccessibleAtlassianResources`.
- **MUST** use Jira project key `GAUZ`.
- **MUST** keep result sets small: a narrow `fields` list for JQL; `limit: 10` for Confluence CQL.
- Run operations that aren't primary tools by the exact name `discover` returns, through the matching `executeRead` / `executeWrite` / `executeDestructive` tool.
- Ticket URL: `https://ibanfr.atlassian.net/browse/<KEY>`.

## Conventions

- **Create an issue**: `createJiraIssue` with `issueType` `Task` (or `Story` / `Bug` / `Epic` as fits), markdown `description`, optional `labels`.
- **Read an issue**: `getJiraIssue` with the issue key.
- **List issues**: `searchJiraIssuesUsingJql`, e.g. `project = GAUZ AND labels = "needs-triage" AND statusCategory != Done ORDER BY updated DESC`.
- **Make an issue a child of a parent**: set `parent` to the parent key on create, or edit the `parent` field later with `editJiraIssue`.
- **Comment on an issue**: `addOrEditJiraIssueComment`.
- **Apply / remove labels**: `editJiraIssue` on the `labels` field. Read current labels first and write back the full list. Jira creates labels on first use.
- **Close**: comment with the outcome, list the issue's transitions with `listJiraIssueTransitions` (via `executeRead`), then `transitionJiraIssue` with the id of the transition whose target status category is Done. Always resolve the id this way: transition ids vary by workflow and current status.

## Pull requests as a triage surface

**PRs as a request surface: no.** Triage runs on Jira tickets only.

## When a skill says "publish to the issue tracker"

Create a GAUZ ticket.

## When a skill says "fetch the relevant ticket"

Take the key from the branch name (`GAUZ-<n>-<description>`) and read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single Epic, and its **child** tickets are the work items.

- **Map**: a GAUZ Epic labelled `wayfinder:map`. Its description holds the wayfinder map body: **Destination**, **Notes**, **Decisions so far**, **Not yet specified**, **Out of scope**.
- **Child ticket**: a GAUZ ticket with `parent` set to the map Epic and labelled `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`). Once claimed, it is assigned to the driving dev.
- **Blocking**: a Jira "Blocks" issue link from blocker to blocked, created with the link operation found via `discover`. A blocker is resolved once its `statusCategory` is Done; a ticket is unblocked when every blocker is resolved.
- **Frontier query**: `project = GAUZ AND parent = <map> AND statusCategory != Done AND assignee IS EMPTY ORDER BY Rank ASC` with `issuelinks` in `fields`. Drop each ticket with an "is blocked by" link whose linked issue's `statusCategory` is not Done. The first remaining ticket wins.
- **Claim**: assign the ticket to the current user (`accountId` from `atlassianUserInfo`) with `editJiraIssue`. This is the session's first write.
- **Resolve**: comment with the answer, close as in **Close** above, then add a context pointer (gist + ticket link) under the map's **Decisions so far**.
