import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket } from '../../types'; 
import Spinner from '../common/Spinner';
import TicketCard from './TicketCard';
import Button from '../common/Button';

const TicketsListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const fetchedTickets = await api.getTickets();

        // 1. Priority Map (Using strings to avoid Enum import errors)
        const statusPriority: Record<string, number> = {
          'OPEN': 1,
          'IN_PROGRESS': 2,
          'RESOLVED': 3,
          'CLOSED': 4,
        };

        // 2. Sort Logic
        const sorted = [...fetchedTickets].sort((a, b) => {
          // Normalize status to uppercase just in case
          const priorityA = statusPriority[a.status.toUpperCase()] || 5;
          const priorityB = statusPriority[b.status.toUpperCase()] || 5;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          // Secondary sort: Newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setTickets(sorted);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tickets.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Support Tickets</h1>
        <Link to="/tickets/new">
          <Button>Create New Ticket</Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg">
          <p className="text-slate-400">You haven't created any tickets yet.</p>
        </div>
      ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {tickets.map((ticket) => {
    // 1. Determine status for styling
    const status = ticket.status.toUpperCase();
    const isFinished = status === 'RESOLVED' || status === 'CLOSED';
    const isActive = status === 'IN_PROGRESS';

    return (
      <div 
        key={ticket._id} 
        // Added h-full to keep all cards the same height
        className={`transition-all duration-500 h-full ${
          isFinished 
            ? "opacity-40 grayscale scale-[0.98]" 
            : isActive 
            ? "opacity-100 ring-2 ring-sky-500/30 rounded-xl shadow-lg shadow-sky-500/10" 
            : "opacity-100"
        }`}
      >
        {/* Pass h-full here too so the TicketCard stretches */}
        <TicketCard ticket={ticket} />
      </div>
    );
  })}
</div>
      )}
    </div>
  );
};

export default TicketsListPage; 