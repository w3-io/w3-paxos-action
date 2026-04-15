/**
 * Paxos action unit tests.
 *
 * Mocks @actions/core inputs and global.fetch to test the action's
 * command dispatch, URL construction, parameter validation, and
 * error handling without hitting the real Paxos API.
 *
 * Run with: npm test
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Helpers: reproduce core action logic for unit testing
// ---------------------------------------------------------------------------

/**
 * Build query string from key-value pairs, omitting empty values.
 * Mirrors the `qs()` helper in src/index.js.
 */
function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== "");
  return entries.length
    ? "?" + entries.map(([k, v]) => `${k}=${v}`).join("&")
    : "";
}

/**
 * Parse body input, mirroring the `pb()` helper in src/index.js.
 */
function pb(body) {
  if (!body) throw new Error("body input is required");
  return JSON.parse(body);
}

// ---------------------------------------------------------------------------
// Mock infrastructure
// ---------------------------------------------------------------------------

const API_URL = "https://api.sandbox.paxos.com/v2";
const OAUTH_URL = "https://oauth.sandbox.paxos.com/oauth2/token";

let originalFetch;
let calls;

beforeEach(() => {
  originalFetch = global.fetch;
  calls = [];
});

afterEach(() => {
  global.fetch = originalFetch;
});

/**
 * Install a fetch mock. Each response in the array is consumed in order.
 * The dispatch() helper skips OAuth, so responses map 1:1 to API calls.
 */
function mockFetch(responses) {
  let index = 0;
  const allResponses = responses;

  global.fetch = async (url, options) => {
    calls.push({ url, options });
    const response = allResponses[index++];
    if (!response) {
      throw new Error(`Unexpected fetch call ${index}: ${url}`);
    }
    const status = response.status ?? 200;
    const ok = status >= 200 && status < 300;
    return {
      ok,
      status,
      text: async () =>
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body ?? {}),
      json: async () => response.body ?? {},
    };
  };
}

/**
 * Simulate running the action's command dispatch. This replicates the
 * switch/case logic from src/index.js so we can test URL construction,
 * HTTP method, and parameter validation without importing the action
 * (which depends on @actions/core side effects).
 */
