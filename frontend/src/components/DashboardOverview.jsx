import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, href }) => {
  const isPositive = changeType === 'positive';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      {href && (
        <div className="mt-4">
          <Link to={href} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View details →
          </Link>
        </div>
      )}
    </div>
  );
};

const QuickAction = ({ title, description, icon: Icon, href, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200"
  };

  return (
    <Link to={href} className="block">
      <div className={`rounded-xl border p-6 hover:shadow-md transition-all hover:scale-105 ${colorClasses[color]}`}>
        <div className="flex items-center">
          <Icon className="h-8 w-8 mr-4" />
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm opacity-75">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Releases",
      value: "0",
      change: null,
      changeType: "neutral",
      icon: MusicalNoteIcon,
      href: "/dashboard/music"
    },
    {
      title: "Monthly Streams",
      value: "0",
      change: null,
      changeType: "neutral",
      icon: ChartBarIcon,
      href: "/dashboard/sales"
    },
    {
      title: "Active Platforms",
      value: "0",
      change: null,
      changeType: "neutral",
      icon: UserGroupIcon,
      href: "/dashboard/music"
    },
    {
      title: "Total Earnings",
      value: "$0.00",
      change: null,
      changeType: "neutral",
      icon: CurrencyDollarIcon,
      href: "/dashboard/sales"
    }
  ];

  const quickActions = [
    {
      title: "Release New Music",
      description: "Upload and distribute your latest tracks",
      icon: PlusIcon,
      href: "/dashboard/music/release",
      color: "blue"
    },
    {
      title: "View Analytics",
      description: "Track your performance and earnings",
      icon: ChartBarIcon,
      href: "/dashboard/sales",
      color: "green"
    },
    {
      title: "Manage Profile",
      description: "Update your artist information",
      icon: UserGroupIcon,
      href: "/dashboard/artist",
      color: "purple"
    },
    {
      title: "Get Support",
      description: "Need help? Contact our support team",
      icon: LifebuoyIcon,
      href: "/dashboard/tickets",
      color: "orange"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with your music distribution.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by releasing your first track.</p>
            <div className="mt-6">
              <Link
                to="/dashboard/music/release"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create New Release
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Notice */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Subscription Status</h3>
            <p className="mt-1 text-sm text-blue-700">
              You don't have an active subscription plan. Subscribe to start distributing your music to major platforms.
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard/subscription"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-200 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
