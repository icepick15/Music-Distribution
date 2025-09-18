import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useState } from "react";
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

const streamData = [
  { name: "Mon", streams: 4200, revenue: 840 },
  { name: "Tue", streams: 5800, revenue: 1160 },
  { name: "Wed", streams: 7400, revenue: 1480 },
  { name: "Thu", streams: 6900, revenue: 1380 },
  { name: "Fri", streams: 8200, revenue: 1640 },
  { name: "Sat", streams: 6200, revenue: 1240 },
  { name: "Sun", streams: 5400, revenue: 1080 },
];

const platformData = [
  { name: "Spotify", value: 45, color: "#1DB954" },
  { name: "Apple Music", value: 25, color: "#FA243C" },
  { name: "YouTube Music", value: 15, color: "#FF0000" },
  { name: "Amazon Music", value: 10, color: "#FF9900" },
  { name: "Others", value: 5, color: "#8884d8" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'streams' ? 'Streams' : 'Revenue'}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StreamingAnalytics() {
  const [chartType, setChartType] = useState('area');

  const chartTypes = [
    { id: 'area', label: 'Area Chart', icon: Activity },
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', label: 'Platform Split', icon: PieChartIcon },
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={streamData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" className="text-sm" stroke="#6b7280" />
              <YAxis className="text-sm" stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="streams"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorStreams)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={streamData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" className="text-sm" stroke="#6b7280" />
              <YAxis className="text-sm" stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="streams"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4f46e5' }}
                activeDot={{ r: 6, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streamData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" className="text-sm" stroke="#6b7280" />
              <YAxis className="text-sm" stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="streams" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Track your streaming performance across platforms</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  chartType === type.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="w-full h-80">
        {renderChart()}
      </div>
      
      {chartType !== 'pie' && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">38.5K</p>
            <p className="text-sm text-gray-600">Total Streams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">₦7.7K</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">+15.3%</p>
            <p className="text-sm text-gray-600">Growth Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">5.5K</p>
            <p className="text-sm text-gray-600">Avg Daily</p>
          </div>
        </div>
      )}
    </div>
  );
}
  