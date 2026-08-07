"use client";

import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_INK, FUNNEL_RAMP } from "@/lib/chart-theme";

interface CampaignFunnelChartProps {
  clicks: number;
  leads: number;
  registrations: number;
  ftds: number;
}

export function CampaignFunnelChart({ clicks, leads, registrations, ftds }: CampaignFunnelChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const ink = dark ? CHART_INK.dark : CHART_INK.light;
  const ramp = dark ? FUNNEL_RAMP.dark : FUNNEL_RAMP.light;

  const stages = [
    { name: "Cliques", value: clicks },
    { name: "Leads", value: leads },
    { name: "Cadastros", value: registrations },
    { name: "FTDs", value: ftds },
  ];

  const option = {
    backgroundColor: "transparent",
    grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      textStyle: { color: ink.primary },
      backgroundColor: dark ? "#1a1a19" : "#fcfcfb",
      borderColor: ink.grid,
    },
    xAxis: {
      type: "category",
      data: stages.map((s) => s.name),
      axisLine: { lineStyle: { color: ink.axis } },
      axisLabel: { color: ink.secondary },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: { color: ink.muted },
      splitLine: { lineStyle: { color: ink.grid } },
    },
    series: [
      {
        type: "bar",
        data: stages.map((s, i) => ({ value: s.value, itemStyle: { color: ramp[i], borderRadius: [4, 4, 0, 0] } })),
        barWidth: "45%",
        label: { show: true, position: "top", color: ink.secondary },
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Funil de conversão (campanhas)</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 260 }} notMerge />
      </CardContent>
    </Card>
  );
}
