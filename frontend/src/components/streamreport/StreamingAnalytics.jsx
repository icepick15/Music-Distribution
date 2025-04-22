import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  const data = [
    { name: "Mon", streams: 4200 },
    { name: "Tue", streams: 5800 },
    { name: "Wed", streams: 7400 },
    { name: "Thu", streams: 6900 },
    { name: "Fri", streams: 8200 },
    { name: "Sat", streams: 6200 },
    { name: "Sun", streams: 5400 },
  ];
  
  export default function StreamingAnalytics() {
    return (
      <div className="bg-white mt-8 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Weekly Stream Performance</h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="streams"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  