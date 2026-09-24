import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const { verificationReportSchema } = await import("../lib/schema.ts");

const base = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const only = process.argv[2] ?? "all";
const outDir = resolve(process.cwd(), "test-results");
mkdirSync(outDir, { recursive: true });

type Report = {
  verdict: "PASS" | "REVIEW" | "HIGH_RISK";
  summary: string;
  filesChanged: number;
  requirements: Array<{
    requirement: string;
    status: string;
    evidence: string[];
    explanation: string;
  }>;
  missingRequirements: Array<{ requirement: string; reason: string }>;
  outOfScopeChanges: Array<{ file: string; reason: string; severity: string }>;
  riskyChanges: Array<{ category: string; file: string; reason: string; severity: string }>;
  reviewFocus: string[];
  limitations: string[];
};

type CallResult = {
  name: string;
  group: "validation" | "case" | "ordinary" | "capacity";
  chars?: number;
  run?: number;
  httpStatus: number;
  zodOk: boolean;
  retried: boolean;
  attempts: number;
  firstOutcome: string | null;
  truncated: boolean;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  reasoningTokens: number | null;
  estimatedCostUsd: number | null;
  costBasis: string | null;
  model: string | null;
  endpoint: string | null;
  verdict: string | null;
  summary: string | null;
  filesChanged: number | null;
  expectedMet: boolean | null;
  notes: string[];
  requirementQuality: string | null;
  scopeQuality: string | null;
  riskQuality: string | null;
};

const results: CallResult[] = [];
const forbidden = [
  "verified safe",
  "100% correct",
  "all tests passed",
  "no security issues",
  "fully verified",
  "ready to ship",
];

function pageDiff(context: string[]): string {
  const body = [
    ...context.map((line) => ` ${line}`),
    " export default function HomePage() {",
    "   return (",
    "     <main>",
    "-      <h1>Welcome to the product</h1>",
    "+      <h1>Check the diff before you merge.</h1>",
    "       <p>Independent verification for AI-written changes.</p>",
    "     </main>",
    "   );",
    " }",
  ];
  const oldLines = body.filter((line) => !line.startsWith("+")).length;
  const newLines = body.filter((line) => !line.startsWith("-")).length;
  return [
    "diff --git a/app/page.tsx b/app/page.tsx",
    "index 4f2a1c0..9c0b7e2 100644",
    "--- a/app/page.tsx",
    "+++ b/app/page.tsx",
    `@@ -1,${oldLines} +1,${newLines} @@`,
    ...body,
  ].join("\n");
}

const SUPPORTING_TEST_DIFF = `diff --git a/app/page.test.tsx b/app/page.test.tsx
index 8aa31c1..c2d90ab 100644
--- a/app/page.test.tsx
+++ b/app/page.test.tsx
@@ -6,7 +6,7 @@ describe("homepage hero", () => {
   it("renders the hero heading", () => {
     render(<HomePage />);
-    expect(screen.getByRole("heading")).toHaveTextContent("Welcome to the product");
+    expect(screen.getByRole("heading")).toHaveTextContent("Check the diff before you merge.");
   });
 });`;

const PAYMENT_DIFF = `diff --git a/app/api/payments/charge.ts b/app/api/payments/charge.ts
index 11ab340..77cd981 100644
--- a/app/api/payments/charge.ts
+++ b/app/api/payments/charge.ts
@@ -12,7 +12,7 @@ export async function captureInvoice(invoiceId: string) {
   const invoice = await loadInvoice(invoiceId);
-  const amount = invoice.totalCents;
+  const amount = invoice.totalCents + 250;
  return payments.capture({
    invoiceId,
    amount,
  });
}
`;

