"use client";

import { useState, useMemo } from "react";
import { Check, Search, Laptop, Users2, Briefcase, X } from "lucide-react";
import { toast } from "sonner";

export default function PortalProductsPage() {
  const [activeTab, setActiveTab] = useState("All Products");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<{
    name: string;
    category: string;
    desc: string;
    features: string[];
    price: string;
    period: string;
  } | null>(null);

  const products = [
    {
      name: "Bright Billing Software",
      category: "Software",
      icon: Laptop,
      iconBg: "bg-blue-50 text-blue-600",
      desc: "Complete billing and subscription management solution.",
      features: ["Subscription billing", "Invoicing & payments", "Reports & analytics", "Multi-currency support", "Automated recurring schedules"],
      price: "₹1,000",
      period: "/ month",
    },
    {
      name: "Bright CRM",
      category: "Tools",
      icon: Users2,
      iconBg: "bg-blue-50 text-blue-600",
      desc: "Manage your customer relationships effectively.",
      features: ["Customer management", "Sales tracking", "Lead management", "Email notification pipelines", "Team collaboration"],
      price: "₹1,500",
      period: "/ month",
    },
    {
      name: "Bright HR",
      category: "Services",
      icon: Briefcase,
      iconBg: "bg-amber-50 text-amber-600",
      desc: "Simple and powerful HR management system.",
      features: ["Employee records", "Leave & attendance", "Payroll management", "Document vaults", "Tax deductions breakdown"],
      price: "₹2,000",
      period: "/ month",
    },
  ];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchTab = activeTab === "All Products" || p.category === activeTab;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        <p className="mt-1 text-xs text-gray-500">
          Browse our suite of cloud subscription tools, software and enterprise business apps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-blue-200/80 rounded-2xl shadow-xs">
          {["All Products", "Software", "Tools", "Services"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                toast.info(`Filtered by: ${tab}`);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                activeTab === tab
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200/80 hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0 border border-blue-100`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{p.name}</h2>
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{p.category}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-4">{p.desc}</p>
                <div className="space-y-2 mb-6">
                  {p.features.slice(0, 3).map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="mb-3">
                  <span className="text-[11px] text-gray-400 block font-medium">Starting at</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{p.price}</span>
                    <span className="text-xs text-gray-500 font-medium">{p.period}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs transition active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedProduct.name}</h2>
            <p className="text-xs text-gray-500 mb-4">{selectedProduct.desc}</p>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 mb-4">
              <span className="text-[11px] text-gray-500 block font-medium">Subscription Tier Rate</span>
              <div className="text-xl font-bold text-[#2563EB] mt-0.5">
                {selectedProduct.price} <span className="text-xs font-normal text-gray-500">{selectedProduct.period}</span>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Features Included</h3>
              {selectedProduct.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`Request for ${selectedProduct.name} submitted! Sales will contact you.`);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