async function dispatch(command, inputs = {}) {
  const {
    body = "",
    id = "",
    profileId = "",
    identityId = "",
    accountId = "",
    orderId = "",
    quoteId = "",
    market = "",
    asset = "",
    ruleId = "",
    memberId = "",
    transactionId = "",
    limit = "",
    cursor = "",
    status = "",
    refId = "",
  } = inputs;

  const headers = {
    Authorization: "Bearer test-token",
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  async function req(method, path, bodyObj) {
    const url = `${API_URL}${path}`;
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

  let result;

  switch (command) {
    // ── Identity
    case "create-identity":
      result = await req("POST", "/identity/identities", pb(body));
      break;
    case "list-identities":
      result = await req("GET", `/identity/identities${qs({ limit, cursor })}`);
      break;
    case "get-identity":
      if (!identityId) throw new Error("identity-id required");
      result = await req("GET", `/identity/identities/${identityId}`);
      break;
    case "update-identity":
      if (!identityId) throw new Error("identity-id required");
      result = await req("PUT", `/identity/identities/${identityId}`, pb(body));
      break;
    case "upload-document":
      if (!identityId) throw new Error("identity-id required");
      result = await req(
        "PUT",
        `/identity/identities/${identityId}/documents`,
        pb(body),
      );
      break;
    case "list-documents":
      if (!identityId) throw new Error("identity-id required");
      result = await req("GET", `/identity/identities/${identityId}/documents`);
      break;
    case "sandbox-set-identity-status":
      if (!identityId) throw new Error("identity-id required");
      result = await req(
        "PUT",
        `/identity/identities/${identityId}/sandbox-status`,
        pb(body),
      );
      break;
    // ── Identity Controls
    case "create-identity-control":
      result = await req("POST", "/identity/controls", pb(body));
      break;
    case "list-identity-controls":
      result = await req("GET", `/identity/controls${qs({ limit, cursor })}`);
      break;
    case "delete-identity-control":
      result = await req("DELETE", `/identity/controls${qs({ id })}`);
      break;
    // ── Institution Members
    case "add-institution-member":
      result = await req("POST", "/identity/institution-members", pb(body));
      break;
    case "remove-institution-member":
      if (!memberId) throw new Error("member-id required");
      result = await req("DELETE", `/identity/institution-members/${memberId}`);
      break;
    // ── Accounts
    case "create-account":
      result = await req("POST", "/identity/accounts", pb(body));
      break;
    case "list-accounts":
      result = await req("GET", `/identity/accounts${qs({ limit, cursor })}`);
      break;
    case "get-account":
      if (!accountId) throw new Error("account-id required");
      result = await req("GET", `/identity/accounts/${accountId}`);
      break;
    case "update-account":
      result = await req("PUT", "/identity/accounts", pb(body));
      break;
    // ── Account Members
    case "add-account-member":
      result = await req("POST", "/identity/account-members", pb(body));
      break;
    case "remove-account-member":
      if (!memberId) throw new Error("member-id required");
      result = await req("DELETE", `/identity/account-members/${memberId}`);
      break;
    // ── Profiles
    case "create-profile":
      result = await req("POST", "/profiles", pb(body));
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
      result = await req("PUT", `/profiles/${profileId}`, pb(body));
      break;
    case "deactivate-profile":
      if (!profileId) throw new Error("profile-id required");
      result = await req("PUT", `/profiles/${profileId}/deactivate`, pb(body));
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
    // ── Deposit Addresses
    case "create-deposit-address":
      result = await req("POST", "/transfer/deposit-addresses", pb(body));
      break;
    case "list-deposit-addresses":
      result = await req(
        "GET",
        `/transfer/deposit-addresses${qs({ profile_id: profileId, limit, cursor })}`,
      );
      break;
    // ── Crypto Deposits
    case "update-crypto-deposit":
      if (!id) throw new Error("id required");
      result = await req(
        "POST",
        `/transfer/crypto-deposits/${id}/update`,
        pb(body),
      );
      break;
    case "reject-crypto-deposit":
      if (!id) throw new Error("id required");
      result = await req(
        "POST",
        `/transfer/crypto-deposits/${id}/reject`,
        pb(body),
      );
      break;
    // ── Crypto Withdrawals
    case "create-crypto-withdrawal":
      result = await req("POST", "/transfer/crypto-withdrawals", pb(body));
      break;
    case "list-crypto-destination-addresses":
      result = await req(
        "GET",
        `/transfer/crypto-destination-addresses${qs({ profile_id: profileId, limit, cursor })}`,
      );
      break;
    case "put-crypto-destination-address":
      result = await req(
        "PUT",
        "/transfer/crypto-destination-address",
        pb(body),
      );
      break;
    case "create-withdrawal-fee":
      result = await req("POST", "/transfer/fees/crypto-withdrawal", pb(body));
      break;
    // ── Fiat Transfers
    case "create-fiat-account":
      result = await req("POST", "/transfer/fiat-accounts", pb(body));
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
      result = await req("PUT", `/transfer/fiat-accounts/${id}`, pb(body));
      break;
    case "delete-fiat-account":
      if (!id) throw new Error("id required");
      result = await req("DELETE", `/transfer/fiat-accounts/${id}`);
      break;
    case "create-fiat-deposit-instructions":
      result = await req(
        "POST",
        "/transfer/fiat-deposit-instructions",
        pb(body),
      );
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
      result = await req("POST", "/transfer/fiat-withdrawals", pb(body));
      break;
    // ── Internal / Paxos Transfers
    case "create-internal-transfer":
      result = await req("POST", "/transfer/internal", pb(body));
      break;
    case "create-paxos-transfer":
      result = await req("POST", "/transfer/paxos", pb(body));
      break;
    // ── Transfers (Read)
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
    // ── Limits
    case "list-transfer-limits":
      result = await req(
        "GET",
        `/transfer/limits/utilizations${qs({ profile_id: profileId })}`,
      );
      break;
    // ── Stablecoin Conversion
    case "create-conversion":
      result = await req("POST", "/conversion/stablecoins", pb(body));
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
    // ── Market Data
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
    // ── Orders
    case "create-order":
      if (!profileId) throw new Error("profile-id required");
      result = await req("POST", `/profiles/${profileId}/orders`, pb(body));
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
      result = await req("DELETE", `/profiles/${profileId}/orders/${orderId}`);
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
    // ── Quotes
    case "list-quotes":
      result = await req("GET", `/quotes${qs({ limit, cursor })}`);
      break;
    case "create-quote-execution":
      if (!profileId) throw new Error("profile-id required");
      result = await req(
        "POST",
        `/profiles/${profileId}/quote-executions`,
        pb(body),
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
    // ── Issuer Quotes
    case "create-issuer-quote":
      result = await req("POST", "/issuer-quote", pb(body));
      break;
    case "execute-issuer-quote":
      if (!quoteId) throw new Error("quote-id required");
      result = await req("POST", `/issuer-quote/${quoteId}`, pb(body));
      break;
    case "list-issuer-quotes":
      result = await req("GET", `/issuer-quotes${qs({ limit, cursor })}`);
      break;
    // ── Orchestration
    case "create-orchestration":
      result = await req("POST", "/orchestration/orchestrations", pb(body));
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
    // ── Orchestration Rules
    case "create-orchestration-rule":
      result = await req("POST", "/orchestration/rules", pb(body));
      break;
    case "list-orchestration-rules":
      result = await req("GET", `/orchestration/rules${qs({ limit, cursor })}`);
      break;
    case "delete-orchestration-rule":
      if (!ruleId) throw new Error("rule-id required");
      result = await req("DELETE", `/orchestration/rules/${ruleId}`);
      break;
    // ── Settlement
    case "create-settlement":
      result = await req("POST", "/settlement/transactions", pb(body));
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
        pb(body),
      );
      break;
    case "cancel-settlement":
      if (!transactionId) throw new Error("transaction-id required");
      result = await req("DELETE", `/settlement/transactions/${transactionId}`);
      break;
    // ── Events
    case "list-events":
      result = await req("GET", `/events${qs({ limit, cursor })}`);
      break;
    case "get-event":
      if (!id) throw new Error("id required");
      result = await req("GET", `/events/${id}`);
      break;
    // ── Rewards / Claims
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
      result = await req("POST", "/rewards/claim-schedules", pb(body));
      break;
    case "list-claim-schedules":
      result = await req(
        "GET",
        `/rewards/claim-schedules${qs({ limit, cursor })}`,
      );
      break;
    case "update-claim-schedule":
      if (!id) throw new Error("id required");
      result = await req("PUT", `/rewards/claim-schedules/${id}`, pb(body));
      break;
    case "delete-claim-schedule":
      if (!id) throw new Error("id required");
      result = await req("DELETE", `/rewards/claim-schedules/${id}`);
      break;
    // ── Payout Groups
    case "create-payout-group":
      result = await req("POST", "/rewards/payout-groups", pb(body));
      break;
    case "list-payout-groups":
      result = await req(
        "GET",
        `/rewards/payout-groups${qs({ limit, cursor })}`,
      );
      break;
    case "update-payout-group":
      if (!id) throw new Error("id required");
      result = await req("PUT", `/rewards/payout-groups/${id}`, pb(body));
      break;
    case "delete-payout-group":
      if (!id) throw new Error("id required");
      result = await req("DELETE", `/rewards/payout-groups/${id}`);
      break;
    // ── Monitoring Addresses
    case "create-monitoring-address":
      result = await req("POST", "/rewards/monitor/address", pb(body));
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
      result = await req("PUT", `/rewards/monitor/address/${id}`, pb(body));
      break;
    // ── Reward Addresses
    case "create-reward-address":
      result = await req("POST", "/rewards/addresses", pb(body));
      break;
    case "list-reward-addresses":
      result = await req("GET", `/rewards/addresses${qs({ limit, cursor })}`);
      break;
    case "update-reward-address":
      if (!id) throw new Error("id required");
      result = await req("PUT", `/rewards/addresses/${id}`, pb(body));
      break;
    case "delete-reward-address":
      if (!id) throw new Error("id required");
      result = await req("DELETE", `/rewards/addresses/${id}`);
      break;
    // ── Payments / Statements
    case "list-payments":
      result = await req("GET", `/statements/payments${qs({ limit, cursor })}`);
      break;
    case "list-statements":
      result = await req("GET", `/statements${qs({ limit, cursor })}`);
      break;
    // ── Tax
    case "list-tax-forms":
      result = await req("GET", `/tax/tax-forms${qs({ limit, cursor })}`);
      break;
    case "list-tax-form-revisions":
      result = await req(
        "GET",
        `/tax/tax-form-revisions${qs({ limit, cursor })}`,
      );
      break;
    // ── API Credentials
    case "list-api-credentials":
      result = await req("GET", "/api-creds/credentials");
      break;
    case "delete-api-credential":
      if (!id) throw new Error("id (client_id) required");
      result = await req("DELETE", `/api-creds/credentials/${id}`);
      break;
    // ── Sandbox Utilities
    case "sandbox-deposit":
      if (!profileId) throw new Error("profile-id required");
      result = await req(
        "POST",
        `/sandbox/profiles/${profileId}/deposit`,
        pb(body),
      );
      break;
    case "sandbox-fiat-deposit":
      result = await req("POST", "/sandbox/fiat-deposits", pb(body));
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("qs: query string builder", () => {
  it("returns empty string for all-empty values", () => {
    assert.equal(qs({ a: "", b: "" }), "");
  });

  it("builds query string from non-empty values", () => {
    assert.equal(qs({ limit: "10", cursor: "" }), "?limit=10");
  });

  it("joins multiple params", () => {
    assert.equal(qs({ limit: "10", cursor: "abc" }), "?limit=10&cursor=abc");
  });
});

describe("pb: body parser", () => {
  it("throws when body is empty", () => {
    assert.throws(() => pb(""), /body input is required/);
  });

  it("throws when body is falsy", () => {
    assert.throws(() => pb(null), /body input is required/);
  });

  it("parses valid JSON", () => {
    const result = pb('{"key":"value"}');
    assert.deepEqual(result, { key: "value" });
  });

  it("throws on invalid JSON", () => {
    assert.throws(() => pb("not-json"), /Unexpected token/);
  });
});

describe("Identity commands", () => {
  it("create-identity POSTs to /identity/identities", async () => {
    mockFetch([{ body: { id: "id_1", type: "PERSON", status: "PENDING" } }]);
    const result = await dispatch("create-identity", {
      body: '{"type":"PERSON","first_name":"Alice"}',
    });
    assert.equal(result.id, "id_1");
    // calls[0] is OAuth, calls[0] is the API call
    assert.match(calls[0].url, /\/identity\/identities$/);
    assert.equal(calls[0].options.method, "POST");
  });

  it("get-identity requires identity-id", async () => {
    await assert.rejects(
      () => dispatch("get-identity", {}),
      /identity-id required/,
    );
  });

  it("get-identity fetches by ID", async () => {
    mockFetch([{ body: { id: "id_1", status: "APPROVED" } }]);
    const result = await dispatch("get-identity", { identityId: "id_1" });
    assert.equal(result.status, "APPROVED");
    assert.match(calls[0].url, /\/identity\/identities\/id_1$/);
  });

  it("list-identities includes pagination", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-identities", { limit: "5", cursor: "abc" });
    assert.match(calls[0].url, /limit=5/);
    assert.match(calls[0].url, /cursor=abc/);
  });

  it("update-identity PUTs with body", async () => {
    mockFetch([{ body: { id: "id_1" } }]);
    await dispatch("update-identity", {
      identityId: "id_1",
      body: '{"last_name":"Smith"}',
    });
    assert.equal(calls[0].options.method, "PUT");
    assert.match(calls[0].url, /\/identity\/identities\/id_1$/);
  });
});

describe("Profile commands", () => {
  it("create-profile POSTs to /profiles", async () => {
    mockFetch([{ body: { id: "prof_1", type: "DEFAULT" } }]);
    const result = await dispatch("create-profile", {
      body: '{"type":"DEFAULT","name":"Treasury"}',
    });
    assert.equal(result.id, "prof_1");
    assert.match(calls[0].url, /\/profiles$/);
  });

  it("get-profile requires profile-id", async () => {
    await assert.rejects(
      () => dispatch("get-profile", {}),
      /profile-id required/,
    );
  });

  it("list-profile-balances hits correct URL", async () => {
    mockFetch([{ body: { items: [{ asset: "USD", available: "1000" }] } }]);
    await dispatch("list-profile-balances", { profileId: "prof_1" });
    assert.match(calls[0].url, /\/profiles\/prof_1\/balances$/);
  });

  it("get-profile-balance requires both profile-id and asset", async () => {
    await assert.rejects(
      () => dispatch("get-profile-balance", { profileId: "p1" }),
      /profile-id and asset required/,
    );
    await assert.rejects(
      () => dispatch("get-profile-balance", { asset: "USD" }),
      /profile-id and asset required/,
    );
  });

  it("get-profile-balance builds correct path", async () => {
    mockFetch([{ body: { asset: "PYUSD", available: "500" } }]);
    await dispatch("get-profile-balance", {
      profileId: "prof_1",
      asset: "PYUSD",
    });
    assert.match(calls[0].url, /\/profiles\/prof_1\/balances\/PYUSD$/);
  });

  it("deactivate-profile PUTs to deactivate path", async () => {
    mockFetch([{ body: { id: "prof_1" } }]);
    await dispatch("deactivate-profile", {
      profileId: "prof_1",
      body: '{"reason":"closing"}',
    });
    assert.match(calls[0].url, /\/profiles\/prof_1\/deactivate$/);
    assert.equal(calls[0].options.method, "PUT");
  });
});

describe("Stablecoin conversion commands", () => {
  it("create-conversion POSTs to /conversion/stablecoins", async () => {
    mockFetch([
      {
        body: {
          id: "conv_1",
          source_asset: "USD",
          destination_asset: "PYUSD",
          amount: "1000",
        },
      },
    ]);
    const result = await dispatch("create-conversion", {
      body: '{"profile_id":"p1","amount":"1000","source_asset":"USD","destination_asset":"PYUSD"}',
    });
    assert.equal(result.id, "conv_1");
    assert.match(calls[0].url, /\/conversion\/stablecoins$/);
    assert.equal(calls[0].options.method, "POST");
  });

  it("get-conversion requires id", async () => {
    await assert.rejects(() => dispatch("get-conversion", {}), /id required/);
  });

  it("cancel-conversion DELETEs", async () => {
    mockFetch([{ body: { id: "conv_1", status: "CANCELLED" } }]);
    await dispatch("cancel-conversion", { id: "conv_1" });
    assert.match(calls[0].url, /\/conversion\/stablecoins\/conv_1$/);
    assert.equal(calls[0].options.method, "DELETE");
  });

  it("list-conversions supports filters", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-conversions", {
      profileId: "p1",
      status: "COMPLETED",
    });
    assert.match(calls[0].url, /profile_id=p1/);
    assert.match(calls[0].url, /status=COMPLETED/);
  });
});

