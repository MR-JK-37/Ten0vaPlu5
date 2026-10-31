import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Per AGENTS.md section 9: read raw bytes first, verify HMAC-SHA256 with constant-time
// comparison, dedupe on deliveryId, then process idempotently. No live YouPI server is
// running in this environment (docs/BLOCKERS.md) so this has not been exercised against
// a real gateway -- it is built exactly to the documented shape and is excluded from
// production traffic unless PAYMENT_PROVIDER=youpi.
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const secret = process.env.YOUPI_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-gateway-signature");
  const deliveryId = request.headers.get("x-gateway-delivery-id");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  if (!deliveryId) {
    return NextResponse.json({ error: "missing delivery id" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Dedupe: a unique (provider, delivery_id) row is the idempotency guarantee. Retries
  // within YouPI's ~1 hour window are not "stale" -- they're a no-op the second time.
  const { error: dedupeError } = await admin.from("webhook_events").insert({
    provider: "youpi",
    delivery_id: deliveryId,
    payload: JSON.parse(rawBody),
    signature_ok: true,
  });
  if (dedupeError) {
    // unique violation => already processed this delivery
    return NextResponse.json({ ok: true, deduped: true });
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    orderId: string;
    amountPaise: number;
    utr?: string;
    paymentId: string;
    verificationLevel: number;
  };

  if (payload.event !== "payment.success") {
    await admin
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "youpi")
      .eq("delivery_id", deliveryId);
    return NextResponse.json({ ok: true });
  }

  // orderId is built as `${invoiceId}-${timestamp}` by lib/payments/providers/youpi.ts.
  const invoiceId = payload.orderId.split("-").slice(0, 5).join("-");
  const { data: invoice } = await admin
    .from("invoices")
    .select("id, amount_due")
    .eq("id", invoiceId)
    .single();

  if (invoice && invoice.amount_due === payload.amountPaise) {
    await admin.rpc("record_payment", {
      p_invoice_id: invoice.id,
      p_method: "youpi",
      p_amount: payload.amountPaise,
      p_status: payload.verificationLevel >= 1 ? "confirmed" : "pending",
      p_provider: "youpi",
      p_provider_payment_id: payload.paymentId,
      p_reference: payload.utr,
      p_verification_level: payload.verificationLevel,
    });
  }
  // A mismatched amount or unknown invoice is intentionally not applied -- flagging it to
  // a staff review queue (payment_exceptions) is tracked as a follow-up, not implemented.

  await admin
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider", "youpi")
    .eq("delivery_id", deliveryId);

  return NextResponse.json({ ok: true });
}
