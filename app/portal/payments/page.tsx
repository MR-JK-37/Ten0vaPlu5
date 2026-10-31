"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function PortalPaymentsPage() {
  const payments = [
    { id: "PAY-02891", date: "Nov 05, 2026", invoice: "INV-01457", amount: "₹1,180", method: "UPI", status: "Success" },
    { id: "PAY-02890", date: "Oct 05, 2026", invoice: "INV-01456", amount: "₹1,180", method: "Card", status: "Success" },
    { id: "PAY-02889", date: "Sep 05, 2026", invoice: "INV-01455", amount: "₹1,180", method: "UPI", status: "Success" },
  ];

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.invoice.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === "All" || p.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Payments</h1>
        <p className="mt-1 text-xs text-gray-500">
          View your payment settlement history, transaction IDs and processing receipts.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments by ID or invoice..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-violet-500"
          >
            <option value="All">Method: All</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Payment No.</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#7C3AED]">{p.id}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{p.date}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-semibold">{p.invoice}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{p.amount}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{p.method}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
