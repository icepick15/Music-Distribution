import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from './NotificationProvider';

const ToastNotifications = () => {
  const { toasts, removeToast } = useNotifications();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getToastStyles = (type) => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-l-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-l-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-l-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-l-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-l-gray-500 text-gray-800`;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} transform transition-all duration-300 ease-in-out animate-slide-in-right`}
          style={{
            animation: 'slideInRight 0.3s ease-out forwards'
          }}
        >
          <div className={`flex-shrink-0 ${getIconColor(toast.type)}`}>
            {getToastIcon(toast.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">
              {toast.title}
            </h4>
            <p className="text-sm mt-1 opacity-90 line-clamp-2">
              {toast.message}
            </p>
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ToastNotifications;