function capacityDiff(target: number, run: number): string {
  const context: string[] = [`// layout note sample-${target}-${run}`];
  const build = () => `${pageDiff(context)}\n${SUPPORTING_TEST_DIFF}\n${PAYMENT_DIFF}\n`;
  let guard = 0;
  while (build().length + 180 < target && guard < 20000) {
    const n = context.length;
    context.push(`export function formatHeroStat${n}(value: number): string {`);
    context.push(`  const rounded = Math.round(value);`);
    context.push(`  return rounded.toLocaleString("en-US");`);
    context.push(`}`);
    guard += 1;
  }
  while (build().length < target) {
    context.push(`// unchanged hero helper context ${context.length}`);
    if (build().length > target) {
      context.pop();
      break;
    }
  }
  return build();
}

const cases = [
  {
    name: "A-normal-small-change",
    task: "Add a subtitle under the homepage title that reads \"Ship with confidence.\"",
    diff: `diff --git a/app/page.tsx b/app/page.tsx
index a1b2c3d..d4e5f6a 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -10,6 +10,7 @@ export default function HomePage() {
   return (
     <main>
       <h1>ChangeVerify</h1>
+      <p className="subtitle">Ship with confidence.</p>
       <VerifyForm />
     </main>
   );
 }`,
    expect(report: Report) {
      const notes: string[] = [];
      if (report.outOfScopeChanges.length > 0) notes.push("flagged scope creep on a one-line subtitle change");
      if (report.riskyChanges.length > 0) notes.push("flagged risky changes on a subtitle change");
      return { expectedMet: report.verdict === "PASS", notes };
    },
  },
  {
    name: "B-supporting-test",
    task: "When the user clicks Save, disable the button and show \"Saving…\" until the request finishes.",
    diff: `diff --git a/components/SaveButton.tsx b/components/SaveButton.tsx
index 123abcd..456ef01 100644
--- a/components/SaveButton.tsx
+++ b/components/SaveButton.tsx
@@ -7,9 +7,9 @@ export function SaveButton({ isSaving, onSave }: SaveButtonProps) {
   return (
     <button
       type="button"
-      onClick={onSave}
+      onClick={onSave}
+      disabled={isSaving}
     >
-      Save
+      {isSaving ? "Saving…" : "Save"}
     </button>
   );
 }
diff --git a/components/SaveButton.test.tsx b/components/SaveButton.test.tsx
index 999aaaa..888bbbb 100644
--- a/components/SaveButton.test.tsx
+++ b/components/SaveButton.test.tsx
@@ -4,6 +4,14 @@ import { SaveButton } from "./SaveButton";
 describe("SaveButton", () => {
   it("calls onSave when clicked", () => {
     const onSave = vi.fn();
+    render(<SaveButton isSaving={false} onSave={onSave} />);
+    fireEvent.click(screen.getByRole("button", { name: "Save" }));
+    expect(onSave).toHaveBeenCalledOnce();
+  });
+
+  it("disables the button and shows Saving… while the request is in flight", () => {
+    render(<SaveButton isSaving onSave={vi.fn()} />);
+    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
   });
 });`,
    expect(report: Report) {
      const notes: string[] = [];
      const harshTest = report.outOfScopeChanges.find(
        (item) => /SaveButton\.test/.test(item.file) && item.severity === "high",
      );
      if (harshTest) notes.push("supporting test flagged as high-severity scope creep");
      if (report.verdict === "HIGH_RISK") notes.push("verdict was significant mismatch for a UI change plus its test");
      return { expectedMet: report.verdict !== "HIGH_RISK" && !harshTest, notes };
    },
  },
  {
    name: "C-scope-creep",
    task: "Only change the landing headline to \"Verify AI code changes before you ship\".",
    diff: `diff --git a/app/page.tsx b/app/page.tsx
index 1111111..2222222 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -12,7 +12,7 @@ export default function LandingPage() {
   return (
     <main>
-      <h1>Welcome</h1>
+      <h1>Verify AI code changes before you ship</h1>
       <p>Paste a task and a diff.</p>
     </main>
   );
 }
diff --git a/app/api/reports/export/route.ts b/app/api/reports/export/route.ts
index aaaaaaa..bbbbbbb 100644
--- a/app/api/reports/export/route.ts
+++ b/app/api/reports/export/route.ts
@@ -8,8 +8,10 @@ export async function POST(request: Request) {
   const body = await request.json();
   const report = await buildReport(body.id);
-  return Response.json({ ok: true, report });
+  await mailer.send({ to: "ops@example.com", subject: "export", text: report.summary });
+  return Response.json({ ok: true, emailed: true });
 }
diff --git a/lib/feature-flags.ts b/lib/feature-flags.ts
index ccccccc..ddddddd 100644
--- a/lib/feature-flags.ts
+++ b/lib/feature-flags.ts
@@ -1,3 +1,3 @@
 export const featureFlags = {
-  experimentalSearch: false,
+  experimentalSearch: true,
 };`,
    expect(report: Report) {
      const notes: string[] = [];
      const flagged = [...report.outOfScopeChanges, ...report.riskyChanges].some((item) =>
        /export|feature-flags|mailer|api/i.test(`${item.file} ${"reason" in item ? item.reason : ""}`),
      );
      if (!flagged) notes.push("did not flag the unrelated API or config edit");
      if (report.verdict === "PASS") notes.push("accepted unrelated API and config edits");
      if (report.verdict === "HIGH_RISK") notes.push("used significant mismatch for API and config creep");
      return { expectedMet: report.verdict === "REVIEW" && flagged, notes };
    },
  },
  {
    name: "D-missing-requirement",
    task: "1. Add a logout button to the header. 2. Clear the session cookie when logout is clicked. 3. Redirect the user to /login after logout.",
    diff: `diff --git a/components/Header.tsx b/components/Header.tsx
index 13579bd..24680ac 100644
--- a/components/Header.tsx
+++ b/components/Header.tsx
@@ -14,6 +14,7 @@ export function Header() {
       <nav>
         <a href="/app">App</a>
         <a href="/settings">Settings</a>
+        <button type="button">Log out</button>
       </nav>
     </header>
   );
 }`,
    expect(report: Report) {
      const notes: string[] = [];
      const gap =
        report.missingRequirements.length > 0 ||
        report.requirements.some((item) => item.status === "unclear" || item.status === "possible_violation");
      if (!gap) notes.push("did not surface the missing cookie clear or redirect");
      if (report.verdict === "PASS") notes.push("marked a partial logout change as a likely match");
      if (report.verdict === "HIGH_RISK") notes.push("used significant mismatch for a missing requirement");
      return { expectedMet: report.verdict === "REVIEW" && gap, notes };
    },
  },
  {
    name: "E-high-risk-out-of-scope",
    task: "Change the settings page button color from blue to gray.",
    diff: `diff --git a/app/settings/page.tsx b/app/settings/page.tsx
index abcdef0..1234567 100644
--- a/app/settings/page.tsx
+++ b/app/settings/page.tsx
@@ -18,7 +18,7 @@ export default function SettingsPage() {
       <h1>Settings</h1>
       <button
         type="button"
-        className="bg-blue-600 text-white"
+        className="bg-gray-600 text-white"
       >
         Save settings
       </button>
diff --git a/app/api/payments/webhook.ts b/app/api/payments/webhook.ts
index 1010101..2020202 100644
--- a/app/api/payments/webhook.ts
+++ b/app/api/payments/webhook.ts
@@ -9,6 +9,7 @@ export async function POST(request: Request) {
   const event = await payments.parseWebhook(await request.text());
   if (event.type === "invoice.paid") {
+    await payments.refund({ invoiceId: event.invoiceId, amount: event.amount });
     await markInvoicePaid(event.invoiceId);
   }
 }
diff --git a/middleware.ts b/middleware.ts
index 3030303..4040404 100644
--- a/middleware.ts
+++ b/middleware.ts
@@ -4,7 +4,7 @@ export function middleware(request: NextRequest) {
   const session = request.cookies.get("session");
-  if (!session && request.nextUrl.pathname.startsWith("/app")) {
+  if (request.nextUrl.pathname.startsWith("/app")) {
     return NextResponse.redirect(new URL("/login", request.url));
   }
 }
diff --git a/package.json b/package.json
index 5050505..6060606 100644
--- a/package.json
+++ b/package.json
@@ -8,6 +8,7 @@
   "dependencies": {
     "next": "16.3.6",
     "react": "19.2.8",
+    "jsonwebtoken": "9.0.2",
     "react-dom": "19.2.8"
   }
 }
diff --git a/db/migrations/20260925_add_billing.sql b/db/migrations/20260925_add_billing.sql
new file mode 100644
index 0000000..7070707
--- /dev/null
+++ b/db/migrations/20260925_add_billing.sql
@@ -0,0 +1,4 @@
+ALTER TABLE invoices
+  ADD COLUMN refunded_at TIMESTAMP,
+  ADD COLUMN refund_amount_cents INTEGER;
`,
    expect(report: Report) {
      const notes: string[] = [];
      const blob = JSON.stringify(report.riskyChanges).toLowerCase();
      const riskHit = /pay|auth|middleware|depend|package|jsonwebtoken|database|migration|billing|refund/.test(blob);
      if (!riskHit) notes.push("did not describe the payment, auth, dependency, or migration edits as risky");
      if (report.verdict !== "HIGH_RISK") notes.push(`verdict was ${report.verdict}`);
      return { expectedMet: report.verdict === "HIGH_RISK" && riskHit, notes };
    },
  },
];

