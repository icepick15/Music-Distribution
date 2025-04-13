import { useState } from "react";

const Tabs = ({ tabs }) => {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex space-x-6 border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`pb-2 text-sm font-medium transition ${
              active === tab.key
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div>{tabs.find((tab) => tab.key === active)?.content}</div>
    </div>
  );
};

export default Tabs;
