// src/features/tickets/components/TicketList.jsx
import TicketCard from "./TicketCard";

const TicketList = ({ status, tickets, onOpenTicket }) => {
  const filtered = tickets.filter((ticket) => ticket.status === status);

  return (
    <div className="space-y-4">
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m13 0H5m14 5V9a1 1 0 00-1-1H7a1 1 0 00-1 1v1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {status} tickets</h3>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            {status === 'open' 
              ? "You don't have any open support tickets. Create a new ticket if you need help."
              : "No resolved tickets to display."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onOpenTicket(ticket)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