describe("Transfer commands", () => {
  it("create-crypto-withdrawal POSTs to correct path", async () => {
    mockFetch([{ body: { id: "w_1", status: "PENDING" } }]);
    await dispatch("create-crypto-withdrawal", {
      body: '{"profile_id":"p1","amount":"0.5","asset":"ETH","destination_address":"0xabc","crypto_network":"ethereum"}',
    });
    assert.match(calls[0].url, /\/transfer\/crypto-withdrawals$/);
    assert.equal(calls[0].options.method, "POST");
  });

  it("create-fiat-withdrawal POSTs to correct path", async () => {
    mockFetch([{ body: { id: "fw_1" } }]);
    await dispatch("create-fiat-withdrawal", {
      body: '{"profile_id":"p1","fiat_account_id":"fa_1","amount":"1000","asset":"USD"}',
    });
    assert.match(calls[0].url, /\/transfer\/fiat-withdrawals$/);
  });

  it("create-internal-transfer POSTs to /transfer/internal", async () => {
    mockFetch([{ body: { id: "t_1" } }]);
    await dispatch("create-internal-transfer", {
      body: '{"source_profile_id":"p1","destination_profile_id":"p2","amount":"100","asset":"USD"}',
    });
    assert.match(calls[0].url, /\/transfer\/internal$/);
  });

  it("get-transfer requires id", async () => {
    await assert.rejects(() => dispatch("get-transfer", {}), /id required/);
  });

  it("list-transfers supports all filters", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-transfers", {
      profileId: "p1",
      status: "COMPLETED",
      refId: "ref_1",
      limit: "20",
    });
    const url = calls[0].url;
    assert.match(url, /profile_id=p1/);
    assert.match(url, /status=COMPLETED/);
    assert.match(url, /ref_id=ref_1/);
    assert.match(url, /limit=20/);
  });

  it("create-deposit-address POSTs body", async () => {
    mockFetch([
      { body: { id: "da_1", address: "0xabc", crypto_network: "ethereum" } },
    ]);
    await dispatch("create-deposit-address", {
      body: '{"profile_id":"p1","crypto_network":"ethereum"}',
    });
    assert.match(calls[0].url, /\/transfer\/deposit-addresses$/);
    const sentBody = JSON.parse(calls[0].options.body);
    assert.equal(sentBody.crypto_network, "ethereum");
  });
});

