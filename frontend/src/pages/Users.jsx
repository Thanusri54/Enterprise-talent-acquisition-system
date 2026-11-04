import React, { useState, useEffect } from 'react';
import api from '../services/api';
import store from '../services/store';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { UserCog, Plus, Mail, Shield, Trash2, Edit3, UserCheck, UserX, Search, Key, Sparkles } from 'lucide-react';

const Users = () => {
  const toast = useToast();
  const [users, setUsers] = useState(store.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'RECRUITER',
    department: 'Talent Acquisition'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data && res.data.length > 0) {
        setUsers(res.data);
      } else {
        setUsers(store.getUsers());
      }
    } catch (err) {
      setUsers(store.getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        store.updateUser(editingUser.id, formData);
        toast.success(`User ${formData.name} updated.`);
      } else {
        store.addUser(formData);
        try { await api.post('/auth/register', formData); } catch (err) {}
        toast.success(`User ${formData.name} created.`);
      }
    } catch (err) {
      toast.error('Failed to save user.');
    }
    setShowAddModal(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleToggleStatus = (targetUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    store.updateUser(targetUser.id, { status: newStatus });
    toast.info(`Account status for ${targetUser.name} set to ${newStatus}.`);
    loadUsers();
  };

  const executeDeleteUser = (id) => {
    store.deleteUser(id);
    toast.success('User account removed successfully.');
    loadUsers();
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: 'password123',
      role: u.role || 'RECRUITER',
      department: u.department || 'Engineering'
    });
    setShowAddModal(true);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-950/60 text-purple-400 border-purple-800';
      case 'HR':
      case 'HR_MANAGER': return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 'RECRUITER': return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
      case 'INTERVIEWER': return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 'CANDIDATE': return 'bg-cyan-950/60 text-cyan-400 border-cyan-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Admin User & Role Governance</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Auth Service :8081
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">RBAC permissions, enterprise user accounts, and authenticated credentials</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-purple-500/20 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New System User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Accounts: <strong className="text-purple-400">{filteredUsers.length}</strong>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredUsers.map((u) => {
                const initials = (u.name || 'User')
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{u.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase font-mono ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {u.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        u.status === 'ACTIVE' || !u.status ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-rose-950/60 text-rose-400 border-rose-800'
                      }`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded transition-colors ${
                            u.status === 'ACTIVE' || !u.status ? 'text-amber-400 hover:bg-amber-950/40' : 'text-emerald-400 hover:bg-emerald-950/40'
                          }`}
                          title={u.status === 'ACTIVE' || !u.status ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.status === 'ACTIVE' || !u.status ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded hover:bg-slate-800"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-rose-950/30"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2 pb-3 border-b border-slate-800">
              <UserCog className="w-4 h-4 text-purple-400" />
              <span>{editingUser ? 'Edit User Account' : 'Add New System User'}</span>
            </h3>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text" required name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="Suresh Rao" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Corporate Email *</label>
                <input
                  type="email" required name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="suresh@company.com" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Assign System Role *</label>
                <select
                  name="role" value={formData.role} onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-purple-500 font-semibold"
                >
                  <option value="ADMIN">ADMIN - Platform Control</option>
                  <option value="HR">HR - Hiring Manager</option>
                  <option value="RECRUITER">RECRUITER - Talent Sourcing</option>
                  <option value="INTERVIEWER">INTERVIEWER - Technical Panel</option>
                  <option value="CANDIDATE">CANDIDATE - Applicant</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text" name="department" value={formData.department} onChange={handleInputChange}
                  placeholder="Engineering" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {editingUser ? 'Save User Changes' : 'Create System User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={() => {
          if (deleteConfirmUser) executeDeleteUser(deleteConfirmUser.id);
        }}
        title="Remove User Account"
        message={`Are you sure you want to remove the user account for "${deleteConfirmUser?.name}" (${deleteConfirmUser?.email})?`}
        confirmText="Remove Account"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Users;
