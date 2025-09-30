import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API helper functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Handle FormData uploads (don't set Content-Type for multipart)
  const isFormData = options.body instanceof FormData;
  
  // Spread options first so callers cannot accidentally overwrite our merged headers
  const config = {
    ...options,
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      // merge caller headers last so they can add/override specific header values but
      // will not completely replace the headers object and remove Authorization.
      ...options.headers,
    },
  };

  try {
    console.log('🚀 Making API call to:', url);
    console.log('🔧 Config:', {
      method: config.method || 'GET',
      headers: config.headers,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      hasBody: !!config.body,
      bodyType: config.body?.constructor?.name || 'none'
    });
    
    let response;
    try {
      response = await fetch(url, config);
    } catch (fetchError) {
      console.error('🚨 Fetch failed:', fetchError);
      console.error('🚨 Fetch error details:', {
        message: fetchError.message,
        name: fetchError.name,
        stack: fetchError.stack
      });
      throw new Error(`Network error: ${fetchError.message}`);
    }
    
    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });
    
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      // Not JSON
    }

    if (!response.ok) {
      // Try to extract helpful message(s)
      const message = (data && (data.detail || data.error))
        || (data && typeof data === 'object' && Object.values(data).flat().join('; '))
        || text
        || 'An error occurred';

      console.error(`API call failed for ${endpoint}:`, { status: response.status, body: data || text });
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger dashboard refresh
  const triggerDataRefresh = () => {
    console.log('🔄 Triggering data refresh, current value:', refreshTrigger);
    setRefreshTrigger(prev => prev + 1);
  };

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authUser = localStorage.getItem('authUser');
        const authToken = localStorage.getItem('authToken');
        
        if (authUser && authToken) {
          const userData = JSON.parse(authUser);
          
          // Validate token with backend
          try {
            const profileData = await apiCall('/auth/profile/');
            setUser(profileData);
            setIsSignedIn(true);
          } catch (error) {
            console.log('Token validation failed, clearing auth data');
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear corrupted data
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoaded(true);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { email }); // Debug log
      
      const response = await apiCall('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', response); // Debug log

      const { user: userData, access, refresh } = response;
      
      if (!userData || !access) {
        console.error('Missing user data or tokens in response:', response);
        throw new Error('Invalid response format');
      }
      
      setUser(userData);
      setIsSignedIn(true);
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      console.log('Login successful, user set:', userData); // Debug log
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    setLoading(true);
    try {
      const response = await apiCall('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const { user: newUser, tokens } = response;
      
      setUser(newUser);
      setIsSignedIn(true);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.setItem('authToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiCall('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.log('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsSignedIn(false);
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await apiCall('/auth/profile/update/', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      
      const updatedUser = { ...user, ...response };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) throw new Error('No refresh token');

      const response = await apiCall('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });

      localStorage.setItem('authToken', response.access);
      return response.access;
    } catch (error) {
      // If refresh fails, logout user
      signOut();
      throw error;
    }
  };

  // Fetch latest profile from backend and update local state/localStorage
  const fetchProfile = async () => {
    try {
      const profileData = await apiCall('/auth/profile/');
      setUser(profileData);
      setIsSignedIn(true);
      try {
        localStorage.setItem('authUser', JSON.stringify(profileData));
      } catch (e) {
        // ignore storage errors
      }
      return profileData;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      throw err;
    }
  };

  // Poll user profile periodically so UI reflects backend-side role/subscription changes
  useEffect(() => {
    let intervalId = null;
    const POLL_INTERVAL_MS = 300000; // 5 minutes - more reasonable for production

    if (isSignedIn) {
      // Immediately fetch once to pick up external changes
      fetchProfile().catch(() => {});
      intervalId = setInterval(() => {
        fetchProfile().catch(() => {});
      }, POLL_INTERVAL_MS);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSignedIn]);

  // Enhanced user with subscription details for your pricing model
  const clerkLikeUser = user ? {
    id: user.id,
    emailAddresses: [{ emailAddress: user.email }],
    firstName: user.first_name || '',
    lastName: user.last_name || '',
    fullName: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
    imageUrl: user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=6366f1&color=ffffff`,
    publicMetadata: {
      role: user.role || 'user',
      subscription: user.subscription || 'free',
      subscriptionType: user.subscription_type || 'free', // 'free', 'pay_per_song', 'yearly'
      songCredits: user.song_credits || 0, // For pay-per-song users
      yearlyFeatures: user.yearly_features || false, // Premium features access
      isVerified: user.is_verified || false,
      isArtistVerified: user.is_artist_verified || false,
      uploadCount: user.upload_count || 0,
      distributionEnabled: user.distribution_enabled || false, // Manual approval for distribution
    }
  } : null;

  const value = {
    user: clerkLikeUser,
    isLoaded,
    isSignedIn,
    loading,
    token: localStorage.getItem('authToken'), // Add token to context
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshToken,
    // API helper for other components
    apiCall,
    // Data refresh trigger
    refreshTrigger,
    triggerDataRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
