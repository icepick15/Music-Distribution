import { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Send,
  Paperclip,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TicketDetailModal = ({ ticket, onClose, onUpdateTicket }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const response = {
        id: `resp-${Date.now()}`,
        author: "You",
        message: newMessage,
        timestamp: new Date().toISOString(),
        isStaff: false
      };
      
      // Update ticket with new response
      const updatedTicket = {
        ...ticket,
        responses: [...ticket.responses, response],
        updatedAt: new Date().toISOString()
      };
      
      onUpdateTicket?.(updatedTicket);
      setNewMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleStatusChange = (newStatus) => {
    const updatedTicket = {
      ...ticket,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    onUpdateTicket?.(updatedTicket);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-red-50 text-red-700 border-red-200';
      case 'billing': return 'bg-green-50 text-green-700 border-green-200';
      case 'feature-request': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'api': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'account': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl relative border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-6 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{ticket.title}</h2>
                  <p className="text-white/80 text-sm">Ticket #{ticket.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.toUpperCase()} PRIORITY
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(ticket.category)}`}>
                  {ticket.category.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {ticket.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-180px)]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Ticket Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Created by: <strong>{ticket.author.name}</strong></span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {ticket.assignee && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>Assigned to: <strong>{ticket.assignee.name}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Last updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {ticket.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`flex ${response.isStaff ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] ${response.isStaff ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border rounded-2xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${response.isStaff ? 'text-blue-900' : 'text-gray-900'}`}>
                          {response.author}
                          {response.isStaff && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Staff</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{response.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            {ticket.status === 'open' && (
              <div className="p-6 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                    className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700 transition-colors flex items-center text-sm"
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      Attach file
                    </button>
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Response
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            
            {ticket.status === 'open' ? (
              <Button
                onClick={() => handleStatusChange('closed')}
                className="w-full mb-4 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            ) : (
              <Button
                onClick={() => handleStatusChange('open')}
                variant="outline"
                className="w-full mb-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Reopen Ticket
              </Button>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Priority</h4>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="api">API & Integration</option>
                  <option value="account">Account & Profile</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ticket History</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Ticket created
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Assigned to support team
                </div>
                {ticket.status === 'closed' && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    Ticket resolved
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
