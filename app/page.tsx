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
        Verify whether Cursor, Claude Code, and other AI coding agents followed your original
        instructions before shipping.
      </p>
      <a
        href="#verify"
        className="mt-8 inline-flex rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6]"
      >
        Verify AI Changes
      </a>
      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          The problem
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#3f3832]">
          AI coding agents are powerful, but they can sometimes:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#3f3832]">
          <li>miss requirements</li>
          <li>change files you didn&apos;t ask for</li>
          <li>ignore constraints</li>
          <li>expand the scope of a task</li>
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          The solution
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#3f3832]">ChangeVerify compares:</p>
        <p className="mt-3 text-sm font-semibold leading-7 text-[#1c1915]">
          Original Task
          <br />+
          <br />
          AI Generated Diff
        </p>
        <p className="mt-3 text-sm leading-6 text-[#3f3832]">and identifies:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#3f3832]">
          <li>missing requirements</li>
          <li>unexpected changes</li>
          <li>scope creep</li>
          <li>risky modifications</li>
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          Real Example
        </h2>
        <article className="mt-4 rounded-lg border border-[#e4d9c8] bg-white px-4 py-4 text-sm leading-6">
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-[#1c1915]">You asked:</dt>
              <dd className="mt-1 whitespace-pre-line text-[#3f3832]">
                {"Add login feature.\nDo not change payment logic."}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1c1915]">AI changed:</dt>
              <dd className="mt-1 whitespace-pre-line text-[#3f3832]">
                {"auth/login.ts\npayment/checkout.ts"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1c1915]">ChangeVerify found:</dt>
              <dd className="mt-1 text-[#3f3832]">
                <p className="font-medium text-[#1c1915]">Unexpected change detected.</p>
                <p className="mt-1">
                  The AI modified payment/checkout.ts even though it was outside the original
                  request.
                </p>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1c1915]">Recommendation:</dt>
              <dd className="mt-1 text-[#3f3832]">Review the payment change before shipping.</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1c1915]">Final Status:</dt>
              <dd className="mt-1 font-semibold text-[#9a3412]">NEEDS REVIEW</dd>
            </div>
          </dl>
        </article>
      </section>
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
