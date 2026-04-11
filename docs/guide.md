# Paxos Integration

Paxos provides regulated crypto brokerage, stablecoin issuance (USDP, PYUSD), and treasury infrastructure. This action exposes the full Paxos API for automated trading, transfers, settlements, and compliance workflows.

## Quick Start

```yaml
- uses: w3-io/w3-paxos-action@v1
  with:
    command: get-profile-balance
    api-key: ${{ secrets.PAXOS_API_KEY }}
    profile-id: ${{ secrets.PAXOS_PROFILE_ID }}
```

## Command Categories

| Category      | Commands | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| Accounts      | 6        | Account and member management                         |
| Profiles      | 6        | Trading profiles and balances                         |
| Orders        | 5        | Market/limit orders on crypto pairs                   |
| Conversions   | 3        | Crypto-to-crypto conversions                          |
| Transfers     | 7        | Internal, crypto, and fiat transfers                  |
| Settlements   | 4        | Institutional settlement workflows                    |
| Identity      | 5        | KYC/KYB identity verification                         |
| Fiat          | 6        | Bank accounts and fiat deposits/withdrawals           |
| Crypto        | 6        | Deposit addresses, withdrawals, destination addresses |
| Stablecoins   | 5        | USDP/PYUSD issuance quotes and execution              |
| Orchestration | 4        | Automated trading rules                               |
| Monitoring    | 3        | Address monitoring for compliance                     |
| Rewards       | 3        | Staking reward addresses                              |
| Sandbox       | 3        | Test environment utilities                            |

## Authentication

```yaml
api-key: ${{ secrets.PAXOS_API_KEY }}
api-url: api.sandbox.paxos.com # for testing
```

Production: `api.paxos.com` (default). Sandbox: `api.sandbox.paxos.com`.

## Full Command Reference

See the [README](../README.md) and [action.yml](../action.yml) for the complete list of 108 commands with all inputs.
