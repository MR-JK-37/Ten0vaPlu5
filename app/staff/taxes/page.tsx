"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

export default function StaffTaxesPage() {
  const taxes = [
    { name: "GST", rate: "18%", appliesTo: "All Products", jurisdiction: "India (All)", status: "Active" },
    { name: "GST", rate: "12%", appliesTo: "Selected Products", jurisdiction: "India (Select)", status: "Active" },
    { name: "GST", rate: "5%", appliesTo: "Add-ons", jurisdiction: "India", status: "Active" },
    { name: "IGST", rate: "18%", appliesTo: "Export/Out of India", jurisdiction: "International", status: "Active" },
  ];

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return taxes.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.jurisdiction.toLowerCase().includes(search.toLowerCase()));
  }, [taxes, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Taxes</h1>
        <p className="text-gray-500 text-xs mt-1">View applicable tax rules and rates for quotations and invoices.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tax rules..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Tax Name</th>
                <th className="px-5 py-3">Rate</th>
                <th className="px-5 py-3">Applies To</th>
                <th className="px-5 py-3">Jurisdiction</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((t, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5 font-bold text-gray-900">{t.name}</td>
                  <td className="px-5 py-3.5 font-extrabold text-[#7C3AED]">{t.rate}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{t.appliesTo}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.jurisdiction}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {t.status}
                    </span>
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
