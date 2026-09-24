import { detectPotentialSecrets } from "@/lib/secret-detection";

export function hasPotentialSecret(value: string): boolean {
  return detectPotentialSecrets(value, "original-task").length > 0;
}
