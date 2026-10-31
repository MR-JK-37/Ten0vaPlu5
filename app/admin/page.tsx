"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Users, IndianRupee, CreditCard, AlertTriangle, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("This Year");
  const [kpiScale, setKpiScale] = useState(1);

  const handleTimeRangeChange = (val: string) => {
    setTimeRange(val);
    toast.info(`Dashboard filtered by: ${val}`);
    if (val === "This Month") setKpiScale(0.12);
    else if (val === "This Quarter") setKpiScale(0.35);
    else setKpiScale(1);
  };

  const kpis = [
    {
      title: "Active Subscriptions",
      value: Math.round(1248 * kpiScale).toLocaleString("en-IN"),
      change: "+6.8%",
      isPositive: true,
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Revenue (This Month)",
      value: `₹${Math.round(8240000 * kpiScale).toLocaleString("en-IN")}`,
      change: "+12.4%",
      isPositive: true,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Payments Received",
      value: `₹${Math.round(6620000 * kpiScale).toLocaleString("en-IN")}`,
      change: "+11.9%",
      isPositive: true,
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Overdue Amount",
      value: `₹${Math.round(1620000 * kpiScale).toLocaleString("en-IN")}`,
      change: "+4.7%",
      isPositive: false,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  const recentInvoices = [
    { id: "INV-01457", customer: "Acme Corp", amount: "₹1,18,000", status: "Paid", badge: "bg-green-100 text-green-700 border-green-200" },
    { id: "INV-01456", customer: "Beta Solutions", amount: "₹2,36,000", status: "Partially Paid", badge: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "INV-01455", customer: "Metro Digital", amount: "₹1,00,000", status: "Overdue", badge: "bg-red-100 text-red-700 border-red-200" },
    { id: "INV-01454", customer: "Sunrise Tech", amount: "₹3,54,000", status: "Paid", badge: "bg-green-100 text-green-700 border-green-200" },
  ];

  const upcomingRenewals = [
    { customer: "Nova Systems", plan: "Pro (Monthly)", date: "Nov 03, 2026" },
    { customer: "GreenLeaf Co.", plan: "Business (Yearly)", date: "Nov 05, 2026" },
    { customer: "Pixel Labs", plan: "Pro (Monthly)", date: "Nov 07, 2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription Management System</h1>
          <p className="text-gray-500 text-xs mt-1">Manage customers, plans, subscriptions, billing and revenue in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white outline-none focus:border-violet-500 shadow-xs"
          >
            <option>This Year</option>
            <option>This Quarter</option>
            <option>This Month</option>
          </select>
          <button
            onClick={() => {
              toast.success("Dashboard metrics refreshed");
            }}
            className="p-1.5 rounded-xl border border-violet-200/80 bg-white hover:bg-violet-50 text-gray-600 hover:text-violet-700 transition shadow-xs"
            title="Refresh metrics"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between hover:border-violet-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <span
                  className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                    kpi.isPositive ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {kpi.isPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                  {kpi.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{kpi.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Subscriptions Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Overview Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Revenue Overview</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Billed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Received</span>
            </div>
          </div>
          <svg viewBox="0 0 520 180" className="w-full h-48 overflow-visible">
            {[0, 35, 70, 105, 140].map((y, idx) => (
              <line key={idx} x1="45" y1={y} x2="510" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <text x="35" y="145" fontSize="9" fill="#94a3b8" textAnchor="end">₹0</text>
            <text x="35" y="110" fontSize="9" fill="#94a3b8" textAnchor="end">₹20L</text>
            <text x="35" y="75" fontSize="9" fill="#94a3b8" textAnchor="end">₹40L</text>
            <text x="35" y="40" fontSize="9" fill="#94a3b8" textAnchor="end">₹80L</text>
            <text x="35" y="10" fontSize="9" fill="#94a3b8" textAnchor="end">₹1.2Cr</text>

            {/* Billed Curve (Purple) */}
            <path
              d="M 55 140 C 110 120, 160 110, 210 95 C 260 85, 310 65, 360 55 C 410 45, 460 30, 500 20"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
            />
            {/* Received Curve (Blue) */}
            <path
              d="M 55 142 C 110 125, 160 115, 210 102 C 260 92, 310 75, 360 68 C 410 58, 460 45, 500 35"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
            />
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, idx) => (
              <text key={m} x={55 + idx * 49} y="165" fontSize="10" fill="#94a3b8" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* Subscriptions by Status Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Subscriptions by Status</h2>
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 -rotate-90">
              {/* Active: 82% */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="309 377" strokeDashoffset="0" />
              {/* Paused: 5% */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="19 377" strokeDashoffset="-309" />
              {/* Draft: 4% */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="15 377" strokeDashoffset="-328" />
              {/* Quoted: 3% */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="11 377" strokeDashoffset="-343" />
              {/* Closed: 6% */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="23 377" strokeDashoffset="-354" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">1,248</span>
              <span className="text-xs text-gray-400 font-medium">Total</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600 mt-2">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active</span><span className="font-semibold text-gray-800">1,024 (82%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Paused</span><span className="font-semibold text-gray-800">62 (5%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Draft</span><span className="font-semibold text-gray-800">48 (4%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Quoted</span><span className="font-semibold text-gray-800">36 (3%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Closed</span><span className="font-semibold text-gray-800">78 (6%)</span></div>
          </div>
        </div>
      </div>

      {/* Recent Invoices & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Invoices</h2>
            <Link href="/admin/invoices" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All →
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Invoice No.</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 font-bold text-violet-700">{inv.id}</td>
                  <td className="py-2.5 text-gray-800 font-medium">{inv.customer}</td>
                  <td className="py-2.5 font-bold text-gray-900">{inv.amount}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${inv.badge}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Upcoming Renewals</h2>
            <Link href="/admin/subscriptions" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All →
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">Renewal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {upcomingRenewals.map((r, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 text-gray-900 font-bold">{r.customer}</td>
                  <td className="py-2.5 text-gray-600 font-medium">{r.plan}</td>
                  <td className="py-2.5 text-right font-semibold text-violet-700">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
