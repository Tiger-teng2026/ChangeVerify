export function ProductIntro() {
  return (
    <div className="mt-8 space-y-8 text-sm leading-6 text-[#3f3832]">
      <section>
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          What it does
        </h2>
        <div className="mt-3 max-w-2xl space-y-3">
          <p>ChangeVerify gives you a second opinion on AI-generated code changes.</p>
          <p>Paste what you asked your AI coding tool to do, then paste the Git diff.</p>
          <p>
            ChangeVerify checks whether the changes appear to match your request, whether anything
            may be missing, and whether the AI changed more than you expected.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3">
          <h2 className="font-semibold text-[#1c1915]">Who it is for</h2>
          <p className="mt-2">
            Built for AI-assisted developers, indie hackers, and vibe coders using tools such as
            Cursor, Claude Code, Codex, Windsurf, Cline, Roo Code, or similar AI coding tools.
          </p>
        </section>
        <section className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3">
          <h2 className="font-semibold text-[#1c1915]">What ChangeVerify does not do</h2>
          <div className="mt-2 space-y-2">
            <p>ChangeVerify does not run your code or tests.</p>
            <p>It does not prove that your code is safe, bug-free, or production-ready.</p>
            <p>It only reviews the Original Task and Git diff you provide.</p>
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          How it works
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Paste your original task</li>
          <li>Paste the Git diff</li>
          <li>Get a focused verification report</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">Example</h2>
        <dl className="mt-3 max-w-2xl space-y-3">
          <div>
            <dt className="font-semibold text-[#1c1915]">Original Task</dt>
            <dd className="mt-1 whitespace-pre-line">
              Change the checkout button text.{"\n"}Do not modify payment logic.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1c1915]">AI Changed</dt>
            <dd className="mt-1 whitespace-pre-line">{"app/page.tsx\nlib/payment.ts"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1c1915]">Result</dt>
            <dd className="mt-1 font-semibold text-[#9a3412]">NEEDS REVIEW</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1c1915]">Why</dt>
            <dd className="mt-1">Payment-related code changed outside the requested task.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
