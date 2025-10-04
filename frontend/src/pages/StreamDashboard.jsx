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
  Activity,
  Lock,
  Upload as UploadIcon,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import OverviewCards from "../components/streamreport/OverviewCards";
import StreamingAnalytics from "../components/streamreport/StreamingAnalytics";
import SalesReportTable from "../components/streamreport/SalesReportTable";
import PayoutSummary from "../components/streamreport/PayoutSummary";
import NotificationsPanel from "../components/streamreport/NotificationsPanel";
import SongPerformancePage from "../components/streamreport/SongPerformancePage";

export default function StreamDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("7d");
  const [viewType, setViewType] = useState("overview");
  
  // Check if user has uploaded any music
  const hasUploads = user?.publicMetadata?.uploadCount > 0;

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

  // If user hasn't uploaded any music yet, show locked state
  if (!hasUploads) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-200">
              {/* Lock Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                <Lock className="w-12 h-12 text-blue-600" />
              </div>
              
              {/* Heading */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Analytics Dashboard Locked
              </h1>
              
              {/* Description */}
              <p className="text-lg text-gray-600 mb-8">
                Upload your first track to unlock comprehensive analytics, streaming insights, and revenue tracking across all platforms.
              </p>
              
              {/* Features Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  What You'll Get
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Real-time Streaming Data</p>
                      <p className="text-xs text-gray-600">Track streams across Spotify, Apple Music, and more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Revenue Analytics</p>
                      <p className="text-xs text-gray-600">Monitor earnings and payout summaries</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Audience Insights</p>
                      <p className="text-xs text-gray-600">Discover your listeners and demographics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Performance Trends</p>
                      <p className="text-xs text-gray-600">Analyze growth and engagement patterns</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UploadIcon className="w-5 h-5" />
                Upload Your First Track
              </Link>
              
              {/* Info */}
              <p className="text-sm text-gray-500 mt-6">
                Analytics data will appear 7-14 days after your music goes live on streaming platforms
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Demo Mode Banner */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 px-6 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-white">
                <AlertCircle className="w-5 h-5" />
                <p className="font-semibold">
                  Sample Data Preview
                </p>
                <span className="hidden sm:inline text-white/90">•</span>
                <p className="hidden sm:inline text-sm text-white/90">
                  Real analytics will appear 7-14 days after your music goes live on streaming platforms
                </p>
              </div>
            </div>

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
                  
                  {/* Sample Data Badge */}
                  <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 text-yellow-100 px-4 py-2 rounded-full text-sm font-medium mt-4">
                    <Sparkles className="w-4 h-4" />
                    Viewing Sample Data
                  </div>
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
              {/* Demo Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Sample Analytics Preview</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      You're viewing sample data to help you understand what analytics will look like once your music is live on streaming platforms. 
                      Real data will begin appearing 7-14 days after your release goes live.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700">
                        <Music className="w-4 h-4" />
                        {user?.publicMetadata?.uploadCount || 0} Track{(user?.publicMetadata?.uploadCount || 0) !== 1 ? 's' : ''} Uploaded
                      </div>
                      <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700">
                        <Activity className="w-4 h-4" />
                        Waiting for Distribution
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Demo Data Wrapper - Slight opacity to indicate sample data */}
              <div className="space-y-8 opacity-90">
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

              {/* Bottom Info Banner */}
              <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">When Will Real Data Appear?</h3>
                    <p className="text-white/90 mb-4">
                      Once your music is distributed and goes live on streaming platforms (Spotify, Apple Music, etc.), 
                      you'll start seeing real analytics data here. This typically takes:
                    </p>
                    <ul className="space-y-2 text-white/90">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                        <strong>Distribution:</strong> 3-5 business days for your music to go live
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                        <strong>Data Collection:</strong> 7-14 days for streaming platforms to report data
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                        <strong>Updates:</strong> Daily updates once data starts flowing
                      </li>
                    </ul>
                    <div className="mt-6 flex items-center gap-3">
                      <Link
                        to="/dashboard/music"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                      >
                        <Music className="w-5 h-5" />
                        View My Releases
                      </Link>
                      <Link
                        to="/dashboard/upload"
                        className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
                      >
                        <UploadIcon className="w-5 h-5" />
                        Upload More Music
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
  );
}
