import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");

    const body = await req.json().catch(() => ({}));
    const dataId = body?.data?.id || url.searchParams.get("id") || url.searchParams.get("data.id");

    if (topic === "payment" || body?.type === "payment" || body?.action?.includes("payment")) {
      if (dataId) {
        // Consulta as informações atualizadas do pagamento no Mercado Pago
        const payment = await paymentClient.get({ id: String(dataId) });

        if (payment) {
          const paymentId = String(payment.id);
          const paymentStatus = payment.status || "pending";
          const userId = payment.metadata?.user_id;

          if (userId && paymentStatus === "approved") {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Estende acesso PRO por 30 dias

            await prisma.$transaction([
              prisma.user.update({
                where: { id: userId },
                data: {
                  plan: "PRO",
                  planExpiresAt: expiresAt,
                },
              }),
              prisma.subscriptionPayment.upsert({
                where: { mpPaymentId: paymentId },
                create: {
                  userId: userId,
                  mpPaymentId: paymentId,
                  amount: payment.transaction_amount || 29.90,
                  status: paymentStatus,
                  paymentMethod: payment.payment_method_id,
                  paidAt: new Date(),
                },
                update: {
                  status: paymentStatus,
                  paidAt: new Date(),
                },
              }),
            ]);
          } else if (userId) {
            await prisma.subscriptionPayment.upsert({
              where: { mpPaymentId: paymentId },
              create: {
                userId: userId,
                mpPaymentId: paymentId,
                amount: payment.transaction_amount || 29.90,
                status: paymentStatus,
                paymentMethod: payment.payment_method_id,
              },
              update: {
                status: paymentStatus,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar Webhook Mercado Pago:", error);
    // Retorna 200 para o Mercado Pago evitar retentativas infinitas em falhas temporárias
    return NextResponse.json({ received: true, error: "Erro interno no processamento" });
  }
}
