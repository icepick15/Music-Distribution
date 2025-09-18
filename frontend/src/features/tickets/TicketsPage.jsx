// src/features/tickets/TicketsPage.jsx
import { useState } from "react";
import { Plus, LifeBuoy, MessageSquare, Users, Clock } from "lucide-react";
import TicketTabs from "./components/TicketTabs";
import TicketList from "./components/TicketList";
import TicketForm from "./components/TicketForm";
import TicketDetailModal from "./components/TicketDetailModal";
import { mockTickets } from "./data/mockTickets";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("open");
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState(mockTickets);

  const handleUpdateTicket = (updatedTicket) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setSelectedTicket(updatedTicket);
  };

  const handleCreateTicket = (newTicketData) => {
    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicketData,
      status: "open",
      priority: newTicketData.priority || "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        name: "You",
        email: "your.email@example.com",
        avatar: null
      },
      assignee: null,
      responses: [
        {
          id: "resp-initial",
          author: "You",
          message: newTicketData.description,
          timestamp: new Date().toISOString(),
          isStaff: false
        }
      ]
    };
    
    setTickets(prev => [newTicket, ...prev]);
    setShowForm(false);
  };

  const openTickets = tickets.filter(ticket => ticket.status === 'open');
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 px-6 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
              <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Support Center
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get help when you need it. Our support team is here to assist you with any questions or issues.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Open Tickets</p>
                  <p className="text-3xl font-bold text-white">{openTickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-white">{closedTickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-300" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Avg. Response</p>
                  <p className="text-3xl font-bold text-white">2h</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Tickets</h2>
            <p className="text-gray-600 mt-1">Track and manage your support requests</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 flex items-center space-x-2 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <TicketTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="p-6">
            <TicketList
              status={activeTab}
              tickets={tickets}
              onOpenTicket={(ticket) => setSelectedTicket(ticket)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <TicketForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateTicket={handleUpdateTicket}
        />
      )}
    </div>
  );
};

export default TicketsPage;
