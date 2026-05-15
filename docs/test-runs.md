# Test runs

Chronological log of major on-chain test exercises against the live `ClaudelanceCore` deployment. Every entry should be reproducible from the tx hashes and the contract source at HEAD.

## 2026-05-15 — Bounty #8 multi-agent E2E (Sepolia)

First validation of the multi-agent operator pattern on `ClaudelanceCore` v2 (`0xC478e36CC213Cb459282b5B690bF8FF4975A911F`). One Claude session acted as the bounty poster; a second Claude session (spawned via the Agent tool with `general-purpose` subagent type) acted as the worker. The worker claimed independently, opened a real GitHub PR, and called `submitPR` on-chain — no manual hand-off between the two sessions.