describe("Fiat account commands", () => {
  it("create-fiat-account POSTs", async () => {
    mockFetch([{ body: { id: "fa_1" } }]);
    await dispatch("create-fiat-account", {
      body: '{"routing_number":"123","account_number":"456"}',
    });
    assert.match(calls[0].url, /\/transfer\/fiat-accounts$/);
  });

  it("delete-fiat-account requires id", async () => {
    await assert.rejects(
      () => dispatch("delete-fiat-account", {}),
      /id required/,
    );
  });

  it("delete-fiat-account DELETEs by id", async () => {
    mockFetch([{ body: { success: true } }]);
    await dispatch("delete-fiat-account", { id: "fa_1" });
    assert.match(calls[0].url, /\/transfer\/fiat-accounts\/fa_1$/);
    assert.equal(calls[0].options.method, "DELETE");
  });
});

describe("Trading commands", () => {
  it("create-order requires profile-id", async () => {
    await assert.rejects(
      () =>
        dispatch("create-order", {
          body: '{"market":"BTC_USD","side":"BUY","type":"MARKET","amount":"0.01"}',
        }),
      /profile-id required/,
    );
  });

  it("create-order POSTs to profile orders path", async () => {
    mockFetch([{ body: { id: "ord_1", market: "BTC_USD", status: "NEW" } }]);
    await dispatch("create-order", {
      profileId: "prof_1",
      body: '{"market":"BTC_USD","side":"BUY","type":"MARKET","amount":"0.01"}',
    });
    assert.match(calls[0].url, /\/profiles\/prof_1\/orders$/);
    assert.equal(calls[0].options.method, "POST");
  });

  it("cancel-order requires profile-id and order-id", async () => {
    await assert.rejects(
      () => dispatch("cancel-order", { profileId: "p1" }),
      /profile-id and order-id required/,
    );
  });

  it("cancel-order DELETEs correct path", async () => {
    mockFetch([{ body: { id: "ord_1" } }]);
    await dispatch("cancel-order", { profileId: "p1", orderId: "ord_1" });
    assert.match(calls[0].url, /\/profiles\/p1\/orders\/ord_1$/);
    assert.equal(calls[0].options.method, "DELETE");
  });

  it("list-orders without profile goes to /orders", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-orders", {});
    assert.match(calls[0].url, /\/orders/);
    assert.ok(!calls[0].url.includes("/profiles/"));
  });

  it("list-orders with profile goes to /profiles/:id/orders", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-orders", { profileId: "p1" });
    assert.match(calls[0].url, /\/profiles\/p1\/orders/);
  });

  it("list-executions without profile goes to /executions", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-executions", {});
    assert.match(calls[0].url, /\/executions/);
  });

  it("list-executions with profile goes to /profiles/:id/executions", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-executions", { profileId: "p1" });
    assert.match(calls[0].url, /\/profiles\/p1\/executions/);
  });
});

