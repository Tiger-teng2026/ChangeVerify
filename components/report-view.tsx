"use client";

import { AiHandoff } from "@/components/ai-handoff";
import { UNLOCK_PRICE_LABEL } from "@/lib/unlock";
import type { StoredFull, StoredPreview, StoredReport } from "@/lib/report-store";
import type { VerificationReport } from "@/lib/schema";

const VERDICT_VIEW = {
  PASS: {
    label: "LIKELY MATCH",
    note: "Changes appear consistent with the requested task based on the provided diff.",
    tone: "border-[#166534] bg-[#f0fdf4] text-[#14532d]",
  },
  REVIEW: {
    label: "NEEDS REVIEW",
    note: "Some requirements, scope, or risk areas appear to need a human look based on the provided diff.",
    tone: "border-[#b45309] bg-[#fffbeb] text-[#9a3412]",
  },
  HIGH_RISK: {
    label: "NEEDS REVIEW",
    note: "The AI coding agent changed more than your original request.",
    tone: "border-[#9f1239] bg-[#fff1f2] text-[#9f1239]",
  },
} as const;

const RECOMMENDED_ACTION: Record<VerificationReport["verdict"], string> = {
  PASS: "The changes appear consistent with your original request. Do one final review of the diff before you ship.",
  REVIEW:
    "Review the items above before you ship. Confirm the requested work is present and that the change stays within the original task.",
  HIGH_RISK:
    "Pause before shipping. Revert changes that go beyond your original request, then check the diff again.",
};

const FULL_REPORT_INCLUDES = [
  {
    title: "Complete verification report for this AI code change",
    detail: "The full report for this change only. It does not unlock other changes.",
  },
  {
    title: "Requirement coverage analysis",
    detail: "See which parts of the original task this change appears to cover.",
  },
  {
    title: "Scope creep detection",
    detail: "See changes that go beyond the original request.",
  },
  {
    title: "Risky change review",
    detail: "See changes that may need attention before you ship.",
  },
  {
    title: "AI fix instructions",
    detail: "Get instructions you can paste into your AI coding tool.",
  },
];

const STATUS_LABEL: Record<VerificationReport["requirements"][number]["status"], string> = {
  completed: "Completed",
  unclear: "Unclear",
  possible_violation: "Possible Violation",
};

export function ReportView({
  result,
  onUnlock,
  unlockPending = false,
  unlockError = null,
}: {
  result: StoredReport;
  onUnlock?: () => void;
  unlockPending?: boolean;
  unlockError?: string | null;
}) {
  if (result.access === "preview") {
    return (
      <PreviewReport
        result={result}
        onUnlock={onUnlock}
        unlockPending={unlockPending}
        unlockError={unlockError}
      />
    );
  }
  return <FullReport result={result} />;
}

