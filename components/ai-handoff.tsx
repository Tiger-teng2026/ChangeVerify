"use client";

import { useState } from "react";
import { buildHandoffPrompt } from "@/lib/handoff";
import type { VerificationReport } from "@/lib/schema";

export function AiHandoff({ report }: { report: VerificationReport }) {
  const [copied, setCopied] = useState(false);
  const prompt = buildHandoffPrompt(report);

  async function copyInstructions() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Fix with your AI coding tool</h2>
      <p className="mt-3 text-sm leading-6 text-[#5c5348]">
        Paste this into Cursor, Claude Code, Codex, Windsurf, Cline, Roo Code, or another AI coding
        tool. ChangeVerify does not change your project.
      </p>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[#e4d9c8] bg-white px-4 py-4 font-mono text-xs leading-5 text-[#3f3832]">
        {prompt}
      </pre>
      <div className="mt-3 flex items-center gap-3">
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
  );
}
