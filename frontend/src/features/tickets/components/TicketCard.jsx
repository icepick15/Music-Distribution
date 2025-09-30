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
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group p-2 sm:p-3 lg:p-4 max-w-full overflow-hidden"
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-xs sm:text-sm truncate">
              {ticket.title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
              #{ticket.ticket_id || ticket.id}
            </span>
          </div>
          
          <p className="text-gray-600 text-xs line-clamp-2 mb-2">
            {ticket.description}
          </p>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className={`text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
            <span className={`text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded ${getCategoryColor(ticket.category)}`}>
              {ticket.category.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center flex-shrink-0">
          {ticket.status === 'open' ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            </div>
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Created {formatDate(ticket.created_at)}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <MessageSquare className="w-3 h-3" />
            <span>{ticket.response_count || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Updated {formatDate(ticket.updated_at)}</span>
          </div>
          {ticket.assignee && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <User className="w-3 h-3" />
              <span className="truncate max-w-16">{ticket.assignee.first_name || ticket.assignee.username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
