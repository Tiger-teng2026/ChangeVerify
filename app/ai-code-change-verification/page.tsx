import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "AI Code Change Verification - ChangeVerify",
  description:
    "Verify one AI code change before you ship. Paste the original task and Git diff to check missing requirements, unexpected changes, and risky modifications.",
  alternates: {
    canonical: "/ai-code-change-verification",
  },
  openGraph: {
    title: "AI Code Change Verification",
    description:
      "Check whether an AI coding agent actually completed the change you asked for.",
  },
};

export default function AiCodeChangeVerificationPage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">AI Code Change Verification</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Paste the original task and the Git diff. ChangeVerify checks whether the AI coding agent
        appears to have done what you asked.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify AI Changes
      </Link>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What gets checked</h2>
          <p>The check looks for three kinds of mismatch in the diff you provide:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Requirements from the original task that do not appear in the change.</li>
            <li>Files or behavior changed beyond that task.</li>
            <li>Edits in areas that may need a closer look before you ship.</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">What this is not</h2>
          <p>
            ChangeVerify does not access your repository, run your tests, or prove that the code is
            correct, secure, or ready to ship. The report is an AI analysis of the text you submit,
            for this change only.
          </p>
        </section>
      </div>
    </Shell>
  );
}
