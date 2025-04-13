// src/features/tickets/TicketsPage.jsx
import { useState } from "react";
import TicketTabs from "./TicketTabs";
import TicketList from "./TicketList";
import TicketForm from "./TicketForm";
import TicketDetailModal from "./TicketDetailModal"; // ✅ Make sure this is imported

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("open");
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // ✅ track modal state

  return (
    <section className="min-h-screen px-6 md:px-12 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Open a ticket or view existing ones.
          </p>
        </div>

        {/* Tabs */}
        <TicketTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Action bar */}
        <div className="flex justify-end my-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow transition"
          >
            Create New Ticket
          </button>
        </div>

        {/* Ticket List */}
        <TicketList
          status={activeTab}
          onOpenTicket={(ticket) => {
            console.log("Opening ticket:", ticket); // ✅ Debug
            setSelectedTicket(ticket);
          }}
        />

        {/* Ticket Form Modal */}
        {showForm && <TicketForm onClose={() => setShowForm(false)} />}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </section>
  );
};

export default TicketsPage;
