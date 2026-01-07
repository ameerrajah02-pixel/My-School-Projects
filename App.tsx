import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Events } from './pages/Events';
import { EventScheduler } from './pages/EventScheduler';
import { RegistrationPage } from './pages/Registration';
import { Judging } from './pages/Judging';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { SpecialPoints } from './pages/SpecialPoints';
import { AuditLogs } from './pages/AuditLogs';
import { PublicLanding } from './pages/PublicLanding';
import { Layout } from './components/Layout';
import { getCurrentUser } from './services/storage';
import { User } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: (user: User) => React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const location = useLocation();

  useEffect(() => {
    // Re-check user on route change (sync state with local storage updates if any)
    setUser(getCurrentUser());
  }, [location]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout user={user}>{children(user)}</Layout>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {(user) => <Dashboard user={user} />}
          </ProtectedRoute>
        } />
        
        <Route path="/students" element={
          <ProtectedRoute>
            {(user) => <Students user={user} />}
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={
          <ProtectedRoute>
            {() => <Events />}
          </ProtectedRoute>
        } />

        <Route path="/scheduler" element={
          <ProtectedRoute>
            {() => <EventScheduler />}
          </ProtectedRoute>
        } />

        <Route path="/registration" element={
          <ProtectedRoute>
            {(user) => <RegistrationPage user={user} />}
          </ProtectedRoute>
        } />
        
        <Route path="/judging" element={
          <ProtectedRoute>
            {() => <Judging />}
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            {() => <Reports />}
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            {() => <UserManagement />}
          </ProtectedRoute>
        } />

        <Route path="/special-points" element={
          <ProtectedRoute>
            {() => <SpecialPoints />}
          </ProtectedRoute>
        } />

        <Route path="/audit-logs" element={
          <ProtectedRoute>
            {() => <AuditLogs />}
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;