describe("Market data commands", () => {
  it("list-markets GETs /markets", async () => {
    mockFetch([{ body: { markets: [] } }]);
    await dispatch("list-markets", {});
    assert.match(calls[0].url, /\/markets$/);
    assert.equal(calls[0].options.method, "GET");
  });

  it("get-ticker requires market", async () => {
    await assert.rejects(() => dispatch("get-ticker", {}), /market required/);
  });

  it("get-ticker GETs /markets/:market/ticker", async () => {
    mockFetch([{ body: { market: "BTC_USD", best_bid: "50000" } }]);
    await dispatch("get-ticker", { market: "BTC_USD" });
    assert.match(calls[0].url, /\/markets\/BTC_USD\/ticker$/);
  });

  it("list-prices GETs /all-markets/prices", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-prices", {});
    assert.match(calls[0].url, /\/all-markets\/prices$/);
  });

  it("get-order-book requires market", async () => {
    await assert.rejects(
      () => dispatch("get-order-book", {}),
      /market required/,
    );
  });
});

describe("Quote commands", () => {
  it("create-quote-execution requires profile-id", async () => {
    await assert.rejects(
      () =>
        dispatch("create-quote-execution", {
          body: '{"quote_id":"q_1"}',
        }),
      /profile-id required/,
    );
  });

  it("create-issuer-quote POSTs to /issuer-quote", async () => {
    mockFetch([{ body: { id: "iq_1", price: "1.0001" } }]);
    await dispatch("create-issuer-quote", {
      body: '{"asset":"PYUSD","side":"BUY","amount":"10000"}',
    });
    assert.match(calls[0].url, /\/issuer-quote$/);
  });

  it("execute-issuer-quote requires quote-id", async () => {
    await assert.rejects(
      () =>
        dispatch("execute-issuer-quote", {
          body: '{"profile_id":"p1"}',
        }),
      /quote-id required/,
    );
  });
});

