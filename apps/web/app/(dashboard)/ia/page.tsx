"use client";

import * as React from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import type { AiInsight } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAiInsightsQuery, useAskAiMutation } from "@/hooks/use-ai";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  insight?: AiInsight | null;
}

function InsightCard({ insight, onAsk }: { insight: AiInsight; onAsk: () => void }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={onAsk}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{insight.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {insight.items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum registro no momento.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {insight.items.slice(0, 4).map((item) => (
              <Badge key={item.creatorId} variant="outline" className="text-xs">
                {item.creatorName}
              </Badge>
            ))}
            {insight.items.length > 4 && <Badge variant="outline">+{insight.items.length - 4}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AgenteIaPage() {
  const { data: insights, isLoading: loadingInsights } = useAiInsightsQuery();
  const askAi = useAskAiMutation();
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Olá! Eu respondo perguntas sobre os dados do CS Hub (rankings, atrasos, pendências) consultando o banco diretamente — não sou uma IA generativa, então funciono melhor com as perguntas sugeridas abaixo.",
    },
  ]);
  const [question, setQuestion] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    try {
      const result = await askAi.mutateAsync(text);
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer, insight: result.insight }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Não consegui processar essa pergunta agora." }]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Agente de IA</h1>
        <p className="text-sm text-muted-foreground">Perguntas rápidas sobre creators, campanhas, pagamentos e saques.</p>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Este projeto não tem credenciais de LLM configuradas — este é um motor de consultas determinístico sobre os dados
          reais, não um chat generativo livre.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg border p-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.insight && message.insight.items.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs opacity-90">
                      {message.insight.items.map((item) => (
                        <li key={item.creatorId}>
                          {item.creatorName} — {item.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {message.role === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void handleAsk(question);
            }}
          >
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ex.: quem gera mais receita?"
              disabled={askAi.isPending}
            />
            <Button type="submit" disabled={askAi.isPending || !question.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Insights automáticos</h2>
          {loadingInsights ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            insights?.map((insight) => <InsightCard key={insight.id} insight={insight} onAsk={() => handleAsk(insight.title)} />)
          )}
        </div>
      </div>
    </div>
  );
}
