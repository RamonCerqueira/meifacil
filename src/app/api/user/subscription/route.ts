import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        planExpiresAt: true,
        subscriptionPayments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      // Se for usuário de demonstração ou ainda não salvo no banco
      return NextResponse.json({
        plan: "FREE",
        planExpiresAt: null,
        payments: [],
      });
    }

    // Verificar se o plano PRO expirou
    const isPro = user.plan === "PRO" && (
      !user.planExpiresAt || new Date(user.planExpiresAt) > new Date()
    );

    return NextResponse.json({
      plan: isPro ? "PRO" : "FREE",
      planExpiresAt: user.planExpiresAt,
      payments: user.subscriptionPayments,
    });
  } catch (error) {
    console.error("Erro ao buscar dados da assinatura:", error);
    return NextResponse.json({
      plan: "FREE",
      planExpiresAt: null,
      payments: [],
    });
  }
}
