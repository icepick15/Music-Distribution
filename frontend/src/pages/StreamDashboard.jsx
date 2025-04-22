import React from "react";
import OverviewCards from "../components/streamreport/OverviewCards";
import StreamingAnalytics from "../components/streamreport/StreamingAnalytics";
import SalesReportTable from "../components/streamreport/SalesReportTable";
import PayoutSummary from "../components/streamreport/PayoutSummary";
import NotificationsPanel from "../components/streamreport/NotificationsPanel";
import SongPerformancePage from "../components/streamreport/SongPerformancePage";


export default function StreamDashboard() {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Overview Cards */}
        <OverviewCards />

        {/* Chart + Notifications (Side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StreamingAnalytics />
          </div>
          <div>
            <NotificationsPanel />
          </div>
        </div>

        {/* Song Performance Table */}
        <SongPerformancePage />

        {/* Sales Report + Payout Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesReportTable />
          <PayoutSummary />
        </div>
      </div>
    </section>
  );
}
