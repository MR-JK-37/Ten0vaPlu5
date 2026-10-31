"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([
    { code: "NEW10", type: "Percentage", value: "10%", validity: "Nov 01 - Dec 31, 2026", usage: "58 / 100", status: "Active" },
    { code: "FLAT500", type: "Fixed", value: "₹500", validity: "Nov 01 - Nov 30, 2026", usage: "12 / 50", status: "Active" },
    { code: "YEAR15", type: "Percentage", value: "15%", validity: "Nov 01, 2026 - Jan 31, 2027", usage: "12 / 200", status: "Active" },
    { code: "BULK25", type: "Percentage", value: "25%", validity: "Nov 01 - Dec 15, 2026", usage: "4 / 20", status: "Active" },
  ]);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return discounts.filter((d) => d.code.toLowerCase().includes(search.toLowerCase()));
  }, [discounts, search]);

  const handleDelete = (code: string) => {
    setDiscounts(discounts.filter(d => d.code !== code));
    toast.success(`Discount rule ${code} removed`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Discounts</h1>
          <p className="text-gray-500 text-xs mt-1">Create and manage coupon codes, promotional discounts and usage caps.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Discount</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-blue-200/80 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-blue-100 bg-blue-50/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discount codes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-blue-200/80 rounded-xl outline-none focus:border-blue-500 bg-white"
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
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filtered.map((d, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-xs bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-1 rounded-lg">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{d.type}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{d.value}</td>
                  <td className="px-5 py-3.5 text-gray-500">{d.validity}</td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{d.usage}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(d.code)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Create Discount Code</h2>
            <p className="text-xs text-gray-500 mb-4">Add a new coupon or voucher code.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Discount code created!");
                setShowAddModal(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500 font-mono uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Discount Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20%"
                    className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Type</label>
                  <select className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500">
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
