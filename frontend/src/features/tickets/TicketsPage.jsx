import { useState, useEffect } from "react";
import { Plus, LifeBuoy, MessageSquare, Users, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import TicketTabs from "./components/TicketTabs";
import TicketList from "./components/TicketList";
import TicketForm from "./components/TicketForm";
import TicketDetailModal from "./components/TicketDetailModal";
import { ticketAPI } from "./api/ticketService";

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState("open");
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    resolved: 0,
    active: 0
  });
  const [loading, setLoading] = useState(true);

  // Load tickets and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ticketsData, statsData] = await Promise.all([
          ticketAPI.getMyTickets(),
          ticketAPI.getStats()
        ]);
        setTickets(ticketsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateTicket = async (updatedTicket) => {
    try {
      console.log('Updating ticket with data:', updatedTicket);
      
      // Extract only the fields that should be updated
      const updateData = {};
      if (updatedTicket.status !== undefined) updateData.status = updatedTicket.status;
      if (updatedTicket.priority !== undefined) updateData.priority = updatedTicket.priority;
      if (updatedTicket.category !== undefined) updateData.category = updatedTicket.category;
      if (updatedTicket.title !== undefined) updateData.title = updatedTicket.title;
      if (updatedTicket.description !== undefined) updateData.description = updatedTicket.description;
      if (updatedTicket.tags !== undefined) updateData.tags = updatedTicket.tags;
      
      console.log('Sending clean update data:', updateData);
      const updated = await ticketAPI.updateTicket(updatedTicket.id, updateData);
      console.log('Received updated ticket:', updated);
      
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === updated.id ? updated : ticket
        )
      );
      setSelectedTicket(updated);
      
      // Update stats if status changed
      const oldTicket = tickets.find(t => t.id === updated.id);
      if (oldTicket && oldTicket.status !== updated.status) {
        console.log('Status changed from', oldTicket.status, 'to', updated.status);
        setStats(prev => {
          const newStats = { ...prev };
          
          // Decrease old status count
          if (oldTicket.status === 'open') newStats.open = Math.max(0, newStats.open - 1);
          if (oldTicket.status === 'resolved') newStats.resolved = Math.max(0, newStats.resolved - 1);
          if (oldTicket.status === 'closed') newStats.closed = Math.max(0, newStats.closed - 1);
          if (['open', 'in_progress', 'pending'].includes(oldTicket.status)) {
            newStats.active = Math.max(0, newStats.active - 1);
          }
          
          // Increase new status count
          if (updated.status === 'open') newStats.open += 1;
          if (updated.status === 'resolved') newStats.resolved += 1;
          if (updated.status === 'closed') newStats.closed += 1;
          if (['open', 'in_progress', 'pending'].includes(updated.status)) {
            newStats.active += 1;
          }
          
          console.log('Updated stats:', newStats);
          return newStats;
        });
      }
      
      toast.success('Ticket updated successfully');
    } catch (error) {
      console.error('Failed to update ticket:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // More specific error messages
      let errorMessage = 'Failed to update ticket';
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this ticket';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid ticket data provided';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleCreateTicket = async (newTicketData) => {
    try {
      const newTicket = await ticketAPI.createTicket(newTicketData);
      setTickets(prev => [newTicket, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        open: prev.open + 1,
        active: prev.active + 1
      }));
      setShowForm(false);
      toast.success('Ticket created successfully');
    } catch (error) {
      console.error('Failed to create ticket:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(`Failed to create ticket: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleAddResponse = async (ticketId, responseData) => {
    try {
      await ticketAPI.addResponse(ticketId, responseData);
      // Reload the selected ticket to get the updated responses
      const updatedTicket = await ticketAPI.getTicket(ticketId);
      setSelectedTicket(updatedTicket);
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
      toast.success('Response added successfully');
    } catch (error) {
      console.error('Failed to add response:', error);
      toast.error('Failed to add response');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (activeTab) {
      case 'open':
        return ticket.status === 'open';
      case 'in_progress':
        return ticket.status === 'in_progress';
      case 'pending':
        return ticket.status === 'pending';
      case 'resolved':
        return ticket.status === 'resolved';
      case 'closed':
        return ticket.status === 'closed';
      case 'all':
        return true;
      default:
        return ticket.status === 'open';
    }
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-lg sm:rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
        
        <div className="relative p-3 sm:p-4 lg:p-6">
          <div className="text-center mb-3 sm:mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg backdrop-blur-sm mb-2">
              <LifeBuoy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">
              Support Center
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto px-2">
              Get help when you need it. Our support team is here to assist you.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-orange-300" />
                </div>
                <p className="text-white/80 text-xs font-medium">Active</p>
                <p className="text-sm sm:text-lg font-bold text-white">{loading ? '...' : stats.active}</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                </div>
                <p className="text-white/80 text-xs font-medium">Resolved</p>
                <p className="text-sm sm:text-lg font-bold text-white">{loading ? '...' : stats.resolved}</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                </div>
                <p className="text-white/80 text-xs font-medium">Total</p>
                <p className="text-sm sm:text-lg font-bold text-white">{loading ? '...' : stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Your Tickets</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Track and manage your support requests</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-xl hover:-translate-y-0.5 w-full text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <TicketTabs activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
          
          <div className="p-2 sm:p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <TicketList
                status={activeTab}
                tickets={filteredTickets}
                onOpenTicket={async (ticket) => {
                  try {
                    // Fetch full ticket details with responses
                    const fullTicket = await ticketAPI.getTicket(ticket.id);
                    setSelectedTicket(fullTicket);
                  } catch (error) {
                    console.error('Failed to load ticket details:', error);
                    // Fallback to the ticket from list if API fails
                    setSelectedTicket(ticket);
                    toast.error('Failed to load ticket details');
                  }
                }}
              />
            )}
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
          onAddResponse={handleAddResponse}
        />
      )}
    </div>
  );
};

export default TicketsPage;