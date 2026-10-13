/**
 * Local full-report unlock for the developer running this app.
 * Both conditions are read on the server. The request cannot turn this on.
 * Production stays locked even if CHANGEVERIFY_DEV_MODE is set.
 */
export function isDeveloperMode(): boolean {
  const nodeEnv = process.env["NODE_ENV"];
  const flag = process.env["CHANGEVERIFY_DEV_MODE"]?.trim();
  return nodeEnv !== "production" && flag === "true";
}
