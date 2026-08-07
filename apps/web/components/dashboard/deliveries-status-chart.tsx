"use client";

import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_INK, STATUS_COLOR } from "@/lib/chart-theme";

interface DeliveriesStatusChartProps {
  pending: number;
  published: number;
  late: number;
}

export function DeliveriesStatusChart({ pending, published, late }: DeliveriesStatusChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const ink = dark ? CHART_INK.dark : CHART_INK.light;

  const data = [
    { name: "Publicado", value: published, itemStyle: { color: STATUS_COLOR.good } },
    { name: "Pendente", value: pending, itemStyle: { color: STATUS_COLOR.warning } },
    { name: "Atrasado", value: late, itemStyle: { color: STATUS_COLOR.critical } },
  ];
  const total = pending + published + late;

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      textStyle: { color: ink.primary },
      backgroundColor: dark ? "#1a1a19" : "#fcfcfb",
      borderColor: ink.grid,
    },
    legend: {
      bottom: 0,
      textStyle: { color: ink.secondary },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: dark ? "#1a1a19" : "#fcfcfb", borderWidth: 2 },
        label: { show: false },
        data,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entregas por status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">Nenhuma entrega registrada.</p>
        ) : (
          <ReactECharts option={option} style={{ height: 260 }} notMerge />
        )}
      </CardContent>
    </Card>
  );
}
