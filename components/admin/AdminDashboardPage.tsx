import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import Spinner from '../common/Spinner';
import UserManagementModal from './UserManagementModal';
import Button from '../common/Button';

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const colors = {
    [Role.USER]: 'bg-gray-500/20 text-gray-300',
    [Role.MODERATOR]: 'bg-blue-500/20 text-blue-300',
    [Role.ADMIN]: 'bg-purple-500/20 text-purple-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${colors[role]}`}>{role}</span>;
};

const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await api.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    // Map through current users and replace the updated one to trigger a re-render
    setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
    handleModalClose();
  };

  const admins = useMemo(() => users.filter(u => u.role === Role.ADMIN), [users]);
  const moderators = useMemo(() => users.filter(u => u.role === Role.MODERATOR), [users]);
  const standardUsers = useMemo(() => users.filter(u => u.role === Role.USER), [users]);

  const renderUserTable = (title: string, userList: User[], showSkills: boolean) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-sky-400 mb-4 px-2 border-l-4 border-sky-500">{title}</h2>
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Role</th>
              {showSkills && <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Skills</th>}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {userList.map((user) => (
              <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"><RoleBadge role={user.role} /></td>
                {showSkills && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="flex flex-wrap gap-1">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map(skill => (
                          <span key={skill} className="px-2 py-0.5 text-xs bg-slate-700 rounded-md border border-slate-600">{skill}</span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-xs">No skills set</span>
                      )}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="text-sky-400 hover:text-sky-300">Edit</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300" 
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {userList.length === 0 && (
              <tr>
                <td colSpan={showSkills ? 5 : 4} className="px-6 py-10 text-center text-slate-500 italic">
                  No users found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400 p-10">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Administrators can adjust roles, manage technical skills, or remove accounts.</p>
      </div>
      
      {renderUserTable("Administrators", admins, true)}
      {renderUserTable("Moderators", moderators, true)}
      {renderUserTable("Standard Users", standardUsers, false)}

      {isModalOpen && selectedUser && (
        <UserManagementModal 
          user={selectedUser} 
          onClose={handleModalClose}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;