# Retrieval evaluations

This feature tests lexical document retrieval, not generated answers, model behavior or production readiness.

## User flow

1. Open Evaluations → Source retrieval.
2. Create a named suite and select an immutable Agent version.
3. Add 1–10 distinct search queries, each with one expected active document already pinned to that version.
4. Save the immutable suite and run it.
5. Inspect each case: expected document, returned document IDs, pass/fail and persisted source-search ID.

A case passes only when its expected document is in the first five retrieved sources. Counts are computed from actual search results. A passing suite never approves deployment. Configuration checks remain available in their own tab.

## Persistence and authorization

Migration 012 adds append-only, forced-RLS suite/evaluation tables with composite tenant foreign keys. Authors can create suites; source operators can run them; workspace readers can inspect history. Neither table grants runtime UPDATE or DELETE.

The caller owns one transaction for the evaluation and all source searches. Any failed case execution rolls back the whole operation. A successful search with no expected match is a recorded failed test case, not an execution error. Request IDs are idempotent for the same suite and actor and reject conflicting reuse. Archived agents or unavailable knowledge cannot execute new searches; historical results remain readable.

Pilot bounds: 200 suites per workspace, 10 cases per suite, 2,000 evaluations per workspace. Existing 10,000 source-run limit also applies because every evaluated case creates a source-run record. Read history is paginated in groups of 25. No paid model calls, external connectors or background workers are invoked.

## Verification

Tests cover true/false outcomes, linked-source validation, duplicate queries, read-only/operator/author separation, cross-workspace rejection, idempotent retry and conflict, immutable history, audit events, and rollback when archived knowledge makes execution unavailable.
