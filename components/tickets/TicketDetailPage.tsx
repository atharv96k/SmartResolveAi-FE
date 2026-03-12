import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, Role, TicketStatus, Priority } from '../../types';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

// --- UPDATED BADGE COMPONENTS TO MATCH DASHBOARD STYLE ---

const DetailItem = ({ label, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-slate-700/50 last:border-0">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex items-center">{children}</dd>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase() || 'OPEN';
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-500/20 text-blue-300',
    IN_PROGRESS: 'bg-purple-500/20 text-purple-300',
    RESOLVED: 'bg-slate-500/20 text-slate-400',
    CLOSED: 'bg-slate-900/40 text-slate-500',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${s === 'OPEN' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'bg-current'}`} />
      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${colors[s] || colors.OPEN}`}>
        {s.replace('_', ' ')}
      </span>
    </div>
  );
};

const PriorityBadge = ({ priority }: { priority?: string }) => {
  if (!priority) return <span className="text-slate-500 text-xs italic">Not Set</span>;
  
  const p = priority.toUpperCase();
  const colors: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
  };

  return (
    <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded border ${colors[p] || 'bg-slate-700 text-slate-300'}`}>
      {p}
    </span>
  );
};

// --- MAIN PAGE COMPONENT ---

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [moderatorMessage, setModeratorMessage] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [users, setUsers] = useState([]);

  const isAdmin = user?.role === Role.ADMIN;
  const isModerator = user?.role === Role.MODERATOR;

  useEffect(() => {
    if (!id) {
      setError('Invalid ticket ID.');
      setIsLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const fetchedTicket = await api.getTicketById(id);
        setTicket(fetchedTicket);
        setTitle(fetchedTicket.title);
        setDescription(fetchedTicket.description);
        setStatus(fetchedTicket.status);
        setModeratorMessage(fetchedTicket.moderatorMessage || '');
        setAssignedToId(fetchedTicket.assignedTo?._id || null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    if (isAdmin) {
      api.getAllUsers().then(setUsers);
    }
  }, [id, isAdmin]);

  const handleSave = async () => {
    try {
      if (!ticket) return;
      let updatedTicketData = { ...ticket };

      // 1. Admin updates Title/Description/Assignment
      if (isAdmin) {
        updatedTicketData = await api.updateTicket(ticket._id, {
          title,
          description,
          assignedTo: assignedToId,
        });
      }

      // 2. Admin or Moderator updates Status/Message
      if (isAdmin || isModerator) {
        updatedTicketData = await api.updateTicketStatus(ticket._id, {
          status,
          moderatorMessage,
        });
      }

      setTicket(updatedTicketData);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400 p-10">{error}</div>;
  if (!ticket) return <div className="text-center text-slate-400 p-10">Ticket not found.</div>;

  const assignedToName = ticket.assignedTo?.name || 'Unassigned';

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-500 ${
      (ticket.status === TicketStatus.RESOLVED|| ticket.status === TicketStatus.CLOSED) ? 'opacity-80' : 'opacity-100'
    }`}>
      <div className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <StatusBadge status={ticket.status} />
               <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-3xl font-bold text-white">{ticket.title}</h1>
            <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">
              ID: {ticket._id} • Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          {(isAdmin || isModerator) && (
            <Button onClick={() => setEditMode(true)} className="bg-sky-600 hover:bg-sky-500">
              Update Ticket
            </Button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-3">Description</h2>
              <div className="bg-slate-900/30 p-5 rounded-lg border border-slate-700/50 text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </section>

            {ticket.moderatorMessage && (
              <section className="animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">Resolution Notes</h2>
                <div className="bg-purple-500/5 p-5 rounded-lg border border-purple-500/20 text-slate-300 italic">
                  "{ticket.moderatorMessage}"
                </div>
              </section>
            )}

            {(ticket.aiNotes || ticket.helpfulNotes) && (
              <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 border-dashed">
                <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                  Suggestions:
                </h2>
                <div className="space-y-4 text-sm text-slate-400">
                   {/* {ticket.aiNotes && <p><strong className="text-slate-300">Analysis:</strong> {ticket.aiNotes}</p>} */}
                   {ticket.helpfulNotes && <p><strong className="text-slate-300"></strong> {ticket.helpfulNotes}</p>}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-slate-900/20 p-6 rounded-xl border border-slate-700/30 h-fit">
            <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-4">Metadata</h2>
            <div className="space-y-1">
              <DetailItem label="Assigned To">
                <span className="font-semibold text-sky-200">{assignedToName}</span>
              </DetailItem>
              <DetailItem label="Skills">
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.relatedSkills?.length ? (
                    ticket.relatedSkills.map(skill => (
                      <span key={skill} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{skill}</span>
                    ))
                  ) : <span className="text-slate-600 text-xs">None</span>}
                </div>
              </DetailItem>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Enhanced) */}
      {editMode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <h2 className="text-2xl font-bold text-white">Update Status & Assignment</h2>
              <p className="text-slate-400 text-sm">Modify ticket details and resolution notes.</p>
            </div>

            <div className="space-y-4">
              {isAdmin && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ticket Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Assigned Moderator</label>
                    <select
                      value={assignedToId || ''}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u: any) => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Workflow Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Internal Notes / Message</label>
                <textarea
                  value={moderatorMessage}
                  onChange={(e) => setModeratorMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none transition-all"
                  placeholder="Explain the resolution or progress..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-sky-600">Save Changes</Button>
              <Button onClick={() => setEditMode(false)} className="flex-1 bg-slate-700">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;