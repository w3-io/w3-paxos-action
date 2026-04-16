# TODO

## KYB-blocked (hard)

The Paxos integration is permanently blocked on Know Your Business
verification. We cannot run it against live Paxos without KYB
clearing, which is an external-to-W3 legal/business process.

Nothing in this repo's code is broken — every command's shape is
correct and the workflow structure is ready. The block is access,
not capability.

- [ ] All live E2E verification — pending KYB. Until then, the action
      ships as code-correct but unverified-live.

## Re-verify after KYB clears

- [ ] RESULTS.md says "YAML fixed, not yet run" (2026-04-15).
      Re-run the 33-step E2E in full once KYB clears. Update
      RESULTS.md with real PASS/FAIL. This will likely surface
      real issues since no step has been exercised against live
      Paxos.

## Docs

- [ ] Clarify in README that Paxos access is KYB-gated. Today a
      reader could easily try this on a personal account and hit
      unexplained errors. The upfront "this needs KYB" note will
      save time.
