const SECRET_PATTERNS = [
  /sk-/,
  /API_KEY\s*=/i,
  /SECRET\s*=/i,
  /PASSWORD\s*=/i,
  /PRIVATE_KEY/i,
  /TOKEN\s*=/i,
];

export function hasPotentialSecret(value: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(value));
}
