import React from "react";

export default function WithdrawalModal({ isOpen, onClose }) {
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