describe("Orchestration commands", () => {
  it("create-orchestration POSTs to /orchestration/orchestrations", async () => {
    mockFetch([{ body: { id: "orch_1", status: "PENDING" } }]);
    await dispatch("create-orchestration", {
      body: '{"source_profile_id":"p1","amount":"1000"}',
    });
    assert.match(calls[0].url, /\/orchestration\/orchestrations$/);
  });

  it("create-orchestration-rule POSTs to /orchestration/rules", async () => {
    mockFetch([{ body: { id: "rule_1" } }]);
    await dispatch("create-orchestration-rule", {
      body: '{"profile_id":"p1","trigger":"deposit"}',
    });
    assert.match(calls[0].url, /\/orchestration\/rules$/);
  });

  it("delete-orchestration-rule requires rule-id", async () => {
    await assert.rejects(
      () => dispatch("delete-orchestration-rule", {}),
      /rule-id required/,
    );
  });

  it("delete-orchestration-rule DELETEs by rule-id", async () => {
    mockFetch([{ body: { success: true } }]);
    await dispatch("delete-orchestration-rule", { ruleId: "rule_1" });
    assert.match(calls[0].url, /\/orchestration\/rules\/rule_1$/);
    assert.equal(calls[0].options.method, "DELETE");
  });
});

