import React, { useState, useMemo } from 'react';
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
  // useMemo prevents unnecessary re-joins on every minor render
  const initialSkills = useMemo(() => user.skills?.join(', ') || '', [user.skills]);
  const [skills, setSkills] = useState<string>(initialSkills);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation: Ensure we aren't sending an empty email (auth risk)
    if (!user.email) {
      setError("User context lost. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // 2. API Call: Ensure your api service handles the Bearer token internally
      const updatedUser = await api.updateUser({
        email: user.email,
        role: role,
        skills: skillsArray
      });

      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      // 3. Detailed Error Handling: 
      // Captures 401 (Unauthorized) or 403 (Forbidden) specifically
      const message = err.response?.status === 401 
        ? "Session expired. Please log in again." 
        : err.response?.data?.message || err.message || 'Failed to update user.';
      
      setError(message);
      console.error("Update User Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md m-4 border border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Edit User: {user.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{user.email}</p>

            {error && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">
                  User Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {Object.values(Role).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="e.g. react, node, typescript"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isLoading}
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