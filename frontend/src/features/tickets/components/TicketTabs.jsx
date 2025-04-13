// src/features/tickets/components/TicketTabs.jsx
const TicketTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
      { label: "Open Tickets", value: "open" },
      { label: "Closed Tickets", value: "closed" },
    ];
  
    return (
      <div className="flex border-b border-gray-200 mb-6 space-x-6 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 border-b-2 transition ${
              activeTab === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };
  
  export default TicketTabs;
  