import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/storage';
import { Trophy, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginUser(username, password);
    if (user) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Trophy className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Sulaimaniya College</h1>
          <p className="text-blue-100">Inter House Sports Meet 2026</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter password"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              Access System
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
            <p className="font-semibold mb-2">Default Passwords:</p>
            <ul className="space-y-1">
              <li>Admin: <code className="bg-gray-100 px-1 rounded">admin123</code></li>
              <li>Captains: <code className="bg-gray-100 px-1 rounded">1234</code></li>
              <li>Judge: <code className="bg-gray-100 px-1 rounded">judge123</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};