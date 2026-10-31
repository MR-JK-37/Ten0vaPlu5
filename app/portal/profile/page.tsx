"use client";

import { useState } from "react";
import { User, Mail, Phone, Building2, FileText, MapPin, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function PortalProfilePage() {
  const [personal, setPersonal] = useState({
    fullName: "Rahul Kumar",
    email: "rahul.kumar@acmecorp.in",
    phone: "+91 98765 43210",
  });

  const [business, setBusiness] = useState({
    companyName: "Acme Corp",
    gst: "27ABCDE1234F1Z5",
    address: "Bengaluru, Karnataka - 560001",
  });

  const [editMode, setEditMode] = useState<"personal" | "business" | null>(null);
  const [tempPersonal, setTempPersonal] = useState(personal);
  const [tempBusiness, setTempBusiness] = useState(business);

  const savePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonal(tempPersonal);
    setEditMode(null);
    toast.success("Personal information updated successfully!");
  };

  const saveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setBusiness(tempBusiness);
    setEditMode(null);
    toast.success("Business details updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="mt-1 text-xs text-gray-500">
          View and update your personal contact details and registered business credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
              <button
                onClick={() => {
                  setTempPersonal(personal);
                  setEditMode("personal");
                }}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Full Name</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{personal.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Email Address</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{personal.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{personal.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Business Information</h2>
              <button
                onClick={() => {
                  setTempBusiness(business);
                  setEditMode("business");
                }}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Company Name</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{business.companyName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">GST / Tax Number</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{business.gst}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Address</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{business.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Modal */}
      {editMode === "personal" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Edit Personal Details</h2>
            <p className="text-xs text-gray-500 mb-4">Update your primary contact information.</p>
            <form onSubmit={savePersonal} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={tempPersonal.fullName}
                  onChange={(e) => setTempPersonal({ ...tempPersonal, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={tempPersonal.email}
                  onChange={(e) => setTempPersonal({ ...tempPersonal, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Phone</label>
                <input
                  type="text"
                  value={tempPersonal.phone}
                  onChange={(e) => setTempPersonal({ ...tempPersonal, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {editMode === "business" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 max-w-md w-full p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Edit Business Details</h2>
            <p className="text-xs text-gray-500 mb-4">Update registered billing &amp; company entity.</p>
            <form onSubmit={saveBusiness} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={tempBusiness.companyName}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">GST / Tax Number</label>
                <input
                  type="text"
                  required
                  value={tempBusiness.gst}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, gst: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={tempBusiness.address}
                  onChange={(e) => setTempBusiness({ ...tempBusiness, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-blue-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition"
                >
                  Save Business Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
