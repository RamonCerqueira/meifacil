import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json({ error: "Dados do formulário de pagamento ausentes" }, { status: 400 });
    }

    // Garante que o usuário existe no banco de dados para evitar violação de Foreign Key (P2003)
    let targetUserId = userId;
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!existingUser) {
      const userByEmail = session.user.email 
        ? await prisma.user.findUnique({ where: { email: session.user.email } }) 
        : null;

      if (userByEmail) {
        targetUserId = userByEmail.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email: session.user.email || `user_${Date.now()}@meifacil.com`,
            name: session.user.name || "MEI Empreendedor",
          },
        });
        targetUserId = newUser.id;
      }
    }

    // Configura o pagamento no Mercado Pago
    const paymentData = {
      body: {
        transaction_amount: Number(formData.transaction_amount) || 29.90,
        token: formData.token,
        description: formData.description || "Assinatura Plano PRO - MEI Fácil",
        installments: Number(formData.installments) || 1,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: session.user.email || formData.payer?.email || "comprador@meifacil.com",
          first_name: formData.payer?.first_name || session.user.name?.split(' ')[0] || "Usuário",
          last_name: formData.payer?.last_name || session.user.name?.split(' ').slice(1).join(' ') || "MEI",
          identification: formData.payer?.identification ? {
            type: formData.payer.identification.type,
            number: formData.payer.identification.number,
          } : undefined,
        },
        metadata: {
          user_id: targetUserId,
          plan: "PRO",
        },
      },
    };

    const paymentResponse = await paymentClient.create(paymentData);

    const paymentId = String(paymentResponse.id);
    const paymentStatus = paymentResponse.status || "pending";
    const amount = paymentResponse.transaction_amount || 29.90;
    const paymentMethod = paymentResponse.payment_method_id || formData.payment_method_id;

    // Se o pagamento for aprovado imediatamente (Cartão de Crédito)
    if (paymentStatus === "approved") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias de acesso PRO

      await prisma.$transaction([
        prisma.user.update({
          where: { id: targetUserId },
          data: {
            plan: "PRO",
            planExpiresAt: expiresAt,
          },
        }),
        prisma.subscriptionPayment.upsert({
          where: { mpPaymentId: paymentId },
          create: {
            userId: targetUserId,
            mpPaymentId: paymentId,
            amount: amount,
            status: paymentStatus,
            paymentMethod: paymentMethod,
            paidAt: new Date(),
          },
          update: {
            status: paymentStatus,
            paidAt: new Date(),
          },
        }),
      ]);
    } else {
      // Registrar pagamento pendente (Pix / Boleto)
      await prisma.subscriptionPayment.upsert({
        where: { mpPaymentId: paymentId },
        create: {
          userId: targetUserId,
          mpPaymentId: paymentId,
          amount: amount,
          status: paymentStatus,
          paymentMethod: paymentMethod,
        },
        update: {
          status: paymentStatus,
        },
      });
    }

    return NextResponse.json({
      id: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
      point_of_interaction: paymentResponse.point_of_interaction,
    });
  } catch (error: any) {
    console.error("Erro ao processar pagamento Mercado Pago:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
