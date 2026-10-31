"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/export/csv";

export default function StaffInvoicesPage() {
  const [invoices, setInvoices] = useState([
    { id: "INV-01457", customer: "Acme Corp", amount: "₹18,000", dueDate: "Nov 05, 2026", status: "Paid", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { id: "INV-01456", customer: "Beta Solutions", amount: "₹2,36,000", dueDate: "Nov 03, 2026", status: "Partially Paid", statusColor: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "INV-01455", customer: "Metro Digital", amount: "₹1,00,000", dueDate: "Nov 02, 2026", status: "Overdue", statusColor: "bg-red-100 text-red-700 border-red-200" },
    { id: "INV-01454", customer: "Sunrise Tech", amount: "₹3,54,000", dueDate: "Nov 10, 2026", status: "Paid", statusColor: "bg-green-100 text-green-700 border-green-200" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = inv.id.toLowerCase().includes(search.toLowerCase()) || inv.customer.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleDownload = (inv: typeof invoices[0]) => {
    const data = [
      {
        "Invoice No": inv.id,
        "Customer": inv.customer,
        "Amount": inv.amount,
        "Due Date": inv.dueDate,
        "Status": inv.status,
        "Currency": "INR",
        "Issue Date": "Nov 01, 2026",
      },
    ];
    downloadCSV(inv.id, data);
    toast.success(`Downloaded ${inv.id}.csv!`);
  };

  const handleExportAll = () => {
    const data = filtered.map(inv => ({
      "Invoice No": inv.id,
      "Customer": inv.customer,
      "Amount": inv.amount,
      "Due Date": inv.dueDate,
      "Status": inv.status,
      "Currency": "INR",
      "Issue Date": "Nov 01, 2026",
    }));
    downloadCSV("staff_invoices_report", data);
    toast.success("Downloaded all invoices as CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-500 text-xs mt-1">Create or send invoices from subscriptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus size={15} />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-violet-500"
          >
            <option value="All">Status: All</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Invoice No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#7C3AED]">{inv.id}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{inv.customer}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{inv.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${inv.statusColor}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDownload(inv)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-[#7C3AED] hover:bg-violet-50 transition border border-transparent hover:border-violet-200"
                      title="Download as CSV"
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Create Staff Invoice</h2>
            <p className="text-xs text-gray-500 mb-4">Generate invoice bill for customer.</p>
            <button
              onClick={() => {
                toast.success("Invoice generated and sent to client!");
                setShowAddModal(false);
              }}
              className="w-full bg-[#7C3AED] text-white py-2.5 rounded-xl text-xs font-semibold mb-2 shadow-sm"
            >
              Generate &amp; Send
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
