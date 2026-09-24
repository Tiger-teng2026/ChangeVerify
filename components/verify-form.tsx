"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DiffHelp } from "@/components/diff-help";
import { focusSecretField, SecretWarning } from "@/components/secret-warning";
import { DIFF_TOO_LARGE_ERROR, diffLimitState } from "@/lib/limits";
import { setStoredReport, type StoredReport } from "@/lib/report-store";
import { detectPotentialSecrets, redactFindings, type SecretFinding } from "@/lib/secret-detection";

const TEMPORARY_FAILURE = "Verification temporarily failed. Please try again.";

export function VerifyForm({
  hardMaxDiffChars,
  maxTaskChars,
}: {
  hardMaxDiffChars: number;
  maxTaskChars: number;
}) {
  const router = useRouter();
  const taskRef = useRef<HTMLTextAreaElement>(null);
  const diffRef = useRef<HTMLTextAreaElement>(null);
  const [originalTask, setOriginalTask] = useState("");
  const [gitDiff, setGitDiff] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const secretFindings = useMemo(() => {
    return [
      ...detectPotentialSecrets(originalTask, "original-task"),
      ...detectPotentialSecrets(gitDiff, "git-diff"),
    ];
  }, [originalTask, gitDiff]);

  const taskTooLong = originalTask.length > maxTaskChars;
  const diffState = diffLimitState(gitDiff.length, hardMaxDiffChars);
  const diffTooLong = diffState === "too_large";
  const largeDiff = diffState === "large";
  const blocked =
    pending ||
    originalTask.trim().length === 0 ||
    gitDiff.trim().length === 0 ||
    taskTooLong ||
    diffTooLong;

  function redactFinding(finding: SecretFinding) {
    if (finding.source === "original-task") {
      setOriginalTask((current) => redactFindings(current, [finding]));
      return;
    }
    setGitDiff((current) => redactFindings(current, [finding]));
  }

  function redactAllFindings() {
    const taskFindings = secretFindings.filter((finding) => finding.source === "original-task");
    const diffFindings = secretFindings.filter((finding) => finding.source === "git-diff");
    setOriginalTask((current) => redactFindings(current, taskFindings));
    setGitDiff((current) => redactFindings(current, diffFindings));
  }

  function jumpToFinding(finding: SecretFinding) {
    const element = finding.source === "original-task" ? taskRef.current : diffRef.current;
    if (!element) return;
    focusSecretField(element, finding);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalTask, gitDiff }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (StoredReport & { error?: string })
        | null;
      if (!response.ok || !payload || !payload.report) {
        setError(payload?.error || TEMPORARY_FAILURE);
        return;
      }
      setStoredReport(payload);
      setOriginalTask("");
      setGitDiff("");
      router.push("/result");
    } catch {
      setError(TEMPORARY_FAILURE);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <div>
        <label htmlFor="original-task" className="block text-base font-semibold">
          1. Paste the original instruction you gave your AI coding tool
        </label>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">
          Paste the exact task or prompt you gave Cursor, Claude Code, Codex, Windsurf, or another
          AI coding tool before it made the code changes.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">
          Use the instruction for this specific change — not your entire project description and not
          the AI’s completion report.
        </p>
        <textarea
          id="original-task"
          ref={taskRef}
          value={originalTask}
          onChange={(event) => setOriginalTask(event.target.value)}
          rows={8}
          placeholder={`Example:\n\nChange the checkout button text from "Buy Now" to "Continue to Payment".\n\nDo not modify payment logic, authentication, database schema, or other pages.`}
          className="mt-3 w-full rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#9a3412]"
        />
        <p className={`mt-2 text-xs ${taskTooLong ? "text-[#9f1239]" : "text-[#6b6258]"}`}>
          {originalTask.length.toLocaleString()} / {maxTaskChars.toLocaleString()}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">
          <span className="font-semibold text-[#1c1915]">Not sure what to paste?</span> Copy the
          message you originally sent to your AI coding tool that caused the current code changes.
        </p>
        <p className="mt-1 text-sm leading-6 text-[#6b6258]">
          Tip: The more specific your original instruction is, the more useful the verification
          report will be.
        </p>
      </div>

      <div>
        <label htmlFor="git-diff" className="block text-base font-semibold">
          2. Paste the Git diff
        </label>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">
          Copy the diff for the changes your AI coding tool made.
        </p>
        <DiffHelp />
        <textarea
          id="git-diff"
          ref={diffRef}
          value={gitDiff}
          onChange={(event) => setGitDiff(event.target.value)}
          rows={14}
          spellCheck={false}
          className="mt-3 w-full rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 font-mono text-xs leading-5 outline-none focus:border-[#9a3412]"
        />
        <p className={`mt-2 text-xs ${diffTooLong ? "text-[#9f1239]" : "text-[#6b6258]"}`}>
          {gitDiff.length.toLocaleString()} / {hardMaxDiffChars.toLocaleString()}
        </p>
        {largeDiff ? (
          <div className="mt-3 rounded-lg border border-[#f59e0b] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#9a3412]">
            <p className="font-semibold">Large diff detected.</p>
            <p className="mt-1">
              ChangeVerify works best with small, single-task changes. Results may be less precise
              for larger diffs.
            </p>
          </div>
        ) : null}
        {diffTooLong ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#9f1239]">{DIFF_TOO_LARGE_ERROR}</p>
        ) : null}
      </div>

      <div className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#5c5348]">
        Before submitting, remove secrets such as API keys, passwords, access tokens, private
        keys, and other sensitive credentials.
      </div>

      <SecretWarning
        findings={secretFindings}
        onJump={jumpToFinding}
        onRedact={redactFinding}
        onRedactAll={redactAllFindings}
      />

      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}

      <button
        type="submit"
        disabled={blocked}
        className="rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Verify AI Changes
      </button>
      {pending ? (
        <p className="text-sm text-[#5c5348]" aria-live="polite">
          Checking the provided diff…
        </p>
      ) : null}
    </form>
  );
}
