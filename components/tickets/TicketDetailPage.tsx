import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, Role, TicketStatus } from '../../types';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { ShieldCheck, MessageSquare, Tag, Info, Clock } from 'lucide-react';

// --- BADGE COMPONENTS ---

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
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

  // ✅ FIX: Separate state for assignable users (moderators + admins only)
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);

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
        setAssignedToId(
          typeof fetchedTicket.assignedTo === 'object'
            ? fetchedTicket.assignedTo?._id
            : fetchedTicket.assignedTo || null
        );
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ticket details.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAssignableUsers = async () => {
      if (isAdmin) {
        const allUsers = await api.getAllUsers();
        // ✅ FIX: Filter to only moderators and admins
        // Regular users should never appear in the assignment dropdown
        const filtered = allUsers.filter(
          (u: any) => u.role === Role.MODERATOR || u.role === Role.ADMIN
        );
        setAssignableUsers(filtered);
      }
    };

    fetchTicket();
    fetchAssignableUsers();
  }, [id, isAdmin]);

  const handleSave = async () => {
    try {
      if (!ticket) return;
      let updatedTicketData = { ...ticket };

      if (isAdmin) {
        updatedTicketData = await api.updateTicket(ticket._id, {
          title,
          description,
          assignedTo: assignedToId,
        });
      }

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

  return (
    <div className={`max-w-4xl mx-auto space-y-6 transition-all duration-500 ${
      (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED)
        ? 'opacity-80'
        : 'opacity-100'
    }`}>

      {/* Duplicate Ticket Alert */}
      {ticket.isDuplicate && ticket.parentTicket && (
        <div className="bg-sky-500/10 border border-sky-500/30 p-5 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-sky-500/20 p-2 rounded-lg">
            <ShieldCheck className="text-sky-400" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-sky-100 font-bold text-sm mb-1">Deduplication Insight</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our AI engine identified this issue as a duplicate. It has been linked to the master ticket:
              <Link to={`/tickets/${ticket.parentTicket._id}`} className="text-sky-400 font-bold ml-1 hover:underline">
                "{ticket.parentTicket.title}"
              </Link>.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-black">Master Status:</span>
              <StatusBadge status={ticket.parentTicket.status} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.reportCount > 1 && (
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold border border-orange-500/20 animate-pulse">
                  🔥 {ticket.reportCount} Reports
                </span>
              )}
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
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Description
              </h2>
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-700/50 text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </section>

            {ticket.moderatorMessage && (
              <section className="animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} /> Resolution Notes
                </h2>
                <div className="bg-purple-500/5 p-5 rounded-xl border border-purple-500/20 text-slate-300 italic">
                  "{ticket.moderatorMessage}"
                </div>
              </section>
            )}

            {ticket.helpfulNotes && (
              <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 border-dashed">
                <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={16} className="animate-pulse" /> AI-Backing Insights
                </h2>
                <div className="text-sm text-slate-400 leading-relaxed">
                  {ticket.helpfulNotes}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-700/30">
              <h2 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Tag size={16} /> Metadata
              </h2>
              <div className="space-y-1">
                <DetailItem label="Assigned To">
                  <span className="font-semibold text-sky-200">
                    {typeof ticket.assignedTo === 'object'
                      ? ticket.assignedTo?.name
                      : 'Unassigned'}
                  </span>
                </DetailItem>
                <DetailItem label="Skills">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ticket.relatedSkills?.length ? (
                      ticket.relatedSkills.map(skill => (
                        <span key={skill} className="text-[10px] bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                          {skill.toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-600 text-xs italic">Not analyzed</span>
                    )}
                  </div>
                </DetailItem>
              </div>
            </div>

            <div className="px-2">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-tighter">
                <Clock size={12} />
                Last Sync: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Assigned Moderator
                    </label>
                    <select
                      value={assignedToId || ''}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {/* ✅ FIX: Only moderators and admins shown — regular users filtered out */}
                      {assignableUsers.map((u: any) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
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
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Internal Notes / Message
                </label>
                <textarea
                  value={moderatorMessage}
                  onChange={(e) => setModeratorMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:border-sky-500 outline-none"
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