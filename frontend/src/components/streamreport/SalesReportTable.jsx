const mockSales = [
    { date: "2025-04-01", platform: "Apple Music", units: 1500, revenue: 42000 },
    { date: "2025-04-02", platform: "Spotify", units: 2100, revenue: 58000 },
    { date: "2025-04-03", platform: "Boomplay", units: 980, revenue: 17400 },
    { date: "2025-04-04", platform: "Audiomack", units: 450, revenue: 8200 },
  ];
  
  export default function SalesReportTable() {
    return (
      <div className="bg-white mt-8 p-6 rounded-2xl shadow-sm overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Sales Report</h2>
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Platform</th>
              <th className="px-4 py-3 font-semibold">Units Sold</th>
              <th className="px-4 py-3 font-semibold">Revenue (₦)</th>
            </tr>
          </thead>
          <tbody>
            {mockSales.map((sale, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{sale.date}</td>
                <td className="px-4 py-3">{sale.platform}</td>
                <td className="px-4 py-3">{sale.units}</td>
                <td className="px-4 py-3 font-semibold">₦{sale.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  