"use client";

import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PointPoids = { date: string; valeur: number };

export function PoidsChart({
  points,
  objectif,
  height = 220,
  showAxes = true,
}: {
  points: PointPoids[];
  objectif?: number | null;
  height?: number;
  showAxes?: boolean;
}) {
  if (points.length === 0) return null;

  const valeurs = points.map((p) => p.valeur).concat(objectif ? [objectif] : []);
  const min = Math.floor(Math.min(...valeurs) - 0.5);
  const max = Math.ceil(Math.max(...valeurs) + 0.5);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        {showAxes && (
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--fg-muted)", fontSize: 10 }}
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
            }
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
            minTickGap={40}
          />
        )}
        {showAxes && (
          <YAxis
            domain={[min, max]}
            allowDecimals={false}
            tick={{ fill: "var(--fg-muted)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
        )}
        {!showAxes && <YAxis domain={[min, max]} hide />}
        {objectif != null && (
          <ReferenceLine
            y={objectif}
            stroke="var(--fg-faint)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
        <Tooltip
          contentStyle={{
            background: "var(--ink-850)",
            border: "1px solid var(--line-strong)",
            borderRadius: 0,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--fg-muted)" }}
          itemStyle={{ color: "var(--cyan)" }}
          labelFormatter={(v) => (v ? new Date(String(v)).toLocaleDateString("fr-FR") : "")}
          formatter={(value) => [`${value} kg`, "Poids"] as [string, string]}
        />
        <Line
          type="monotone"
          dataKey="valeur"
          stroke="var(--cyan)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "var(--cyan)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
