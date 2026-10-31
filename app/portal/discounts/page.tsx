"use client";

import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PortalDiscountsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const offers = [
    {
      title: "10% OFF",
      subtitle: "on Yearly Plans",
      code: "YEAR10",
      validTill: "Dec 31, 2026",
      iconBg: "bg-pink-50 text-pink-600 border border-pink-100",
    },
    {
      title: "₹500 OFF",
      subtitle: "on Business Plan",
      code: "BIZ500",
      validTill: "Nov 30, 2026",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApply = (code: string) => {
    setAppliedCode(code);
    toast.success(`Discount code "${code}" applied to next billing cycle!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discounts</h1>
        <p className="mt-1 text-xs text-gray-500">
          View available seasonal promotional offers and apply eligible coupon codes to your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {offers.map((offer, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-xs border border-violet-200/80 hover:border-violet-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${offer.iconBg} flex items-center justify-center shrink-0`}>
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{offer.title}</h2>
                  <p className="text-xs text-gray-500 font-semibold">{offer.subtitle}</p>
                </div>
              </div>

              <div className="bg-violet-50/30 border border-dashed border-violet-200 rounded-xl p-3.5 my-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Promo Code:</span>
                  <span className="font-mono text-sm font-extrabold text-[#7C3AED] tracking-wider">{offer.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-200/70 font-semibold transition"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Valid till: <span className="font-bold text-gray-800">{offer.validTill}</span>
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => handleApply(offer.code)}
                className={`w-full font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs transition active:scale-95 ${
                  appliedCode === offer.code
                    ? "bg-emerald-600 text-white"
                    : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                }`}
              >
                {appliedCode === offer.code ? "✓ Offer Applied" : "Apply Offer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