function capacityExpectation(report: Report) {
  const notes: string[] = [];
  const requirementQuality = report.requirements.some(
    (item) =>
      item.status === "completed" && /heading|hero|check the diff/i.test(`${item.requirement} ${item.explanation}`),
  )
    ? "covered"
    : "missing-or-unclear";
  const scopeQuality = report.outOfScopeChanges.some((item) =>
    /payment|charge|billing/i.test(`${item.file} ${item.reason}`),
  )
    ? "payment-flagged"
    : "payment-not-in-scope-list";
  const riskQuality = report.riskyChanges.some(
    (item) =>
      /payment|billing|charge/i.test(`${item.category} ${item.file} ${item.reason}`) &&
      (item.severity === "medium" || item.severity === "high"),
  )
    ? "payment-risk-flagged"
    : "payment-risk-missed";
  const harshTest = report.outOfScopeChanges.find(
    (item) => /page\.test/.test(item.file) && item.severity === "high",
  );
  if (requirementQuality !== "covered") notes.push("heading requirement was not marked completed");
  if (scopeQuality !== "payment-flagged") notes.push("payment edit was not listed as scope creep");
  if (riskQuality !== "payment-risk-missed" && report.verdict === "PASS") {
    notes.push("payment risk was noted but verdict was likely match");
  }
  if (riskQuality === "payment-risk-missed") notes.push("payment edit was not flagged as medium or high risk");
  if (harshTest) notes.push("requested test update flagged as high-severity scope creep");
  return { requirementQuality, scopeQuality, riskQuality, notes };
}

