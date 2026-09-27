import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "AI-Generated Code Review - ChangeVerify",
  description:
    "Review AI-generated code before you ship. Compare the original task with the Git diff to find missing requirements, scope creep, and risky changes.",
  alternates: {
    canonical: "/ai-generated-code-review",
  },
  openGraph: {
    title: "AI-Generated Code Review",
    description:
      "Check code from Cursor, Claude Code, and other AI coding agents against the original task.",
  },
};

export default function AiGeneratedCodeReviewPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">AI-Generated Code Review</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Review a change from Cursor, Claude Code, or another AI coding agent. Paste the original
        task and the Git diff, then check the change before you ship.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify AI Changes
      </Link>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What the review looks for</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Parts of the original task that do not show up in the diff.</li>
            <li>Changes that go outside the requested work.</li>
            <li>Modifications that may be risky even when the task looks done.</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What this is not</h2>
          <p>
            ChangeVerify does not read your repository or run your code. A paid report covers this
            change only. It is not a subscription, and it does not prove the generated code is
            correct or secure.
          </p>
        </section>
      </div>
    </Shell>
  );
}
