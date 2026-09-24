export type SecretSource = "original-task" | "git-diff";

export type SecretKind = "api_key" | "password" | "secret" | "token" | "private_key" | "bearer";

export type SecretFinding = {
  id: string;
  source: SecretSource;
  line: number;
  start: number;
  end: number;
  type: SecretKind;
  maskedPreview: string;
};

const IGNORED_VALUE = /^(?:\[REDACTED\]|true|false|null|undefined|none|nil)$/i;

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function overlaps(findings: SecretFinding[], start: number, end: number): boolean {
  return findings.some((finding) => start < finding.end && end > finding.start);
}

function pushFinding(
  findings: SecretFinding[],
  text: string,
  source: SecretSource,
  start: number,
  end: number,
  type: SecretKind,
  maskedPreview: string,
) {
  if (start < 0 || end <= start || end > text.length) return;
  if (overlaps(findings, start, end)) return;
  findings.push({
    id: `${source}:${start}:${end}:${type}`,
    source,
    line: lineAt(text, start),
    start,
    end,
    type,
    maskedPreview,
  });
}

function maskApiKey(value: string): string {
  const tail = value.length >= 16 ? value.slice(-4) : "";
  return `sk-****${tail}`;
}

function keywordKind(keyword: string): SecretKind {
  const name = keyword.toLowerCase().replace("-", "_");
  if (name === "password") return "password";
  if (name === "secret") return "secret";
  if (name.startsWith("api")) return "api_key";
  return "token";
}

export function detectPotentialSecrets(text: string, source: SecretSource): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const privateKey =
    /-----BEGIN ((?:RSA |OPENSSH )?)PRIVATE KEY-----\r?\n([\s\S]*?)\r?\n-----END \1PRIVATE KEY-----/g;
  const bearer = /Authorization:\s*Bearer\s+([A-Za-z0-9._~+/-]{16,})/gi;
  const apiKey = /(?:^|[^A-Za-z0-9_])(sk-[A-Za-z0-9_-]{16,})/g;
  const assignment =
    /\b(access[_-]?token|api[_-]?key|password|secret|token)\b\s*[:=]\s*(?:(["'])([^"'\r\n]+)\2|([^\s"'`,;]+))/gi;

  for (const match of text.matchAll(privateKey)) {
    const body = match[2] ?? "";
    if (!body.trim() || body.trim() === "[REDACTED]") continue;
    const full = match[0];
    const markerAt = full.lastIndexOf(`-----END ${match[1] ?? ""}PRIVATE KEY-----`);
    let bodyEnd = markerAt;
    if (full[bodyEnd - 1] === "\n") bodyEnd -= 1;
    if (full[bodyEnd - 1] === "\r") bodyEnd -= 1;
    const start = (match.index ?? 0) + bodyEnd - body.length;
    const end = (match.index ?? 0) + bodyEnd;
    const header = `-----BEGIN ${match[1] ?? ""}PRIVATE KEY-----`;
    pushFinding(findings, text, source, start, end, "private_key", header);
  }

  for (const match of text.matchAll(bearer)) {
    const token = match[1] ?? "";
    if (IGNORED_VALUE.test(token)) continue;
    const start = (match.index ?? 0) + match[0].length - token.length;
    pushFinding(findings, text, source, start, start + token.length, "bearer", "Bearer ****");
  }

  for (const match of text.matchAll(apiKey)) {
    const token = match[1] ?? "";
    const start = (match.index ?? 0) + match[0].length - token.length;
    pushFinding(findings, text, source, start, start + token.length, "api_key", maskApiKey(token));
  }

  for (const match of text.matchAll(assignment)) {
    const keyword = match[1] ?? "";
    const quoted = Boolean(match[2]);
    const value = match[3] ?? match[4] ?? "";
    if (value.length < (keyword.toLowerCase() === "token" ? 8 : 4)) continue;
    if (IGNORED_VALUE.test(value)) continue;
    const start = (match.index ?? 0) + match[0].length - value.length - (quoted ? 1 : 0);
    pushFinding(
      findings,
      text,
      source,
      start,
      start + value.length,
      keywordKind(keyword),
      `${keyword}=****`,
    );
  }

  return findings.sort((a, b) => a.start - b.start);
}

export function focusSecretField(element: HTMLTextAreaElement, finding: SecretFinding) {
  element.focus();
  element.setSelectionRange(finding.start, finding.end);
  const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
  const height = Number.isFinite(lineHeight) ? lineHeight : 20;
  element.scrollTop = Math.max(0, (finding.line - 1) * height - element.clientHeight / 3);
  element.scrollIntoView({ block: "center", inline: "nearest" });
}

export function redactFindings(text: string, findings: SecretFinding[]): string {
  const ordered = [...findings].sort((a, b) => b.start - a.start);
  let next = text;
  for (const finding of ordered) {
    if (next.slice(finding.start, finding.end).length !== finding.end - finding.start) continue;
    next = `${next.slice(0, finding.start)}[REDACTED]${next.slice(finding.end)}`;
  }
  return next;
}
