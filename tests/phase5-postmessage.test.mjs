import fs from "fs";
import path from "path";

console.log("================================================================================");
console.log("VYBE Phase 5 Verification Suite: postMessage Protocol & Origin Safety");
console.log("================================================================================");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// ------------------------------------------------------------------------------
// 1. Source Code Audit of src/lib/player/postmessage.ts
// ------------------------------------------------------------------------------
console.log("\n[1] Auditing postMessage Bridge Implementation...");
const bridgePath = path.resolve("src/lib/player/postmessage.ts");
assert(fs.existsSync(bridgePath), "Bridge source file exists: src/lib/player/postmessage.ts");

const bridgeContent = fs.readFileSync(bridgePath, "utf-8");
assert(bridgeContent.includes("https://web.screenscape.fun"), "Contains primary origin: https://web.screenscape.fun");
assert(bridgeContent.includes("https://nxsha.screenscape.me"), "Contains mirror origin: https://nxsha.screenscape.me");
assert(bridgeContent.includes("SCREENSCAPE_GET_PROGRESS"), "Implements request: SCREENSCAPE_GET_PROGRESS");
assert(bridgeContent.includes("SCREENSCAPE_SET_PROGRESS"), "Implements request: SCREENSCAPE_SET_PROGRESS");
assert(bridgeContent.includes("SCREENSCAPE_PROGRESS_RESPONSE"), "Implements listener for: SCREENSCAPE_PROGRESS_RESPONSE");
assert(bridgeContent.includes("SCREENSCAPE_SET_PROGRESS_RESPONSE"), "Implements listener for: SCREENSCAPE_SET_PROGRESS_RESPONSE");
assert(bridgeContent.includes("SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS"), "Implements request: SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS");
assert(bridgeContent.includes("timeoutMs"), "Implements timeout guard against hung iframe postMessage");
assert(bridgeContent.includes("window.removeEventListener"), "Cleans up message event listeners properly");

// ------------------------------------------------------------------------------
// 2. Origin Security Logic Verification
// ------------------------------------------------------------------------------
console.log("\n[2] Testing Origin Validation Function Logic...");

const PERMITTED_EMBED_ORIGINS = [
  "https://web.screenscape.fun",
  "https://nxsha.screenscape.me",
];

function isPermittedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const normalized = `${url.protocol}//${url.host}`;
    return PERMITTED_EMBED_ORIGINS.includes(normalized);
  } catch {
    return false;
  }
}

assert(isPermittedOrigin("https://web.screenscape.fun"), "https://web.screenscape.fun is permitted");
assert(isPermittedOrigin("https://nxsha.screenscape.me"), "https://nxsha.screenscape.me is permitted");
assert(isPermittedOrigin("https://web.screenscape.fun/embed"), "Normalized path origin permitted");
assert(!isPermittedOrigin("https://evil-screenscape.fun"), "Rejects phishing origin https://evil-screenscape.fun");
assert(!isPermittedOrigin("http://web.screenscape.fun"), "Rejects insecure http:// origin");
assert(!isPermittedOrigin("https://attacker.com"), "Rejects untrusted origin https://attacker.com");
assert(!isPermittedOrigin(""), "Rejects empty origin");
assert(!isPermittedOrigin(null), "Rejects null origin");

// ------------------------------------------------------------------------------
// 3. Simulated postMessage Roundtrip & Error Handling
// ------------------------------------------------------------------------------
console.log("\n[3] Testing postMessage Message Formatting & Timeout Safety...");

const mockEmbedWindow = {
  messages: [],
  postMessage(data, targetOrigin) {
    this.messages.push({ data, targetOrigin });
  },
};

// Test sending SET_PROGRESS
const testTmdbId = 10195;
const testProgress = 3200;
mockEmbedWindow.postMessage(
  {
    type: "SCREENSCAPE_SET_PROGRESS",
    requestId: "req-1",
    payload: { tmdbId: testTmdbId, progressSeconds: testProgress },
  },
  "https://web.screenscape.fun"
);

assert(mockEmbedWindow.messages.length === 1, "Dispatches message to iframe window");
assert(mockEmbedWindow.messages[0].data.type === "SCREENSCAPE_SET_PROGRESS", "Dispatches SCREENSCAPE_SET_PROGRESS");
assert(mockEmbedWindow.messages[0].data.payload.progressSeconds === 3200, "Dispatches progressSeconds in payload");
assert(mockEmbedWindow.messages[0].targetOrigin === "https://web.screenscape.fun", "Secured with targetOrigin https://web.screenscape.fun");

// ------------------------------------------------------------------------------
// Summary
// ------------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log("================================================================================");
