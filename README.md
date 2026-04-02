# W3 Paxos Action

Crypto brokerage, stablecoin operations, and treasury management via the Paxos API.

## Quick Start

```yaml
- uses: w3-io/w3-paxos-action@v1
  with:
    command: list-profile-balances
    api-key: ${{ secrets.PAXOS_API_KEY }}
```

## Commands

108 commands across accounts, profiles, orders, conversions, transfers, settlements, identity, fiat, crypto, stablecoins, orchestration, and sandbox.

See [docs/guide.md](docs/guide.md) for the full command reference.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `command` | Yes | — | Operation to perform |
| `api-key` | Yes | — | Paxos API key |
| `api-url` | No | `api.paxos.com` | API endpoint (sandbox: `api.sandbox.paxos.com`) |
| `body` | No | — | JSON request body |
| (others) | No | — | Command-specific inputs (see guide) |

## Outputs

| Output | Description |
|--------|-------------|
| `result` | JSON result of the operation |

## Authentication

Get API credentials from the [Paxos Dashboard](https://dashboard.paxos.com). Use `api-url: api.sandbox.paxos.com` for testing.