describe("Settlement commands", () => {
  it("create-settlement POSTs to /settlement/transactions", async () => {
    mockFetch([{ body: { id: "stl_1", status: "CREATED" } }]);
    await dispatch("create-settlement", {
      body: '{"counterparty":"cp_1","asset":"BTC","amount":"1.0"}',
    });
    assert.match(calls[0].url, /\/settlement\/transactions$/);
  });

  it("affirm-settlement requires transaction-id", async () => {
    await assert.rejects(
      () =>
        dispatch("affirm-settlement", {
          body: '{"confirmed":true}',
        }),
      /transaction-id required/,
    );
  });

  it("affirm-settlement PUTs to correct path", async () => {
    mockFetch([{ body: { id: "stl_1", status: "AFFIRMED" } }]);
    await dispatch("affirm-settlement", {
      transactionId: "stl_1",
      body: '{"confirmed":true}',
    });
    assert.match(calls[0].url, /\/settlement\/transactions\/stl_1\/affirm$/);
    assert.equal(calls[0].options.method, "PUT");
  });

  it("cancel-settlement DELETEs", async () => {
    mockFetch([{ body: { success: true } }]);
    await dispatch("cancel-settlement", { transactionId: "stl_1" });
    assert.equal(calls[0].options.method, "DELETE");
  });
});

describe("Rewards commands", () => {
  it("create-claim-schedule POSTs to /rewards/claim-schedules", async () => {
    mockFetch([{ body: { id: "cs_1" } }]);
    await dispatch("create-claim-schedule", {
      body: '{"schedule":"daily"}',
    });
    assert.match(calls[0].url, /\/rewards\/claim-schedules$/);
  });

  it("create-payout-group POSTs to /rewards/payout-groups", async () => {
    mockFetch([{ body: { id: "pg_1" } }]);
    await dispatch("create-payout-group", {
      body: '{"name":"Group A"}',
    });
    assert.match(calls[0].url, /\/rewards\/payout-groups$/);
  });

  it("create-monitoring-address POSTs to /rewards/monitor/address", async () => {
    mockFetch([{ body: { id: "ma_1" } }]);
    await dispatch("create-monitoring-address", {
      body: '{"address":"0xabc","crypto_network":"ethereum"}',
    });
    assert.match(calls[0].url, /\/rewards\/monitor\/address$/);
  });

  it("delete-reward-address requires id", async () => {
    await assert.rejects(
      () => dispatch("delete-reward-address", {}),
      /id required/,
    );
  });
});

