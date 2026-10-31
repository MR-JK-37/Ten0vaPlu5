"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

export default function StaffPaymentsPage() {
  const [payments, setPayments] = useState([
    { id: "PAY-02891", invoice: "INV-01457", customer: "Acme Corp", amount: "₹1,18,000", method: "UPI", status: "Success" },
    { id: "PAY-02890", invoice: "INV-01456", customer: "Beta Solutions", amount: "₹70,000", method: "Bank Transfer", status: "Success" },
    { id: "PAY-02889", invoice: "INV-01455", customer: "Metro Digital", amount: "₹1,60,000", method: "UPI", status: "Success" },
    { id: "PAY-02888", invoice: "INV-01454", customer: "Sunrise Tech", amount: "₹50,000", method: "Card", status: "Success" },
  ]);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase()) || p.invoice.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === "All" || p.method === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-gray-500 text-xs mt-1">Record and track customer payment collections.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-blue-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-blue-100 bg-blue-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">Method: All</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Payment No.</th>
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#2563EB]">{p.id}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{p.invoice}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{p.customer}</td>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Record Staff Payment</h2>
            <p className="text-xs text-gray-500 mb-4">Acknowledge customer remittance.</p>
            <button
              onClick={() => {
                toast.success("Payment recorded successfully!");
                setShowAddModal(false);
              }}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-xs font-semibold mb-2 shadow-sm"
            >
              Confirm Payment
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 font-medium py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
