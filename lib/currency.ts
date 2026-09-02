// FCFA formatter — enterprise, Cameroun
export const CURRENCY = "XAF" as const; // FCFA = XAF
export const LOCALE = "fr-CM";

export function formatFCFA(value: number, opts: { compact?: boolean } = {}) {
  const rounded = Math.round(value);
  if (opts.compact && rounded >= 1000) {
    return `${(rounded / 1000).toFixed(rounded % 1000 === 0 ? 0 : 1).replace(".", ",")} k FCFA`;
  }
  return `${new Intl.NumberFormat(LOCALE).format(rounded)} FCFA`;
}

export function formatPrice(priceUSD: number) {
  // legacy $ → FCFA: 1 USD ~ 620 FCFA (enterprise rate, keep consistent)
  const FCFA_RATE = 620;
  return formatFCFA(priceUSD * FCFA_RATE);
}

// For direct FCFA values already (if product.price is already FCFA, use formatFCFA directly)
