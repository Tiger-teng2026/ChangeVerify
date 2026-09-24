"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setStoredReport, type StoredReport } from "@/lib/report-store";
import { hasPotentialSecret } from "@/lib/secrets";

const TEMPORARY_FAILURE = "Verification temporarily failed. Please try again.";

export function VerifyForm({
  maxDiffChars,
  maxTaskChars,
}: {
  maxDiffChars: number;
  maxTaskChars: number;
}) {
  const router = useRouter();
  const [originalTask, setOriginalTask] = useState("");
  const [gitDiff, setGitDiff] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const secretDetected = useMemo(
    () => hasPotentialSecret(originalTask) || hasPotentialSecret(gitDiff),
    [originalTask, gitDiff],
  );

  const taskTooLong = originalTask.length > maxTaskChars;
  const diffTooLong = gitDiff.length > maxDiffChars;
  const blocked =
    pending ||
    originalTask.trim().length === 0 ||
    gitDiff.trim().length === 0 ||
    taskTooLong ||
    diffTooLong;

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
          1. What did you ask your AI agent to do?
        </label>
        <textarea
          id="original-task"
          value={originalTask}
          onChange={(event) => setOriginalTask(event.target.value)}
          rows={8}
          className="mt-3 w-full rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#9a3412]"
        />
        <p className={`mt-2 text-xs ${taskTooLong ? "text-[#9f1239]" : "text-[#6b6258]"}`}>
          {originalTask.length.toLocaleString()} / {maxTaskChars.toLocaleString()}
        </p>
      </div>

      <div>
        <label htmlFor="git-diff" className="block text-base font-semibold">
          2. Paste the Git diff
        </label>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">
          In Cursor or your terminal, copy the diff for the AI-generated changes.
        </p>
        <textarea
          id="git-diff"
          value={gitDiff}
          onChange={(event) => setGitDiff(event.target.value)}
          rows={14}
          spellCheck={false}
          className="mt-3 w-full rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 font-mono text-xs leading-5 outline-none focus:border-[#9a3412]"
        />
        <p className={`mt-2 text-xs ${diffTooLong ? "text-[#9f1239]" : "text-[#6b6258]"}`}>
          {gitDiff.length.toLocaleString()} / {maxDiffChars.toLocaleString()}
        </p>
      </div>

      <div className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#5c5348]">
        Before submitting, remove secrets such as API keys, passwords, access tokens, private
        keys, and other sensitive credentials.
      </div>

      {secretDetected ? (
        <div className="rounded-lg border border-[#f59e0b] bg-[#fff7ed] px-4 py-3 text-sm leading-6 text-[#9a3412]">
          <p className="font-semibold">Potential secret detected.</p>
          <p className="mt-1">
            Before submitting, remove API keys, passwords, access tokens, private keys, and other
            sensitive credentials.
          </p>
        </div>
      ) : null}

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