function FullReport({ result }: { result: StoredFull }) {
  const view = VERDICT_VIEW[result.report.verdict];
  const { report } = result;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          Overall Verdict
        </h1>
        <div className={`mt-3 rounded-xl border px-5 py-5 ${view.tone}`}>
          <p className="text-2xl font-semibold tracking-tight">{view.label}</p>
          <p className="mt-2 text-sm leading-6">{view.note}</p>
        </div>
        <div className="mt-4 rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 text-sm leading-6 text-[#3f3832]">
          <p>Based only on the Original Task and provided Git diff.</p>
          <p className="mt-2">
            This report does not verify runtime behavior, test results, repository-wide
            correctness, or security.
          </p>
        </div>
        {result.truncated ? (
          <p className="mt-3 text-sm text-[#9a3412]">
            The model output reached its length limit. This report may be incomplete.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="mt-3 text-sm leading-7 text-[#3f3832]">{report.summary}</p>
        <p className="mt-3 text-sm text-[#6b6258]">Files changed: {report.filesChanged}</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Requirement Coverage</h2>
        {report.requirements.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-4 space-y-4">
            {report.requirements.map((item, index) => (
              <li key={`${item.requirement}-${index}`} className="rounded-lg border border-[#e4d9c8] bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.requirement}</p>
                  <span className="text-xs font-semibold tracking-wide uppercase text-[#9a3412]">
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
                {item.explanation ? (
                  <p className="mt-2 text-sm leading-6 text-[#3f3832]">{item.explanation}</p>
                ) : null}
                {item.evidence.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5c5348]">
                    {item.evidence.map((evidence, evidenceIndex) => (
                      <li key={`${evidence}-${evidenceIndex}`}>{evidence}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Possible Missing Requirements</h2>
        {report.missingRequirements.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-4 space-y-3">
            {report.missingRequirements.map((item, index) => (
              <li key={`${item.requirement}-${index}`} className="rounded-lg border border-[#e4d9c8] bg-white px-4 py-4">
                <p className="font-medium">{item.requirement}</p>
                {item.reason ? <p className="mt-2 text-sm leading-6 text-[#3f3832]">{item.reason}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Possible Scope Creep</h2>
        {report.outOfScopeChanges.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-4 space-y-3">
            {report.outOfScopeChanges.map((item, index) => (
              <li key={`${item.file}-${index}`} className="rounded-lg border border-[#e4d9c8] bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm">{item.file}</p>
                  <Severity severity={item.severity} />
                </div>
                {item.reason ? <p className="mt-2 text-sm leading-6 text-[#3f3832]">{item.reason}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Risky Changes</h2>
        {report.riskyChanges.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-4 space-y-3">
            {report.riskyChanges.map((item, index) => (
              <li key={`${item.file}-${item.category}-${index}`} className="rounded-lg border border-[#e4d9c8] bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{item.category}</p>
                  <Severity severity={item.severity} />
                </div>
                <p className="mt-2 font-mono text-sm text-[#5c5348]">{item.file}</p>
                {item.reason ? <p className="mt-2 text-sm leading-6 text-[#3f3832]">{item.reason}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Top 3 Things to Review</h2>
        {report.reviewFocus.length === 0 ? (
          <Empty />
        ) : (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#3f3832]">
            {report.reviewFocus.slice(0, 3).map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        )}
      </section>

      <RecommendedAction verdict={report.verdict} />

      <AiHandoff report={report} />

      <section>
        <h2 className="text-lg font-semibold">Limitations</h2>
        <div className="mt-4 rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 text-sm leading-6 text-[#3f3832]">
          <p>Based only on the Original Task and provided Git diff.</p>
          <p className="mt-2">
            This report does not verify runtime behavior, test results, repository-wide
            correctness, or security.
          </p>
        </div>
        {report.limitations.length > 0 ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#3f3832]">
            {report.limitations.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

function PreviewReport({
  result,
  onUnlock,
  unlockPending,
  unlockError,
}: {
  result: StoredPreview;
  onUnlock?: () => void;
  unlockPending: boolean;
  unlockError: string | null;
}) {
  const view = VERDICT_VIEW[result.preview.verdict];
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#6b6258]">
          Overall Verdict
        </h1>
        <div className={`mt-3 rounded-xl border px-5 py-5 ${view.tone}`}>
          <p className="text-2xl font-semibold tracking-tight">{view.label}</p>
          <p className="mt-2 text-sm leading-6">{view.note}</p>
        </div>
        <div className="mt-4 rounded-lg border border-[#d9d0c1] bg-white px-4 py-3 text-sm leading-6 text-[#3f3832]">
          <p>Based only on the Original Task and provided Git diff.</p>
          <p className="mt-2">
            This is a free preview of this change. One payment unlocks the full report for this
            change only.
          </p>
          <p className="mt-2">
            This is an AI analysis of the text you submitted. It can miss issues or be wrong. It
            does not verify runtime behavior, test results, repository-wide correctness, or security.
          </p>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="mt-3 text-sm leading-7 text-[#3f3832]">{result.preview.summary}</p>
        <p className="mt-3 text-sm text-[#6b6258]">Files changed: {result.preview.filesChanged}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Top 3 Things to Review</h2>
        {result.preview.reviewFocus.length === 0 ? (
          <Empty />
        ) : (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#3f3832]">
            {result.preview.reviewFocus.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ol>
        )}
      </section>
      <RecommendedAction verdict={result.preview.verdict} />
      <section>
        <h2 className="text-lg font-semibold">What you get</h2>
        <ul className="mt-4 space-y-3">
          {FULL_REPORT_INCLUDES.map((item) => (
            <li key={item.title} className="rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3">
              <p className="font-semibold text-[#1c1915]">{item.title}</p>
              <p className="mt-1 text-[#5c5348]">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border border-[#e4d9c8] bg-white px-5 py-5">
        <h2 className="text-lg font-semibold">Unlock This Report</h2>
        <p className="mt-2 text-sm leading-6 text-[#5c5348]">{UNLOCK_PRICE_LABEL}</p>
        <div className="mt-3 text-sm leading-6 text-[#5c5348]">
          <p>One-time payment for this verification report.</p>
          <p>No subscription.</p>
          <p>No recurring charges.</p>
        </div>
        <div className="mt-4 rounded-lg border border-[#e4d9c8] bg-[#faf7f1] px-4 py-3 text-sm leading-6 text-[#5c5348]">
          <p>Based on the Original Task and Git diff you provided.</p>
          <p className="mt-2">ChangeVerify does not access your repository.</p>
          <p className="mt-2">Your code is not stored.</p>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          disabled={unlockPending || !onUnlock}
          className="mt-4 rounded-full bg-[#1c1915] px-6 py-3 text-sm font-semibold text-[#f3efe6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {unlockPending ? "Opening checkout…" : "Unlock This Report"}
        </button>
        {unlockError ? <p className="mt-3 text-sm text-[#9f1239]">{unlockError}</p> : null}
      </section>
    </div>
  );
}

function RecommendedAction({ verdict }: { verdict: VerificationReport["verdict"] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Recommended Action</h2>
      <p className="mt-3 text-sm leading-7 text-[#3f3832]">{RECOMMENDED_ACTION[verdict]}</p>
    </section>
  );
}

function Empty() {
  return <p className="mt-3 text-sm text-[#6b6258]">None identified based on the provided diff.</p>;
}

function Severity({ severity }: { severity: "low" | "medium" | "high" }) {
  return <span className="text-xs font-semibold tracking-wide uppercase">{severity}</span>;
}
