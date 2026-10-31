"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "May", Billed: 300, Paid: 300 },
  { month: "Jun", Billed: 600, Paid: 580 },
  { month: "Jul", Billed: 900, Paid: 900 },
  { month: "Aug", Billed: 1000, Paid: 980 },
  { month: "Sep", Billed: 1180, Paid: 1180 },
  { month: "Oct", Billed: 1180, Paid: 1180 },
];

export function BillingChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} tickFormatter={(v: number) => `₹${v}`} width={60} />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Line type="monotone" dataKey="Billed" stroke="#3B82F6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Paid" stroke="#F97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