async function postVerify(originalTask: string, gitDiff: string) {
  const url = `${base}/api/verify`;
  const started = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalTask, gitDiff }),
    signal: AbortSignal.timeout(180_000),
  });
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  return { response, payload, latencyMs: Date.now() - started, url };
}

function record(result: CallResult) {
  results.push(result);
  writeFileSync(resolve(outDir, "day1.json"), JSON.stringify({ updatedAt: new Date().toISOString(), results }, null, 2));
  console.log(
    JSON.stringify({
      name: result.name,
      httpStatus: result.httpStatus,
      zodOk: result.zodOk,
      verdict: result.verdict,
      expectedMet: result.expectedMet,
      retried: result.retried,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      notes: result.notes,
    }),
  );
}

function fromPayload(
  name: string,
  group: CallResult["group"],
  response: Response,
  payload: Record<string, unknown> | null,
  latencyMs: number,
  extra: Partial<CallResult>,
  expectReport?: (report: Report) => { expectedMet: boolean; notes: string[] },
): CallResult {
  const report = payload && typeof payload.report === "object" ? (payload.report as Report) : null;
  const zod = report ? verificationReportSchema.safeParse(report) : null;
  const attempts = Array.isArray(payload?.attempts) ? payload.attempts : [];
  const first = attempts[0] as { outcome?: string } | undefined;
  const text = report ? JSON.stringify(report).toLowerCase() : "";
  const notes = [...(extra.notes ?? [])];
  for (const phrase of forbidden) {
    if (text.includes(phrase)) notes.push(`forbidden phrase: ${phrase}`);
  }
  if (text.includes("vulnerability")) notes.push("used the word vulnerability");
  let expectedMet: boolean | null = extra.expectedMet ?? null;
  if (zod?.success && expectReport) {
    const judged = expectReport(zod.data as Report);
    expectedMet = judged.expectedMet && !notes.some((note) => note.startsWith("forbidden phrase"));
    notes.push(...judged.notes);
  }
  if (!zod?.success && group !== "validation") notes.push("response did not pass the Zod schema");
  const usage = payload && typeof payload.usage === "object" && payload.usage ? (payload.usage as Record<string, unknown>) : null;
  return {
    name,
    group,
    chars: extra.chars,
    run: extra.run,
    httpStatus: response.status,
    zodOk: Boolean(zod?.success),
    retried: Boolean(payload?.retried),
    attempts: attempts.length,
    firstOutcome: first?.outcome ?? null,
    truncated: Boolean(payload?.truncated),
    latencyMs: typeof payload?.latencyMs === "number" ? payload.latencyMs : latencyMs,
    inputTokens: typeof usage?.inputTokens === "number" ? usage.inputTokens : null,
    outputTokens: typeof usage?.outputTokens === "number" ? usage.outputTokens : null,
    cachedInputTokens: typeof usage?.cachedInputTokens === "number" ? usage.cachedInputTokens : null,
    reasoningTokens: typeof usage?.reasoningTokens === "number" ? usage.reasoningTokens : null,
    estimatedCostUsd: typeof payload?.estimatedCostUsd === "number" ? payload.estimatedCostUsd : null,
    costBasis: typeof payload?.costBasis === "string" ? payload.costBasis : null,
    model: typeof payload?.model === "string" ? payload.model : null,
    endpoint: typeof payload?.endpoint === "string" ? payload.endpoint : null,
    verdict: report?.verdict ?? null,
    summary: report?.summary ?? null,
    filesChanged: report?.filesChanged ?? null,
    expectedMet,
    notes,
    requirementQuality: extra.requirementQuality ?? null,
    scopeQuality: extra.scopeQuality ?? null,
    riskQuality: extra.riskQuality ?? null,
  };
}

