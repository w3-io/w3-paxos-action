# W3 Paxos Action

Paxos institutional crypto platform for W3 workflows. 109 commands covering identity, custody, trading, stablecoins (PYUSD, USDP, USDG), settlement, orchestration, rewards, and tax reporting.

## Why Paxos

Paxos is the regulated infrastructure layer. They issue PYUSD (for PayPal), USDP (Pax Dollar), and USDG (Global Dollar). They provide institutional-grade crypto brokerage, custody, and settlement. Through W3, these operations become verifiable and auditable with receipts anchored to L1.

## Commands

### Identity & Compliance (7)

| Command | Description |
|---------|-------------|
| `create-identity` | Create a person or institution identity |
| `list-identities` | List all identities |
| `get-identity` | Get identity by ID |
| `update-identity` | Update identity details |
| `upload-document` | Upload KYC/KYB document |
| `list-documents` | List identity documents |
| `sandbox-set-identity-status` | Set identity status (sandbox) |

### Identity Controls (3)

| Command | Description |
|---------|-------------|
| `create-identity-control` | Create custom compliance control |
| `list-identity-controls` | List controls |
| `delete-identity-control` | Delete a control |

### Accounts (6)

| Command | Description |
|---------|-------------|
| `create-account` | Create account linked to identity |
| `list-accounts` | List accounts |
| `get-account` | Get account |
| `update-account` | Update account |
| `add-account-member` | Add member to account |
| `remove-account-member` | Remove member |

### Profiles & Balances (7)

| Command | Description |
|---------|-------------|
| `create-profile` | Create asset profile |
| `list-profiles` | List profiles |
| `get-profile` | Get profile |
| `update-profile` | Update profile |
| `deactivate-profile` | Deactivate profile |
| `list-profile-balances` | Get all asset balances |
| `get-profile-balance` | Get balance for specific asset |

### Crypto Deposits (4)

| Command | Description |
|---------|-------------|
| `create-deposit-address` | Generate blockchain deposit address |
| `list-deposit-addresses` | List deposit addresses |
| `update-crypto-deposit` | Provide travel rule info for deposit |
| `reject-crypto-deposit` | Reject a crypto deposit |

### Crypto Withdrawals (4)

| Command | Description |
|---------|-------------|
| `create-crypto-withdrawal` | Withdraw crypto to external address |
| `list-crypto-destination-addresses` | List whitelisted addresses |
| `put-crypto-destination-address` | Add/update destination address |
| `create-withdrawal-fee` | Get guaranteed withdrawal fee |

### Fiat Transfers (9)

| Command | Description |
|---------|-------------|
| `create-fiat-account` | Register bank account (Fedwire, SWIFT) |
| `list-fiat-accounts` | List fiat accounts |
| `get-fiat-account` | Get fiat account |
| `update-fiat-account` | Update fiat account |
| `delete-fiat-account` | Delete fiat account |
| `create-fiat-deposit-instructions` | Get wire deposit instructions |
| `list-fiat-deposit-instructions` | List deposit instructions |
| `get-fiat-deposit-instructions` | Get specific instructions |
| `create-fiat-withdrawal` | Initiate wire withdrawal |

### Transfers (4)

| Command | Description |
|---------|-------------|
| `create-internal-transfer` | Transfer between profiles (same entity) |
| `create-paxos-transfer` | Transfer between Paxos entities |
| `list-transfers` | List all transfers |
| `get-transfer` | Get transfer details |

### Stablecoin Conversion (4)

| Command | Description |
|---------|-------------|
| `create-conversion` | Mint or redeem stablecoins (1:1 USD) |
| `list-conversions` | List conversions |
| `get-conversion` | Get conversion |
| `cancel-conversion` | Cancel pending conversion |

### Market Data (7)

| Command | Description |
|---------|-------------|
| `list-markets` | List available trading pairs |
| `get-order-book` | Get order book for a market |
| `get-ticker` | Get 24h ticker statistics |
| `list-recent-executions` | List recent trades |
| `list-historical-prices` | Get historical price data |
| `list-prices` | Get prices across all markets |
| `list-tickers` | Get tickers across all markets |

