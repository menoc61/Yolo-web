// Enterprise payments abstraction — Visa (Stripe) + Orange Money (Notch) + MTN MoMo (CinetPay) + Cash
// Cash supports two modes: "shop" (Click & Collect — Google Maps shop links) & "cod" (Cash on Delivery)

export type PaymentMethod = "visa" | "om" | "momo" | "cash";
export type CashMode = "shop" | "cod";
export type OrderStatus = "paid" | "pending_push" | "cod_pending" | "rejected";

// cspell:ignore débité FCFA USSD confirmer téléphone momo MoMo Cinet CinetPay retrait espèces
export const PAYMENT_META: Record<PaymentMethod, { label: string; desc: string; provider?: string; icon: string }> = {
  visa: { label: "Visa", desc: "Stripe 3D Secure — débité en FCFA (XAF)", provider: "Stripe", icon: "💳" },
  om: { label: "Orange Money", desc: "Notch — push USSD à confirmer sur ton téléphone", provider: "Notch", icon: "📱" },
  momo: { label: "MTN MoMo", desc: "CinetPay — push MoMo à confirmer sur ton téléphone", provider: "CinetPay", icon: "📱" },
  cash: { label: "Cash", desc: "Espèces FCFA — en boutique (retrait) ou à la livraison", icon: "💵" },
};

// ── Shipping ──

export type ShippingMethod = "yde" | "cm" | "cemac" | "pickup";

export const SHIPPING_META: Record<ShippingMethod, { label: string; costFCFA: number; eta: string }> = {
  yde: { label: "Yaoundé — Avenue Kennedy express 24h", costFCFA: 0, eta: "24h" },
  cm: { label: "Cameroun — express national 24-48h", costFCFA: 2500, eta: "24-48h" },
  cemac: { label: "CEMAC — 3-5 jours", costFCFA: 5000, eta: "3-5j" },
  pickup: { label: "Retrait en boutique (Click & Collect)", costFCFA: 0, eta: "2h" },
};

// ── Cities → zones (auto-derives shipping) ──

export type CityId =
  | "yaounde" | "douala" | "bafoussam" | "bamenda" | "bertoua"
  | "buea" | "ebolowa" | "garoua" | "kribi" | "limbe"
  | "maroua" | "ngaoundere" | "nkongsamba" | "kumba"
  | "cemac";

export const CITIES: { id: CityId; label: string }[] = [
  { id: "yaounde", label: "Yaoundé" },
  { id: "douala", label: "Douala" },
  { id: "bafoussam", label: "Bafoussam" },
  { id: "bamenda", label: "Bamenda" },
  { id: "bertoua", label: "Bertoua" },
  { id: "buea", label: "Buéa" },
  { id: "ebolowa", label: "Ebolowa" },
  { id: "garoua", label: "Garoua" },
  { id: "kribi", label: "Kribi" },
  { id: "limbe", label: "Limbé" },
  { id: "maroua", label: "Maroua" },
  { id: "ngaoundere", label: "Ngaoundéré" },
  { id: "nkongsamba", label: "Nkongsamba" },
  { id: "kumba", label: "Kumba" },
  { id: "cemac", label: "Hors Cameroun (CEMAC)" },
];

export const CITY_LABELS: Record<CityId, string> = Object.fromEntries(CITIES.map((c) => [c.id, c.label])) as Record<CityId, string>;

/** Auto-derive shipping zone from city selection */
export function cityToShipping(city: CityId): ShippingMethod {
  if (city === "yaounde") return "yde";
  if (city === "cemac") return "cemac";
  return "cm";
}

// ── Payloads ──

export interface PlaceOrderPayload {
  items: { id: string; quantity: number; price: number }[];
  customer: { name: string; email: string; phone: string; address: string; city: string; notes?: string };
  payment: PaymentMethod;
  cashMode?: CashMode; // only when payment = "cash"
  shipping: ShippingMethod;
  promoCode?: string | null;
}

export interface PlaceOrderResult {
  orderId: string;
  status: OrderStatus;
  payment: PaymentMethod;
  cashMode?: CashMode;
  totalFCFA: number;
  message: string;
}

// ── Client helper → POST /api/orders ──

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResult> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? "Paiement échoué — réessaie");
  }
  return res.json();
}