"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([
    { id: "SUB-1057", customer: "Acme Corp", plan: "Business", startDate: "Nov 01, 2025", nextBilling: "Dec 01, 2025", status: "Active", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { id: "SUB-1056", customer: "Beta Solutions", plan: "Pro", startDate: "Oct 15, 2025", nextBilling: "Nov 15, 2025", status: "Active", statusColor: "bg-green-100 text-green-700 border-green-200" },
    { id: "SUB-1055", customer: "Metro Digital", plan: "Business", startDate: "Oct 10, 2025", nextBilling: "Nov 10, 2025", status: "Paused", statusColor: "bg-orange-100 text-orange-700 border-orange-200" },
    { id: "SUB-1054", customer: "Sunrise Tech", plan: "Enterprise", startDate: "Sep 01, 2025", nextBilling: "Oct 01, 2025", status: "Active", statusColor: "bg-green-100 text-green-700 border-green-200" },
  ]);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase());
      const matchPlan = planFilter === "All" || s.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [subscriptions, search, planFilter]);

  const togglePause = (id: string) => {
    setSubscriptions(subscriptions.map(s => {
      if (s.id === id) {
        const next = s.status === "Active" ? "Paused" : "Active";
        const color = next === "Active" ? "bg-green-100 text-green-700 border-green-200" : "bg-orange-100 text-orange-700 border-orange-200";
        toast.info(`Subscription ${id} is now ${next}`);
        return { ...s, status: next, statusColor: color };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 text-xs mt-1">Manage subscription lifecycles, billing frequency and automated renewal rules.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Subscription</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-violet-500"
          >
            <option value="All">Plan: All</option>
            <option value="Business">Business</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Sub. No.</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">Next Billing</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-[#7C3AED]">{s.id}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{s.customer}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{s.plan}</td>
                  <td className="px-5 py-3.5 text-gray-500">{s.startDate}</td>
                  <td className="px-5 py-3.5 text-gray-500">{s.nextBilling}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => togglePause(s.id)}
                      className="px-2.5 py-1 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 text-[11px] font-semibold transition border border-violet-200/70"
                    >
                      {s.status === "Active" ? "Pause" : "Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Add Subscription</h2>
            <p className="text-xs text-gray-500 mb-4">Enroll customer into a recurring plan.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Subscription SUB-1058 enrolled successfully!");
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
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Plan</label>
                <select className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500">
                  <option>Business</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                  <option>Starter</option>
                </select>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
                >
                  Create Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
