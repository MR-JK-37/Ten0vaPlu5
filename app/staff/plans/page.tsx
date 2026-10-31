"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function StaffPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; features: string[] } | null>(null);

  const plans = [
    {
      name: "Starter",
      price: "₹499 / month",
      features: ["Up to 3 users", "Core features", "Email support"],
    },
    {
      name: "Business",
      price: "₹1,499 / month",
      isPopular: true,
      features: ["Up to 10 users", "Advanced features", "Priority support"],
    },
    {
      name: "Enterprise",
      price: "₹4,999 / year",
      features: ["Unlimited users", "All features", "Dedicated support"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plans</h1>
        <p className="mt-1 text-xs text-gray-500">
          Review standard subscription plans, tier limits and pricing matrices to quote customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl p-6 shadow-xs border transition flex flex-col justify-between relative ${
              p.isPopular ? "border-[#2563EB] ring-2 ring-blue-500/20" : "border-blue-200/80 hover:border-blue-300"
            }`}
          >
            {p.isPopular && (
              <span className="absolute -top-3 right-6 bg-[#2563EB] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Most Popular
              </span>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <h2 className="text-base font-bold text-gray-900">{p.name}</h2>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 my-4">{p.price}</div>
              <div className="space-y-2.5 mb-6">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-gray-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={() => setSelectedPlan(p)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 px-4 rounded-xl text-xs border border-blue-200 transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-sm w-full p-6 text-left">
            <h2 className="text-base font-bold text-gray-900 mb-1">{selectedPlan.name} Plan</h2>
            <p className="text-xs text-[#2563EB] font-bold mb-4">{selectedPlan.price}</p>
            <div className="space-y-2 mb-5 text-xs text-gray-700">
              {selectedPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedPlan(null)}
              className="w-full bg-[#2563EB] text-white py-2 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
