import { ProductIntro } from "@/components/product-intro";
import { Shell } from "@/components/shell";
import { VerifyForm } from "@/components/verify-form";
import { readHardMaxDiffChars } from "@/lib/config";
import { MAX_TASK_CHARS } from "@/lib/limits";

export const dynamic = "force-dynamic";

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
      <ProductIntro />
      <VerifyForm hardMaxDiffChars={readHardMaxDiffChars()} maxTaskChars={MAX_TASK_CHARS} />
    </Shell>
  );
}
