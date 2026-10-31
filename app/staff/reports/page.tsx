"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, History, Tag, Percent, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function StaffReportsPage() {
  const [period, setPeriod] = useState("Oct 01, 2026 – Oct 31, 2026");

  const kpis = [
    { label: "Quotations Sent", value: "24", change: "+20%", isUp: true },
    { label: "Invoices Created", value: "18", change: "+12%", isUp: true },
    { label: "Payments Collected", value: "₹6,62,000", change: "+14%", isUp: true },
    { label: "Overdue Invoices", value: "7", change: "-6%", isUp: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 text-xs mt-1">View personal performance reports, sales activity and task analytics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="font-semibold">{period}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-xs border border-blue-200/80 hover:border-blue-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">{k.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${k.isUp ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                {k.isUp ? "↑ " : "↓ "} {k.change}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-3">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-blue-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">My Activity Trend</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Quotations</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Invoices</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Payments</span>
            </div>
          </div>
          <svg viewBox="0 0 500 170" className="w-full h-44 overflow-visible">
            {[0, 30, 60, 90, 120].map((y, idx) => (
              <line key={idx} x1="30" y1={y} x2="490" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <text x="20" y="125" fontSize="9" fill="#94a3b8" textAnchor="end">0</text>
            <text x="20" y="95" fontSize="9" fill="#94a3b8" textAnchor="end">10</text>
            <text x="20" y="65" fontSize="9" fill="#94a3b8" textAnchor="end">20</text>
            <text x="20" y="35" fontSize="9" fill="#94a3b8" textAnchor="end">30</text>
            <text x="20" y="5" fontSize="9" fill="#94a3b8" textAnchor="end">40</text>

            <path d="M 50 115 C 100 105, 150 90, 200 80 C 250 70, 300 50, 350 45 C 400 35, 450 30, 480 20" fill="none" stroke="#2563EB" strokeWidth="2.5" />
            <path d="M 50 120 C 100 115, 150 100, 200 90 C 250 80, 300 70, 350 60 C 400 50, 450 45, 480 40" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
            <path d="M 50 125 C 100 120, 150 115, 200 110 C 250 100, 300 95, 350 90 C 400 85, 450 80, 480 75" fill="none" stroke="#10B981" strokeWidth="2.5" />

            {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => (
              <text key={m} x={50 + i * 86} y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* Donut Chart: Work Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-blue-200/80 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Work Summary</h2>
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 -rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#2563EB" strokeWidth="20" strokeDasharray="184 377" strokeDashoffset="0" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#3B82F6" strokeWidth="20" strokeDasharray="139 377" strokeDashoffset="-184" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="54 377" strokeDashoffset="-323" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">49</span>
              <span className="text-xs text-gray-400 font-medium">Total</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600 mt-2">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Quotations</span><span className="font-semibold text-gray-800">24 (49%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Invoices</span><span className="font-semibold text-gray-800">18 (37%)</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Payments</span><span className="font-semibold text-gray-800">7 (14%)</span></div>
          </div>
        </div>
      </div>

      {/* Other Staff Features */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3 tracking-tight">Other Staff Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/staff/tasks" className="bg-white p-5 rounded-2xl shadow-xs border border-blue-200/80 hover:border-blue-300 transition group">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-105 transition">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-gray-900">Notifications</h3>
            <p className="text-[11px] text-gray-500 mt-1">Get alerts for tasks, renewals and important updates.</p>
          </Link>

          <div
            onClick={() => toast.info("Opening Staff Audit & Activity logs")}
            className="bg-white p-5 rounded-2xl shadow-xs border border-blue-200/80 hover:border-blue-300 transition group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-3 group-hover:scale-105 transition">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-gray-900">Activity History</h3>
            <p className="text-[11px] text-gray-500 mt-1">View and track your actions and changes.</p>
          </div>

          <Link href="/staff/discounts" className="bg-white p-5 rounded-2xl shadow-xs border border-blue-200/80 hover:border-blue-300 transition group">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-gray-900">Discounts</h3>
            <p className="text-[11px] text-gray-500 mt-1">View available discounts and apply eligible offers.</p>
          </Link>

          <Link href="/staff/taxes" className="bg-white p-5 rounded-2xl shadow-xs border border-blue-200/80 hover:border-blue-300 transition group">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-gray-900">Taxes</h3>
            <p className="text-[11px] text-gray-500 mt-1">View applicable tax rules and rates.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
