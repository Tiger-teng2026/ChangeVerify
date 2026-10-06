import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "How to Review Cursor AI Code Changes Before Shipping",
  description:
    "Learn how to review Cursor AI code changes before shipping. Find missing requirements, unexpected modifications, and risks from AI coding agents.",
  alternates: {
    canonical: "/cursor-code-review",
  },
  openGraph: {
    title: "How to Review Cursor AI Code Changes Before Shipping",
    description:
      "Learn how to review Cursor AI code changes before shipping. Find missing requirements, unexpected modifications, and risks from AI coding agents.",
  },
};

export default function CursorCodeReviewPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        How to Review Cursor AI Code Changes Before Shipping
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Cursor helps developers write code faster. After AI changes multiple files, you still need
        confidence before shipping.
      </p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What Cursor can miss</h2>
          <p>
            A Cursor change can leave part of the instruction unfinished, edit files you did not
            ask it to touch, or expand a small request into a wider diff. Review the Git diff
            against the original task, not only the summary Cursor wrote.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Why AI self-review has limitations</h2>
          <p>
            Asking the same agent to review its own change often repeats the assumptions it used
            while writing the code. That review can confirm the plan it already followed and still
            miss a requirement that never made it into the diff.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">How ChangeVerify verifies changes</h2>
          <p>
            Paste the original Cursor instruction and the Git diff. ChangeVerify checks that pair
            for missing requirements, unexpected modifications, and risky edits. It does not connect
            to your Cursor account or repository.
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
