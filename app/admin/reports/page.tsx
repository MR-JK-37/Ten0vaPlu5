"use client";

import { useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("Oct 01, 2026 – Oct 31, 2026");

  const handleRefresh = () => {
    toast.success("Financial reports refreshed with latest billing runs");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-500 text-xs mt-1">View comprehensive business summaries, revenue trends and plan performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="font-semibold">{period}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-xl border border-violet-200/80 bg-white hover:bg-violet-50 text-gray-600 hover:text-violet-700 transition shadow-xs"
            title="Refresh metrics"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 hover:border-violet-300 transition">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Billed Amount</span>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">₹82,40,000</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 hover:border-violet-300 transition">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Collected</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹66,20,000</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 hover:border-violet-300 transition">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Outstanding</span>
          <div className="text-2xl font-extrabold text-red-500 mt-1">₹16,20,000</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 hover:border-violet-300 transition">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Net Growth</span>
          <div className="text-2xl font-extrabold text-[#7C3AED] mt-1">₹5,80,000</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Revenue Trend</h2>
          </div>
          <svg viewBox="0 0 500 170" className="w-full h-44 overflow-visible">
            {[0, 32, 64, 96, 128].map((y, idx) => (
              <line key={idx} x1="45" y1={y} x2="490" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <text x="35" y="132" fontSize="9" fill="#94a3b8" textAnchor="end">₹0</text>
            <text x="35" y="100" fontSize="9" fill="#94a3b8" textAnchor="end">₹20L</text>
            <text x="35" y="68" fontSize="9" fill="#94a3b8" textAnchor="end">₹40L</text>
            <text x="35" y="36" fontSize="9" fill="#94a3b8" textAnchor="end">₹80L</text>
            <text x="35" y="10" fontSize="9" fill="#94a3b8" textAnchor="end">₹1.0Cr</text>

            <defs>
              <linearGradient id="adminReportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 60 128 C 130 120, 200 110, 270 95 C 340 85, 410 50, 480 30 L 480 128 L 60 128 Z"
              fill="url(#adminReportGrad)"
            />
            <path
              d="M 60 128 C 130 120, 200 110, 270 95 C 340 85, 410 50, 480 30"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
            />
            {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, idx) => (
              <text key={m} x={60 + idx * 84} y="150" fontSize="10" fill="#94a3b8" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* Revenue by Plan Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Revenue by Plan</h2>
          <div className="relative flex items-center justify-center py-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 -rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="#7C3AED" strokeWidth="20" strokeDasharray="158 377" strokeDashoffset="0" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="132 377" strokeDashoffset="-158" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="50 377" strokeDashoffset="-290" />
              <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="37 377" strokeDashoffset="-340" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-900">₹82.4L</span>
              <span className="text-[10px] text-gray-400">Total</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600 mt-2">
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Business</span><span className="font-semibold text-gray-800">42%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Pro</span><span className="font-semibold text-gray-800">35%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Enterprise</span><span className="font-semibold text-gray-800">13%</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Starter</span><span className="font-semibold text-gray-800">10%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
