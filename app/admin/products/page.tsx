"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "Billing Software", type: "Software", sellingPrice: "₹1,000/mo", costPrice: "₹600", status: "Active" },
    { id: 2, name: "Inventory Suite", type: "Software", sellingPrice: "₹2,000/mo", costPrice: "₹1,200", status: "Active" },
    { id: 3, name: "HR Manager", type: "Software", sellingPrice: "₹1,500/mo", costPrice: "₹900", status: "Active" },
    { id: 4, name: "CRM Pro", type: "Software", sellingPrice: "₹2,500/mo", costPrice: "₹1,600", status: "Active" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", type: "Software", sellingPrice: "", costPrice: "" });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.sellingPrice) {
      toast.error("Please enter product name and selling price");
      return;
    }
    const created = {
      id: Date.now(),
      name: newProd.name,
      type: newProd.type,
      sellingPrice: newProd.sellingPrice.includes("₹") ? newProd.sellingPrice : `₹${newProd.sellingPrice}/mo`,
      costPrice: newProd.costPrice ? (newProd.costPrice.includes("₹") ? newProd.costPrice : `₹${newProd.costPrice}`) : "₹500",
      status: "Active",
    };
    setProducts([created, ...products]);
    setShowAddModal(false);
    setNewProd({ name: "", type: "Software", sellingPrice: "", costPrice: "" });
    toast.success(`Product "${created.name}" added to catalog!`);
  };

  const handleDelete = (id: number, name: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success(`Product "${name}" deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-500 text-xs mt-1">Manage catalog products, add-on modules and pricing variants.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-violet-200/80 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-violet-100 bg-violet-50/20">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-violet-200/80 rounded-xl outline-none focus:border-violet-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-violet-200/80 rounded-xl px-3 py-1.5 text-xs text-gray-700 bg-white outline-none focus:border-violet-500"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toast.info(`Viewing details for: ${p.name}`)}
                        className="px-2.5 py-1 rounded-lg text-violet-700 bg-violet-50 hover:bg-violet-100 text-[11px] font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-violet-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Add New Product</h2>
            <p className="text-xs text-gray-500 mb-4">Register a new product module or add-on license.</p>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Analytics Cloud"
                  className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Selling Price *</label>
                  <input
                    type="text"
                    required
                    value={newProd.sellingPrice}
                    onChange={(e) => setNewProd({ ...newProd, sellingPrice: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Cost Price</label>
                  <input
                    type="text"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    placeholder="e.g. 800"
                    className="w-full px-3 py-2 text-xs border border-violet-200 rounded-xl outline-none focus:border-violet-500"
                  />
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
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
