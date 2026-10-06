import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Common Vibe Coding Problems and How to Avoid Them",
  description:
    "Discover common vibe coding problems including AI mistakes, missing requirements, unexpected changes, and how to build more reliable AI-assisted applications.",
  alternates: {
    canonical: "/vibe-coding-mistakes",
  },
  openGraph: {
    title: "Common Vibe Coding Problems and How to Avoid Them",
    description:
      "Discover common vibe coding problems including AI mistakes, missing requirements, unexpected changes, and how to build more reliable AI-assisted applications.",
  },
};

export default function VibeCodingMistakesPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        Common Vibe Coding Problems and How to Avoid Them
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Vibe coding moves quickly. The risk is shipping a change that felt right in the chat and
        does not match the task in the diff.
      </p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            AI builds faster but may misunderstand intent
          </h2>
          <p>
            An agent can implement a plausible version of your request and still miss a constraint
            you stated. The conversation can look finished while the code follows a different
            interpretation of the task.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Generated code may require verification</h2>
          <p>
            Generated code can include mistakes, missing requirements, and unexpected changes. Check
            the original task against the Git diff before you treat the change as done.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Large AI changes need review</h2>
          <p>
            A large AI change is harder to scan by eye. Extra files, wider behavior, and edits
            outside the request are easier to miss when the diff is long. A focused review of that
            diff is more reliable than trusting the pace of the session.
          </p>
        </section>
      </div>
      <Link
        href="/#verify"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify Your AI Changes Free
      </Link>
    </Shell>
  );
}
