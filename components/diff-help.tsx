"use client";

import { useState } from "react";

export const AI_TOOL_DIFF_PROMPT = `Run git status first.

If there are untracked files, run:
git add -N .

Then run:
git --no-pager diff HEAD

Return the full Git diff only.
Do not summarize it.`;

export function DiffHelp() {
  const [copied, setCopied] = useState(false);

  async function copyInstructions() {
    try {
      await navigator.clipboard.writeText(AI_TOOL_DIFF_PROMPT);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <details className="mt-3 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold">
        Not sure how to get your Git diff?
      </summary>
      <div className="mt-3 space-y-6 text-sm leading-6 text-[#3f3832]">
        <p>
          ChangeVerify works best when your project already has a Git commit before your AI coding
          tool makes changes.
        </p>

        <section className="space-y-3">
          <h3 className="font-semibold text-[#1c1915]">Using your AI coding tool</h3>
          <p>
            Paste this instruction into Cursor, Claude Code, Codex, Windsurf, Cline, Roo Code, or
            another AI coding tool with terminal access.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-[#e4d9c8] bg-white px-3 py-3 font-mono text-xs leading-5">
            {AI_TOOL_DIFF_PROMPT}
          </pre>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyInstructions}
              className="rounded-full border border-[#1c1915] px-4 py-2 text-sm font-semibold"
            >
              Copy instructions
            </button>
            {copied ? (
              <p className="text-sm text-[#166534]" aria-live="polite">
                Copied
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-[#1c1915]">Using a terminal</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-[#e4d9c8] bg-white px-3 py-3 font-mono text-xs leading-5">
            {`git status`}
          </pre>
          <p>If you have untracked files:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-[#e4d9c8] bg-white px-3 py-3 font-mono text-xs leading-5">
            {`git add -N .`}
          </pre>
          <p>Then:</p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-[#e4d9c8] bg-white px-3 py-3 font-mono text-xs leading-5">
            {`git --no-pager diff HEAD`}
          </pre>
          <p>Copy the output starting from &quot;diff --git&quot; and paste it below.</p>
          <p>
            If Git says that HEAD does not exist, create a baseline commit before asking your AI
            coding tool to make changes.
          </p>
        </section>
      </div>
    </details>
  );
}
