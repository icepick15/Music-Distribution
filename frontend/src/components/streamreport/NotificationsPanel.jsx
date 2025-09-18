import React from "react";
import { Bell, AlertTriangle } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Payout Successful",
    message: "₦25,000 has been sent to your bank account.",
    type: "success",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "New Streaming Report",
    message: "Your updated analytics for April is available.",
    type: "info",
    time: "Yesterday",
  },
  {
    id: 3,
    title: "Reminder",
    message: "Complete your KYC to enable withdrawals.",
    type: "warning",
    time: "3 days ago",
  },
];

export default function NotificationsPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          Notifications
        </h2>
        <span className="text-sm text-gray-400">{notifications.length} unread</span>
      </div>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-xl border ${
              note.type === "success"
                ? "bg-green-50 border-green-200"
                : note.type === "warning"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm text-gray-800">{note.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{note.message}</p>
              </div>
              {note.type === "warning" && (
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">{note.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
