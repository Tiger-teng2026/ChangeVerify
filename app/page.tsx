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
      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">Trust</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#3f3832]">
            <h3 className="font-semibold text-[#1c1915]">Privacy</h3>
            <p className="mt-2">
              You paste the diff. ChangeVerify does not access your repository, and it does not keep
              a code history.
            </p>
          </div>
          <div className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#3f3832]">
            <h3 className="font-semibold text-[#1c1915]">Product Boundary</h3>
            <p className="mt-2">
              The report is an AI check of the text you submit. It does not prove the code is
              correct, secure, or ready to ship.
            </p>
          </div>
          <div className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#3f3832]">
            <h3 className="font-semibold text-[#1c1915]">Payment</h3>
            <p className="mt-2">
              $4.99 is a one-time purchase of the full report for this change. It is not a
              subscription.
            </p>
          </div>
        </div>
      </section>
      <VerifyForm hardMaxDiffChars={readHardMaxDiffChars()} maxTaskChars={MAX_TASK_CHARS} />
    </Shell>
  );
}
