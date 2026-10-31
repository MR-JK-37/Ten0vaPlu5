"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function PortalPlansPage() {
  const [cycle, setCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "₹1,000",
      yearlyPrice: "₹10,000",
      period: cycle === "Monthly" ? "/ month" : "/ year",
      isPopular: false,
      features: [
        "Up to 5 users",
        "Core billing & invoicing",
        "Email support",
        "Standard reporting",
      ],
    },
    {
      name: "Business",
      monthlyPrice: "₹2,000",
      yearlyPrice: "₹20,000",
      period: cycle === "Monthly" ? "/ month" : "/ year",
      isPopular: true,
      features: [
        "Up to 25 users",
        "Advanced subscription lifecycle",
        "Priority 24/7 support",
        "Custom tax & discount rules",
        "Webhook & API integrations",
      ],
    },
    {
      name: "Enterprise",
      monthlyPrice: "₹5,000",
      yearlyPrice: "₹50,000",
      period: cycle === "Monthly" ? "/ month" : "/ year",
      isPopular: false,
      features: [
        "Unlimited users",
        "Dedicated account manager",
        "Custom SLAs & compliance",
        "Multi-organization accounts",
        "Tailored contract billing",
      ],
    },
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleConfirmPlan = () => {
    toast.success(`Plan updated to "${selectedPlan} (${cycle})"!`);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Plans</h1>
        <p className="mt-1 text-xs text-gray-500">
          Explore available subscription tiers and choose the plan that best fits your business scale.
        </p>
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className="flex justify-start">
        <div className="bg-white p-1 rounded-2xl border border-violet-200/80 shadow-xs flex items-center gap-1">
          <button
            onClick={() => {
              setCycle("Monthly");
              toast.info("Viewing monthly billing rates");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              cycle === "Monthly"
                ? "bg-[#7C3AED] text-white shadow-xs"
                : "text-gray-600 hover:text-violet-700 hover:bg-violet-50"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => {
              setCycle("Yearly");
              toast.info("Viewing yearly billing rates (Save ~17%)");
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              cycle === "Yearly"
                ? "bg-[#7C3AED] text-white shadow-xs"
                : "text-gray-600 hover:text-violet-700 hover:bg-violet-50"
            }`}
          >
            <span>Yearly</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-extrabold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <div
            key={i}
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
              <div className="flex items-baseline gap-1 mt-3 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">
                  {cycle === "Monthly" ? p.monthlyPrice : p.yearlyPrice}
                </span>
                <span className="text-xs text-gray-500 font-medium">{p.period}</span>
              </div>
              <div className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2.5 text-xs text-gray-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={() => handleSelectPlan(p.name)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 ${
                  p.isPopular
                    ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    : "bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200"
                }`}
              >
                Choose Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-sm w-full p-6 text-center">
            <h2 className="text-base font-bold text-gray-900 mb-2">Confirm Plan Change</h2>
            <p className="text-xs text-gray-600 mb-5">
              Switch your active subscription to <strong className="text-[#7C3AED]">{selectedPlan} ({cycle})</strong>? Your next invoice will be adjusted accordingly.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlan}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
