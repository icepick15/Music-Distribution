import { Calendar, Clock, User, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

const TicketCard = ({ ticket, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-red-50 text-red-600';
      case 'billing': return 'bg-green-50 text-green-600';
      case 'feature-request': return 'bg-blue-50 text-blue-600';
      case 'api': return 'bg-purple-50 text-purple-600';
      case 'account': return 'bg-orange-50 text-orange-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div
      onClick={() => onClick(ticket)}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {ticket.title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              #{ticket.id}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {ticket.description}
          </p>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${getCategoryColor(ticket.category)}`}>
              {ticket.category.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center ml-4">
          {ticket.status === 'open' ? (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(ticket.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Updated {formatDate(ticket.updatedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {ticket.assignee && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{ticket.assignee.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{ticket.responses.length} {ticket.responses.length === 1 ? 'response' : 'responses'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
