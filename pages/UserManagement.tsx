import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, House } from '../types';
import { getUsers, saveUser, deleteUser, getCurrentUser } from '../services/storage';
import { Plus, Trash2, Edit2, Shield, Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    password: '',
    role: UserRole.CAPTAIN,
    house: undefined
  });

  const loadUsers = () => {
    setUsers(getUsers());
    const current = getCurrentUser();
    setCurrentUser(current);

    // Strict Access Control: Only ADMIN allowed
    if (current?.role !== UserRole.ADMIN) {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
        alert("Username and Password are required");
        return;
    }

    if (formData.role === UserRole.CAPTAIN && !formData.house) {
        alert("A House must be assigned for Captains");
        return;
    }

    // Check unique username
    if (!editingUser) {
        const exists = users.some(u => u.username.toLowerCase() === formData.username?.toLowerCase());
        if (exists) {
            alert("Username already exists!");
            return;
        }
    }

    const payload: User = {
      id: editingUser ? editingUser.id : uuidv4(),
      username: formData.username!,
      password: formData.password!,
      role: formData.role!,
      house: formData.role === UserRole.CAPTAIN ? formData.house : undefined
    };

    saveUser(payload);
    closeModal();
    loadUsers();
  };

  const handleDelete = (id: string) => {
    // Safety check against deleting self, though UI hides the button
    const current = getCurrentUser();
    if (id === current?.id) {
        alert("You cannot delete your own account.");
        return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(id);
      loadUsers(); // Refresh the list immediately
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '', // Default blank for new users
        role: UserRole.CAPTAIN,
        house: House.ANKARA
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500">Create accounts for House Captains, Judges, and Editors.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Password</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">House Assigned</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                    <Shield size={16} className="mr-2 text-gray-400" />
                    {u.username}
                    {currentUser?.id === u.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">
                   {u.password}
                </td>
                <td className="px-6 py-4 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                          u.role === UserRole.CAPTAIN ? 'bg-blue-100 text-blue-700' : 
                          u.role === UserRole.EDITOR ? 'bg-green-100 text-green-700' :
                          'bg-amber-100 text-amber-700'}`}>
                        {u.role}
                    </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                   {u.house ? (
                       <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${u.house === House.ANKARA ? 'bg-purple-100 text-purple-700' : 
                          u.house === House.BAGDAD ? 'bg-pink-100 text-pink-700' : 
                          'bg-red-100 text-red-900'}`}>
                        {u.house}
                      </span>
                   ) : '-'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    type="button"
                    onClick={() => openModal(u)} 
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={16} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(u.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete User"
                    >
                        <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Set password" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {Object.values(UserRole).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {formData.role === UserRole.CAPTAIN && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned House</label>
                        <select value={formData.house} onChange={e => setFormData({...formData, house: e.target.value as House})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Select House --</option>
                            {Object.values(House).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};