import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Cursor Code Review - ChangeVerify",
  description:
    "Review a Cursor code change against the original instruction. Paste the task and Git diff to find missing requirements, unexpected files, and risky edits.",
  alternates: {
    canonical: "/cursor-code-review",
  },
  openGraph: {
    title: "Cursor Code Review",
    description: "Check whether a Cursor change matches the task you gave it before you ship.",
  },
};

export default function CursorCodeReviewPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">Cursor Code Review</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Paste the instruction you gave Cursor and the Git diff it produced. ChangeVerify checks
        whether that change appears to match the request.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify AI Changes
      </Link>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What to review</h2>
          <p>Use the diff from the Cursor change, not a summary of what Cursor said it did.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Requested work that is missing from the diff.</li>
            <li>Files Cursor changed outside the instruction.</li>
            <li>Edits that go beyond a copy or UI change into riskier code.</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What this is not</h2>
          <p>
            This is not an official Cursor product, and it does not connect to your Cursor account
            or repository. It reviews only the task and diff you paste. The report can miss issues
            or be wrong, and it does not prove the code is secure or ready to ship.
          </p>
        </section>
      </div>
    </Shell>
  );
}