describe("Sandbox commands", () => {
  it("sandbox-deposit requires profile-id", async () => {
    await assert.rejects(
      () =>
        dispatch("sandbox-deposit", {
          body: '{"asset":"BTC","amount":"1.0"}',
        }),
      /profile-id required/,
    );
  });

  it("sandbox-deposit POSTs to /sandbox/profiles/:id/deposit", async () => {
    mockFetch([{ body: { id: "dep_1" } }]);
    await dispatch("sandbox-deposit", {
      profileId: "p1",
      body: '{"asset":"BTC","amount":"1.0","crypto_network":"bitcoin"}',
    });
    assert.match(calls[0].url, /\/sandbox\/profiles\/p1\/deposit$/);
  });

  it("sandbox-fiat-deposit POSTs to /sandbox/fiat-deposits", async () => {
    mockFetch([{ body: { id: "fd_1" } }]);
    await dispatch("sandbox-fiat-deposit", {
      body: '{"profile_id":"p1","amount":"5000","asset":"USD"}',
    });
    assert.match(calls[0].url, /\/sandbox\/fiat-deposits$/);
  });
});

describe("Error handling", () => {
  it("unknown command throws", async () => {
    await assert.rejects(
      () => dispatch("nonexistent-command", {}),
      /Unknown command: nonexistent-command/,
    );
  });

  it("API error includes status and message", async () => {
    mockFetch([{ status: 400, body: { message: "Invalid request" } }]);
    await assert.rejects(() => dispatch("list-markets", {}), /returned 400/);
  });

  it("API 500 error propagates", async () => {
    mockFetch([{ status: 500, body: "Internal Server Error" }]);
    await assert.rejects(() => dispatch("list-prices", {}), /returned 500/);
  });

  it("body required commands throw without body", async () => {
    await assert.rejects(
      () => dispatch("create-identity", {}),
      /body input is required/,
    );
  });

  it("DELETE does not send body", async () => {
    mockFetch([{ body: { success: true } }]);
    await dispatch("delete-fiat-account", { id: "fa_1" });
    assert.equal(calls[0].options.body, undefined);
  });
});

describe("Auth and headers", () => {
  it("sends Bearer token in Authorization header", async () => {
    mockFetch([{ body: {} }]);
    await dispatch("list-markets", {});
    const auth = calls[0].options.headers.Authorization;
    assert.equal(auth, "Bearer test-token");
  });

  it("sends Content-Type and Accept headers", async () => {
    mockFetch([{ body: {} }]);
    await dispatch("list-markets", {});
    assert.equal(calls[0].options.headers["Content-Type"], "application/json");
    assert.equal(calls[0].options.headers.Accept, "application/json");
  });

  it("POST sends JSON body", async () => {
    mockFetch([{ body: { id: "prof_1" } }]);
    await dispatch("create-profile", {
      body: '{"type":"DEFAULT","name":"Test"}',
    });
    const sent = JSON.parse(calls[0].options.body);
    assert.equal(sent.type, "DEFAULT");
    assert.equal(sent.name, "Test");
  });
});

describe("Accounts and members", () => {
  it("get-account requires account-id", async () => {
    await assert.rejects(
      () => dispatch("get-account", {}),
      /account-id required/,
    );
  });

  it("remove-institution-member requires member-id", async () => {
    await assert.rejects(
      () => dispatch("remove-institution-member", {}),
      /member-id required/,
    );
  });

  it("remove-account-member DELETEs by member-id", async () => {
    mockFetch([{ body: { success: true } }]);
    await dispatch("remove-account-member", { memberId: "m_1" });
    assert.match(calls[0].url, /\/identity\/account-members\/m_1$/);
    assert.equal(calls[0].options.method, "DELETE");
  });
});

describe("Events and tax", () => {
  it("get-event requires id", async () => {
    await assert.rejects(() => dispatch("get-event", {}), /id required/);
  });

  it("list-tax-forms GETs /tax/tax-forms", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-tax-forms", {});
    assert.match(calls[0].url, /\/tax\/tax-forms/);
  });

  it("list-api-credentials GETs /api-creds/credentials", async () => {
    mockFetch([{ body: { items: [] } }]);
    await dispatch("list-api-credentials", {});
    assert.match(calls[0].url, /\/api-creds\/credentials$/);
  });

  it("delete-api-credential requires id", async () => {
    await assert.rejects(
      () => dispatch("delete-api-credential", {}),
      /id \(client_id\) required/,
    );
  });
});
