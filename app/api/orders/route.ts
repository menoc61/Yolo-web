import { NextResponse } from "next/server";
import { applyPromo } from "@/lib/promo";
import { PAYMENT_META, SHIPPING_META } from "@/lib/payments";
import type { PlaceOrderPayload } from "@/lib/payments";

// Mock server — production: Stripe + Notch/CinetPay webhooks + COD ledger
// FCFA (XAF) throughout · Avenue Kennedy, Yaoundé

export async function POST(req: Request) {
  const body = (await req.json()) as PlaceOrderPayload;

  const subtotalFCFA = body.items.reduce((s, i) => s + Math.round(i.price * 620) * i.quantity, 0);
  const shippingFCFA = SHIPPING_META[body.shipping]?.costFCFA ?? 0;
  let totalFCFA = subtotalFCFA + shippingFCFA;

  if (body.promoCode) {
    const promo = applyPromo(totalFCFA, body.promoCode);
    if (!("error" in promo) && promo.discount) totalFCFA = promo.total;
  }

  // Provider latency simulation
  const delay = body.payment === "visa" ? 900 : body.payment === "om" || body.payment === "momo" ? 1100 : 350;
  await new Promise((r) => setTimeout(r, delay));

  // Simulate Notch / CinetPay push rejection (8% — tests the rejected event flow)
  if ((body.payment === "om" || body.payment === "momo") && Math.random() < 0.08) {
    return NextResponse.json(
      { error: `Push ${PAYMENT_META[body.payment].label} non confirmé — réessaie ou choisis un autre moyen de paiement` },
      { status: 409 },
    );
  }

  const orderId = `YOLO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const status =
    body.payment === "visa" ? "paid"
    : body.payment === "cash" && body.cashMode === "shop" ? "cod_pending"
    : body.payment === "cash" ? "cod_pending"
    : "pending_push";

  const message =
    body.payment === "visa"
      ? "Paiement Visa confirmé par Stripe"
      : body.payment === "cash" && body.cashMode === "shop"
        ? "Commande prête au retrait — prépare tes FCFA et passe à Avenue Kennedy ou l'un de nos points"
        : body.payment === "cash"
          ? "Commande COD enregistrée — prépare tes FCFA à la livraison"
          : `Push ${PAYMENT_META[body.payment].label} envoyé — confirme sur ton téléphone`;

  return NextResponse.json({ orderId, status, payment: body.payment, cashMode: body.cashMode, totalFCFA, message });
}