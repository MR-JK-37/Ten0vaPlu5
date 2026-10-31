"use client";

import { useState, useMemo } from "react";
import { Search, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PortalInvoicesPage() {
  const invoices = [
    { id: "INV-01457", date: "Nov 05, 2026", amount: "₹1,180", dueDate: "Nov 05, 2026", status: "Paid" },
    { id: "INV-01456", date: "Oct 05, 2026", amount: "₹1,180", dueDate: "Oct 05, 2026", status: "Paid" },
    { id: "INV-01455", date: "Sep 05, 2026", amount: "₹1,180", dueDate: "Sep 05, 2026", status: "Paid" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = inv.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleDownload = (id: string) => {
    toast.success(`Generated official PDF tax invoice for ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Invoices</h1>
        <p className="mt-1 text-xs text-gray-500">
          View, download and print your monthly tax invoices and payment receipts.
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
              placeholder="Search invoices..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-blue-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">Status: All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#2563EB]">{inv.id}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{inv.date}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-5 py-3.5 text-gray-500">{inv.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDownload(inv.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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
