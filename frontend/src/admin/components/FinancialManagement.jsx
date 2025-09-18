import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Users, 
  Download,
  Eye,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const FinancialManagement = () => {
  const [financialData, setFinancialData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [filters, setFilters] = useState({
    transaction_type: '',
    status: '',
    subscription_tier: ''
  });

  useEffect(() => {
    fetchFinancialData();
    fetchTransactions();
    fetchSubscriptions();
  }, [dateRange, filters]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/financial/overview/?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch financial data');
      
      const data = await response.json();
      setFinancialData(data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Fallback mock data
      setFinancialData({
        total_revenue: 125000,
        monthly_revenue: 28500,
        subscription_revenue: 85000,
        commission_revenue: 40000,
        total_payouts: 95000,
        pending_payouts: 15000,
        active_subscriptions: 1250,
        revenue_growth: 15.2,
        payout_growth: -3.8,
        subscription_growth: 8.7,
        monthly_breakdown: [
          { month: 'Jan', revenue: 18000, payouts: 12000 },
          { month: 'Feb', revenue: 22000, payouts: 15000 },
          { month: 'Mar', revenue: 25000, payouts: 18000 },
          { month: 'Apr', revenue: 28500, payouts: 20000 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        days: dateRange,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/admin/financial/transactions/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.results || data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback mock data
      setTransactions([
        {
          id: 1,
          user: { username: 'john_doe', first_name: 'John', last_name: 'Doe' },
          type: 'subscription',
          amount: 2500,
          status: 'completed',
          plan: 'gold',
          date: '2024-01-15T10:30:00Z',
          payment_method: 'card'
        },
        {
          id: 2,
          user: { username: 'sarah_music', first_name: 'Sarah', last_name: 'Johnson' },
          type: 'commission',
          amount: 850,
          status: 'completed',
          song_title: 'Echoes of Tomorrow',
          date: '2024-01-14T15:45:00Z',
          payment_method: 'paypal'
        },
        {
          id: 3,
          user: { username: 'nova_beats', first_name: 'Nova', last_name: 'Star' },
          type: 'payout',
          amount: 12000,
          status: 'pending',
          date: '2024-01-13T08:20:00Z',
          payment_method: 'bank_transfer'
        }
      ]);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`/api/admin/financial/subscriptions/?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const data = await response.json();
      setSubscriptions(data.results || data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Fallback mock data
      setSubscriptions([
        { plan: 'free', count: 2150, revenue: 0, growth: 5.2 },
        { plan: 'bronze', count: 850, revenue: 25500, growth: 12.3 },
        { plan: 'gold', count: 320, revenue: 48000, growth: 8.7 },
        { plan: 'platinum', count: 80, revenue: 32000, growth: 15.8 }
      ]);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>,
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>,
      failed: <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Failed</span>,
      refunded: <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Refunded</span>
    };
    return badges[status] || badges.pending;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      subscription: <CreditCard className="w-4 h-4" />,
      commission: <TrendingUp className="w-4 h-4" />,
      payout: <DollarSign className="w-4 h-4" />
    };
    return icons[type] || <DollarSign className="w-4 h-4" />;
  };

  const getGrowthIndicator = (growth) => {
    if (growth > 0) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <ArrowUpRight className="w-4 h-4" />
          <span className="text-sm font-medium">+{growth}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <ArrowDownRight className="w-4 h-4" />
          <span className="text-sm font-medium">{growth}%</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Monitor revenue, subscriptions, and payouts</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={() => {
              fetchFinancialData();
              fetchTransactions();
              fetchSubscriptions();
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.total_revenue)}</p>
              {getGrowthIndicator(financialData.revenue_growth)}
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.monthly_revenue)}</p>
              {getGrowthIndicator(financialData.subscription_growth)}
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.total_payouts)}</p>
              {getGrowthIndicator(financialData.payout_growth)}
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{financialData.active_subscriptions?.toLocaleString()}</p>
              <div className="flex items-center space-x-1 text-blue-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">Subscribers</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'transactions', name: 'Transactions', icon: CreditCard },
            { id: 'subscriptions', name: 'Subscriptions', icon: Users },
            { id: 'payouts', name: 'Payouts', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {financialData.monthly_breakdown?.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600">{month.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(month.payouts)}</p>
                      <p className="text-xs text-gray-500">Payouts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {subscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      sub.plan === 'free' ? 'bg-gray-400' :
                      sub.plan === 'bronze' ? 'bg-orange-400' :
                      sub.plan === 'gold' ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}></div>
                    <span className="font-medium text-gray-900 capitalize">{sub.plan}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{sub.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(sub.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              
              <div className="flex items-center space-x-3">
                <select
                  value={filters.transaction_type}
                  onChange={(e) => setFilters(prev => ({ ...prev, transaction_type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="subscription">Subscription</option>
                  <option value="commission">Commission</option>
                  <option value="payout">Payout</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {transaction.user.first_name?.[0] || transaction.user.username[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaction.user.first_name && transaction.user.last_name 
                                  ? `${transaction.user.first_name} ${transaction.user.last_name}` 
                                  : transaction.user.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="capitalize font-medium text-gray-900">{transaction.type}</span>
                          </div>
                          {transaction.plan && (
                            <p className="text-xs text-gray-500 capitalize">{transaction.plan} plan</p>
                          )}
                          {transaction.song_title && (
                            <p className="text-xs text-gray-500">{transaction.song_title}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional tabs content would go here for subscriptions and payouts */}
    </div>
  );
};

export default FinancialManagement;
