"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/money/money";

interface Point {
  month: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: Point[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.month).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted}>
          <XAxis dataKey="label" fontSize={12} />
          <YAxis
            fontSize={12}
            tickFormatter={(v: number) => formatMoney(v).replace(".00", "")}
            width={70}
          />
          <Tooltip formatter={(value) => formatMoney(typeof value === "number" ? value : 0)} />
          <Bar dataKey="revenue" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
