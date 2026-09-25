# Atlas Autonomous Reasoning Loop v0.2
Date: 2026-09-25
Status: NON-PRODUCTION RELEASE CANDIDATE

## Objective
Make Atlas reason over material changes without requiring a ChatGPT conversation to manually assemble each decision.

## Operating law
**Autonomous reasoning is allowed. Autonomous truth mutation and consequential external action are not.**

Atlas may independently:
- detect material evidence changes
- identify affected cases
- recompute deterministic evidence/economic logic
- select permitted reasoning providers by data class
- run the six executive mandates
- invoke focused challenge lenses
- preserve dissent and hard stops
- produce one integrated recommendation
- record provenance and later outcomes

Atlas may not independently:
- promote relationship or pipeline into commitment / contracted revenue
- upgrade evidence without underlying evidence
- send external messages
- sign / pay / change commercial rights
- rotate credentials or permissions
- mutate pricing, supplier ranking or forecasts as learned truth

## Cycle
NEW OBSERVATION / OUTCOME
-> MATERIALITY DELTA
-> AFFECTED CASE RESOLUTION
-> DETERMINISTIC BRAIN
-> DATA-CLASS ROUTING GATE
-> EXECUTIVE REASONING
-> FOCUSED CHALLENGE LENSES
-> EXECUTIVE INTEGRATOR
-> ONE RECOMMENDATION
-> HUMAN AUTHORITY
-> OUTCOME
-> LEARNING

## Executive mandates
Standing:
- CEO
- CFO
- CTO
- CCO
- COO
- CIO

## Focused challenge lenses
Available:
- STRATEGIST
- HUNTER
- IC
- RED_TEAM
- COMPETITOR
- NEGOTIATOR
- SENTINEL
- AUDITOR
- OPERATOR
- SYSTEM

The cycle selects only a bounded subset of challenge lenses for each case to control cost and noise.

## Data routing
Default case data class is **CONFIDENTIAL_COMMERCIAL** if no explicit class is supplied.

This is intentionally conservative.

### PUBLIC
Gemini Developer API free tier may be used when configured and benchmark-approved.

### INTERNAL / CONFIDENTIAL / PRIVATE
Gemini free is not permitted by the current Atlas data policy.

If no approved provider exists, Atlas still runs:
- materiality
- evidence classification
- money logic
- blocker logic
- next-action selection
- deterministic recommendation

and marks the case as `reasoned_deterministically`.

It does not fabricate an AI committee.

## Reasoning truth
Model outputs remain `INFERENCE`.

Evidence remains the underlying:
- source artifact
- contract / PO / invoice / acceptance record
- direct written confirmation
- transaction
- verified public publication
- observed outcome

## Triggering
By default the cycle only reasons cases linked to a meaningful change.

`force=true` is reserved for deliberate full review / benchmark / release validation.

## Integration
The Executive Integrator does not vote.

Any material hard stop from:
- an executive persona, or
- a selected challenge lens

can force a HOLD disposition.

## Current limitation
The production Brain Memory baseline still contains synthetic persona views.

Brain v0.2 does not claim live private-data AI reasoning until an approved private-data provider exists.

For the current zero-cost architecture:
- PUBLIC reasoning can use Gemini after benchmark success.
- proprietary/private cases remain deterministic unless a separately approved provider route exists.

## Release gate before production
1. Gemini PUBLIC smoke test returns a successful structured response.
2. Five-source Gemini benchmark passes Atlas factuality/citation threshold.
3. Autonomous-cycle tests pass.
4. Current synthetic Brain Memory is clearly separated from new live/deterministic provenance.
5. Private-schema RLS defense-in-depth decision is reviewed.
6. Application reads latest approved Brain v0.2 outputs instead of treating hard-coded Phase-0 cards as live truth.
7. Human authority remains required for consequential external action.
8. Production deployment receives explicit approval.