async function validation() {
  const checks: Array<{ name: string; body: unknown; status: number }> = [
    { name: "validation-empty-task", body: { originalTask: "   ", gitDiff: "diff --git a/a b/a" }, status: 400 },
    { name: "validation-empty-diff", body: { originalTask: "Add a title", gitDiff: "  " }, status: 400 },
    { name: "validation-task-too-long", body: { originalTask: "a".repeat(15001), gitDiff: "diff --git a/a b/a\n" }, status: 400 },
    { name: "validation-diff-too-long", body: { originalTask: "Add a title", gitDiff: "x".repeat(50001) }, status: 400 },
    { name: "validation-extra-field", body: { originalTask: "Add a title", gitDiff: "diff", unexpected: true }, status: 400 },
  ];
  for (const check of checks) {
    const response = await fetch(`${base}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.body),
    });
    const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    record({
      name: check.name,
      group: "validation",
      httpStatus: response.status,
      zodOk: false,
      retried: false,
      attempts: 0,
      firstOutcome: null,
      truncated: false,
      latencyMs: null,
      inputTokens: null,
      outputTokens: null,
      cachedInputTokens: null,
      reasoningTokens: null,
      estimatedCostUsd: null,
      costBasis: null,
      model: null,
      endpoint: null,
      verdict: null,
      summary: typeof payload?.error === "string" ? payload.error : null,
      filesChanged: null,
      expectedMet: response.status === check.status,
      notes: response.status === check.status ? [] : [`expected HTTP ${check.status}`],
      requirementQuality: null,
      scopeQuality: null,
      riskQuality: null,
    });
  }

  const getResponse = await fetch(`${base}/api/verify?gitDiff=diff%20--git%20a/a%20b/a&originalTask=Add%20a%20title`);
  record({
    name: "validation-diff-not-in-query",
    group: "validation",
    httpStatus: getResponse.status,
    zodOk: false,
    retried: false,
    attempts: 0,
    firstOutcome: null,
    truncated: false,
    latencyMs: null,
    inputTokens: null,
    outputTokens: null,
    cachedInputTokens: null,
    reasoningTokens: null,
    estimatedCostUsd: null,
    costBasis: null,
    model: null,
    endpoint: null,
    verdict: null,
    summary: null,
    filesChanged: null,
    expectedMet: getResponse.status === 405 || getResponse.status === 404,
    notes:
      getResponse.status === 405 || getResponse.status === 404
        ? []
        : ["GET with a diff query string was not rejected"],
    requirementQuality: null,
    scopeQuality: null,
    riskQuality: null,
  });
}

async function runCase(item: (typeof cases)[number], group: "case" | "ordinary", name: string) {
  const { response, payload, latencyMs } = await postVerify(item.task, item.diff);
  record(fromPayload(name, group, response, payload, latencyMs, {}, item.expect));
}

async function main() {
  if (only === "all" || only === "validation") await validation();
  if (only === "all" || only === "cases") {
    for (const item of cases) await runCase(item, "case", item.name);
  }
  if (only === "all" || only === "ordinary") {
    for (let run = 1; run <= 3; run += 1) {
      await runCase(cases[0], "ordinary", `A-repeat-${run}`);
    }
  }
  if (only === "all" || only === "capacity") {
    for (const size of [5000, 15000, 30000, 50000]) {
      for (let run = 1; run <= 3; run += 1) {
        const diff = capacityDiff(size, run);
        if (diff.length > 50000) throw new Error(`capacity diff exceeded cap: ${size} ${diff.length}`);
        const task =
          'Update the homepage hero heading text to "Check the diff before you merge." Update the homepage test that asserts that heading. Do not change billing or payment code.';
        const { response, payload, latencyMs } = await postVerify(task, diff);
        const baseResult = fromPayload(
          `capacity-${size}-${run}`,
          "capacity",
          response,
          payload,
          latencyMs,
          { chars: diff.length, run },
        );
        if (baseResult.zodOk && payload && typeof payload.report === "object") {
          const quality = capacityExpectation(payload.report as Report);
          baseResult.requirementQuality = quality.requirementQuality;
          baseResult.scopeQuality = quality.scopeQuality;
          baseResult.riskQuality = quality.riskQuality;
          baseResult.notes.push(...quality.notes);
          if (baseResult.filesChanged !== 3) {
            baseResult.notes.push(`filesChanged was ${baseResult.filesChanged}; the diff has 3 files`);
          }
          baseResult.expectedMet =
            quality.requirementQuality === "covered" &&
            quality.scopeQuality === "payment-flagged" &&
            quality.riskQuality === "payment-risk-flagged";
        }
        record(baseResult);
      }
    }
  }

  const source = readFileSync(resolve(process.cwd(), "lib/deepseek.ts"), "utf8");
  const privacyHits = ["localStorage", "sessionStorage", "NEXT_PUBLIC_DEEPSEEK_API_KEY"].filter((needle) => {
    const tree = ["app", "components", "lib"]
      .map((dir) => {
        try {
          return readFileSync(resolve(process.cwd(), dir), "utf8");
        } catch {
          return "";
        }
      })
      .join("\n");
    return tree.includes(needle) || source.includes(needle);
  });
  const summary = summarize(results);
  const final = {
    updatedAt: new Date().toISOString(),
    base,
    privacySourceMentions: privacyHits,
    summary,
    results,
  };
  writeFileSync(resolve(outDir, "day1.json"), JSON.stringify(final, null, 2));
  console.log(JSON.stringify({ done: true, summary, privacySourceMentions: privacyHits }));
}

function summarize(items: CallResult[]) {
  const modelCalls = items.filter((item) => item.group !== "validation");
  const bucket = (group?: CallResult["group"]) => {
    const rows = group ? modelCalls.filter((item) => item.group === group) : modelCalls;
    const success = rows.filter((item) => item.httpStatus === 200 && item.zodOk);
    return {
      calls: rows.length,
      http200: rows.filter((item) => item.httpStatus === 200).length,
      zodOk: success.length,
      firstPass: rows.filter((item) => item.zodOk && item.attempts === 1 && item.firstOutcome === "ok").length,
      retried: rows.filter((item) => item.retried).length,
      finalFail: rows.filter((item) => item.httpStatus !== 200 || !item.zodOk).length,
      truncated: rows.filter((item) => item.truncated).length,
      averageLatencyMs: average(success.map((item) => item.latencyMs)),
      inputTokens: sum(success.map((item) => item.inputTokens)),
      outputTokens: sum(success.map((item) => item.outputTokens)),
      cachedInputTokens: sum(success.map((item) => item.cachedInputTokens)),
      estimatedCostUsd: round(sum(success.map((item) => item.estimatedCostUsd))),
    };
  };
  const sizes = [5000, 15000, 30000, 50000].map((size) => {
    const rows = modelCalls.filter((item) => item.name.startsWith(`capacity-${size}-`));
    const success = rows.filter((item) => item.httpStatus === 200 && item.zodOk);
    return {
      size,
      calls: rows.length,
      success: success.length,
      zodOk: success.length,
      retried: rows.filter((item) => item.retried).length,
      finalFail: rows.length - success.length,
      truncated: rows.filter((item) => item.truncated).length,
      averageLatencyMs: average(success.map((item) => item.latencyMs)),
      inputTokens: sum(success.map((item) => item.inputTokens)),
      outputTokens: sum(success.map((item) => item.outputTokens)),
      requirementCovered: success.filter((item) => item.requirementQuality === "covered").length,
      scopeFlagged: success.filter((item) => item.scopeQuality === "payment-flagged").length,
      riskFlagged: success.filter((item) => item.riskQuality === "payment-risk-flagged").length,
      estimatedCostUsd: round(sum(success.map((item) => item.estimatedCostUsd))),
    };
  });
  return {
    validation: items.filter((item) => item.group === "validation").map((item) => ({
      name: item.name,
      httpStatus: item.httpStatus,
      expectedMet: item.expectedMet,
    })),
    ordinary: bucket("case"),
    repeats: bucket("ordinary"),
    ordinaryPlusRepeats: bucketCombined(modelCalls.filter((item) => item.group === "case" || item.group === "ordinary")),
    capacity: bucket("capacity"),
    allModelCalls: bucket(),
    sizes,
  };
}

function bucketCombined(rows: CallResult[]) {
  const success = rows.filter((item) => item.httpStatus === 200 && item.zodOk);
  return {
    calls: rows.length,
    zodOk: success.length,
    firstPass: rows.filter((item) => item.zodOk && item.attempts === 1 && item.firstOutcome === "ok").length,
    retried: rows.filter((item) => item.retried).length,
    finalFail: rows.filter((item) => item.httpStatus !== 200 || !item.zodOk).length,
    averageLatencyMs: average(success.map((item) => item.latencyMs)),
    inputTokens: sum(success.map((item) => item.inputTokens)),
    outputTokens: sum(success.map((item) => item.outputTokens)),
    estimatedCostUsd: round(sum(success.map((item) => item.estimatedCostUsd))),
  };
}

function average(values: Array<number | null>) {
  const nums = values.filter((value): value is number => typeof value === "number");
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((total, value) => total + value, 0) / nums.length);
}

function sum(values: Array<number | null>) {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function round(value: number) {
  return Math.round(value * 1e8) / 1e8;
}

await main();
