"use client";

import { useState, useMemo } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    { id: 1, name: "Acme Corp", email: "contact@acme.in", contact: "+91 98765 43210", subscriptions: 5, status: "Active" },
    { id: 2, name: "Beta Solutions", email: "hello@beta.in", contact: "+91 98765 43211", subscriptions: 3, status: "Active" },
    { id: 3, name: "Metro Digital", email: "info@metro.in", contact: "+91 98765 43212", subscriptions: 2, status: "Active" },
    { id: 4, name: "Sunrise Tech", email: "support@sunrise.in", contact: "+91 98765 43213", subscriptions: 4, status: "Active" },
    { id: 5, name: "Nova Systems", email: "sales@nova.in", contact: "+91 98765 43214", subscriptions: 6, status: "Active" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activePage, setActivePage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", contact: "", subscriptions: "1" });

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, search, statusFilter]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please provide both name and email");
      return;
    }
    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      contact: formData.contact || "+91 98765 43200",
      subscriptions: parseInt(formData.subscriptions) || 1,
      status: "Active",
    };
    setCustomers([newCustomer, ...customers]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", contact: "", subscriptions: "1" });
    toast.success(`Customer "${newCustomer.name}" created successfully!`);
  };

  const handleDelete = (name: string, id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
    toast.success(`Customer "${name}" removed`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 text-xs mt-1">Manage customer accounts, billing profiles and assigned plans.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Main Table Card with Outline */}
      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/70 rounded-xl bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-violet-200/70 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-violet-500"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Customer Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3 text-center">Subscriptions</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="text-xs hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{c.email}</td>
                  <td className="px-5 py-3.5 text-gray-600">{c.contact}</td>
                  <td className="px-5 py-3.5 text-center font-semibold text-gray-800">{c.subscriptions}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toast.info(`Viewing customer profile: ${c.name}`)}
                        className="px-2.5 py-1 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 text-[11px] font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.name, c.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete customer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-gray-400">
                    No customers found matching &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-violet-100 bg-gray-50/30 text-xs text-gray-500">
          <span>Showing 1–{filtered.length} of 248</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setActivePage(p);
                  toast.info(`Switched to page ${p}`);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                  activePage === p
                    ? "bg-[#7C3AED] text-white"
                    : "border border-violet-200 text-gray-700 hover:bg-violet-50"
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-1 text-gray-400">...</span>
            <button
              onClick={() => {
                setActivePage(50);
                toast.info("Switched to page 50");
              }}
              className="w-7 h-7 rounded-lg border border-violet-200 text-xs text-gray-700 hover:bg-violet-50 font-semibold"
            >
              50
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Add New Customer</h2>
            <p className="text-xs text-gray-500 mb-4">Enter customer account and contact information.</p>
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Innovations Ltd."
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. billing@acme.in"
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm transition"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
