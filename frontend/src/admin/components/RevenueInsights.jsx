import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Example dummy revenue data
const monthlyRevenue = [
  { month: "Jan", revenue: 4000, payout: 2000 },
  { month: "Feb", revenue: 4500, payout: 2200 },
  { month: "Mar", revenue: 5000, payout: 2500 },
  { month: "Apr", revenue: 6000, payout: 3000 },
];

export default function RevenueInsights() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Revenue Insights</h2>

      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" />
            <Line type="monotone" dataKey="payout" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Revenue vs Payout</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#4f46e5" />
            <Bar dataKey="payout" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
