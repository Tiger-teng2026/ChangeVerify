import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "How to Verify AI Generated Code Before Deployment",
  description:
    "Learn how to verify AI generated code before deployment. Understand how AI coding agents can miss requirements, make unexpected changes, and how ChangeVerify helps verify code changes.",
  alternates: {
    canonical: "/how-to-verify-ai-generated-code",
  },
  openGraph: {
    title: "How to Verify AI Generated Code Before Deployment",
    description:
      "Learn how to verify AI generated code before deployment. Understand how AI coding agents can miss requirements, make unexpected changes, and how ChangeVerify helps verify code changes.",
  },
};

export default function HowToVerifyAiGeneratedCodePage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        How to Verify AI Generated Code Before Deployment
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        A fast AI change still needs a check against the task you actually gave. Compare that task
        with the Git diff before you deploy.
      </p>
      <div className="mt-10 space-y-8 text-sm leading-7 text-[#3f3832]">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            AI coding agents are powerful, but verification is different
          </h2>
          <p>
            AI coding agents can build features quickly, but developers still need to verify
            whether the changes match the original requirements. Speed of implementation is not the
            same as a check that the diff did what you asked.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">Common problems with AI generated code</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Missing requirements</li>
            <li>Unexpected changes</li>
            <li>Scope creep</li>
            <li>Regression risks</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">
            Why reviewing AI code with the same AI may not be enough
          </h2>
          <p>
            The same AI agent that created changes may review them from the same assumptions. A
            second look that starts from your original task and the Git diff is a different check
            than asking the author to approve its own work.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1c1915]">How ChangeVerify works</h2>
          <p>Paste what you asked for, then paste the diff the agent produced.</p>
          <div className="max-w-sm space-y-2 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4 text-[#1c1915]">
            <p className="font-semibold">Original Task</p>
            <p className="text-[#6b6258]">+</p>
            <p className="font-semibold">Git Diff</p>
            <p className="text-[#6b6258]">↓</p>
            <p className="font-semibold">AI Change Verification Report</p>
          </div>
          <p>
            ChangeVerify does not access your repository. It reviews only the original task and Git
            diff you provide.
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
