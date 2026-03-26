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

        const priorityWeight: Record<string, number> = {
          'URGENT': 1,
          'HIGH': 2,
          'MEDIUM': 3,
          'LOW': 4,
        };

        const statusWeight: Record<string, number> = {
          'OPEN': 1,
          'IN_PROGRESS': 2,
          'RESOLVED': 3,
          'CLOSED': 4,
        };

        const sorted = [...fetchedTickets].sort((a, b) => {
          // 1. Active tickets before resolved/closed
          const sA = statusWeight[a.status.toUpperCase()] || 5;
          const sB = statusWeight[b.status.toUpperCase()] || 5;
          if (sA !== sB) return sA - sB;

          // 2. Higher reportCount first (trending/duplicate reports)
          const rA = a.reportCount ?? 1;
          const rB = b.reportCount ?? 1;
          if (rB !== rA) return rB - rA;

          // 3. Higher priority first (URGENT > HIGH > MEDIUM > LOW)
          const pA = priorityWeight[(a.priority ?? '').toUpperCase()] || 5;
          const pB = priorityWeight[(b.priority ?? '').toUpperCase()] || 5;
          if (pA !== pB) return pA - pB;

          // 4. Fallback: newest ticket first
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

        {/* Smaller on mobile, full size on sm+ */}
        <h1 className="text-lg sm:text-3xl font-bold text-white">My Support Tickets</h1>

        {/* Smaller button on mobile */}
        <Link to="/tickets/new">
          <Button size="sm" className="text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2">
            Create New Ticket
          </Button>
        </Link>

      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg">
          <p className="text-slate-400">You haven't created any tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const status = ticket.status.toUpperCase();
            const isFinished = status === 'RESOLVED' || status === 'CLOSED';
            const isActive = status === 'IN_PROGRESS';

            return (
              <div
                key={ticket._id}
                className={`transition-all duration-500 h-full ${
                  isFinished
                    ? "opacity-40 grayscale scale-[0.98]"
                    : isActive
                    ? "opacity-100 ring-2 ring-sky-500/30 rounded-xl shadow-lg shadow-sky-500/10"
                    : "opacity-100"
                }`}
              >
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