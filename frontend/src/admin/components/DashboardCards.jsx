// src/admin/components/DashboardCards.jsx
import React from "react";
import { Users, Music, BadgeCheck, DollarSign } from "lucide-react";

const metrics = [
  {
    title: "Total Revenue",
    value: "₦1,200,000",
    icon: <DollarSign className="w-6 h-6 text-green-600" />,
    bg: "bg-green-50",
  },
  {
    title: "Total Users",
    value: "4,512",
    icon: <Users className="w-6 h-6 text-blue-600" />,
    bg: "bg-blue-50",
  },
  {
    title: "Total Songs",
    value: "2,230",
    icon: <Music className="w-6 h-6 text-purple-600" />,
    bg: "bg-purple-50",
  },
  {
    title: "Verified Artists",
    value: "1,750",
    icon: <BadgeCheck className="w-6 h-6 text-yellow-600" />,
    bg: "bg-yellow-50",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((item, index) => (
        <div
          key={index}
          className={`p-4 rounded-2xl shadow-sm border ${item.bg} flex items-center gap-4`}
        >
          <div className="p-2 rounded-xl bg-white">{item.icon}</div>
          <div>
            <p className="text-sm text-gray-500">{item.title}</p>
            <h3 className="text-xl font-bold text-gray-800">{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
