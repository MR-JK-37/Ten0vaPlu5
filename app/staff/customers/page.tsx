"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Acme Corp", initials: "AC", email: "contact@acme.in", contact: "+91 98765 43210", subscriptions: 5, status: "Active" },
    { id: 2, name: "Beta Solutions", initials: "BS", email: "hello@beta.in", contact: "+91 98765 43211", subscriptions: 3, status: "Active" },
    { id: 3, name: "Metro Digital", initials: "MD", email: "info@metro.in", contact: "+91 98765 43212", subscriptions: 2, status: "Active" },
    { id: 4, name: "Sunrise Tech", initials: "ST", email: "support@sunrise.in", contact: "+91 98765 43213", subscriptions: 4, status: "Active" },
    { id: 5, name: "Nova Systems", initials: "NS", email: "sales@nova.in", contact: "+91 98765 43214", subscriptions: 6, status: "Active" },
  ]);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: "", email: "", contact: "" });

  const filtered = useMemo(() => {
    return customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  }, [customers, search]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.email) {
      toast.error("Please enter customer name and email");
      return;
    }
    const created = {
      id: Date.now(),
      name: newCust.name,
      initials: newCust.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "NC",
      email: newCust.email,
      contact: newCust.contact || "+91 98765 43200",
      subscriptions: 1,
      status: "Active",
    };
    setCustomers([created, ...customers]);
    setShowAddModal(false);
    setNewCust({ name: "", email: "", contact: "" });
    toast.success(`Assigned customer "${created.name}" created!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 text-xs mt-1">Manage your assigned client accounts and contacts.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Customer</span>
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
              placeholder="Search assigned customers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            Assigned to Me
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Customer Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3 text-center">Subscriptions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
                        {c.initials}
                      </span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{c.contact}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-gray-800">{c.subscriptions}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toast.info(`Viewing account history: ${c.name}`)}
                      className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold transition border border-blue-200/70"
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

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Add Assigned Customer</h2>
            <p className="text-xs text-gray-500 mb-4">Register a customer under your staff account portfolio.</p>
            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Customer / Company Name</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Apex Tech Ltd"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newCust.email}
                  onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                  placeholder="e.g. contact@apex.in"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={newCust.contact}
                  onChange={(e) => setNewCust({ ...newCust, contact: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
