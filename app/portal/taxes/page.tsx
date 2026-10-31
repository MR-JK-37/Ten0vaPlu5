export default function PortalTaxesPage() {
  const taxes = [
    { name: "GST", rate: "18%", appliesTo: "All Products & Plans", description: "Goods and Services Tax (India)" },
    { name: "CESS", rate: "1%", appliesTo: "Selected Plans", description: "Additional Cess (if applicable)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Taxes</h1>
        <p className="mt-1 text-sm text-gray-500">
          View the tax details applicable to your invoices.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-gray-400 border-b border-gray-100">
              <th className="px-5 py-3">Tax Name</th>
              <th className="px-5 py-3">Rate</th>
              <th className="px-5 py-3">Applies To</th>
              <th className="px-5 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {taxes.map((t, i) => (
              <tr key={i} className="border-b border-gray-50 text-xs">
                <td className="px-5 py-3.5 font-bold text-gray-900">{t.name}</td>
                <td className="px-5 py-3.5 font-semibold text-violet-700">{t.rate}</td>
                <td className="px-5 py-3.5 text-gray-700">{t.appliesTo}</td>
                <td className="px-5 py-3.5 text-gray-500">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

