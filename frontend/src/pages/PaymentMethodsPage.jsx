import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const PaymentMethodsPage = () => {
  const { user, apiCall } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load user's payment data
  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const [methodsRes, transactionsRes, subscriptionRes] = await Promise.all([
        apiCall('/payments/methods/'),
        apiCall('/payments/transactions/'),
        apiCall('/payments/subscription/current/')
      ]);

      if (methodsRes.success) setPaymentMethods(methodsRes.data);
      if (transactionsRes.success) setTransactions(transactionsRes.data.results || transactionsRes.data);
      if (subscriptionRes.success) setCurrentSubscription(subscriptionRes.data);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      const response = await apiCall(`/payments/methods/${methodId}/`, 'DELETE');
      if (response.success) {
        setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    try {
      const response = await apiCall(`/payments/methods/${methodId}/set-default/`, 'POST');
      if (response.success) {
        setPaymentMethods(prev => prev.map(method => ({
          ...method,
          is_default: method.id === methodId
        })));
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
    }
  };

  const PaystackPayment = ({ onSuccess, onClose, amount, description }) => {
    const [cardData, setCardData] = useState({
      card_number: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
      save_card: false
    });

    const handlePaymentSubmit = async (e) => {
      e.preventDefault();
      setProcessing(true);

      try {
        // Initialize payment with Paystack
        const response = await apiCall('/payments/initialize/', 'POST', {
          amount: amount,
          transaction_type: 'subscription',
          subscription_type: 'yearly'
        });

        if (response.success) {
          // Open Paystack popup
          window.PaystackPop.setup({
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, // Get from environment
            email: user.email,
            amount: amount * 100, // Convert to kobo
            currency: 'NGN',
            ref: response.data.reference,
            onSuccess: function(transaction) {
              // Verify payment
              verifyPayment(transaction.reference);
            },
            onCancel: function() {
              setProcessing(false);
              onClose();
            }
          }).openIframe();
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
        setProcessing(false);
      }
    };

    const verifyPayment = async (reference) => {
      try {
        const response = await apiCall('/payments/verify/', 'POST', { reference });
        if (response.success) {
          onSuccess(response.data);
          loadPaymentData(); // Reload payment data
        } else {
          alert('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        alert('Payment verification failed');
      } finally {
        setProcessing(false);
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">{description}</p>
            <p className="text-2xl font-bold text-purple-600">₦{amount.toLocaleString()}</p>
          </div>

          <form onSubmit={handlePaymentSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={cardData.card_number}
                  onChange={(e) => setCardData({...cardData, card_number: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Month
                </label>
                <input
                  type="text"
                  placeholder="MM"
                  maxLength="2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={cardData.expiry_month}
                  onChange={(e) => setCardData({...cardData, expiry_month: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Year
                </label>
                <input
                  type="text"
                  placeholder="YYYY"
                  maxLength="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={cardData.expiry_year}
                  onChange={(e) => setCardData({...cardData, expiry_year: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  checked={cardData.save_card}
                  onChange={(e) => setCardData({...cardData, save_card: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-600">Save this card for future payments</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay ₦${amount.toLocaleString()}`
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <ClockIcon className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-2">Manage your payment methods and view transaction history</p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">
                  Current Plan: {currentSubscription.subscription_type?.charAt(0).toUpperCase() + currentSubscription.subscription_type?.slice(1) || 'Free'}
                </h3>
                {currentSubscription.subscription_type === 'yearly' && (
                  <p className="text-purple-700">Unlimited uploads until {new Date(currentSubscription.end_date).toLocaleDateString()}</p>
                )}
                {currentSubscription.subscription_type === 'pay_per_song' && (
                  <p className="text-purple-700">{currentSubscription.remaining_credits} credits remaining (no expiry)</p>
                )}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentSubscription.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentSubscription.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Payment Methods</h2>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Card
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment methods saved</p>
                  <p className="text-sm text-gray-500">Add a payment method to get started</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{method.display_name}</p>
                          <p className="text-sm text-gray-500">
                            {method.payment_type === 'card' && `Expires ${method.card_exp_month}/${method.card_exp_year}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.is_default && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                          Set Default
                        </button>
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500">Your payment history will appear here</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.initiated_at).toLocaleDateString()} at{' '}
                          {new Date(transaction.initiated_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₦{transaction.amount}</p>
                        <div className="flex items-center">
                          {transaction.status === 'success' && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          {transaction.status === 'failed' && (
                            <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          {transaction.status === 'pending' && (
                            <ClockIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            transaction.status === 'success' ? 'text-green-600' :
                            transaction.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Need More Credits?</h3>
            <p className="text-gray-600 mb-4">Purchase additional song upload credits</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Buy Credits
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upgrade Subscription</h3>
            <p className="text-gray-600 mb-4">Get unlimited uploads with our yearly plan</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddCard && (
        <PaystackPayment
          amount={39900}
          description="Yearly Premium Subscription"
          onSuccess={(data) => {
            console.log('Payment successful:', data);
            alert('Payment successful!');
          }}
          onClose={() => setShowAddCard(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
