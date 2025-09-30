// src/features/tickets/components/TicketTabs.jsx
import { AlertCircle, CheckCircle, Clock, Pause, Archive, Eye } from "lucide-react";

const TicketTabs = ({ activeTab, setActiveTab, stats = {} }) => {
  const tabs = [
    { 
      label: "All Tickets", 
      value: "all",
      icon: Eye,
      count: stats.total || 0,
      color: "text-gray-600 bg-gray-50 border-gray-200"
    },
    { 
      label: "Open", 
      value: "open",
      icon: AlertCircle,
      count: stats.open || 0,
      color: "text-red-600 bg-red-50 border-red-200"
    },
    { 
      label: "In Progress", 
      value: "in_progress",
      icon: Clock,
      count: stats.in_progress || 0,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200"
    },
    { 
      label: "Pending", 
      value: "pending",
      icon: Pause,
      count: stats.pending || 0,
      color: "text-orange-600 bg-orange-50 border-orange-200"
    },
    { 
      label: "Resolved", 
      value: "resolved",
      icon: CheckCircle,
      count: stats.resolved || 0,
      color: "text-green-600 bg-green-50 border-green-200"
    },
    { 
      label: "Closed", 
      value: "closed",
      icon: Archive,
      count: stats.closed || 0,
      color: "text-gray-600 bg-gray-50 border-gray-200"
    },
  ];

  return (
    <div className="border-b border-gray-200 px-2 sm:px-4">
      <nav className="flex overflow-x-auto scrollbar-hide space-x-2 sm:space-x-4 -mb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1 sm:gap-1.5 py-2 sm:py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="hidden xs:inline sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.label.charAt(0)}</span>
              {tab.count > 0 && (
                <span className={`ml-0.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TicketTabs;
  