"use client";

import type { SecretFinding } from "@/lib/secret-detection";

export { focusSecretField } from "@/lib/secret-detection";

const SOURCE_LABEL = {
  "original-task": "Original Task",
  "git-diff": "Git Diff",
} as const;

const TYPE_LABEL = {
  api_key: "Possible API key",
  password: "Possible password",
  secret: "Possible secret",
  token: "Possible token",
  private_key: "Possible private key",
  bearer: "Possible bearer token",
} as const;

export function SecretWarning({
  findings,
  onJump,
  onRedact,
  onRedactAll,
}: {
  findings: SecretFinding[];
  onJump: (finding: SecretFinding) => void;
  onRedact: (finding: SecretFinding) => void;
  onRedactAll: () => void;
}) {
  if (findings.length === 0) return null;
  const visible = findings.slice(0, 5);
  const hidden = findings.length - visible.length;

  return (
    <div className="rounded-lg border border-[#f59e0b] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#9a3412]">
      <p className="font-semibold">Potential sensitive information found</p>
      <p className="mt-1">Review and remove sensitive values before submitting.</p>
      <p className="mt-1">This is a basic local check, not a security scanner.</p>
      <ul className="mt-3 space-y-3">
        {visible.map((finding) => (
          <li key={finding.id}>
            <p className="font-medium">
              {SOURCE_LABEL[finding.source]} · Line {finding.line}
            </p>
            <p>{TYPE_LABEL[finding.type]}</p>
            <p className="font-mono text-xs">{finding.maskedPreview}</p>
            <div className="mt-1 flex gap-3">
              <button type="button" onClick={() => onJump(finding)} className="font-semibold underline">
                Jump to
              </button>
              <button type="button" onClick={() => onRedact(finding)} className="font-semibold underline">
                Redact
              </button>
            </div>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="mt-3">+ {hidden} more possible sensitive values</p>
      ) : null}
      {findings.length > 1 ? (
        <button type="button" onClick={onRedactAll} className="mt-3 font-semibold underline">
          Redact all
        </button>
      ) : null}
    </div>
  );
}
