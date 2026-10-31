"use client";

import { useState, useMemo } from "react";
import { Search, X, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function PortalQuotationsPage() {
  const [quotations, setQuotations] = useState([
    { id: "QTN-0258", date: "Nov 01, 2026", product: "Bright Billing (Monthly)", amount: "₹1,000", status: "Sent", statusColor: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "QTN-0257", date: "Oct 28, 2026", product: "Bright CRM (Monthly)", amount: "₹1,500", status: "Accepted", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { id: "QTN-0256", date: "Oct 20, 2026", product: "Bright HR (Monthly)", amount: "₹2,000", status: "Expired", statusColor: "bg-red-100 text-red-700 border-red-200" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedQuote, setSelectedQuote] = useState<typeof quotations[0] | null>(null);

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch = q.id.toLowerCase().includes(search.toLowerCase()) || q.product.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotations, search, statusFilter]);

  const handleAcceptQuote = (id: string) => {
    setQuotations(quotations.map(q => q.id === id ? { ...q, status: "Accepted", statusColor: "bg-green-100 text-green-700 border-green-200" } : q));
    toast.success(`Quotation ${id} accepted successfully!`);
    setSelectedQuote(null);
  };

  const handleRejectQuote = (id: string) => {
    setQuotations(quotations.map(q => q.id === id ? { ...q, status: "Declined", statusColor: "bg-gray-100 text-gray-700 border-gray-200" } : q));
    toast.info(`Quotation ${id} declined.`);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotations</h1>
        <p className="mt-1 text-xs text-gray-500">
          Review formal offers, approve pricing schedules, or accept quotations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-blue-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-blue-100 bg-blue-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">Status: All</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Quote No.</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Product / Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#2563EB]">{q.id}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{q.date}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-semibold">{q.product}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{q.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${q.statusColor}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedQuote(q)}
                      className="px-3 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-semibold border border-blue-200/70 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Review Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedQuote(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Quotation {selectedQuote.id}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedQuote.statusColor}`}>
                  {selectedQuote.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 space-y-2 text-xs mb-5 border border-gray-100">
              <div className="flex justify-between"><span className="text-gray-500">Service / Plan:</span><span className="font-bold text-gray-900">{selectedQuote.product}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Issuing Date:</span><span className="font-semibold text-gray-800">{selectedQuote.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Quotation Total:</span><span className="font-bold text-[#2563EB] text-sm">{selectedQuote.amount}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
              {selectedQuote.status === "Sent" && (
                <>
                  <button
                    onClick={() => handleRejectQuote(selectedQuote.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptQuote(selectedQuote.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                  >
                    Accept Quotation
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
