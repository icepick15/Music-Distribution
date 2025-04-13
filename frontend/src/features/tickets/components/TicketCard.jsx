import { CalendarDays } from "lucide-react";

const TicketCard = ({ ticket, onClick }) => {
  return (
    <div
      onClick={() => onClick(ticket)} // ✅ this is calling the prop
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">{ticket.title}</h3>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            ticket.status === "open"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {ticket.status.toUpperCase()}
        </span>
      </div>
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <CalendarDays className="w-4 h-4" />
        <span>Created on {ticket.createdAt}</span>
      </div>
    </div>
  );
};  

export default TicketCard;
