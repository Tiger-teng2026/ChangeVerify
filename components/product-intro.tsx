const examples = [
  {
    tool: "",
    originalTask: "Change the checkout button text.\nDo not modify payment logic.",
    files: ["app/page.tsx", "lib/payment.ts"],
    issues: [
      "lib/payment.ts changed, even though the task said not to modify payment logic.",
      "The change is not limited to the checkout button text.",
    ],
    recommendations: [
      "Revert the payment-related changes in lib/payment.ts.",
      "Keep only the checkout button text change in app/page.tsx.",
      "Review lib/payment.ts before you ship.",
    ],
    status: "NEEDS REVIEW",
  },
  {
    tool: "Cursor",
    originalTask:
      "Add an empty state and an error state to the project list.\nDo not change data fetching.",
    files: ["components/project-list.tsx"],
    issues: [
      "The empty state was added in components/project-list.tsx.",
      "The error state from the original task is missing.",
    ],
    recommendations: [
      "Add the missing error state in components/project-list.tsx.",
      "Leave data fetching unchanged.",
    ],
    status: "NEEDS REVIEW",
  },
  {
    tool: "Claude Code",
    originalTask:
      'Update the pricing page headline to "Plans for indie developers".\nDo not change checkout, billing, or environment variables.',
    files: ["app/pricing/page.tsx", "lib/billing.ts", ".env.example"],
    issues: [
      "lib/billing.ts and .env.example changed outside the headline task.",
      "A billing environment variable name was changed.",
    ],
    recommendations: [
      "Revert lib/billing.ts and .env.example.",
      "Keep only the headline change in app/pricing/page.tsx.",
    ],
    status: "NEEDS REVIEW",
  },
];

const steps = [
  {
    title: "Paste original AI instruction",
    detail: "The exact task you gave your AI coding tool.",
  },
  {
    title: "Paste Git diff",
    detail: "The changes that tool actually made.",
  },
  {
    title: "Get verification report",
    detail: "Missing requirements, unexpected changes, and risky modifications.",
  },
];

export function ProductIntro() {
  return (
    <div className="mt-10 space-y-8 text-sm leading-6 text-[#3f3832]">
      <section>
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          How it works
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4"
            >
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#9a3412]">
                Step {index + 1}
              </p>
              <p className="mt-2 font-semibold text-[#1c1915]">{step.title}</p>
              <p className="mt-2 text-[#5c5348]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

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
        <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#6b6258]">Examples</h2>
        <div className="mt-3 space-y-4">
          {examples.map((example) => (
            <article
              key={example.originalTask}
              className="rounded-lg border border-[#e4d9c8] bg-white px-4 py-4"
            >
              {example.tool ? (
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#9a3412]">
                  {example.tool}
                </p>
              ) : null}
              <dl className={example.tool ? "mt-3 space-y-4" : "space-y-4"}>
                <div>
                  <dt className="font-semibold text-[#1c1915]">Original Task</dt>
                  <dd className="mt-1 whitespace-pre-line text-[#3f3832]">{example.originalTask}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#1c1915]">AI Changed Files</dt>
                  <dd className="mt-1 whitespace-pre-line text-[#3f3832]">{example.files.join("\n")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#1c1915]">Detected Issues</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-5">
                      {example.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#1c1915]">Recommendation</dt>
                  <dd className="mt-1">
                    <ul className="list-disc space-y-1 pl-5">
                      {example.recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#1c1915]">Final Status</dt>
                  <dd className="mt-1 font-semibold text-[#9a3412]">{example.status}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-4">
        <h2 className="font-semibold text-[#1c1915]">Privacy and security</h2>
        <div className="mt-2 max-w-2xl space-y-2 text-[#5c5348]">
          <p>Your code is not stored.</p>
          <p>
            The original task and Git diff are used only for this verification. ChangeVerify does not
            keep your code history.
          </p>
          <p>ChangeVerify does not access your repository. You paste the diff yourself.</p>
        </div>
      </section>
    </div>
  );
}
