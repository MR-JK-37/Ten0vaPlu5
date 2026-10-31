"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState([
    { id: "QTN-0258", customer: "Acme Corp", amount: "₹1,18,000", validTill: "Nov 10, 2026", status: "Accepted", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { id: "QTN-0257", customer: "Beta Solutions", amount: "₹2,36,000", validTill: "Nov 08, 2026", status: "Sent", statusColor: "bg-blue-100 text-blue-700 border-blue-200" },
    { id: "QTN-0256", customer: "GreenLeaf Co.", amount: "₹59,000", validTill: "Nov 07, 2026", status: "Draft", statusColor: "bg-gray-100 text-gray-700 border-gray-200" },
    { id: "QTN-0255", customer: "Pixel Labs", amount: "₹1,77,000", validTill: "Nov 05, 2026", status: "Expired", statusColor: "bg-red-100 text-red-700 border-red-200" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch = q.id.toLowerCase().includes(search.toLowerCase()) || q.customer.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotations, search, statusFilter]);

  const handleDelete = (id: string) => {
    setQuotations(quotations.filter(q => q.id !== id));
    toast.success(`Quotation ${id} deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-gray-500 text-xs mt-1">Create, send and track customer price estimates and proposals.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Create Quotation</span>
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
            <option value="Accepted">Accepted</option>
            <option value="Sent">Sent</option>
            <option value="Draft">Draft</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Quote No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Valid Till</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#2563EB]">{q.id}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{q.customer}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{q.amount}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{q.validTill}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${q.statusColor}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toast.info(`Viewing quote: ${q.id}`)}
                        className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Quotation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Create Quotation</h2>
            <p className="text-xs text-gray-500 mb-4">Prepare an offer for customer review.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Quotation QTN-0260 created and dispatched!");
                setShowAddModal(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Customer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Amount (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1,50,000"
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Valid Till</label>
                  <input
                    type="text"
                    defaultValue="Nov 20, 2026"
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                >
                  Send Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
