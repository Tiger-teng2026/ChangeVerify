import { toJSONSchema, z } from "zod";

const severitySchema = z.enum(["low", "medium", "high"]);

export const verificationReportSchema = z
  .object({
    verdict: z.enum(["PASS", "REVIEW", "HIGH_RISK"]),
    summary: z.string().min(1),
    filesChanged: z.number().int().nonnegative(),
    requirements: z.array(
      z
        .object({
          requirement: z.string().min(1),
          status: z.enum(["completed", "unclear", "possible_violation"]),
          evidence: z.array(z.string()),
          explanation: z.string(),
        })
        .strict(),
    ),
    missingRequirements: z.array(
      z
        .object({
          requirement: z.string().min(1),
          reason: z.string(),
        })
        .strict(),
    ),
    outOfScopeChanges: z.array(
      z
        .object({
          file: z.string().min(1),
          reason: z.string(),
          severity: severitySchema,
        })
        .strict(),
    ),
    riskyChanges: z.array(
      z
        .object({
          category: z.string().min(1),
          file: z.string().min(1),
          reason: z.string(),
          severity: severitySchema,
        })
        .strict(),
    ),
    reviewFocus: z.array(z.string().min(1)).max(3),
    limitations: z.array(z.string()),
  })
  .strict();

export type VerificationReport = z.infer<typeof verificationReportSchema>;

const generated = toJSONSchema(verificationReportSchema, {
  target: "draft-07",
  reused: "inline",
}) as Record<string, unknown>;

delete generated.$schema;

export const verificationJsonSchema: Record<string, unknown> = JSON.parse(
  JSON.stringify(generated),
) as Record<string, unknown>;
