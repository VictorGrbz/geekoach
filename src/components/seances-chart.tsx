"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PointSemaine = { semaine: string; label: string; count: number };

export function SeancesChart({ points, height = 200 }: { points: PointSemaine[]; height?: number }) {
  if (points.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--fg-muted)", fontSize: 10 }}
          axisLine={{ stroke: "var(--line)" }}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--fg-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          contentStyle={{
            background: "var(--ink-850)",
            border: "1px solid var(--line-strong)",
            borderRadius: 0,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--fg-muted)" }}
          itemStyle={{ color: "var(--cyan)" }}
          formatter={(value) => [`${value}`, "Séances"] as [string, string]}
        />
        <Bar dataKey="count" fill="var(--cyan-dim)" maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
