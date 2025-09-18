import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  HomeIcon,
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CogIcon,
  UserIcon,
  PlusIcon,
  LockClosedIcon,
  CreditCardIcon,
  BellIcon,
  ExclamationTriangleIcon
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
  const { canUpload, remainingUploads } = useSubscription();

  if (!user) return null;

  const subscriptionType = user.publicMetadata?.subscriptionType || 'free';
  const songCredits = user.publicMetadata?.songCredits || 0;
  const yearlyFeatures = user.publicMetadata?.yearlyFeatures || false;
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
          <h1 className="text-xl font-bold text-gray-900">Music Hub</h1>
          <p className="text-sm text-gray-600">
            {subscriptionType === 'yearly' && 'Premium Account'}
            {subscriptionType === 'pay_per_song' && `${songCredits} credits`}
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
              (subscriptionType === 'pay_per_song' && songCredits > 0) 
                ? { type: 'credits', text: `${songCredits} left` }
                : subscriptionType === 'free' 
                ? { type: 'pro', text: 'Get plan' }
                : (subscriptionType === 'yearly' ? { type: 'pro', text: 'Premium' } : undefined)
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

          {/* Create Album - Coming Soon */}
          <SidebarButton 
            icon={PlusIcon}
            status="locked"
            badge={{ type: 'soon', text: 'Coming Soon' }}
            onClick={() => showLockedTooltip('Album Creation')}
          >
            Create Album
          </SidebarButton>

          {/* Schedule Release - Coming Soon */}
          <SidebarButton 
            icon={CalendarIcon}
            status="locked"
            badge={{ type: 'soon', text: 'Coming Soon' }}
            onClick={() => showLockedTooltip('Release Scheduling')}
          >
            Schedule Release
          </SidebarButton>

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

          {/* Account Management */}
          <SidebarButton to="/dashboard/profile" icon={UserIcon}>
            Profile
          </SidebarButton>

          {/* Subscription Management */}
          <SidebarButton 
            to="/dashboard/subscription" 
            icon={CreditCardIcon}
            badge={
              subscriptionType === 'free' 
                ? { type: 'pro', text: 'Upgrade' }
                : subscriptionType === 'pay_per_song'
                ? { type: 'credits', text: 'Buy more' }
                : { type: 'pro', text: 'Manage' }
            }
          >
            Subscription
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
              {subscriptionType === 'free' && 'Free Plan'}
            </span>
          </div>
          
          {subscriptionType === 'free' && (
            <div>
              <p className="text-sm text-purple-700 mb-3">
                Start uploading your music with pay-per-song or upgrade to yearly for unlimited uploads!
              </p>
              <SidebarButton 
                to="/pricing" 
                icon={ArrowUpTrayIcon}
                badge={{ type: 'new', text: 'Start' }}
              >
                Choose Plan
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
