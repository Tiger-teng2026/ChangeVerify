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
        Did Your AI Coding Agent Actually Do What You Asked?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5c5348]">
        Paste your original task and Git diff. Find missing requirements, unexpected changes, and
        risky modifications before you ship.
      </p>
      <a
        href="#verify"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify AI Changes
      </a>
      <ProductIntro />
      <VerifyForm hardMaxDiffChars={readHardMaxDiffChars()} maxTaskChars={MAX_TASK_CHARS} />
    </Shell>
  );
}