### Trading — Orders (5)

| Command | Description |
|---------|-------------|
| `create-order` | Place market, limit, or post-only order |
| `list-orders` | List orders (per-profile or global) |
| `get-order` | Get order details |
| `cancel-order` | Cancel an order |
| `list-executions` | List trade executions |

### Trading — Quotes (7)

| Command | Description |
|---------|-------------|
| `list-quotes` | List available quotes |
| `create-quote-execution` | Execute a held-rate quote |
| `list-quote-executions` | List quote executions |
| `get-quote-execution` | Get quote execution details |
| `create-issuer-quote` | Request Paxos-as-issuer mint/redeem quote |
| `execute-issuer-quote` | Execute an issuer quote |
| `list-issuer-quotes` | List issuer quote executions |

### Orchestration (6)

| Command | Description |
|---------|-------------|
| `create-orchestration` | Create mint/redeem/transfer workflow |
| `list-orchestrations` | List orchestrations |
| `get-orchestration` | Get orchestration status |
| `create-orchestration-rule` | Create auto-trigger rule for deposits |
| `list-orchestration-rules` | List rules |
| `delete-orchestration-rule` | Delete a rule |

### Settlement (5)

| Command | Description |
|---------|-------------|
| `create-settlement` | Create bilateral OTC settlement |
| `list-settlements` | List settlements |
| `get-settlement` | Get settlement details |
| `affirm-settlement` | Affirm a settlement transaction |
| `cancel-settlement` | Cancel a settlement |

### Rewards & Monitoring (12)

| Command | Description |
|---------|-------------|
| `get-reward-details` | Get stablecoin reward details |
| `list-claims` | List reward claims |
| `create-claim-schedule` | Set up automated reward claiming |
| `list-claim-schedules` | List claim schedules |
| `update-claim-schedule` | Update schedule |
| `delete-claim-schedule` | Delete schedule |
| `create-payout-group` | Create reward payout group |
| `list-payout-groups` | List payout groups |
| `update-payout-group` | Update payout group |
| `delete-payout-group` | Delete payout group |
| `create-monitoring-address` | Monitor blockchain address |
| `list-monitoring-addresses` | List monitored addresses |

### Reporting (4)

| Command | Description |
|---------|-------------|
| `list-payments` | List payment statements |
| `list-statements` | List account statements |
| `list-tax-forms` | List tax forms |
| `list-tax-form-revisions` | List tax form revisions |

### Sandbox (2)

| Command | Description |
|---------|-------------|
| `sandbox-deposit` | Simulate crypto deposit (sandbox) |
| `sandbox-fiat-deposit` | Simulate fiat deposit (sandbox) |

## Authentication

Paxos uses OAuth2 client credentials:

```
POST https://oauth.sandbox.paxos.com/oauth2/token
  grant_type=client_credentials
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_CLIENT_SECRET
  scope=funding:read_profile ...
```

The action handles token management automatically.

## Environments

| Environment | API URL | OAuth URL |
|-------------|---------|-----------|
| Sandbox | `https://api.sandbox.paxos.com/v2` | `https://oauth.sandbox.paxos.com/oauth2/token` |
| Production | `https://api.paxos.com/v2` | `https://oauth.paxos.com/oauth2/token` |

## Stablecoin Operations

Paxos issues PYUSD, USDP, and USDG. Use `create-conversion` to mint (USD → stablecoin) or redeem (stablecoin → USD) at 1:1.

```yaml
- uses: w3/paxos@v1
  with:
    command: create-conversion
    client-id: ${{ secrets.PAXOS_CLIENT_ID }}
    client-secret: ${{ secrets.PAXOS_CLIENT_SECRET }}
    body: |
      {
        "profile_id": "...",
        "amount": "1000",
        "source_asset": "USD",
        "destination_asset": "PYUSD"
      }
```
