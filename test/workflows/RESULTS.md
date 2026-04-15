# E2E Test Results

> Last verified: 2026-04-15 -- NOT YET VERIFIED (YAML error)

## Prerequisites

| Credential | Env var | Source |
|-----------|---------|--------|
| Paxos sandbox OAuth2 client ID | `PAXOS_CLIENT_ID` | Paxos dashboard |
| Paxos sandbox OAuth2 client secret | `PAXOS_CLIENT_SECRET` | Paxos dashboard |

## Results

| # | Step | Command | Status | Notes |
|---|------|---------|--------|-------|
| 1 | Create an identity | `create-identity` | NOT YET VERIFIED | Sandbox |
| 2 | List identities | `list-identities` | NOT YET VERIFIED | |
| 3 | Get the identity | `get-identity` | NOT YET VERIFIED | |
| 4 | Sandbox set identity status | `sandbox-set-identity-status` | NOT YET VERIFIED | |
| 5 | Create an account | `create-account` | NOT YET VERIFIED | |
| 6 | List accounts | `list-accounts` | NOT YET VERIFIED | |
| 7 | Get the account | `get-account` | NOT YET VERIFIED | |
| 8 | Create a profile | `create-profile` | NOT YET VERIFIED | |
| 9 | List profiles | `list-profiles` | NOT YET VERIFIED | |
| 10 | Get the profile | `get-profile` | NOT YET VERIFIED | |
| 11 | List profile balances | `list-profile-balances` | NOT YET VERIFIED | |
| 12 | Sandbox deposit USD | `sandbox-deposit` | NOT YET VERIFIED | |
| 13 | Sandbox fiat deposit | `sandbox-fiat-deposit` | NOT YET VERIFIED | |
| 14 | List markets | `list-markets` | NOT YET VERIFIED | |
| 15 | Get BTC/USD ticker | `get-ticker` | NOT YET VERIFIED | |
| 16 | Get BTC/USD order book | `get-order-book` | NOT YET VERIFIED | |
| 17 | List prices | `list-prices` | NOT YET VERIFIED | |
| 18 | List tickers | `list-tickers` | NOT YET VERIFIED | |
| 19 | List recent executions | `list-recent-executions` | NOT YET VERIFIED | |
| 20 | Create a limit order | `create-order` | NOT YET VERIFIED | |
| 21 | List orders | `list-orders` | NOT YET VERIFIED | |
| 22 | Cancel the order | `cancel-order` | NOT YET VERIFIED | |
| 23 | List transfers | `list-transfers` | NOT YET VERIFIED | |
| 24 | List transfer limits | `list-transfer-limits` | NOT YET VERIFIED | |
| 25 | List conversions | `list-conversions` | NOT YET VERIFIED | |
| 26 | Create deposit address | `create-deposit-address` | NOT YET VERIFIED | |
| 27 | List deposit addresses | `list-deposit-addresses` | NOT YET VERIFIED | |
| 28 | List fiat accounts | `list-fiat-accounts` | NOT YET VERIFIED | |
| 29 | List orchestrations | `list-orchestrations` | NOT YET VERIFIED | |
| 30 | List events | `list-events` | NOT YET VERIFIED | |
| 31 | List tax forms | `list-tax-forms` | NOT YET VERIFIED | |
| 32 | List API credentials | `list-api-credentials` | NOT YET VERIFIED | |
| 33 | Deactivate the profile | `deactivate-profile` | NOT YET VERIFIED | |

## Skipped Commands

| Command | Reason |
|---------|--------|
| N/A | All exercised commands listed above |

## How to run

```bash
# Export credentials
export PAXOS_CLIENT_ID="..."
export PAXOS_CLIENT_SECRET="..."

# Run
w3 workflow test --execute test/workflows/e2e.yaml
```
