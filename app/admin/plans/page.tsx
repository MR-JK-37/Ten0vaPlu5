"use client";

import { useState } from "react";
import { Plus, Check, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const [activeTab, setActiveTab] = useState("All Plans");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Starter",
      price: "₹499 / month",
      type: "Monthly",
      isPopular: false,
      features: ["Up to 3 users", "Core features", "Email support"],
      status: "Active",
    },
    {
      id: 2,
      name: "Business",
      price: "₹1,499 / month",
      type: "Monthly",
      isPopular: true,
      features: ["Up to 10 users", "Advanced features", "Priority support"],
      status: "Active",
    },
    {
      id: 3,
      name: "Enterprise",
      price: "₹4,999 / year",
      type: "Yearly",
      isPopular: false,
      features: ["Unlimited users", "All features", "Dedicated support"],
      status: "Active",
    },
  ]);

  const filtered = plans.filter((p) => {
    if (activeTab === "All Plans") return true;
    return p.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plans</h1>
          <p className="text-gray-500 text-xs mt-1">Create and manage subscription plans, tier limits and pricing.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-violet-200/80 rounded-2xl shadow-xs self-start w-fit">
        {["All Plans", "Monthly", "Yearly", "Daily", "Weekly"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              toast.info(`Filtered plans: ${tab}`);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === tab
                ? "bg-[#7C3AED] text-white shadow-xs"
                : "text-gray-600 hover:text-violet-700 hover:bg-violet-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl p-6 shadow-xs border transition flex flex-col justify-between relative ${
              p.isPopular ? "border-[#7C3AED] ring-2 ring-violet-500/20" : "border-violet-200/80 hover:border-violet-300"
            }`}
          >
            {p.isPopular && (
              <span className="absolute -top-3 right-6 bg-[#7C3AED] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Most Popular
              </span>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                <h2 className="text-base font-bold text-gray-900">{p.name}</h2>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 my-4">{p.price}</div>
              <div className="space-y-2.5 mb-6">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                {p.status}
              </span>
              <button
                onClick={() => setEditingPlan(p.name)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Create Subscription Plan</h2>
            <p className="text-xs text-gray-500 mb-4">Define a new pricing level and feature tier.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("New subscription plan registered!");
                setShowAddModal(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pro Growth"
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Price (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2999"
                    className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Billing Period</label>
                  <select className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500">
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-sm w-full p-6 text-center">
            <h2 className="text-base font-bold text-gray-900 mb-1">Edit Plan: {editingPlan}</h2>
            <p className="text-xs text-gray-500 mb-4">Adjust pricing or feature allotments.</p>
            <button
              onClick={() => {
                toast.success(`Plan ${editingPlan} updated!`);
                setEditingPlan(null);
              }}
              className="w-full bg-[#7C3AED] text-white py-2 rounded-xl text-xs font-semibold mb-2"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingPlan(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
