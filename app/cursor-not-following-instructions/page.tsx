import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Cursor Not Following Instructions? How to Verify What It Changed",
  description:
    "Cursor may sometimes change code outside your original instructions. Learn how to check for missed requirements, unexpected changes, scope creep, and plan deviations before shipping.",
  alternates: {
    canonical: "/cursor-not-following-instructions",
  },
  openGraph: {
    title: "Cursor Not Following Instructions? How to Verify What It Changed",
    description:
      "Cursor may sometimes change code outside your original instructions. Learn how to check for missed requirements, unexpected changes, scope creep, and plan deviations before shipping.",
  },
};

export default function CursorNotFollowingInstructionsPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        Cursor Not Following Instructions? How to Verify What It Changed
      </h1>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            You gave Cursor clear instructions. It still changed something else.
          </h2>
          <p>
            AI coding agents can sometimes reinterpret instructions, make adjacent changes, or
            complete only part of a task. The chat can look finished while the diff still includes
            an edit you did not ask for, or leaves a constraint you stated unfinished.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            Common signs the agent did not follow your instructions
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>A requirement was skipped</li>
            <li>A file changed that you did not ask to touch</li>
            <li>A public API changed despite being out of scope</li>
            <li>The implementation drifted from the original plan</li>
            <li>The agent reported completion even though part of the task is missing</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            Why rules and prompts are not the same as verification
          </h2>
          <p>Rules tell the agent what should happen. Verification checks what actually happened.</p>
          <p>
            Rules, prompts, AGENTS.md, and hooks can guide an AI coding agent, but they do not
            guarantee that every final change matches the original task.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            Why asking the same AI to review its own work may not be enough
          </h2>
          <p>
            The same agent may review the result using the same assumptions it used while
            implementing the change. That second pass can confirm the interpretation it already
            followed.
          </p>
          <p>
            An independent review that starts from the original task and compares it against the
            actual Git diff is a different type of check.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">A better way to verify the result</h2>
          <div className="max-w-sm space-y-2 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4 text-[#1c1915]">
            <p className="font-semibold">Original Task / Plan</p>
            <p className="text-[#6b6258]">+</p>
            <p className="font-semibold">Git Diff</p>
            <p className="text-[#6b6258]">↓</p>
            <p className="font-semibold">Check for:</p>
            <ul className="list-disc space-y-1 pl-5 font-normal text-[#3f3832]">
              <li>Missing requirements</li>
              <li>Unexpected changes</li>
              <li>Possible scope creep</li>
              <li>Possible plan deviations</li>
              <li>Risky modifications that need human review</li>
            </ul>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Example</h2>
          <div className="space-y-3 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4">
            <p className="font-semibold text-[#1c1915]">You asked:</p>
            <p>Refactor this package for performance. Do not change the public API.</p>
            <p className="font-semibold text-[#1c1915]">AI changed:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Internal implementation</li>
              <li>Public API behavior</li>
            </ul>
            <p className="font-semibold text-[#1c1915]">ChangeVerify result:</p>
            <p>Possible instruction violation</p>
            <p>
              The original task explicitly prohibited public API changes, but the diff appears to
              modify exported behavior.
            </p>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">How ChangeVerify helps</h2>
          <p>ChangeVerify compares:</p>
          <div className="max-w-sm space-y-2 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4 text-[#1c1915]">
            <p className="font-semibold">Original Task</p>
            <p className="text-[#6b6258]">+</p>
            <p className="font-semibold">Git Diff</p>
            <p className="text-[#6b6258]">↓</p>
            <p className="font-semibold">AI Change Verification Report</p>
          </div>
          <p>It helps identify:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Missing requirements</li>
            <li>Unexpected changes</li>
            <li>Scope creep</li>
            <li>Possible plan deviations</li>
            <li>Human review priorities</li>
          </ul>
          <p>
            ChangeVerify does not prove runtime correctness, security, or production safety.
          </p>
        </section>
      </div>
      <Link
        href="/#verify"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify Your AI Changes Free
      </Link>
      <section className="mt-10 space-y-3 text-sm leading-7 text-[#3f3832]">
        <h2 className="text-lg font-semibold text-[#1c1915]">Related guides</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/how-to-verify-ai-generated-code" className="underline">
              How to Verify AI Generated Code Before Deployment
            </Link>
          </li>
          <li>
            <Link href="/cursor-code-review" className="underline">
              How to Review Cursor AI Code Changes Before Shipping
            </Link>
          </li>
          <li>
            <Link href="/vibe-coding-mistakes" className="underline">
              Common Vibe Coding Problems and How to Avoid Them
            </Link>
          </li>
        </ul>
      </section>
    </Shell>
  );
}
