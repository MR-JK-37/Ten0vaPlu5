"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  CheckCircle,
  IndianRupee,
  FileText,
  Shield,
  Download,
  CreditCard,
  ArrowLeftRight,
  Eye,
  Bell,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function PortalDashboardPage() {
  const [renewed, setRenewed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const infoCards = [
    { label: "Current Product", value: "Bright Billing Software", icon: Package, iconBg: "bg-violet-50 text-violet-600" },
    { label: "Subscription Plan", value: "Monthly", icon: Calendar, iconBg: "bg-orange-50 text-orange-600" },
    { label: "Subscription Status", value: "Active", icon: CheckCircle, iconBg: "bg-green-50 text-green-600", valueClass: "text-green-600 font-semibold" },
    { label: "Monthly Price", value: "₹1,000", icon: IndianRupee, iconBg: "bg-amber-50 text-amber-600" },
    { label: "Next Billing Date", value: renewed ? "Jan 01, 2027" : "Dec 01, 2026", icon: Calendar, iconBg: "bg-blue-50 text-blue-600" },
    { label: "Latest Invoice", value: "₹1,180", icon: FileText, iconBg: "bg-purple-50 text-purple-600" },
    { label: "Outstanding Balance", value: "₹0", icon: Shield, iconBg: "bg-emerald-50 text-emerald-600", valueClass: "text-emerald-600 font-semibold" },
  ];

  const latestInvoices = [
    { no: "INV-01457", date: "Nov 05, 2026", amount: "₹1,180", status: "Paid" },
    { no: "INV-01456", date: "Oct 05, 2026", amount: "₹1,180", status: "Paid" },
    { no: "INV-01455", date: "Sep 05, 2026", amount: "₹1,180", status: "Paid" },
  ];

  const recentPayments = [
    { no: "PAY-02891", date: "Nov 05, 2026", amount: "₹1,180", method: "UPI", status: "Success" },
    { no: "PAY-02890", date: "Oct 05, 2026", amount: "₹1,180", method: "Card", status: "Success" },
    { no: "PAY-02889", date: "Sep 05, 2026", amount: "₹1,180", method: "UPI", status: "Success" },
  ];

  const notifications = [
    { text: "Invoice INV-01457 is now paid.", date: "Nov 05, 2026", icon: CheckCircle, iconColor: "text-green-500", iconBg: "bg-green-50" },
    { text: "Your subscription will renew on Dec 01, 2026.", date: "Nov 01, 2026", icon: Calendar, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
    { text: "New offer: 10% off on yearly plan!", date: "Oct 28, 2026", icon: Bell, iconColor: "text-orange-500", iconBg: "bg-orange-50" },
  ];

  const handleDownloadInvoice = (invNo: string) => {
    toast.success(`Downloading PDF for ${invNo}...`);
  };

  const handleRenew = () => {
    setRenewed(true);
    toast.success("Subscription successfully renewed until Jan 01, 2027!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good Morning, Rahul! 👋</h1>
        <p className="mt-1 text-xs text-gray-500">
          Welcome to your customer portal. Manage your subscriptions, invoices and payments.
        </p>
      </div>

      {/* 7 KPI Cards with Outlines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {infoCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-xs border border-violet-200/80 flex flex-col justify-between hover:border-violet-300 transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-base font-bold text-gray-900 truncate ${card.valueClass || ""}`}>{card.value}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Payment & Billing Overview, Renewal Reminder, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment & Billing Overview (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Payment &amp; Billing Overview</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Billed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> Paid</span>
            </div>
          </div>
          <svg viewBox="0 0 500 170" className="w-full h-44 overflow-visible">
            {[0, 32, 64, 96, 128].map((y, idx) => (
              <line key={idx} x1="45" y1={y} x2="490" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <text x="35" y="132" fontSize="9" fill="#94a3b8" textAnchor="end">₹0</text>
            <text x="35" y="100" fontSize="9" fill="#94a3b8" textAnchor="end">₹300</text>
            <text x="35" y="68" fontSize="9" fill="#94a3b8" textAnchor="end">₹600</text>
            <text x="35" y="36" fontSize="9" fill="#94a3b8" textAnchor="end">₹900</text>
            <text x="35" y="10" fontSize="9" fill="#94a3b8" textAnchor="end">₹1.5K</text>

            {/* Billed line (blue) */}
            <path
              d="M 60 125 C 130 110, 200 85, 270 75 C 340 65, 410 40, 480 25"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
            {/* Paid line (violet) */}
            <path
              d="M 60 128 C 130 115, 200 90, 270 80 C 340 70, 410 45, 480 25"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
            />
            {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, idx) => (
              <text key={m} x={60 + idx * 84} y="150" fontSize="10" fill="#94a3b8" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        {/* Renewal Reminder (3 cols) */}
        <div className="lg:col-span-3 bg-violet-50/50 rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-[#7C3AED]">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Renewal Reminder</h2>
            </div>
            <p className="text-xs text-gray-600">Your subscription will renew on</p>
            <p className="text-xl font-extrabold text-[#7C3AED] mt-1">{renewed ? "Jan 01, 2027" : "Dec 01, 2026"}</p>
            <p className="text-xs text-gray-500 mt-1">Amount: <span className="font-bold text-gray-800">₹1,180</span> (incl. tax)</p>
          </div>
          <div className="mt-5">
            <button
              onClick={handleRenew}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition active:scale-95"
            >
              {renewed ? "✓ Renewed" : "Renew Now"}
            </button>
          </div>
        </div>

        {/* Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80 flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleDownloadInvoice("INV-01457")}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-violet-100 bg-violet-50/20 hover:bg-violet-50 hover:border-violet-300 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700">Download Latest Invoice</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-violet-100 bg-violet-50/20 hover:bg-violet-50 hover:border-violet-300 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700">Make a Payment</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
            </button>

            <Link
              href="/portal/plans"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-violet-100 bg-violet-50/20 hover:bg-violet-50 hover:border-violet-300 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700">Change Plan</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
            </Link>

            <Link
              href="/portal/subscriptions"
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-violet-100 bg-violet-50/20 hover:bg-violet-50 hover:border-violet-300 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-semibold text-gray-700 group-hover:text-violet-700">View My Subscription</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Latest Invoices, Recent Payments, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Invoices */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Latest Invoices</h2>
            <Link href="/portal/invoices" className="text-xs font-semibold text-violet-600 hover:text-violet-700">View All →</Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Invoice No.</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {latestInvoices.map((inv, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 font-bold text-gray-900">{inv.no}</td>
                  <td className="py-2.5 text-gray-500 font-medium">{inv.date}</td>
                  <td className="py-2.5 font-bold text-gray-900">{inv.amount}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv.no)}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#7C3AED] hover:bg-violet-50 transition"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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
            <Link href="/portal/payments" className="text-xs font-semibold text-violet-600 hover:text-violet-700">View All →</Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100">
                <th className="pb-2">Payment No.</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Method</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentPayments.map((pay, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="py-2.5 font-bold text-gray-900">{pay.no}</td>
                  <td className="py-2.5 text-gray-500 font-medium">{pay.date}</td>
                  <td className="py-2.5 font-bold text-[#7C3AED]">{pay.amount}</td>
                  <td className="py-2.5 text-gray-600 font-medium">{pay.method}</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
            <button
              onClick={() => toast.info("All notifications are up to date")}
              className="text-xs font-semibold text-violet-600 hover:text-violet-700"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2.5">
            {notifications.map((n, i) => {
              const Icon = n.icon;
              return (
                <div
                  key={i}
                  onClick={() => toast.info(n.text)}
                  className="flex items-start gap-2.5 p-2 rounded-xl border border-violet-100/70 bg-violet-50/20 hover:bg-violet-50 cursor-pointer transition"
                >
                  <div className={`w-6 h-6 rounded-lg ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-800 font-semibold leading-snug">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[#7C3AED] flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Make a Payment</h2>
            <p className="text-xs text-gray-500 mb-4">Subscription Billing Amount: <strong className="text-gray-900">₹1,180</strong></p>
            <div className="space-y-2 mb-4 text-left text-xs">
              <button
                onClick={() => {
                  toast.success("Payment of ₹1,180 completed via UPI!");
                  setShowPaymentModal(false);
                }}
                className="w-full p-2.5 rounded-xl border border-violet-200 hover:bg-violet-50 font-semibold text-gray-800 flex items-center justify-between transition"
              >
                <span>Instant UPI (GPay / PhonePe / Paytm)</span>
                <span className="text-violet-600 font-bold">Pay ₹1,180</span>
              </button>
              <button
                onClick={() => {
                  toast.success("Payment of ₹1,180 completed via Card!");
                  setShowPaymentModal(false);
                }}
                className="w-full p-2.5 rounded-xl border border-violet-200 hover:bg-violet-50 font-semibold text-gray-800 flex items-center justify-between transition"
              >
                <span>Credit / Debit Card</span>
                <span className="text-violet-600 font-bold">Pay ₹1,180</span>
              </button>
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
