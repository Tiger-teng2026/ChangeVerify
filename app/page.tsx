import { Shell } from "@/components/shell";
import { VerifyForm } from "@/components/verify-form";
import { MAX_DIFF_CHARS, MAX_TASK_CHARS } from "@/lib/config";

export default function HomePage() {
  return (
    <Shell>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
        Did your AI coding agent actually do what you asked?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Paste your original task and Git diff. Get an independent check for missing requirements,
        scope creep, and risky changes before you ship.
      </p>
      <VerifyForm maxDiffChars={MAX_DIFF_CHARS} maxTaskChars={MAX_TASK_CHARS} />
    </Shell>
  );
}
