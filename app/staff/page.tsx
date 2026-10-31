"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  RefreshCw,
  Receipt,
  AlertTriangle,
  Calendar,
  CheckSquare,
  Clock,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function StaffDashboardPage() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Follow up with Beta Solutions (Invoice INV-01456)", tag: "Overdue", tagColor: "bg-red-100 text-red-700 border-red-200", done: false },
    { id: 2, text: "Send quotation to GreenLeaf Co.", tag: "Today", tagColor: "bg-blue-100 text-blue-700 border-blue-200", done: false },
    { id: 3, text: "Confirm subscription for Metro Digital", tag: "Today", tagColor: "bg-blue-100 text-blue-700 border-blue-200", done: false },
    { id: 4, text: "Payment follow-up – Sunrise Tech (₹3,540)", tag: "Tomorrow", tagColor: "bg-orange-100 text-orange-700 border-orange-200", done: false },
    { id: 5, text: "Prepare renewal for Nova Systems", tag: "Nov 07", tagColor: "bg-purple-100 text-purple-700 border-purple-200", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const next = !t.done;
        if (next) toast.success(`Task completed: "${t.text}"`);
        else toast.info(`Task reopened: "${t.text}"`);
        return { ...t, done: next };
      }
      return t;
    }));
  };

  const stats = [
    { label: "Customers Assigned", value: "85", icon: Users, bg: "bg-violet-50 text-violet-600" },
    { label: "Quotations Awaiting Response", value: "12", icon: FileText, bg: "bg-amber-50 text-amber-600" },
    { label: "Active Subscriptions", value: "60", icon: RefreshCw, bg: "bg-emerald-50 text-emerald-600" },
    { label: "Invoices Pending Payment", value: "18", icon: Receipt, bg: "bg-blue-50 text-blue-600" },
    { label: "Overdue Invoices", value: "7", icon: AlertTriangle, bg: "bg-red-50 text-red-600" },
    { label: "Upcoming Renewals", value: "10", icon: Calendar, bg: "bg-indigo-50 text-indigo-600" },
    { label: "Tasks Requiring Attention", value: "5", icon: CheckSquare, bg: "bg-pink-50 text-pink-600" },
  ];

  const enquiries = [
    { name: "Rahul Mehta", enquiry: "Subscription details", time: "10:24 AM", status: "New", statusColor: "bg-amber-100 text-amber-700 border-amber-200" },
    { name: "Karan Verma", enquiry: "Plan upgrade request", time: "09:47 AM", status: "In Progress", statusColor: "bg-blue-100 text-blue-700 border-blue-200" },
    { name: "Neha Arora", enquiry: "Renewal & pricing", time: "Yesterday", status: "Replied", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { name: "Amit Joshi", enquiry: "Add more users", time: "Yesterday", status: "New", statusColor: "bg-amber-100 text-amber-700 border-amber-200" },
  ];

  const recentPayments = [
    { customer: "Acme Corp", amount: "₹1,18,000", method: "UPI", date: "Oct 31, 2026" },
    { customer: "Beta Solutions", amount: "₹70,000", method: "Bank Transfer", date: "Oct 30, 2026" },
    { customer: "Metro Digital", amount: "₹1,60,000", method: "UPI", date: "Oct 30, 2026" },
    { customer: "Sunrise Tech", amount: "₹50,000", method: "Card", date: "Oct 29, 2026" },
  ];

  const upcomingRenewals = [
    { customer: "Nova Systems", plan: "Pro (Monthly)", date: "Nov 03, 2026" },
    { customer: "GreenLeaf Co.", plan: "Business (Yearly)", date: "Nov 05, 2026" },
    { customer: "Pixel Labs", plan: "Pro (Monthly)", date: "Nov 07, 2026" },
    { customer: "CloudSync", plan: "Enterprise (Yearly)", date: "Nov 10, 2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good Morning, Priya! 👋</h1>
          <p className="text-gray-500 text-xs mt-1">Here&apos;s your daily work overview and assigned accounts.</p>
        </div>
        <button
          onClick={() => toast.success("Work overview refreshed")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-violet-200/80 hover:bg-violet-50 text-gray-700 shadow-xs transition"
        >
          <RefreshCw size={13} className="text-violet-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 7 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-xs border border-violet-200/80 flex flex-col justify-between hover:border-violet-300 transition"
            >
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3 shrink-0`}>
                <Icon size={16} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Work Overview Chart + My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Work Overview Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Work Overview</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Quotations</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Invoices</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Payments</span>
            </div>
          </div>
          <svg viewBox="0 0 500 170" className="w-full h-44 overflow-visible">
            {[0, 30, 60, 90, 120].map((y, idx) => (
              <line key={idx} x1="35" y1={y} x2="490" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <text x="25" y="125" fontSize="9" fill="#94a3b8" textAnchor="end">10</text>
            <text x="25" y="95" fontSize="9" fill="#94a3b8" textAnchor="end">20</text>
            <text x="25" y="65" fontSize="9" fill="#94a3b8" textAnchor="end">30</text>
            <text x="25" y="35" fontSize="9" fill="#94a3b8" textAnchor="end">40</text>
            <text x="25" y="5" fontSize="9" fill="#94a3b8" textAnchor="end">50</text>

            {/* Quotations: Purple line */}
            <path d="M 50 115 C 120 110, 190 95, 260 70 C 330 65, 400 45, 480 35" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            {/* Invoices: Blue line */}
            <path d="M 50 120 C 120 115, 190 102, 260 85 C 330 80, 400 60, 480 50" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
            {/* Payments: Green line */}
            <path d="M 50 125 C 120 122, 190 112, 260 100 C 330 92, 400 80, 480 70" fill="none" stroke="#10B981" strokeWidth="2.5" />

            {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, idx) => (
              <text key={m} x={50 + idx * 86} y="145" fontSize="10" fill="#94a3b8" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* My Tasks Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">My Tasks ({tasks.filter(t => !t.done).length})</h2>
            <Link href="/staff/tasks" className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                  task.done
                    ? "bg-gray-50/70 border-gray-100 opacity-60"
                    : "bg-violet-50/30 border-violet-100 hover:border-violet-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}} // handled by parent onClick
                    className="w-4 h-4 rounded text-violet-600 border-violet-300 focus:ring-violet-400 cursor-pointer"
                  />
                  <span className={`text-xs font-medium truncate ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {task.text}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ml-2 ${task.tagColor}`}>
                  {task.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Enquiries, Payments, Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Enquiries */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Customer Enquiries</h2>
            <button onClick={() => toast.info("Opening customer enquiry logs")} className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All →
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Enquiry</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {enquiries.map((e, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 font-bold text-gray-900">{e.name}</td>
                  <td className="py-2.5 text-gray-500 truncate max-w-[120px]">{e.enquiry}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${e.statusColor}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent Payments</h2>
            <Link href="/staff/payments" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              View All →
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2 text-right">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentPayments.map((p, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 font-bold text-gray-900">{p.customer}</td>
                  <td className="py-2.5 font-bold text-violet-700">{p.amount}</td>
                  <td className="py-2.5 text-right text-gray-500 font-medium">{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Upcoming Renewals (10)</h2>
            <Link href="/staff/subscriptions" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
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
                  <td className="py-2.5 font-bold text-gray-900">{r.customer}</td>
                  <td className="py-2.5 text-gray-500 font-medium">{r.plan}</td>
                  <td className="py-2.5 text-right font-bold text-violet-700">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
