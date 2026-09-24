import type { VerificationReport } from "@/lib/schema";

const FINDINGS_ENDING = `Make the smallest necessary correction.

Do not make unrelated changes.

After the fix, return the new Git diff so it can be verified again.

Return the new Git diff only.
Do not summarize it.`;

const CLEAN_PROMPT = `Review the latest changes against my original task.

ChangeVerify did not identify a specific missing requirement,
out-of-scope change, or risky change based on the provided diff.

Perform one final targeted review.

Do not make unrelated changes.

Return the latest Git diff only.
Do not summarize it.`;

function isCleanPass(report: VerificationReport): boolean {
  return (
    report.verdict === "PASS" &&
    report.missingRequirements.length === 0 &&
    report.outOfScopeChanges.length === 0 &&
    report.riskyChanges.length === 0
  );
}

function repeatsExistingItem(item: string, needles: string[]): boolean {
  const text = item.trim().toLowerCase();
  if (!text) return true;
  return needles.some((needle) => {
    const key = needle.trim().toLowerCase();
    return key.length >= 4 && text.includes(key);
  });
}

export function buildHandoffPrompt(report: VerificationReport): string {
  if (isCleanPass(report)) return CLEAN_PROMPT;

  const items: string[] = [];
  const needles: string[] = [];

  for (const item of report.missingRequirements) {
    const requirement = item.requirement.trim();
    if (!requirement) continue;
    needles.push(requirement);
    items.push(`Complete this missing requirement:\n\n${requirement}`);
  }

  for (const item of report.outOfScopeChanges) {
    const file = item.file.trim();
    if (!file) continue;
    needles.push(file);
    const reason = item.reason.trim();
    items.push(
      [
        "Review this possible out-of-scope change:",
        "",
        file,
        reason,
        "",
        "Explain why this file changed.",
        "If this change is not necessary to complete the original task,",
        "revert or remove only that unrelated change.",
      ]
        .filter((line, index) => index !== 3 || reason.length > 0)
        .join("\n"),
    );
  }

  for (const item of report.riskyChanges) {
    const category = item.category.trim();
    const file = item.file.trim();
    if (!category || !file) continue;
    needles.push(file);
    const reason = item.reason.trim();
    items.push(
      [
        "Review this sensitive change:",
        "",
        category,
        file,
        reason,
        "",
        "Do not claim it is a confirmed bug or security issue.",
      ]
        .filter((line, index) => index !== 4 || reason.length > 0)
        .join("\n"),
    );
  }

  const extra = report.reviewFocus
    .slice(0, 3)
    .map((item) => item.trim())
    .filter((item, index, all) => {
      if (!item || repeatsExistingItem(item, needles)) return false;
      const key = item.toLowerCase();
      return all.findIndex((candidate) => candidate.toLowerCase() === key) === index;
    });

  if (extra.length > 0) {
    items.push(`Additional review items:\n\n${extra.map((item) => `- ${item}`).join("\n")}`);
  }

  if (items.length === 0) return CLEAN_PROMPT;

  const numbered = items.map((item, index) => `${index + 1}. ${item}`).join("\n\n");

  return [
    "Review the latest changes against my original task.",
    "",
    "ChangeVerify found these items that need attention:",
    "",
    numbered,
    "",
    "Only address the items above.",
    "",
    "Do not redo requirements that already appear completed.",
    "",
    FINDINGS_ENDING,
  ].join("\n");
}
