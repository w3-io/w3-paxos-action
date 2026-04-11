import { setJsonOutput, handleError } from "@w3-io/action-core";
import * as core from "@actions/core";

async function run() {
  try {
    const command = core.getInput("command", { required: true }).toLowerCase();
    const clientId = core.getInput("client-id", { required: true });
    const clientSecret = core.getInput("client-secret", { required: true });
    const apiUrl =
      core.getInput("api-url") || "https://api.sandbox.paxos.com/v2";
    const oauthUrl =
      core.getInput("oauth-url") ||
      "https://oauth.sandbox.paxos.com/oauth2/token";
    const scope = core.getInput("scope") || "";

    // Common inputs
    const body = core.getInput("body") || "";
    const id = core.getInput("id") || "";
    const profileId = core.getInput("profile-id") || "";
    const identityId = core.getInput("identity-id") || "";
    const accountId = core.getInput("account-id") || "";
    const orderId = core.getInput("order-id") || "";
    const quoteId = core.getInput("quote-id") || "";
    const market = core.getInput("market") || "";
    const asset = core.getInput("asset") || "";
    const ruleId = core.getInput("rule-id") || "";
    const memberId = core.getInput("member-id") || "";
    const transactionId = core.getInput("transaction-id") || "";
    const limit = core.getInput("limit") || "";
    const cursor = core.getInput("cursor") || "";
    const status = core.getInput("status") || "";
    const refId = core.getInput("ref-id") || "";

    // --- OAuth2 Token ---
    const tokenParams = new URLSearchParams();
    tokenParams.set("grant_type", "client_credentials");
    tokenParams.set("client_id", clientId);
    tokenParams.set("client_secret", clientSecret);
    if (scope) tokenParams.set("scope", scope);

    const tokenRes = await fetch(oauthUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(
        `OAuth failed: ${tokenData.error_description || tokenData.error || JSON.stringify(tokenData)}`,
      );
    }

    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    async function req(method, path, bodyObj) {
      const url = `${apiUrl}${path}`;
      const opts = { method, headers: { ...headers } };
      if (bodyObj && method !== "GET" && method !== "DELETE") {
        opts.body = JSON.stringify(bodyObj);
      }
      const res = await fetch(url, opts);
      if (res.status === 204) return { success: true };
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      if (!res.ok) {
        const msg = typeof data === "object" ? JSON.stringify(data) : data;
        throw new Error(
          `${method} ${path} returned ${res.status}: ${msg.slice(0, 200)}`,
        );
      }
      return data;
    }

    function qs(p) {
      const e = Object.entries(p).filter(([, v]) => v !== "");
      return e.length ? "?" + e.map(([k, v]) => `${k}=${v}`).join("&") : "";
    }

    function pb() {
      if (!body) throw new Error("body input is required");
      return JSON.parse(body);
    }

    let result;

    switch (command) {
      // ── Identity ─────────────────────────────────────────────────
      case "create-identity":
        result = await req("POST", "/identity/identities", pb());
        break;
      case "list-identities":
        result = await req(
          "GET",
          `/identity/identities${qs({ limit, cursor })}`,
        );
        break;
      case "get-identity":
        if (!identityId) throw new Error("identity-id required");
        result = await req("GET", `/identity/identities/${identityId}`);
        break;
      case "update-identity":
        if (!identityId) throw new Error("identity-id required");
        result = await req("PUT", `/identity/identities/${identityId}`, pb());
        break;
      case "upload-document":
        if (!identityId) throw new Error("identity-id required");
        result = await req(
          "PUT",
          `/identity/identities/${identityId}/documents`,
          pb(),
        );
        break;
      case "list-documents":
        if (!identityId) throw new Error("identity-id required");
        result = await req(
          "GET",
          `/identity/identities/${identityId}/documents`,
        );
        break;
      case "sandbox-set-identity-status":
        if (!identityId) throw new Error("identity-id required");
        result = await req(
          "PUT",
          `/identity/identities/${identityId}/sandbox-status`,
          pb(),
        );
        break;

      // ── Identity Controls ────────────────────────────────────────
      case "create-identity-control":
        result = await req("POST", "/identity/controls", pb());
        break;
      case "list-identity-controls":
        result = await req("GET", `/identity/controls${qs({ limit, cursor })}`);
        break;
      case "delete-identity-control":
        result = await req("DELETE", `/identity/controls${qs({ id })}`);
        break;

      // ── Institution Members ──────────────────────────────────────
      case "add-institution-member":
        result = await req("POST", "/identity/institution-members", pb());
        break;
      case "remove-institution-member":
        if (!memberId) throw new Error("member-id required");
        result = await req(
          "DELETE",
          `/identity/institution-members/${memberId}`,
        );
        break;

      // ── Accounts ─────────────────────────────────────────────────
      case "create-account":
        result = await req("POST", "/identity/accounts", pb());
        break;
      case "list-accounts":
        result = await req("GET", `/identity/accounts${qs({ limit, cursor })}`);
        break;
      case "get-account":
        if (!accountId) throw new Error("account-id required");
        result = await req("GET", `/identity/accounts/${accountId}`);
        break;
      case "update-account":
        result = await req("PUT", "/identity/accounts", pb());
        break;

      // ── Account Members ──────────────────────────────────────────
      case "add-account-member":
        result = await req("POST", "/identity/account-members", pb());
        break;
      case "remove-account-member":
        if (!memberId) throw new Error("member-id required");
        result = await req("DELETE", `/identity/account-members/${memberId}`);
        break;

      // ── Profiles ─────────────────────────────────────────────────
      case "create-profile":
        result = await req("POST", "/profiles", pb());
        break;
      case "list-profiles":
        result = await req("GET", `/profiles${qs({ limit, cursor })}`);
        break;
      case "get-profile":
        if (!profileId) throw new Error("profile-id required");
        result = await req("GET", `/profiles/${profileId}`);
        break;
      case "update-profile":
        if (!profileId) throw new Error("profile-id required");
        result = await req("PUT", `/profiles/${profileId}`, pb());
        break;
      case "deactivate-profile":
        if (!profileId) throw new Error("profile-id required");
        result = await req("PUT", `/profiles/${profileId}/deactivate`, pb());
        break;
      case "list-profile-balances":
        if (!profileId) throw new Error("profile-id required");
        result = await req("GET", `/profiles/${profileId}/balances`);
        break;
      case "get-profile-balance":
        if (!profileId || !asset)
          throw new Error("profile-id and asset required");
        result = await req("GET", `/profiles/${profileId}/balances/${asset}`);
        break;

      // ── Deposit Addresses ────────────────────────────────────────
      case "create-deposit-address":
        result = await req("POST", "/transfer/deposit-addresses", pb());
        break;
      case "list-deposit-addresses":
        result = await req(
          "GET",
          `/transfer/deposit-addresses${qs({ profile_id: profileId, limit, cursor })}`,
        );
        break;

      // ── Crypto Deposits ──────────────────────────────────────────
      case "update-crypto-deposit":
        if (!id) throw new Error("id required");
        result = await req(
          "POST",
          `/transfer/crypto-deposits/${id}/update`,
          pb(),
        );
        break;
      case "reject-crypto-deposit":
        if (!id) throw new Error("id required");
        result = await req(
          "POST",
          `/transfer/crypto-deposits/${id}/reject`,
          pb(),
        );
        break;

      // ── Crypto Withdrawals ───────────────────────────────────────
      case "create-crypto-withdrawal":
        result = await req("POST", "/transfer/crypto-withdrawals", pb());
        break;
      case "list-crypto-destination-addresses":
        result = await req(
          "GET",
          `/transfer/crypto-destination-addresses${qs({ profile_id: profileId, limit, cursor })}`,
        );
        break;
      case "put-crypto-destination-address":
        result = await req("PUT", "/transfer/crypto-destination-address", pb());
        break;
      case "create-withdrawal-fee":
        result = await req("POST", "/transfer/fees/crypto-withdrawal", pb());
        break;

      // ── Fiat Transfers ───────────────────────────────────────────
      case "create-fiat-account":
        result = await req("POST", "/transfer/fiat-accounts", pb());
        break;
      case "list-fiat-accounts":
        result = await req(
          "GET",
          `/transfer/fiat-accounts${qs({ profile_id: profileId, limit, cursor })}`,
        );
        break;
      case "get-fiat-account":
        if (!id) throw new Error("id required");
        result = await req("GET", `/transfer/fiat-accounts/${id}`);
        break;
      case "update-fiat-account":
        if (!id) throw new Error("id required");
        result = await req("PUT", `/transfer/fiat-accounts/${id}`, pb());
        break;
      case "delete-fiat-account":
        if (!id) throw new Error("id required");
        result = await req("DELETE", `/transfer/fiat-accounts/${id}`);
        break;
      case "create-fiat-deposit-instructions":
        result = await req("POST", "/transfer/fiat-deposit-instructions", pb());
        break;
      case "list-fiat-deposit-instructions":
        result = await req(
          "GET",
          `/transfer/fiat-deposit-instructions${qs({ profile_id: profileId, limit, cursor })}`,
        );
        break;
      case "get-fiat-deposit-instructions":
        if (!id) throw new Error("id required");
        result = await req("GET", `/transfer/fiat-deposit-instructions/${id}`);
        break;
      case "create-fiat-withdrawal":
        result = await req("POST", "/transfer/fiat-withdrawals", pb());
        break;

      // ── Internal / Paxos Transfers ───────────────────────────────
      case "create-internal-transfer":
        result = await req("POST", "/transfer/internal", pb());
        break;
      case "create-paxos-transfer":
        result = await req("POST", "/transfer/paxos", pb());
        break;

      // ── Transfers (Read) ─────────────────────────────────────────
      case "list-transfers":
        result = await req(
          "GET",
          `/transfer/transfers${qs({ profile_id: profileId, limit, cursor, status, ref_id: refId })}`,
        );
        break;
      case "get-transfer":
        if (!id) throw new Error("id required");
        result = await req("GET", `/transfer/transfers/${id}`);
        break;

      // ── Limits ───────────────────────────────────────────────────
      case "list-transfer-limits":
        result = await req(
          "GET",
          `/transfer/limits/utilizations${qs({ profile_id: profileId })}`,
        );
        break;

      // ── Stablecoin Conversion ────────────────────────────────────
      case "create-conversion":
        result = await req("POST", "/conversion/stablecoins", pb());
        break;
      case "list-conversions":
        result = await req(
          "GET",
          `/conversion/stablecoins${qs({ profile_id: profileId, limit, cursor, status })}`,
        );
        break;
      case "get-conversion":
        if (!id) throw new Error("id required");
        result = await req("GET", `/conversion/stablecoins/${id}`);
        break;
      case "cancel-conversion":
        if (!id) throw new Error("id required");
        result = await req("DELETE", `/conversion/stablecoins/${id}`);
        break;

      // ── Market Data ──────────────────────────────────────────────
      case "list-markets":
        result = await req("GET", "/markets");
        break;
      case "get-order-book":
        if (!market) throw new Error("market required");
        result = await req("GET", `/markets/${market}/order-book`);
        break;
      case "get-ticker":
        if (!market) throw new Error("market required");
        result = await req("GET", `/markets/${market}/ticker`);
        break;
      case "list-recent-executions":
        if (!market) throw new Error("market required");
        result = await req(
          "GET",
          `/markets/${market}/recent-executions${qs({ limit })}`,
        );
        break;
      case "list-historical-prices":
        if (!market) throw new Error("market required");
        result = await req(
          "GET",
          `/markets/${market}/historical-prices${qs({ limit, cursor })}`,
        );
        break;
      case "list-prices":
        result = await req("GET", "/all-markets/prices");
        break;
      case "list-tickers":
        result = await req("GET", "/all-markets/ticker");
        break;

      // ── Orders ───────────────────────────────────────────────────
      case "create-order":
        if (!profileId) throw new Error("profile-id required");
        result = await req("POST", `/profiles/${profileId}/orders`, pb());
        break;
      case "list-orders":
        if (profileId) {
          result = await req(
            "GET",
            `/profiles/${profileId}/orders${qs({ limit, cursor, status })}`,
          );
        } else {
          result = await req("GET", `/orders${qs({ limit, cursor, status })}`);
        }
        break;
      case "get-order":
        if (!profileId || !orderId)
          throw new Error("profile-id and order-id required");
        result = await req("GET", `/profiles/${profileId}/orders/${orderId}`);
        break;
      case "cancel-order":
        if (!profileId || !orderId)
          throw new Error("profile-id and order-id required");
        result = await req(
          "DELETE",
          `/profiles/${profileId}/orders/${orderId}`,
        );
        break;
      case "list-executions":
        if (profileId) {
          result = await req(
            "GET",
            `/profiles/${profileId}/executions${qs({ limit, cursor })}`,
          );
        } else {
          result = await req("GET", `/executions${qs({ limit, cursor })}`);
        }
        break;

      // ── Quotes ───────────────────────────────────────────────────
      case "list-quotes":
        result = await req("GET", `/quotes${qs({ limit, cursor })}`);
        break;
      case "create-quote-execution":
        if (!profileId) throw new Error("profile-id required");
        result = await req(
          "POST",
          `/profiles/${profileId}/quote-executions`,
          pb(),
        );
        break;
      case "list-quote-executions":
        if (!profileId) throw new Error("profile-id required");
        result = await req(
          "GET",
          `/profiles/${profileId}/quote-executions${qs({ limit, cursor })}`,
        );
        break;
      case "get-quote-execution":
        if (!profileId || !id) throw new Error("profile-id and id required");
        result = await req(
          "GET",
          `/profiles/${profileId}/quote-executions/${id}`,
        );
        break;

      // ── Issuer Quotes ────────────────────────────────────────────
      case "create-issuer-quote":
        result = await req("POST", "/issuer-quote", pb());
        break;
      case "execute-issuer-quote":
        if (!quoteId) throw new Error("quote-id required");
        result = await req("POST", `/issuer-quote/${quoteId}`, pb());
        break;
      case "list-issuer-quotes":
        result = await req("GET", `/issuer-quotes${qs({ limit, cursor })}`);
        break;

      // ── Orchestration ────────────────────────────────────────────
      case "create-orchestration":
        result = await req("POST", "/orchestration/orchestrations", pb());
        break;
      case "list-orchestrations":
        result = await req(
          "GET",
          `/orchestration/orchestrations${qs({ limit, cursor, status })}`,
        );
        break;
      case "get-orchestration":
        if (!id) throw new Error("id required");
        result = await req("GET", `/orchestration/orchestrations/${id}`);
        break;

      // ── Orchestration Rules ──────────────────────────────────────
      case "create-orchestration-rule":
        result = await req("POST", "/orchestration/rules", pb());
        break;
      case "list-orchestration-rules":
        result = await req(
          "GET",
          `/orchestration/rules${qs({ limit, cursor })}`,
        );
        break;
      case "delete-orchestration-rule":
        if (!ruleId) throw new Error("rule-id required");
        result = await req("DELETE", `/orchestration/rules/${ruleId}`);
        break;

      // ── Settlement ───────────────────────────────────────────────
      case "create-settlement":
        result = await req("POST", "/settlement/transactions", pb());
        break;
      case "list-settlements":
        result = await req(
          "GET",
          `/settlement/transactions${qs({ limit, cursor, status })}`,
        );
        break;
      case "get-settlement":
        if (!transactionId) throw new Error("transaction-id required");
        result = await req("GET", `/settlement/transactions/${transactionId}`);
        break;
      case "affirm-settlement":
        if (!transactionId) throw new Error("transaction-id required");
        result = await req(
          "PUT",
          `/settlement/transactions/${transactionId}/affirm`,
          pb(),
        );
        break;
      case "cancel-settlement":
        if (!transactionId) throw new Error("transaction-id required");
        result = await req(
          "DELETE",
          `/settlement/transactions/${transactionId}`,
        );
        break;

      // ── Events ───────────────────────────────────────────────────
      case "list-events":
        result = await req("GET", `/events${qs({ limit, cursor })}`);
        break;
      case "get-event":
        if (!id) throw new Error("id required");
        result = await req("GET", `/events/${id}`);
        break;

      // ── Rewards / Claims ─────────────────────────────────────────
      case "get-reward-details":
        result = await req(
          "GET",
          `/rewards/details${qs({ profile_id: profileId })}`,
        );
        break;
      case "list-claims":
        result = await req("GET", `/rewards/claims${qs({ limit, cursor })}`);
        break;
      case "create-claim-schedule":
        result = await req("POST", "/rewards/claim-schedules", pb());
        break;
      case "list-claim-schedules":
        result = await req(
          "GET",
          `/rewards/claim-schedules${qs({ limit, cursor })}`,
        );
        break;
      case "update-claim-schedule":
        if (!id) throw new Error("id required");
        result = await req("PUT", `/rewards/claim-schedules/${id}`, pb());
        break;
      case "delete-claim-schedule":
        if (!id) throw new Error("id required");
        result = await req("DELETE", `/rewards/claim-schedules/${id}`);
        break;

      // ── Payout Groups ────────────────────────────────────────────
      case "create-payout-group":
        result = await req("POST", "/rewards/payout-groups", pb());
        break;
      case "list-payout-groups":
        result = await req(
          "GET",
          `/rewards/payout-groups${qs({ limit, cursor })}`,
        );
        break;
      case "update-payout-group":
        if (!id) throw new Error("id required");
        result = await req("PUT", `/rewards/payout-groups/${id}`, pb());
        break;
      case "delete-payout-group":
        if (!id) throw new Error("id required");
        result = await req("DELETE", `/rewards/payout-groups/${id}`);
        break;

      // ── Monitoring Addresses ─────────────────────────────────────
      case "create-monitoring-address":
        result = await req("POST", "/rewards/monitor/address", pb());
        break;
      case "list-monitoring-addresses":
        result = await req(
          "GET",
          `/rewards/monitor/address${qs({ limit, cursor })}`,
        );
        break;
      case "get-monitoring-address":
        if (!id) throw new Error("id required");
        result = await req("GET", `/rewards/monitor/address/${id}`);
        break;
      case "update-monitoring-address":
        if (!id) throw new Error("id required");
        result = await req("PUT", `/rewards/monitor/address/${id}`, pb());
        break;

      // ── Reward Addresses ─────────────────────────────────────────
      case "create-reward-address":
        result = await req("POST", "/rewards/addresses", pb());
        break;
      case "list-reward-addresses":
        result = await req("GET", `/rewards/addresses${qs({ limit, cursor })}`);
        break;
      case "update-reward-address":
        if (!id) throw new Error("id required");
        result = await req("PUT", `/rewards/addresses/${id}`, pb());
        break;
      case "delete-reward-address":
        if (!id) throw new Error("id required");
        result = await req("DELETE", `/rewards/addresses/${id}`);
        break;

      // ── Payments / Statements ────────────────────────────────────
      case "list-payments":
        result = await req(
          "GET",
          `/statements/payments${qs({ limit, cursor })}`,
        );
        break;
      case "list-statements":
        result = await req("GET", `/statements${qs({ limit, cursor })}`);
        break;

      // ── Tax ──────────────────────────────────────────────────────
      case "list-tax-forms":
        result = await req("GET", `/tax/tax-forms${qs({ limit, cursor })}`);
        break;
      case "list-tax-form-revisions":
        result = await req(
          "GET",
          `/tax/tax-form-revisions${qs({ limit, cursor })}`,
        );
        break;

      // ── API Credentials ──────────────────────────────────────────
      case "list-api-credentials":
        result = await req("GET", "/api-creds/credentials");
        break;
      case "delete-api-credential":
        if (!id) throw new Error("id (client_id) required");
        result = await req("DELETE", `/api-creds/credentials/${id}`);
        break;

      // ── Sandbox Utilities ────────────────────────────────────────
      case "sandbox-deposit":
        if (!profileId) throw new Error("profile-id required");
        result = await req(
          "POST",
          `/sandbox/profiles/${profileId}/deposit`,
          pb(),
        );
        break;
      case "sandbox-fiat-deposit":
        result = await req("POST", "/sandbox/fiat-deposits", pb());
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    setJsonOutput("result", result);
  } catch (error) {
    handleError(error);
  }
}

run();
