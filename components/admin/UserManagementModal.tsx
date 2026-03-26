import React, { useState, useMemo, useEffect } from 'react';
import { User, Role } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';

interface UserManagementModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ user, onClose, onUpdate }) => {
  const [role, setRole] = useState<Role>(user.role);
  // Memoize initial skills to prevent unnecessary re-renders
  const initialSkills = useMemo(() => user.skills?.join(', ') || '', [user.skills]);
  const [skills, setSkills] = useState<string>(initialSkills);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear skills if the role is switched to USER, as they don't have technical expertise
  useEffect(() => {
    if (role === Role.USER) {
      setSkills('');
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.email) {
      setError("User email context is missing. Please refresh and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare the data to send. Skills are split by comma and trimmed.
      const skillsArray = role === Role.USER 
        ? [] 
        : skills.split(',').map(s => s.trim()).filter(Boolean);

      // Perform the API call using the structured data
      const response = await api.updateUser({
        email: user.email,
        role: role,
        skills: skillsArray
      });

      // Your API likely returns { message: string, user: User } based on your backend code
      // We pass the updated user object back to the parent to update state
      const updatedUser = response.user || response; 
      onUpdate(updatedUser);
      
    } catch (err: any) {
      const message = err.message || 'Failed to update user. Please try again.';
      setError(message);
      console.error("Update User Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 backdrop-blur-sm transition-all" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4 border border-slate-700 animate-in fade-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-1">Update Permissions</h2>
            <p className="text-sm text-slate-400 mb-6">Editing Profile: <span className="text-sky-400 font-medium">{user.name}</span></p>

            {error && (
              <div className="p-3 mb-6 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  System Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                >
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r}>{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {role !== Role.USER && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label htmlFor="skills" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Expertise Areas (comma-separated)
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    placeholder="e.g. java, spring-boot, react"
                  />
                  <p className="mt-2 text-[10px] text-slate-500 italic">
                    These keywords allow the AI to route relevant technical tickets to this user.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 px-8 py-5 flex justify-end space-x-3 rounded-b-xl border-t border-slate-700">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="px-6 bg-sky-600 hover:bg-sky-500"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;