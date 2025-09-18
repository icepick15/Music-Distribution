import React, { useState } from "react";
import { 
  TrendingUp, 
  Music, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import OverviewCards from "../components/streamreport/OverviewCards";
import StreamingAnalytics from "../components/streamreport/StreamingAnalytics";
import SalesReportTable from "../components/streamreport/SalesReportTable";
import PayoutSummary from "../components/streamreport/PayoutSummary";
import NotificationsPanel from "../components/streamreport/NotificationsPanel";
import SongPerformancePage from "../components/streamreport/SongPerformancePage";

export default function StreamDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [viewType, setViewType] = useState("overview");

  const dateRangeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" },
    { value: "1y", label: "Last Year" }
  ];

  const viewOptions = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "detailed", label: "Detailed", icon: PieChart },
    { value: "realtime", label: "Real-time", icon: Activity }
  ];

  return (
    <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-16">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Analytics & Sales Dashboard
                  </h1>
                  <p className="text-xl text-white/90 max-w-3xl mx-auto">
                    Track your music performance, streaming analytics, and revenue across all platforms in real-time
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Total Streams</p>
                        <p className="text-3xl font-bold text-white">1.2M</p>
                        <p className="text-green-300 text-sm mt-1">+15% this month</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Music className="w-6 h-6 text-blue-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold text-white">₦6.2M</p>
                        <p className="text-green-300 text-sm mt-1">+22% this month</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Monthly Listeners</p>
                        <p className="text-3xl font-bold text-white">45.8K</p>
                        <p className="text-green-300 text-sm mt-1">+8% this month</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Active Releases</p>
                        <p className="text-3xl font-bold text-white">12</p>
                        <p className="text-blue-300 text-sm mt-1">3 new this month</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-orange-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
              {/* Controls Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics</h2>
                  <p className="text-gray-600 mt-1">Comprehensive view of your music performance and earnings</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Date Range Selector */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {dateRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Type Selector */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {viewOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setViewType(option.value)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            viewType === option.value
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Export Button */}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Enhanced Overview Cards */}
                <OverviewCards />

                {/* Chart + Notifications Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <StreamingAnalytics />
                  </div>
                  <div>
                    <NotificationsPanel />
                  </div>
                </div>

                {/* Song Performance Section */}
                <SongPerformancePage />

                {/* Revenue Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SalesReportTable />
                  <PayoutSummary />
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
  );
}
