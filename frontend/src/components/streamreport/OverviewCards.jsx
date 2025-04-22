import { FaMusic, FaMoneyBillWave, FaFire, FaChartLine } from "react-icons/fa";

const cards = [
  {
    title: "Total Streams",
    value: "1.2M",
    icon: <FaMusic className="text-indigo-500 w-6 h-6" />,
  },
  {
    title: "Total Revenue",
    value: "₦6,200,000",
    icon: <FaMoneyBillWave className="text-green-500 w-6 h-6" />,
  },
  {
    title: "Top Song",
    value: "“Wave Energy”",
    icon: <FaFire className="text-pink-500 w-6 h-6" />,
  },
  {
    title: "Avg Daily Streams",
    value: "7,200",
    icon: <FaChartLine className="text-blue-500 w-6 h-6" />,
  },
];

export default function OverviewCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
        >
          <div className="bg-gray-100 p-3 rounded-full">{card.icon}</div>
          <div>
            <div className="text-sm text-gray-500">{card.title}</div>
            <div className="text-xl font-bold text-gray-900">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
