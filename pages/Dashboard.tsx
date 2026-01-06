import React, { useEffect, useState } from 'react';
import { User, Student, Event, Result, Registration, House, UserRole } from '../types';
import { getStudents, getEvents, getResults, getRegistrations, getSpecialPoints } from '../services/storage';
import { Users, Trophy, Flag, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    completedEvents: 0,
    myStudents: 0,
    housePoints: [] as { name: string; points: number; fill: string }[]
  });

  useEffect(() => {
    const students = getStudents();
    const events = getEvents();
    const results = getResults();
    const specialPoints = getSpecialPoints();

    // Calculate House Points
    const houseScores = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };
    
    // 1. Points from Results
    results.forEach(r => {
      const event = events.find(e => e.id === r.eventId);
      if (!event) return;

      const isTeam = event.isTeamEvent;
      // Points allocation: 
      // Individual: 5, 3, 1
      // Team: 7, 5, 3
      const pts1 = isTeam ? 7 : 5;
      const pts2 = isTeam ? 5 : 3;
      const pts3 = isTeam ? 3 : 1;

      const getStudentHouse = (sid: string | undefined) => students.find(s => s.id === sid)?.house;
      
      const firstHouse = getStudentHouse(r.firstPlaceStudentId);
      const secondHouse = getStudentHouse(r.secondPlaceStudentId);
      const thirdHouse = getStudentHouse(r.thirdPlaceStudentId);

      if (firstHouse) houseScores[firstHouse] += pts1;
      if (secondHouse) houseScores[secondHouse] += pts2;
      if (thirdHouse) houseScores[thirdHouse] += pts3;
    });

    // 2. Add Special Points
    specialPoints.forEach(sp => {
        if (houseScores[sp.house] !== undefined) {
            houseScores[sp.house] += sp.points;
        }
    });

    const housePointsData = [
      { name: House.ANKARA, points: houseScores[House.ANKARA], fill: '#ef4444' }, // Red
      { name: House.BAGDAD, points: houseScores[House.BAGDAD], fill: '#10b981' }, // Green
      { name: House.CAIRO, points: houseScores[House.CAIRO], fill: '#3b82f6' },   // Blue
    ];

    setStats({
      totalStudents: students.length,
      totalEvents: events.length,
      completedEvents: results.length,
      myStudents: user.house ? students.filter(s => s.house === user.house).length : students.length,
      housePoints: housePointsData
    });
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user.username}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Events" 
          value={stats.totalEvents} 
          icon={Trophy} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Events Completed" 
          value={stats.completedEvents} 
          icon={Medal} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title={user.role === UserRole.CAPTAIN ? "My Students" : "Total Students"} 
          value={stats.myStudents} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Registrations" 
          value={getRegistrations().length} 
          icon={Flag} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Live House Points</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.housePoints}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {stats.housePoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-4">
             {user.role === UserRole.ADMIN && (
               <p className="text-gray-600">Go to Event Management to create new events or Special Points to award extras.</p>
             )}
             {user.role === UserRole.CAPTAIN && (
               <p className="text-gray-600">Ensure all your students are registered before the deadline. Check the Registration tab.</p>
             )}
             {user.role === UserRole.JUDGE && (
               <p className="text-gray-600">Head to Judging to enter results for your assigned events.</p>
             )}
             <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm">
                <strong>Point System:</strong><br/>
                Individual: 5, 3, 1<br/>
                Team: 7, 5, 3
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};