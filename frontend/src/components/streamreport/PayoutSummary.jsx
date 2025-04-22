import React, { useState } from "react";

// Modal Component (inline)
function WithdrawalModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Request Withdrawal</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₦)</label>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bank Account</label>
            <input
              type="text"
              placeholder="e.g. Access Bank - 1234567890"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PayoutSummary() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
      {/* Modal */}
      <WithdrawalModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Payout Summary</h2>
        <p className="text-sm text-gray-500">Track your available balance and recent payouts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="p-4 rounded-xl bg-gray-50 border">
          <p className="text-sm text-gray-500">Available Balance</p>
          <h3 className="text-2xl font-bold text-green-600">₦84,500</h3>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border">
          <p className="text-sm text-gray-500">Last Withdrawal</p>
          <h3 className="text-lg font-semibold text-gray-800">₦25,000</h3>
          <p className="text-xs text-gray-400 mt-1">Mar 30, 2025</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border">
          <p className="text-sm text-gray-500">Pending Withdrawals</p>
          <h3 className="text-lg font-semibold text-gray-800">₦10,000</h3>
          <p className="text-xs text-gray-400 mt-1">Expected in 3-5 days</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Need a payout?</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-3 sm:mt-0 bg-black text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}
