import { formatFCFA } from "./currency";

export interface PromoCode {
  code: string;
  discountPercent: number;
  minAmountFCFA?: number;
  expiresAt?: string;
  description: string;
}

export const PROMO_CODES: PromoCode[] = [
  { code: "YOLO10", discountPercent: 10, description: "Bienvenue — 10% sur ta 1ère commande yolo.co", minAmountFCFA: 20000 },
  { code: "KENNEDY20", discountPercent: 20, description: "Avenue Kennedy — 20% dès 80.000 FCFA", minAmountFCFA: 80000 },
  { code: "WHATSAPP5", discountPercent: 5, description: "Groupe WhatsApp — 5% extra" },
];

export function applyPromo(totalFCFA: number, code?: string) {
  if (!code) return { total: totalFCFA, discount: 0, applied: null as PromoCode | null };
  const promo = PROMO_CODES.find((p) => p.code.toLowerCase() === code.toLowerCase());
  if (!promo) return { total: totalFCFA, discount: 0, applied: null, error: "Code invalide" as const };
  if (promo.minAmountFCFA && totalFCFA < promo.minAmountFCFA) {
    return { total: totalFCFA, discount: 0, applied: null, error: `Minimum ${formatFCFA(promo.minAmountFCFA)} requis` as const };
  }
  const discount = Math.round((totalFCFA * promo.discountPercent) / 100);
  return { total: totalFCFA - discount, discount, applied: promo };
}
