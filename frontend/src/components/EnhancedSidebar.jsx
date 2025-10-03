import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLocation, NavLink } from 'react-router-dom';
import SubscriptionGuard from './SubscriptionGuard';
import { 
  HomeIcon,
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CogIcon,
  PlusIcon,
  LockClosedIcon,
  CreditCardIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const SidebarButton = ({ to, icon: Icon, children, status, badge, disabled = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const getStatusStyles = () => {
    switch (status) {
      case 'disabled':
        return 'opacity-50 cursor-not-allowed pointer-events-none';
      case 'locked':
        return 'opacity-75 cursor-pointer hover:bg-red-50';
      case 'coming_soon':
        return 'opacity-75 cursor-pointer hover:bg-orange-50';
      case 'beta':
        return 'border-l-2 border-blue-400';
      default:
        return 'hover:bg-gray-50';
    }
  };

  const getBadgeColor = () => {
    switch (badge?.type) {
      case 'pro':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'beta':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'soon':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'new':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'credits':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const baseClasses = `
    flex items-center w-full px-4 py-3 text-left text-gray-700 rounded-xl transition-all duration-200
    ${isActive ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''}
    ${getStatusStyles()}
  `;

  const content = (
    <>
      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
      <span className="flex-1">{children}</span>
      
      {/* Status Icons */}
      {status === 'locked' && <LockClosedIcon className="h-4 w-4 text-red-500 ml-2" />}
      {status === 'coming_soon' && <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 ml-2" />}
      
      {/* Badges */}
      {badge && (
        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor()}`}>
          {badge.text}
        </span>
      )}
    </>
  );

  if (disabled || status === 'disabled') {
    return <div className={baseClasses}>{content}</div>;
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  }

  return (
    <NavLink to={to} className={baseClasses}>
      {content}
    </NavLink>
  );
};

const EnhancedSidebar = () => {
  const { user } = useAuth();
  const { canUpload, remainingUploads, subscription } = useSubscription();

  if (!user) return null;

  const subscriptionType = subscription?.subscription_type || user.publicMetadata?.subscriptionType || 'free';
  const songCredits = subscription?.remaining_credits || user.publicMetadata?.songCredits || 0;
  const yearlyFeatures = subscriptionType === 'yearly';
  const uploadCount = user.publicMetadata?.uploadCount || 0;
  const role = user.publicMetadata?.role || user.role;

  // Feature availability logic - Phase 1 (Pre-API)
  // Use subscription context for upload permission
  // fallback to computed values if subscription context isn't available
  const computedCanUpload = canUpload ? canUpload : () => {
    if (role === 'artist') return true;
    if (subscriptionType === 'yearly') return true;
    if (subscriptionType === 'pay_per_song' && songCredits > 0) return true;
    return false;
  };

  // Locked until distribution API is integrated
  const isDistributionAPILive = false;

  const showLockedTooltip = (feature) => {
    alert(`${feature} will be available soon. We're working hard to bring you the best experience!`);
  };

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.firstName || user?.first_name || 'User'}!</h1>
          <p className="text-sm text-gray-600">
            {subscriptionType === 'yearly' && 'Premium Account'}
            {subscriptionType === 'pay_per_song' && `${songCredits} credits remaining`}
            {subscriptionType === 'free' && 'Free Account'}
          </p>
        </div>

        <nav className="space-y-2">
          {/* Dashboard - Always available */}
          <SidebarButton to="/dashboard" icon={HomeIcon}>
            Dashboard
          </SidebarButton>

          {/* Music Library - Always available */}
          <SidebarButton to="/dashboard/music" icon={MusicalNoteIcon}>
            Music Library
          </SidebarButton>

          {/* Upload - Requires active subscription */}
          <SidebarButton 
            to={canUpload() ? "/upload" : "/dashboard/subscription"}
            icon={ArrowUpTrayIcon}
            status={!canUpload() ? 'locked' : undefined}
            badge={
              canUpload()
                ? subscriptionType === 'yearly'
                  ? { type: 'pro', text: 'Unlimited' }
                  : subscriptionType === 'pay_per_song'
                  ? { type: 'credits', text: `${remainingUploads || songCredits} left` }
                  : undefined
                : { type: 'pro', text: 'Get Plan' }
            }
          >
            Upload Music
          </SidebarButton>

          {/* Analytics - Coming Soon */}
          <SidebarButton 
            icon={ChartBarIcon}
            status="locked"
            badge={{ type: 'soon', text: 'Coming Soon' }}
            onClick={() => showLockedTooltip('Analytics & Insights')}
          >
            Analytics
          </SidebarButton>

          {/* Create Album/EP - Yearly Premium Feature */}
          <SubscriptionGuard requiredPlan="yearly" featureName="Album & EP Creation">
            <SidebarButton 
              to={yearlyFeatures ? "/dashboard/albums/create" : undefined}
              icon={PlusIcon}
              status={yearlyFeatures ? undefined : "locked"}
              badge={yearlyFeatures ? { type: 'pro', text: 'Premium' } : { type: 'pro', text: 'Premium Only' }}
              onClick={yearlyFeatures ? undefined : () => {}}
            >
              Create Album/EP
            </SidebarButton>
          </SubscriptionGuard>

          {/* Schedule Release - Yearly Premium Feature */}
          <SubscriptionGuard requiredPlan="yearly" featureName="Release Scheduling">
            <SidebarButton 
              to={yearlyFeatures ? "/dashboard/music/release?schedule=true" : undefined}
              icon={CalendarIcon}
              status={yearlyFeatures ? undefined : "locked"}
              badge={yearlyFeatures ? { type: 'pro', text: 'Premium' } : { type: 'pro', text: 'Premium Only' }}
              onClick={yearlyFeatures ? undefined : () => {}}
            >
              Schedule Release
            </SidebarButton>
          </SubscriptionGuard>

          {/* Sales & Revenue - Coming Soon */}
          <SidebarButton 
            icon={CurrencyDollarIcon}
            status="locked"
            badge={{ type: 'soon', text: 'Coming Soon' }}
            onClick={() => showLockedTooltip('Sales & Revenue Tracking')}
          >
            Sales & Revenue
          </SidebarButton>

          <hr className="my-4 border-gray-200" />

          {/* Subscription Management */}
          <SidebarButton 
            to="/dashboard/subscription" 
            icon={CreditCardIcon}
            badge={
              subscriptionType === 'yearly'
                ? { type: 'pro', text: 'Premium' }
                : subscriptionType === 'pay_per_song' && (songCredits > 0 || remainingUploads > 0)
                ? { type: 'credits', text: 'Active' }
                : { type: 'pro', text: 'Upgrade' }
            }
          >
            Subscription
          </SidebarButton>

          <SidebarButton 
            to="/dashboard/referrals" 
            icon={UserGroupIcon}
            badge={{ type: 'new', text: 'NEW' }}
          >
            Referrals
          </SidebarButton>

          <SidebarButton to="/dashboard/settings" icon={CogIcon}>
            Settings
          </SidebarButton>
        </nav>

        {/* Subscription Status Card */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <div className="flex items-center mb-3">
            <CreditCardIcon className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">
              {subscriptionType === 'yearly' && 'Premium Plan'}
              {subscriptionType === 'pay_per_song' && 'Pay Per Song'}
              {subscriptionType === 'free' && 'Getting Started'}
            </span>
          </div>
          
          {subscriptionType === 'free' && (
            <div>
              <p className="text-sm text-purple-700 mb-3">
                Start uploading your music! Choose pay-per-song for flexibility or yearly for unlimited uploads.
              </p>
              <SidebarButton 
                to="/dashboard/subscription" 
                icon={ArrowUpTrayIcon}
                badge={{ type: 'new', text: 'Start' }}
              >
                Choose Plan
              </SidebarButton>
            </div>
          )}
          
          {subscriptionType === 'pay_per_song' && (
            <div>
              <p className="text-sm text-purple-700 mb-3">
                You have {remainingUploads} upload credits remaining. Purchase more credits or upgrade to yearly for unlimited uploads!
              </p>
              <SidebarButton 
                to="/dashboard/subscription" 
                icon={CurrencyDollarIcon}
                badge={{ type: 'info', text: `${remainingUploads} left` }}
              >
                Buy Credits
              </SidebarButton>
            </div>
          )}
          
          {subscriptionType === 'yearly' && subscription?.end_date && (
            <div>
              <p className="text-sm text-purple-700 mb-3">
                Unlimited uploads until {new Date(subscription.end_date).toLocaleDateString()}. Keep creating amazing music!
              </p>
              <SidebarButton 
                to="/dashboard/subscription" 
                icon={CheckCircleIcon}
                badge={{ type: 'success', text: 'Active' }}
              >
                Manage Plan
              </SidebarButton>
            </div>
          )}

          {subscriptionType === 'pay_per_song' && (
            <div>
              <p className="text-sm text-purple-700 mb-2">
                Upload credits: <strong>{songCredits}</strong>
              </p>
              {songCredits === 0 && (
                <p className="text-xs text-purple-600 mb-3">Buy more credits to upload</p>
              )}
              <SidebarButton 
                to="/dashboard/buy-credits" 
                icon={CreditCardIcon}
                badge={{ type: 'credits', text: 'Buy' }}
              >
                Buy Credits
              </SidebarButton>
            </div>
          )}

          {subscriptionType === 'yearly' && (
            <div>
              <p className="text-sm text-purple-700 mb-2">
                ✨ Unlimited uploads & premium features
              </p>
              <p className="text-xs text-purple-600">
                Next billing: Dec 2025
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSidebar;
