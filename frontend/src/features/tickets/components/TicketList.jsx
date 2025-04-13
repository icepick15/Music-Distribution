// src/features/tickets/components/TicketList.jsx
import TicketCard from "./TicketCard";

// Simulated ticket data
const mockTickets = [
  {
    id: "1",
    title: "Can't access my dashboard",
    description: "Every time I log in, I get a 403 error.",
    status: "open",
    createdAt: "2025-04-10",
  },
  {
    id: "2",
    title: "Billing issue",
    description: "I was charged twice for the same month.",
    status: "closed",
    createdAt: "2025-03-28",
  },
];

const TicketList = ({ status, onOpenTicket }) => {
  const filtered = mockTickets.filter((ticket) => ticket.status === status);

  return (
    <div className="space-y-4">
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-sm">No {status} tickets to show.</p>
        </div>
      ) : (
        filtered.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onOpenTicket(ticket)} // ✅ Call handler when clicked
          />
        ))
      )}
    </div>
  );
};

export default TicketList;
