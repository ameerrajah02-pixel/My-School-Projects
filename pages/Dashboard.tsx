import React, { useEffect, useState } from 'react';
import { User, Student, Event, Result, Registration, House, UserRole } from '../types';
import { getStudents, getEvents, getResults, getRegistrations, getSpecialPoints } from '../services/storage';
import { Users, Trophy, Flag, Medal } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    completedEvents: 0,
    myStudents: 0,
    housePoints: [] as { name: string; points: number; fill: string }[],
    houseMedals: [] as { name: string; value: number; fill: string }[]
  });

  useEffect(() => {
    const students = getStudents();
    const events = getEvents();
    const results = getResults();
    const specialPoints = getSpecialPoints();

    // Calculate House Stats
    const houseScores = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };
    const houseMedalCounts = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };
    
    // 1. Process Results
    results.forEach(r => {
      const event = events.find(e => e.id === r.eventId);
      if (!event) return;

      const isTeam = event.isTeamEvent;
      const pts1 = isTeam ? 7 : 5;
      const pts2 = isTeam ? 5 : 3;
      const pts3 = isTeam ? 3 : 1;

      const getStudentHouse = (sid: string | undefined) => students.find(s => s.id === sid)?.house;
      
      const firstHouse = getStudentHouse(r.firstPlaceStudentId);
      const secondHouse = getStudentHouse(r.secondPlaceStudentId);
      const thirdHouse = getStudentHouse(r.thirdPlaceStudentId);

      if (firstHouse) {
        houseScores[firstHouse] += pts1;
        houseMedalCounts[firstHouse] += 1;
      }
      if (secondHouse) {
        houseScores[secondHouse] += pts2;
        houseMedalCounts[secondHouse] += 1;
      }
      if (thirdHouse) {
        houseScores[thirdHouse] += pts3;
        houseMedalCounts[thirdHouse] += 1;
      }
    });

    // 2. Add Special Points
    specialPoints.forEach(sp => {
        if (houseScores[sp.house] !== undefined) {
            houseScores[sp.house] += sp.points;
        }
    });

    const housePointsData = [
      { name: House.ANKARA, points: houseScores[House.ANKARA], fill: '#9333ea' }, // Purple
      { name: House.BAGDAD, points: houseScores[House.BAGDAD], fill: '#db2777' }, // Pink
      { name: House.CAIRO, points: houseScores[House.CAIRO], fill: '#7f1d1d' },   // Maroon (Red-900)
    ];

    const houseMedalsData = [
      { name: House.ANKARA, value: houseMedalCounts[House.ANKARA], fill: '#9333ea' },
      { name: House.BAGDAD, value: houseMedalCounts[House.BAGDAD], fill: '#db2777' },
      { name: House.CAIRO, value: houseMedalCounts[House.CAIRO], fill: '#7f1d1d' },
    ];

    setStats({
      totalStudents: students.length,
      totalEvents: events.length,
      completedEvents: results.length,
      myStudents: user.house ? students.filter(s => s.house === user.house).length : students.length,
      housePoints: housePointsData,
      houseMedals: houseMedalsData
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-bold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value !== undefined ? data.value : data.points} {data.points !== undefined ? 'Points' : 'Medals'}
          </p>
        </div>
      );
    }
    return null;
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Bar Chart - Points */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Live House Points (Leaderboard)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.housePoints}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {stats.housePoints.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-4 flex-1">
             {user.role === UserRole.ADMIN && (
               <p className="text-gray-600 text-sm">Go to <strong>Event Management</strong> to create new events or <strong>Special Points</strong> to award extras.</p>
             )}
             {user.role === UserRole.CAPTAIN && (
               <p className="text-gray-600 text-sm">Ensure all your students are registered before the deadline. Check the <strong>Registration</strong> tab.</p>
             )}
             {user.role === UserRole.JUDGE && (
               <p className="text-gray-600 text-sm">Head to <strong>Judging</strong> to enter results for your assigned events.</p>
             )}
             <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-sm mt-auto">
                <strong>Point System:</strong><br/>
                Individual: 5, 3, 1<br/>
                Team: 7, 5, 3
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart - Points Share */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-800 mb-4">Points Distribution (Share)</h2>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.housePoints}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="points"
                    >
                        {stats.housePoints.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Pie Chart - Medal Share */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold text-gray-800 mb-4">Total Medals Won (Share)</h2>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.houseMedals}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {stats.houseMedals.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};