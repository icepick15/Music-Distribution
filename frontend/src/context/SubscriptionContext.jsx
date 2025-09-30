import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// API helper function
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('authToken');
  const url = `http://127.0.0.1:8000/api${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.detail || responseData.error || 'An error occurred');
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current subscription
  const fetchSubscription = useCallback(async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/payments/subscription/current/');
      if (response.success) {
        console.log('Fetched subscription:', response.data);
        setSubscription(response.data);
      } else {
        console.log('No subscription found, using free subscription');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Check if user can upload songs
  const canUpload = () => {
    if (!subscription) return false;

    if (subscription.subscription_type === 'yearly') {
      // Check if yearly subscription is still active
      return subscription.status === 'active' && new Date(subscription.end_date) > new Date();
    } else if (subscription.subscription_type === 'pay_per_song') {
      // Check if user has remaining credits
      const remainingCredits = subscription.remaining_credits || 0;
      return remainingCredits > 0 && subscription.status === 'active';
    } else if (subscription.subscription_type === 'free') {
      // Free users might have limited uploads for demo/testing purposes
      // You can customize this logic based on your business rules
      return true; // Or set to false if free users shouldn't upload
    }

    return false;
  };

  // Get remaining uploads
  const getRemainingUploads = () => {
    if (!subscription) return 0;

    if (subscription.subscription_type === 'yearly') {
      return new Date(subscription.end_date) > new Date() ? 'unlimited' : 0;
    } else if (subscription.subscription_type === 'pay_per_song') {
      const remaining = subscription.remaining_credits || 0;
      return Math.max(0, remaining);
    } else if (subscription.subscription_type === 'free') {
      return 'demo'; // or a specific number like 1-3 for free users
    }

    return 0;
  };

  // Consume a song upload credit
  const consumeUpload = useCallback(async () => {
    if (!canUpload()) return false;

    if (subscription && subscription.subscription_type === 'pay_per_song') {
      try {
        const response = await apiCall('/payments/subscription/consume-credit/', 'POST');
        if (response.success) {
          // Update local subscription state
          setSubscription(prev => ({
            ...prev,
            credits_used: (prev.credits_used || 0) + 1,
            remaining_credits: Math.max(0, (prev.remaining_credits || 0) - 1)
          }));
          return true;
        }
      } catch (error) {
        console.error('Failed to consume upload credit:', error);
        return false;
      }
    } else if (subscription && subscription.subscription_type === 'yearly') {
      // Yearly subscribers don't need to consume credits
      return true;
    } else if (subscription && subscription.subscription_type === 'free') {
      // Free users don't have credits to consume, but upload might be allowed for demo/testing
      return true;
    }

    return false;
  }, [subscription, canUpload]);

  const value = {
    subscription,
    loading,
  // expose the function so consumers can call canUpload()
  canUpload: canUpload,
  // remaining uploads as a value (string or number)
  remainingUploads: getRemainingUploads(),
    fetchSubscription,
    consumeUpload,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
