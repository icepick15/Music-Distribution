import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RecentReleases from "./RecentReleases";

const tabs = ["All Releases", "Pending Releases", "Live Releases"];

const ReleasesPage = () => {
  const [activeTab, setActiveTab] = useState("All Releases");
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#recent-releases") {
      const el = document.getElementById("recent-releases");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // small delay ensures DOM is ready
      }
    }
  }, [location]);

  return (
    <section className="min-h-screen bg-white px-6 md:px-12 py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Releases</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 space-x-6 text-sm font-medium">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 border-b-2 transition ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Release Table */}
      <RecentReleases activeTab={activeTab} />
    </section>
  );
};

export default ReleasesPage;
