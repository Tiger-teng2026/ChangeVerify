import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envText = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
for (const line of envText.split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index === -1) continue;
  const key = line.slice(0, index).trim();
  const value = line.slice(index + 1).trim();
  if (key && process.env[key] === undefined) process.env[key] = value;
}

const { verificationJsonSchema, verificationReportSchema } = await import("../lib/schema.ts");

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.log(JSON.stringify({ probe: "missing_api_key" }));
  process.exit(1);
}

const schemaText = JSON.stringify(verificationJsonSchema);
console.log(
  JSON.stringify({
    probe: "schema_shape",
    bytes: schemaText.length,
    hasRef: schemaText.includes('"$ref"'),
    topKeys: Object.keys(verificationJsonSchema),
  }),
);

async function post(body: unknown) {
  const started = Date.now();
  const response = await fetch("https://api.deepseek.com/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  return { status: response.status, latencyMs: Date.now() - started, parsed, textLength: text.length };
}

const tiny = await post({
  model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
  instructions: "Return json only.",
  input: "Set ok to true.",
  reasoning: { effort: "none" },
  temperature: 0,
  max_output_tokens: 200,
  text: {
    format: {
      type: "json_schema",
      name: "probe",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["ok"],
        properties: { ok: { type: "boolean" } },
      },
    },
  },
});

const tinyOutput = readOutput(tiny.parsed);
console.log(
  JSON.stringify({
    probe: "tiny_json_schema",
    status: tiny.status,
    latencyMs: tiny.latencyMs,
    output: tinyOutput.slice(0, 300),
    error: readError(tiny.parsed),
  }),
);

const full = await post({
  model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
  instructions: "Return json only. verdict must be PASS. summary must be a short sentence. filesChanged is 1. Use empty arrays except limitations, which has one short string. reviewFocus must be empty.",
  input: "Task: add a comment. Diff: one file adds a comment.",
  reasoning: { effort: "none" },
  temperature: 0,
  max_output_tokens: 1500,
  text: {
    format: {
      type: "json_schema",
      name: "verification_report",
      schema: verificationJsonSchema,
    },
  },
});

const fullOutput = readOutput(full.parsed);
let zodOk = false;
let zodIssue = "";
try {
  const json = JSON.parse(fullOutput);
  const result = verificationReportSchema.safeParse(json);
  zodOk = result.success;
  if (!result.success) zodIssue = result.error.issues.map((issue) => issue.path.join(".")).join(",");
} catch {
  zodOk = false;
  zodIssue = "parse_failed";
}

console.log(
  JSON.stringify({
    probe: "full_json_schema",
    status: full.status,
    latencyMs: full.latencyMs,
    zodOk,
    zodIssue,
    outputChars: fullOutput.length,
    error: readError(full.parsed),
    model: full.parsed && typeof full.parsed === "object" ? (full.parsed as { model?: string }).model : null,
    usage: full.parsed && typeof full.parsed === "object" ? (full.parsed as { usage?: unknown }).usage : null,
  }),
);

function readOutput(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const record = item as { type?: string; content?: Array<{ type?: string; text?: string }> };
    if (record.type !== "message" || !Array.isArray(record.content)) continue;
    for (const part of record.content) {
      if (part?.type === "output_text" && part.text) chunks.push(part.text);
    }
  }
  return chunks.join("");
}

function readError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as { error?: { message?: string } | string; message?: string };
  if (typeof record.error === "string") return record.error.slice(0, 400);
  if (record.error && typeof record.error.message === "string") return record.error.message.slice(0, 400);
  if (typeof record.message === "string" && !readOutput(payload)) return record.message.slice(0, 400);
  return null;
}
