import { Injectable } from "@nestjs/common";
import type { AiInsight, AskAiResponse } from "@cs-hub/shared-types";
import { PrismaService } from "../../../prisma/prisma.service";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

interface InsightDefinition {
  id: string;
  title: string;
  keywords: string[];
  compute: () => Promise<AiInsight>;
}

/**
 * Not a generative LLM — this project has no LLM API credentials configured, so "Agente de
 * IA" here means a deterministic query engine: a fixed set of named insights computed
 * straight from Prisma (same cross-cutting-read exception as DashboardService), routed to by
 * matching keywords in the question. It answers the ranking/risk questions from the spec
 * honestly and reproducibly; it does not attempt free-form natural-language understanding.
 */
@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  private insightDefinitions(): InsightDefinition[] {
    return [
      {
        id: "top-revenue",
        title: "Quem gera mais receita",
        keywords: ["mais receita", "gera mais", "maior receita", "top receita"],
        compute: () => this.topRevenueCreators(),
      },
      {
        id: "negative-roi",
        title: "Campanhas com ROI negativo",
        keywords: ["roi negativo", "está negativo", "esta negativo", "prejuízo", "prejuizo"],
        compute: () => this.negativeRoiCampaigns(),
      },
      {
        id: "late-deliveries",
        title: "Quem não entregou no prazo",
        keywords: ["não entregou", "nao entregou", "atrasad", "entrega em atraso"],
        compute: () => this.lateDeliveries(),
      },
      {
        id: "expired-exclusivity",
        title: "Quem venceu a exclusividade",
        keywords: ["venceu exclusividade", "exclusividade vencida", "exclusividade venc"],
        compute: () => this.expiredExclusivities(),
      },
      {
        id: "overdue-payments",
        title: "Quem não recebeu pagamento",
        keywords: ["não recebeu pagamento", "nao recebeu pagamento", "pagamento atrasado", "não pagou", "nao pagou"],
        compute: () => this.overduePayments(),
      },
      {
        id: "missing-withdrawal-request",
        title: "Quem ainda não solicitou o saque do mês",
        keywords: ["não solicitou", "nao solicitou", "saque pendente", "ainda não pediu"],
        compute: () => this.creatorsWithoutWithdrawalRequest(),
      },
    ];
  }

  async allInsights(): Promise<AiInsight[]> {
    return Promise.all(this.insightDefinitions().map((definition) => definition.compute()));
  }

  async ask(question: string): Promise<AskAiResponse> {
    const normalized = question.toLowerCase();
    const definitions = this.insightDefinitions();
    // Matches on the declared keywords OR the insight's own title, so clicking an insight
    // card (which sends its title as the "question") always routes back to itself.
    const match = definitions.find(
      (definition) =>
        normalized.includes(definition.title.toLowerCase()) ||
        definition.keywords.some((keyword) => normalized.includes(keyword)),
    );

    if (!match) {
      return {
        answer:
          "Não reconheci essa pergunta. Sou um motor de consultas sobre os dados do CS Hub (não uma IA generativa) — tente uma das perguntas sugeridas abaixo.",
        insight: null,
        suggestions: definitions.map((d) => d.title),
      };
    }

    const insight = await match.compute();
    const answer = insight.items.length
      ? `${insight.summary} ${insight.items.map((item) => item.creatorName).join(", ")}.`
      : `${insight.summary} Nenhum registro encontrado no momento.`;

    return { answer, insight, suggestions: definitions.filter((d) => d.id !== match.id).map((d) => d.title) };
  }

  private async topRevenueCreators(): Promise<AiInsight> {
    const grouped = await this.prisma.financeTransaction.groupBy({
      by: ["creatorId"],
      where: { type: "INCOME", status: "PAID", creatorId: { not: null } },
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: "desc" } },
      take: 5,
    });

    const creators = await this.prisma.creator.findMany({
      where: { id: { in: grouped.map((g) => g.creatorId as string) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(creators.map((c) => [c.id, c.name]));

    return {
      id: "top-revenue",
      title: "Quem gera mais receita",
      summary: "Ranking de receita paga por creator (todo o período):",
      items: grouped.map((g) => ({
        creatorId: g.creatorId as string,
        creatorName: nameById.get(g.creatorId as string) ?? "—",
        label: `R$ ${((g._sum.amountCents ?? 0) / 100).toFixed(2)}`,
      })),
    };
  }

  private async negativeRoiCampaigns(): Promise<AiInsight> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { creatorId: { not: null }, investmentCents: { gt: 0 } },
      include: { creator: { select: { id: true, name: true } } },
    });

    const negative = campaigns
      .map((c) => ({ ...c, roi: (c.revenueCents - c.investmentCents) / c.investmentCents }))
      .filter((c) => c.roi < 0)
      .sort((a, b) => a.roi - b.roi)
      .slice(0, 5);

    return {
      id: "negative-roi",
      title: "Campanhas com ROI negativo",
      summary: "Creators com campanhas dando prejuízo agora:",
      items: negative.map((c) => ({
        creatorId: c.creator!.id,
        creatorName: c.creator!.name,
        label: `${c.name}: ${(c.roi * 100).toFixed(0)}%`,
      })),
    };
  }

  private async lateDeliveries(): Promise<AiInsight> {
    const deliveries = await this.prisma.delivery.findMany({
      where: { status: "LATE" },
      include: { creator: { select: { id: true, name: true } } },
    });

    const countByCreator = new Map<string, { name: string; count: number }>();
    for (const delivery of deliveries) {
      const existing = countByCreator.get(delivery.creatorId);
      countByCreator.set(delivery.creatorId, {
        name: delivery.creator.name,
        count: (existing?.count ?? 0) + 1,
      });
    }

    const items = [...countByCreator.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([creatorId, { name, count }]) => ({ creatorId, creatorName: name, label: `${count} entrega(s) em atraso` }));

    return { id: "late-deliveries", title: "Quem não entregou no prazo", summary: "Creators com entregas atrasadas:", items };
  }

  private async expiredExclusivities(): Promise<AiInsight> {
    const now = new Date();
    const expired = await this.prisma.exclusivity.findMany({
      where: { status: "ACTIVE", endDate: { lt: now } },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { endDate: "asc" },
      take: 5,
    });

    return {
      id: "expired-exclusivity",
      title: "Quem venceu a exclusividade",
      summary: "Exclusividades já vencidas mas ainda marcadas como ativas:",
      items: expired.map((e) => ({
        creatorId: e.creator.id,
        creatorName: e.creator.name,
        label: `${e.brand} — venceu em ${e.endDate.toLocaleDateString("pt-BR")}`,
      })),
    };
  }

  private async overduePayments(): Promise<AiInsight> {
    const now = new Date();
    const grouped = await this.prisma.financeTransaction.groupBy({
      by: ["creatorId"],
      where: { status: "PENDING", dueDate: { lt: now }, creatorId: { not: null } },
      _sum: { amountCents: true },
      orderBy: { _sum: { amountCents: "desc" } },
      take: 5,
    });

    const creators = await this.prisma.creator.findMany({
      where: { id: { in: grouped.map((g) => g.creatorId as string) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(creators.map((c) => [c.id, c.name]));

    return {
      id: "overdue-payments",
      title: "Quem não recebeu pagamento",
      summary: "Creators com lançamentos vencidos e ainda não pagos:",
      items: grouped.map((g) => ({
        creatorId: g.creatorId as string,
        creatorName: nameById.get(g.creatorId as string) ?? "—",
        label: `R$ ${((g._sum.amountCents ?? 0) / 100).toFixed(2)} vencido(s)`,
      })),
    };
  }

  private async creatorsWithoutWithdrawalRequest(): Promise<AiInsight> {
    const competence = startOfMonth(new Date());
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { competence, requestedAt: null },
      include: { creator: { select: { id: true, name: true } } },
      take: 10,
    });

    return {
      id: "missing-withdrawal-request",
      title: "Quem ainda não solicitou o saque do mês",
      summary: `Creators com saque disponível em ${competence.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} mas sem solicitação enviada:`,
      items: withdrawals.map((w) => ({ creatorId: w.creator.id, creatorName: w.creator.name, label: "sem solicitação" })),
    };
  }
}
