"use client";

import { useState } from "react";
import { MoreVertical, ArrowLeftRight, PauseCircle, XCircle, Eye, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";

export default function PortalSubscriptionsPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [status, setStatus] = useState("Active");
  const [showModal, setShowModal] = useState<"change" | "details" | null>(null);

  const sub = {
    id: "SUB-1057",
    product: "Bright Billing Software",
    plan: "Monthly",
    startDate: "Nov 01, 2026",
    nextBilling: "Dec 01, 2026",
  };

  const handleTogglePause = () => {
    setShowMenu(false);
    if (status === "Active") {
      setStatus("Paused");
      toast.warning("Subscription paused. Billing is temporarily suspended.");
    } else {
      setStatus("Active");
      toast.success("Subscription resumed and active!");
    }
  };

  const handleCancel = () => {
    setShowMenu(false);
    setStatus("Cancelled");
    toast.error("Subscription cancelled. Service access remains until next billing date.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Subscriptions</h1>
        <p className="mt-1 text-xs text-gray-500">
          Manage your active subscription licenses, change tiers, or pause services.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Sub. No.</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">Next Billing</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              <tr className="hover:bg-violet-50/30 transition">
                <td className="px-5 py-4 font-bold text-[#7C3AED]">{sub.id}</td>
                <td className="px-5 py-4 text-gray-900 font-bold">{sub.product}</td>
                <td className="px-5 py-4 text-gray-600 font-medium">{sub.plan}</td>
                <td className="px-5 py-4 text-gray-500">{sub.startDate}</td>
                <td className="px-5 py-4 text-gray-500">{sub.nextBilling}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      status === "Active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : status === "Paused"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-xl hover:bg-violet-50 text-gray-400 hover:text-[#7C3AED] border border-transparent hover:border-violet-200 transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-5 top-12 z-40 w-48 bg-white rounded-2xl shadow-xl border border-violet-200 p-1.5 text-left text-xs animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowModal("change");
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-violet-50 rounded-xl text-gray-700 font-medium transition"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-violet-600" />
                        <span>Change Plan</span>
                      </button>
                      <button
                        onClick={handleTogglePause}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-violet-50 rounded-xl text-gray-700 font-medium transition"
                      >
                        {status === "Active" ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pause Subscription</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Resume Subscription</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-red-50 rounded-xl text-red-600 font-medium transition"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Cancel Subscription</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowModal("details");
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-violet-50 rounded-xl text-gray-700 font-medium border-t border-gray-100 transition mt-1 pt-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>View Details</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Details / Change Modals */}
      {showModal === "details" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-sm w-full p-6 text-left">
            <h2 className="text-base font-bold text-gray-900 mb-2">Subscription Details</h2>
            <div className="space-y-2 text-xs border border-violet-100 bg-violet-50/20 rounded-xl p-3 mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Subscription ID:</span><span className="font-bold text-[#7C3AED]">{sub.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Service:</span><span className="font-bold text-gray-900">{sub.product}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Billing Cycle:</span><span className="font-medium text-gray-700">{sub.plan}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rate:</span><span className="font-bold text-gray-900">₹1,000 + GST</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-bold text-emerald-600">{status}</span></div>
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="w-full bg-[#7C3AED] text-white py-2 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal === "change" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-sm w-full p-6 text-left">
            <h2 className="text-base font-bold text-gray-900 mb-1">Change Subscription Tier</h2>
            <p className="text-xs text-gray-500 mb-4">Select the plan to switch to starting next cycle:</p>
            <div className="space-y-2 mb-4 text-xs">
              <button
                onClick={() => {
                  toast.success("Switched to Starter Plan (₹1,000/mo)");
                  setShowModal(null);
                }}
                className="w-full p-2.5 rounded-xl border border-violet-100 hover:bg-violet-50 text-left font-medium text-gray-800"
              >
                Starter Tier (Up to 5 users) — ₹1,000/mo
              </button>
              <button
                onClick={() => {
                  toast.success("Upgraded to Business Plan (₹2,000/mo)");
                  setShowModal(null);
                }}
                className="w-full p-2.5 rounded-xl border border-[#7C3AED] bg-violet-50 text-left font-bold text-[#7C3AED]"
              >
                Business Tier (Up to 25 users) — ₹2,000/mo (Current)
              </button>
              <button
                onClick={() => {
                  toast.success("Upgraded to Enterprise Plan (₹5,000/mo)");
                  setShowModal(null);
                }}
                className="w-full p-2.5 rounded-xl border border-violet-100 hover:bg-violet-50 text-left font-medium text-gray-800"
              >
                Enterprise Tier (Unlimited) — ₹5,000/mo
              </button>
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
