import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, Event, Result, Student, EventStatus } from '../types';
import { getEvents, getResults, getStudents, getSpecialPoints } from '../services/storage';
import { Trophy, Calendar, Clock, LogIn, Medal, Award, Activity, List, ChevronRight } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

export const PublicLanding: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    houseStats: { name: House; points: number; gold: number; silver: number; bronze: number; special: number; fill: string }[];
    recentResults: (Result & { eventName: string; winner: string; winnerHouse?: House })[];
    upcomingEvents: Event[];
    allScheduledEvents: Event[];
    cumulativeData: any[];
  }>({
    houseStats: [],
    recentResults: [],
    upcomingEvents: [],
    allScheduledEvents: [],
    cumulativeData: []
  });

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2070", // Running/Track
    "https://images.unsplash.com/photo-1531685250784-756f9f674884?auto=format&fit=crop&q=80&w=2070", // Celebration/Trophy
    "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=2070", // Team Huddle
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=2070", // Sports Action
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=2070"  // Stadium/Crowd
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const students = getStudents();
    const events = getEvents();
    const results = getResults();
    const specialPoints = getSpecialPoints();

    // 1. Calculate House Points & Medals (Totals)
    const houseData = {
      [House.ANKARA]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#9333ea' }, // Purple
      [House.BAGDAD]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#db2777' }, // Pink
      [House.CAIRO]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#7f1d1d' },  // Maroon
    };

    // Helper to get house from student ID
    const getHouse = (id?: string) => students.find(s => s.id === id)?.house;

    // --- CUMULATIVE GRAPH CALCULATION START ---
    
    // Create a timeline of score changes
    let timeline: { name: string; date: number; points: { [key in House]: number } }[] = [];

    // Add Event Results to timeline
    results.forEach(r => {
      const event = events.find(e => e.id === r.eventId);
      if (!event) return;

      const isTeam = event.isTeamEvent;
      const pts = isTeam ? [7, 5, 3] : [5, 3, 1];
      const eventPoints = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };

      // Helper to add points for this specific event
      const addPts = (sid: string | undefined, idx: number) => {
        const h = getHouse(sid);
        if (h) eventPoints[h] += pts[idx];
      };

      addPts(r.firstPlaceStudentId, 0);
      addPts(r.secondPlaceStudentId, 1);
      addPts(r.thirdPlaceStudentId, 2);

      // Add to timeline
      timeline.push({
        name: event.name,
        date: event.schedule ? new Date(event.schedule).getTime() : 0, // Fallback for sorting
        points: eventPoints
      });

      // Update Total Stats (Existing Logic)
      Object.keys(eventPoints).forEach(h => {
        const house = h as House;
        houseData[house].points += eventPoints[house];
      });
      
      // Update Medal Counts
      const h1 = getHouse(r.firstPlaceStudentId);
      const h2 = getHouse(r.secondPlaceStudentId);
      const h3 = getHouse(r.thirdPlaceStudentId);
      if (h1) houseData[h1].gold++;
      if (h2) houseData[h2].silver++;
      if (h3) houseData[h3].bronze++;
    });

    // Sort timeline by date
    timeline.sort((a, b) => a.date - b.date);

    // Calculate running totals
    let runningTotals = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };
    const cumulativeGraphData = [
      { name: 'Start', [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 } // Initial point
    ];

    timeline.forEach(item => {
      runningTotals[House.ANKARA] += item.points[House.ANKARA];
      runningTotals[House.BAGDAD] += item.points[House.BAGDAD];
      runningTotals[House.CAIRO] += item.points[House.CAIRO];

      cumulativeGraphData.push({
        name: item.name,
        [House.ANKARA]: runningTotals[House.ANKARA],
        [House.BAGDAD]: runningTotals[House.BAGDAD],
        [House.CAIRO]: runningTotals[House.CAIRO],
      });
    });

    // Add Special Points as a final step in the graph (since they don't have a schedule date)
    let specialPointsTotal = { [House.ANKARA]: 0, [House.BAGDAD]: 0, [House.CAIRO]: 0 };
    specialPoints.forEach(sp => {
      if (houseData[sp.house]) {
        houseData[sp.house].points += sp.points;
        houseData[sp.house].special += sp.points;
        specialPointsTotal[sp.house] += sp.points;
      }
    });

    // Push final special points jump if any exist
    if (specialPoints.length > 0) {
       runningTotals[House.ANKARA] += specialPointsTotal[House.ANKARA];
       runningTotals[House.BAGDAD] += specialPointsTotal[House.BAGDAD];
       runningTotals[House.CAIRO] += specialPointsTotal[House.CAIRO];
       
       cumulativeGraphData.push({
         name: 'Special Points Awarded',
         [House.ANKARA]: runningTotals[House.ANKARA],
         [House.BAGDAD]: runningTotals[House.BAGDAD],
         [House.CAIRO]: runningTotals[House.CAIRO],
       });
    }

    // --- CUMULATIVE GRAPH CALCULATION END ---

    const houseStats = Object.values(House).map(h => ({
      name: h,
      ...houseData[h]
    })).sort((a, b) => b.points - a.points);

    // 2. Recent Results
    const processedResults = [...results].reverse().slice(0, 5).map(r => {
      const event = events.find(e => e.id === r.eventId);
      const winner = students.find(s => s.id === r.firstPlaceStudentId);
      return {
        ...r,
        eventName: event ? event.name : 'Unknown Event',
        winner: winner ? winner.fullName : 'Unknown',
        winnerHouse: winner?.house
      };
    });

    // 3. Upcoming Events
    const scheduled = events
        .filter(e => e.schedule && e.status !== EventStatus.COMPLETED)
        .sort((a, b) => new Date(a.schedule!).getTime() - new Date(b.schedule!).getTime());

    // 4. All Scheduled
    const allScheduled = events
        .filter(e => e.schedule)
        .sort((a, b) => new Date(a.schedule!).getTime() - new Date(b.schedule!).getTime());

    setStats({
      houseStats,
      recentResults: processedResults,
      upcomingEvents: scheduled.slice(0, 5),
      allScheduledEvents: allScheduled,
      cumulativeData: cumulativeGraphData
    });
  }, []);

  const maxPoints = Math.max(...stats.houseStats.map(h => h.points), 100); // Dynamic max

  const Speedometer = ({ data }: { data: typeof stats.houseStats[0] }) => {
    const chartData = [
      { name: 'Points', value: data.points, fill: data.fill },
      { name: 'Remaining', value: (maxPoints * 1.2) - data.points, fill: '#f3f4f6' }
    ];

    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{data.name}</h3>
        <div className="h-32 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius="70%"
                outerRadius="100%"
                dataKey="value"
                stroke="none"
              >
                <Cell fill={data.fill} />
                <Cell fill="#f3f4f6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 text-center mb-2">
            <span className="text-3xl font-bold text-gray-900">{data.points}</span>
            <span className="text-xs text-gray-500 block">POINTS</span>
          </div>
        </div>
        <div className="mt-2 flex space-x-3 text-sm">
           <div className="flex items-center" title="Gold"><div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div>{data.gold}</div>
           <div className="flex items-center" title="Silver"><div className="w-2 h-2 rounded-full bg-gray-400 mr-1"></div>{data.silver}</div>
           <div className="flex items-center" title="Bronze"><div className="w-2 h-2 rounded-full bg-orange-400 mr-1"></div>{data.bronze}</div>
        </div>
      </div>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Custom Styles for Animation */}
      <style>{`
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: textShimmer 3s linear infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
      
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Trophy className="text-yellow-400" size={28} />
              <div>
                <h1 className="text-lg font-bold leading-tight">Sulaimaniya College</h1>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Inter House Sports Meet 2026</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[450px] md:h-[500px] w-full overflow-hidden bg-slate-900 shadow-xl">
        {heroImages.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-40' : 'opacity-0'}`}
            style={{ 
              backgroundImage: `url(${img})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          />
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="animate-fade-up text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white animate-text-shimmer pb-2">
                        Sulaimaniya College
                    </span>
                </h1>
                <h2 className="animate-fade-up text-2xl md:text-4xl font-bold text-blue-100 mb-8 drop-shadow-lg flex items-center justify-center" style={{animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards'}}>
                    <span className="hidden md:block h-px w-12 bg-blue-400 mr-4"></span>
                    Inter House Sports Meet 2026
                    <span className="hidden md:block h-px w-12 bg-blue-400 ml-4"></span>
                </h2>
                <div className="inline-flex flex-col items-center animate-fade-up" style={{animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards'}}>
                    <p className="text-xl md:text-3xl text-white font-serif italic font-light drop-shadow-md border-b-2 border-yellow-400 pb-2 px-6">
                        "Unleash the Champion Within"
                    </p>
                </div>
            </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3 z-20">
            {heroImages.map((_, idx) => (
            <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-yellow-400 w-10' : 'bg-white/30 w-3 hover:bg-white/60'}`}
                aria-label={`Go to slide ${idx + 1}`}
            />
            ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* Speedometers */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.houseStats.map(house => (
            <Speedometer key={house.name} data={house} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Medal Tally */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 flex items-center">
                        <Medal className="mr-2 text-yellow-500" size={20} /> Medal Tally
                    </h2>
                </div>
                <div className="flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">House</th>
                                <th className="px-2 py-3 text-center text-yellow-600">G</th>
                                <th className="px-2 py-3 text-center text-gray-500">S</th>
                                <th className="px-2 py-3 text-center text-orange-600">B</th>
                                <th className="px-2 py-3 text-center text-purple-600" title="Special Points">Sp.</th>
                                <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.houseStats.map(h => (
                                <tr key={h.name}>
                                    <td className="px-4 py-3 font-medium text-gray-900 border-l-4" style={{borderLeftColor: h.fill}}>{h.name}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.gold}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.silver}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.bronze}</td>
                                    <td className="px-2 py-3 text-center font-bold text-purple-600 text-xs">+{h.special}</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{h.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-center text-gray-500">
                    Points: Individual (5, 3, 1) • Team (7, 5, 3) • Special
                </div>
            </section>

            {/* Cumulative Line Chart */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                 <h2 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Activity className="mr-2 text-blue-500" size={20} /> Championship Race (Cumulative Points)
                </h2>
                <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.cumulativeData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 10}} 
                                interval="preserveStartEnd"
                                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}...` : value}
                            />
                            <YAxis />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey={House.ANKARA} 
                                stroke="#9333ea" 
                                strokeWidth={3} 
                                dot={{r: 4, strokeWidth: 0}} 
                                activeDot={{r: 6}} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey={House.BAGDAD} 
                                stroke="#db2777" 
                                strokeWidth={3} 
                                dot={{r: 4, strokeWidth: 0}} 
                                activeDot={{r: 6}}
                            />
                            <Line 
                                type="monotone" 
                                dataKey={House.CAIRO} 
                                stroke="#7f1d1d" 
                                strokeWidth={3} 
                                dot={{r: 4, strokeWidth: 0}} 
                                activeDot={{r: 6}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Results */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                     <h2 className="font-bold text-gray-800 flex items-center">
                        <Award className="mr-2 text-purple-500" size={20} /> Recent Results
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats.recentResults.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No events completed yet.</div>
                    ) : (
                        stats.recentResults.map((r) => (
                            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{r.eventName}</p>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <Trophy size={14} className="mr-1 text-yellow-500" />
                                        Winner: {r.winner}
                                    </p>
                                </div>
                                {r.winnerHouse && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        r.winnerHouse === House.ANKARA ? 'bg-purple-100 text-purple-700' :
                                        r.winnerHouse === House.BAGDAD ? 'bg-pink-100 text-pink-700' :
                                        'bg-red-100 text-red-900'
                                    }`}>
                                        {r.winnerHouse}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Upcoming Events */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                     <h2 className="font-bold text-gray-800 flex items-center">
                        <Clock className="mr-2 text-blue-500" size={20} /> Up Next
                    </h2>
                </div>
                 <div className="divide-y divide-gray-100">
                    {stats.upcomingEvents.length === 0 ? (
                         <div className="p-8 text-center text-gray-400">No upcoming events scheduled.</div>
                    ) : (
                        stats.upcomingEvents.map((e) => (
                             <div key={e.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{e.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{e.category} • {e.ageGroup}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-blue-600">
                                        {new Date(e.schedule!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(e.schedule!).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>

        {/* Full Schedule Table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                 <h2 className="font-bold text-gray-800 flex items-center">
                    <List className="mr-2 text-gray-600" size={20} /> Full Event Schedule
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Event</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats.allScheduledEvents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No schedule available.</td>
                            </tr>
                        ) : (
                            stats.allScheduledEvents.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-600 whitespace-nowrap">
                                        {formatDate(e.schedule)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {e.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {e.ageGroup} / {e.genderCategory}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                            e.status === EventStatus.COMPLETED ? 'bg-gray-100 text-gray-600' :
                                            e.status === EventStatus.OPEN ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {e.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-200 mt-12">
            &copy; 2026 Sulaimaniya College Sports Meet. All Rights Reserved.
        </footer>
      </main>
    </div>
  );
};