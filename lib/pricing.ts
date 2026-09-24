/**
 * Official DeepSeek prices per 1M tokens, from
 * https://api-docs.deepseek.com/quick_start/pricing
 * Peak hours: 01:00–04:00 and 06:00–10:00 UTC, Monday–Friday,
 * excluding Chinese public holidays (those hours are off-peak).
 * This helper only applies the published clock windows.
 */

type RateCard = {
  cacheHitPerM: number;
  cacheMissPerM: number;
  outputPerM: number;
};

const FLASH: { peak: RateCard; offPeak: RateCard } = {
  peak: { cacheHitPerM: 0.006, cacheMissPerM: 0.3, outputPerM: 1.2 },
  offPeak: { cacheHitPerM: 0.003, cacheMissPerM: 0.15, outputPerM: 0.6 },
};

const PRO: { peak: RateCard; offPeak: RateCard } = {
  peak: { cacheHitPerM: 0.044, cacheMissPerM: 1.32, outputPerM: 3.96 },
  offPeak: { cacheHitPerM: 0.022, cacheMissPerM: 0.66, outputPerM: 1.98 },
};

export function isDeepSeekPeak(at: Date): boolean {
  const day = at.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minute = at.getUTCHours() * 60 + at.getUTCMinutes();
  const inWindow = (start: number, end: number) => minute >= start && minute < end;
  return inWindow(1 * 60, 4 * 60) || inWindow(6 * 60, 10 * 60);
}

function rateCard(model: string, at: Date): { card: RateCard; label: string } | null {
  const name = model.toLowerCase();
  const peak = isDeepSeekPeak(at);
  const windowLabel = peak ? "peak" : "off-peak";
  if (name.includes("pro")) {
    return { card: peak ? PRO.peak : PRO.offPeak, label: `deepseek-v4-pro ${windowLabel}` };
  }
  if (name.includes("flash")) {
    return { card: peak ? FLASH.peak : FLASH.offPeak, label: `deepseek-flash ${windowLabel}` };
  }
  return null;
}

export function estimateCostUsd(input: {
  model: string;
  at: Date;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}): { usd: number; basis: string } | null {
  const selected = rateCard(input.model, input.at);
  if (!selected) return null;
  if (input.cachedInputTokens > input.inputTokens) return null;
  const miss = input.inputTokens - input.cachedInputTokens;
  const usd =
    (input.cachedInputTokens / 1_000_000) * selected.card.cacheHitPerM +
    (miss / 1_000_000) * selected.card.cacheMissPerM +
    (input.outputTokens / 1_000_000) * selected.card.outputPerM;
  const basis = `${selected.label}; cache-hit $${selected.card.cacheHitPerM}/1M, cache-miss $${selected.card.cacheMissPerM}/1M, output $${selected.card.outputPerM}/1M`;
  return { usd: Math.round(usd * 1e8) / 1e8, basis };
}
