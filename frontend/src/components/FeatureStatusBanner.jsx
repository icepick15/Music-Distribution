import { useState } from 'react';
import { 
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  LockClosedIcon,
  StarIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const FeatureStatusBanner = ({ status, title, description, launchDate, userType = 'free', onUpgrade, onNotify }) => {
  const [isNotifying, setIsNotifying] = useState(false);

  const statusConfig = {
    live: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      label: 'Live',
      showBanner: false // Don't show banner for live features
    },
    beta: {
      icon: CogIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      label: 'Beta Access',
      showBanner: true
    },
    pro_only: {
      icon: LockClosedIcon,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-500',
      label: 'Pro Feature',
      showBanner: true
    },
    coming_soon: {
      icon: ClockIcon,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-500',
      label: 'Coming Soon',
      showBanner: true
    },
    notify_me: {
      icon: BellIcon,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-500',
      label: 'Get Notified',
      showBanner: true
    }
  };

  const config = statusConfig[status];
  if (!config?.showBanner) return null; // Don't show banner for live features

  const Icon = config.icon;

  const handleNotifyMe = async () => {
    setIsNotifying(true);
    try {
      await onNotify?.(title);
      // Show success message
    } catch (error) {
      console.error('Failed to set notification:', error);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-4 mb-6`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-6 w-6 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${config.textColor}`}>{title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
              {config.label}
            </span>
          </div>
          <p className={`${config.textColor} mb-3`}>{description}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {status === 'pro_only' && userType === 'free' && (
              <button 
                onClick={onUpgrade}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <StarIcon className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </button>
            )}
            
            {status === 'coming_soon' && (
              <button 
                onClick={handleNotifyMe}
                disabled={isNotifying}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                {isNotifying ? 'Saving...' : 'Notify Me When Ready'}
              </button>
            )}
            
            {launchDate && (
              <span className={`text-sm ${config.textColor} opacity-75`}>
                Expected: {launchDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureStatusBanner;
