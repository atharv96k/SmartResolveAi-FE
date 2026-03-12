import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Priority, TicketStatus } from '../../types';

interface TicketCardProps {
  ticket: Ticket;
}

const PriorityBadge: React.FC<{ priority?: string }> = ({ priority }) => {
  if (!priority) return null;
  const p = priority.toUpperCase();
  const colors: Record<string, string> = {
    'LOW': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'MEDIUM': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'HIGH': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'URGENT': 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
  };
  const colorClass = colors[p] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded border ${colorClass}`}>
      {priority}
    </span>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toUpperCase();
    const colors: Record<string, string> = {
        'OPEN': 'bg-blue-500/10 text-blue-300',
        'IN_PROGRESS': 'bg-purple-500/10 text-purple-300',
        'RESOLVED': 'bg-slate-800 text-slate-500',
        'CLOSED': 'bg-slate-900 text-slate-600',
    }
    return (
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${s === 'OPEN' ? 'bg-blue-400' : 'bg-slate-600'}`} />
        <span className={`text-[11px] font-bold uppercase tracking-tight ${colors[s] || 'text-slate-400'}`}>
          {status.replace('_', ' ')}
        </span>
      </div>
    );
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const status = ticket.status.toUpperCase();
  const isFinished = status === 'RESOLVED' || status === 'CLOSED';

  return (
    <Link 
      to={`/tickets/${ticket._id}`} 
      className={`group block h-full transition-all duration-500 ${isFinished ? "opacity-50 grayscale-[80%]" : "opacity-100"}`}
    >
      {/* REMOVED: shadow-xl, backdrop-blur 
          ADDED: Solid background with clear border contrast 
      */}
      <div className="bg-slate-900 rounded-xl p-6 h-full flex flex-col justify-between border border-slate-800 group-hover:border-slate-600 group-hover:bg-slate-800/40 transition-all duration-200">
        <div>
          <div className="flex justify-between items-center mb-5">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors line-clamp-1">
            {ticket.title}
          </h3>
          
          <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
            {ticket.description}
          </p>

          {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {ticket.relatedSkills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-[10px] bg-slate-950 text-slate-400 px-2.5 py-1 rounded-md border border-slate-800 group-hover:border-slate-700">
                  {skill.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <div className="text-[10px] text-sky-500 font-black tracking-[2px] opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 uppercase">
              Open Ticket
            </div>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;