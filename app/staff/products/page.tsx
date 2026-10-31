"use client";

import { useState, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";

export default function StaffProductsPage() {
  const products = [
    { id: 1, name: "Billing Software", type: "Software", sellingPrice: "₹1,000/mo", costPrice: "₹600", status: "Active" },
    { id: 2, name: "Inventory Suite", type: "Software", sellingPrice: "₹2,000/mo", costPrice: "₹1,200", status: "Active" },
    { id: 3, name: "HR Manager", type: "Software", sellingPrice: "₹1,500/mo", costPrice: "₹900", status: "Active" },
    { id: 4, name: "CRM Pro", type: "Software", sellingPrice: "₹2,500/mo", costPrice: "₹1,600", status: "Active" },
  ];

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
        <p className="text-gray-500 text-xs mt-1">Review catalog software packages, pricing and features to configure quotes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Selling Price</th>
                <th className="px-5 py-3">Cost Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{p.type}</td>
                  <td className="px-5 py-3.5 font-bold text-[#7C3AED]">{p.sellingPrice}</td>
                  <td className="px-5 py-3.5 text-gray-500">{p.costPrice}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toast.info(`Product ${p.name}: Selling ${p.sellingPrice}, Cost ${p.costPrice}`)}
                      className="px-2.5 py-1 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 text-[11px] font-semibold transition border border-violet-200/70"
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
    </div>
  );
}
