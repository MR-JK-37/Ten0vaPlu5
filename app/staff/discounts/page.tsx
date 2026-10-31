"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

export default function StaffDiscountsPage() {
  const discounts = [
    { code: "NEW10", type: "Percentage", value: "10%", validity: "Nov 01 - Dec 31, 2026", usage: "58 / 100", status: "Active" },
    { code: "FLAT500", type: "Fixed", value: "₹500", validity: "Nov 01 - Nov 30, 2026", usage: "12 / 50", status: "Active" },
    { code: "YEAR15", type: "Percentage", value: "15%", validity: "Jan 01, 2026 - Jan 31, 2027", usage: "12 / 200", status: "Active" },
    { code: "BULK25", type: "Percentage", value: "25%", validity: "Nov 01 - Dec 15, 2026", usage: "4 / 20", status: "Active" },
  ];

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return discounts.filter((d) => d.code.toLowerCase().includes(search.toLowerCase()));
  }, [discounts, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discounts</h1>
        <p className="text-gray-500 text-xs mt-1">View available discounts and apply eligible promotional codes to quotes.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discounts..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Validity</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((d, i) => (
                <tr key={i} className="hover:bg-violet-50/30 transition">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-xs bg-violet-50 text-[#7C3AED] border border-violet-200 px-2 py-1 rounded-lg">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{d.type}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{d.value}</td>
                  <td className="px-5 py-3.5 text-gray-500">{d.validity}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{d.usage}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {d.status}
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
