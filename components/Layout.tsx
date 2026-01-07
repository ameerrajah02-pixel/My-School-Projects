import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { logoutUser } from '../services/storage';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Trophy, 
  ClipboardList, 
  Gavel, 
  FileBarChart,
  Settings,
  Star,
  History,
  CalendarClock
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const navItemClass = (path: string) => `
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
    ${location.pathname === path 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
  `;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
      {/* Sidebar - Hidden on print */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col items-center mb-6">
              <div className="bg-slate-700 p-3 rounded-full mb-3">
                 <Trophy className="text-blue-400" size={32} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-center leading-tight">Sulaimaniya<br/><span className="text-blue-400">Sports 2026</span></h1>
          </div>
          <div className="mt-2 text-xs uppercase tracking-wider text-slate-400 text-center">
            {user.role} {user.house ? `- ${user.house}` : ''}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => navigate('/dashboard')} className={navItemClass('/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {/* Admin Routes */}
          {user.role === UserRole.ADMIN && (
            <>
              <button onClick={() => navigate('/events')} className={navItemClass('/events')}>
                <Trophy size={20} />
                <span>Event Management</span>
              </button>
              <button onClick={() => navigate('/scheduler')} className={navItemClass('/scheduler')}>
                <CalendarClock size={20} />
                <span>Event Scheduler</span>
              </button>
              <button onClick={() => navigate('/students')} className={navItemClass('/students')}>
                <Users size={20} />
                <span>All Students</span>
              </button>
              <button onClick={() => navigate('/special-points')} className={navItemClass('/special-points')}>
                <Star size={20} />
                <span>Special Points</span>
              </button>
              <button onClick={() => navigate('/users')} className={navItemClass('/users')}>
                <Settings size={20} />
                <span>User Management</span>
              </button>
              <button onClick={() => navigate('/audit-logs')} className={navItemClass('/audit-logs')}>
                <History size={20} />
                <span>Activity Logs</span>
              </button>
            </>
          )}

          {/* Captain Routes */}
          {user.role === UserRole.CAPTAIN && (
            <>
              <button onClick={() => navigate('/students')} className={navItemClass('/students')}>
                <Users size={20} />
                <span>My Team</span>
              </button>
              <button onClick={() => navigate('/registration')} className={navItemClass('/registration')}>
                <ClipboardList size={20} />
                <span>Registration</span>
              </button>
            </>
          )}

          {/* Judge Routes */}
          {(user.role === UserRole.JUDGE || user.role === UserRole.ADMIN) && (
            <button onClick={() => navigate('/judging')} className={navItemClass('/judging')}>
              <Gavel size={20} />
              <span>Judging & Results</span>
            </button>
          )}

           {/* All except regular users if any */}
           <button onClick={() => navigate('/reports')} className={navItemClass('/reports')}>
            <FileBarChart size={20} />
            <span>Reports & Stats</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full px-4 py-2 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white print:overflow-visible print:h-auto print:block">
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible print:h-auto">
          {children}
        </div>
      </main>
    </div>
  );
};