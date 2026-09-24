"use client";

import type { VerificationReport } from "@/lib/schema";
import type { StoredReport } from "@/lib/report-store";

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
    label: "SIGNIFICANT MISMATCH",
    note: "The provided diff appears to depart from the requested task in a significant way.",
    tone: "border-[#9f1239] bg-[#fff1f2] text-[#9f1239]",
  },
} as const;

const STATUS_LABEL: Record<VerificationReport["requirements"][number]["status"], string> = {
  completed: "Completed",
  unclear: "Unclear",
  possible_violation: "Possible Violation",
};

export function ReportView({ result }: { result: StoredReport }) {
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

function Empty() {
  return <p className="mt-3 text-sm text-[#6b6258]">None identified based on the provided diff.</p>;
}

function Severity({ severity }: { severity: "low" | "medium" | "high" }) {
  return <span className="text-xs font-semibold tracking-wide uppercase">{severity}</span>;
}
