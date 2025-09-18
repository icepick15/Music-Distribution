// src/features/tickets/components/TicketTabs.jsx
import { AlertCircle, CheckCircle } from "lucide-react";

const TicketTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { 
      label: "Open Tickets", 
      value: "open",
      icon: AlertCircle,
      color: "text-orange-600 bg-orange-50 border-orange-200"
    },
    { 
      label: "Resolved Tickets", 
      value: "closed",
      icon: CheckCircle,
      color: "text-green-600 bg-green-50 border-green-200"
    },
  ];

  return (
    <div className="border-b border-gray-200 px-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TicketTabs;
  