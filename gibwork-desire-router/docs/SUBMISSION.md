# Gibwork Developer Hackathon submission pack

## Project

**Gibwork Desire Router — intent-to-bounty delegation for AI agents**

## Use case and value

An AI agent receives a desired outcome. Instead of hallucinating capability or blindly making another tool call, Desire Router decides whether the work should stay local, be delegated, be split into a hybrid workflow, or stop for human approval. When delegation is justified it emits a bounded Gibwork task brief with budget, deadline, evidence requirements and safety boundaries.

The novelty is the **control-plane decision before marketplace execution**: agents delegate because the outcome genuinely needs external capability, not merely because a bounty API exists.

## Gibwork toolset

- Official `@gibwork/sdk` client for authenticated `tasks.listAvailable` and optional `tasks.create`.
- Gibwork public explore API for wallet-free read-only discovery.
- CLI for terminal/automation workflows.
- MCP server exposing safe read/prepare tools to AI agents.

## Setup

```bash
npm install
npm test
```

Optional wallet-backed operations are documented in `.env.example`. Secrets remain local.

## Commands

```bash
node dist/src/cli.js route "<desired outcome>" --budget 100 --hours 12
node dist/src/cli.js discover --min 50
node dist/src/cli.js prepare "<desired outcome>" --budget 100 --hours 12
node dist/src/mcp.js
```

## Evidence

- Automated tests: `test/router.test.ts`
- Spend boundary: no MCP tool exposes funded creation; CLI funded creation needs explicit `--execute` + local key + `GIBWORK_ALLOW_SPEND=YES`.
- CI workflow installs Node 22 dependencies, builds, tests, and captures a dry-run demo transcript.

## Submission checklist

- [x] Public source branch
- [x] Written use-case/value summary
- [x] Gibwork toolset identified
- [x] Install/setup instructions
- [x] Environment variables documented
- [x] Commands + sample I/O
- [x] MIT license
- [x] Automated tests
- [ ] Green GitHub Actions receipt
- [ ] Final terminal screenshot / short demo recording
- [ ] Participant Discord role / current platform submission gate

## Bounty

Gibwork Developer Hackathon bounty ID: `1052f22d-3f87-4b1d-b0d7-71a60679e7fa`.
