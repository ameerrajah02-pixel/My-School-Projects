import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { House, Event, Result, Student, EventStatus, EventCategory, Gender } from '../types';
import { getEvents, getResults, getStudents, getSpecialPoints } from '../services/storage';
import { 
  Trophy, Calendar, Clock, LogIn, Medal, Award, Activity, List, 
  LayoutDashboard, Star, CheckCircle, Timer, Filter, Users, Search
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

// --- Types & Interfaces ---

interface HouseStat { 
  name: House; 
  points: number; 
  gold: number; 
  silver: number; 
  bronze: number; 
  special: number; 
  fill: string;
  rank?: number;
}

// --- Components ---

const HouseRankCard: React.FC<{ stat: HouseStat; rank: number; maxPoints: number }> = ({ stat, rank, maxPoints }) => {
    // Data for the Gauge (Pie Chart)
    const gaugeMax = Math.max(maxPoints * 1.2, 10); 
    const data = [
        { name: 'Points', value: stat.points, fill: stat.fill },
        { name: 'Remaining', value: gaugeMax - stat.points, fill: '#e5e7eb' } // Gray track
    ];

    return (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 transition-transform transform hover:scale-105 bg-white ${
            rank === 1 ? 'border-yellow-400 ring-4 ring-yellow-400/20' :
            rank === 2 ? 'border-gray-300' :
            'border-orange-200'
        }`}>
            {/* Gauge Section */}
            <div className="h-32 relative mb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="val" fill={stat.fill} />
                            <Cell key="rem" fill="#f3f4f6" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Content (The "Odometer" Readout) */}
                <div className="absolute inset-0 flex flex-col justify-end items-center pb-2 pointer-events-none">
                    <span className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-0.5">Rank</span>
                    <div className={`text-4xl font-black leading-none ${
                         rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-500' : 'text-orange-600'
                    }`}>
                        {rank}
                    </div>
                </div>
            </div>

            {/* House Name & Points */}
            <div className="text-center mb-6">
                 <h3 className={`text-xl font-black uppercase tracking-wide ${
                    stat.name === House.ANKARA ? 'text-purple-700' : 
                    stat.name === House.BAGDAD ? 'text-pink-700' : 'text-red-900'
                }`}>{stat.name}</h3>
                <div className="mt-1 inline-block bg-slate-900 text-white px-4 py-1 rounded font-mono text-xl font-bold shadow-inner">
                    {String(stat.points).padStart(4, '0')} <span className="text-xs text-gray-400 font-normal">PTS</span>
                </div>
            </div>
            
            {/* Embossed Medals Section */}
            <div className="flex justify-center items-center space-x-4">
               {/* Gold */}
               <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border border-yellow-600">
                       {stat.gold}
                   </div>
                   <span className="text-[10px] font-bold text-yellow-600 uppercase mt-1">Gold</span>
               </div>

               {/* Silver */}
               <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500 border border-gray-500">
                       {stat.silver}
                   </div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Silv</span>
               </div>

               {/* Bronze */}
               <div className="flex flex-col items-center">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.3)] bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 border border-orange-700">
                       {stat.bronze}
                   </div>
                   <span className="text-[10px] font-bold text-orange-700 uppercase mt-1">Brnz</span>
               </div>
            </div>
        </div>
    );
};

const ResultCard: React.FC<{ result: any }> = ({ result }) => (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${
                    result.category === EventCategory.MAJOR_GAME ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>{result.category}</span>
                <span className="text-sm text-gray-500">• {result.ageGroup}</span>
            </div>
            <h4 className="font-bold text-gray-900 text-xl">{result.eventName}</h4>
            <p className="text-sm text-gray-600 mt-2">
                Winner: <span className="font-bold text-gray-900 text-base">{result.winner}</span>
                <span className="ml-2 text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">{result.winnerHouse}</span>
            </p>
        </div>
        
        <div className="flex flex-col gap-2 w-full sm:w-auto">
             {/* Gold */}
             <div className="flex items-center justify-between sm:justify-end gap-3 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
                 <div className="flex items-center gap-3">
                     <div className="bg-yellow-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
                     <span className="text-base font-medium text-gray-800">{result.winner}</span>
                 </div>
             </div>
             {/* Silver */}
             {result.second && (
                 <div className="flex items-center justify-between sm:justify-end gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
                        <span className="text-base font-medium text-gray-600">{result.second}</span>
                    </div>
                </div>
             )}
             {/* Bronze */}
             {result.third && (
                <div className="flex items-center justify-between sm:justify-end gap-3 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
                        <span className="text-base font-medium text-gray-600">{result.third}</span>
                    </div>
                </div>
             )}
        </div>
    </div>
);

// --- Main Page Component ---

export const PublicLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'results' | 'champions' | 'events' | 'schedule' | 'members'>('dashboard');
  
  // Event Filters State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterAge, setFilterAge] = useState<string>('All');

  // Member Filters State
  const [memSearch, setMemSearch] = useState('');
  const [memHouse, setMemHouse] = useState('All');
  const [memGrade, setMemGrade] = useState('All');
  const [memAge, setMemAge] = useState('All');
  const [memGender, setMemGender] = useState('All');

  // Data State
  const [stats, setStats] = useState<{
    houseStats: HouseStat[];
    results: any[];
    upcomingEvents: Event[];
    allEvents: Event[];
    students: Student[];
    progress: { total: number; completed: number; percentage: number };
    champions: {
        individual: { student: Student; wins: number }[];
        majorGames: { eventName: string; house: House }[];
    };
    maxHousePoints: number;
  }>({
    houseStats: [],
    results: [],
    upcomingEvents: [],
    allEvents: [],
    students: [],
    progress: { total: 0, completed: 0, percentage: 0 },
    champions: { individual: [], majorGames: [] },
    maxHousePoints: 100 // Default to avoid div by zero
  });

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1531685250784-756f9f674884?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=2070"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // --- Data Processing ---
    const students = getStudents();
    const events = getEvents();
    const results = getResults();
    const specialPoints = getSpecialPoints();

    // 1. House Stats & Ranking
    const houseData = {
      [House.ANKARA]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#9333ea' },
      [House.BAGDAD]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#db2777' },
      [House.CAIRO]: { points: 0, gold: 0, silver: 0, bronze: 0, special: 0, fill: '#7f1d1d' },
    };

    const getHouse = (id?: string) => students.find(s => s.id === id)?.house;

    // Calc Points from Results
    results.forEach(r => {
      const event = events.find(e => e.id === r.eventId);
      if (!event) return;
      const isTeam = event.isTeamEvent;
      const pts = isTeam ? [7, 5, 3] : [5, 3, 1];

      const award = (sid: string | undefined, idx: number, type: 'gold'|'silver'|'bronze') => {
          const h = getHouse(sid);
          if (h) {
              houseData[h].points += pts[idx];
              houseData[h][type]++;
          }
      };

      // Handle arrays for winners
      const w1 = r.firstPlaceStudentIds || (r.firstPlaceStudentId ? [r.firstPlaceStudentId] : []);
      const w2 = r.secondPlaceStudentIds || (r.secondPlaceStudentId ? [r.secondPlaceStudentId] : []);
      const w3 = r.thirdPlaceStudentIds || (r.thirdPlaceStudentId ? [r.thirdPlaceStudentId] : []);

      w1.forEach(id => award(id, 0, 'gold'));
      w2.forEach(id => award(id, 1, 'silver'));
      w3.forEach(id => award(id, 2, 'bronze'));
    });

    // Calc Special Points
    specialPoints.forEach(sp => {
        if (houseData[sp.house]) {
            houseData[sp.house].points += sp.points;
            houseData[sp.house].special += sp.points;
        }
    });

    const rankedHouses = Object.values(House).map(h => ({
      name: h, ...houseData[h]
    })).sort((a, b) => b.points - a.points); // Sort descending

    const maxPts = Math.max(...rankedHouses.map(h => h.points), 10);

    // 2. Process Results List
    const processedResults = results.map(r => {
      const event = events.find(e => e.id === r.eventId);
      
      const getNames = (ids: string[] | string | undefined) => {
          if (!ids) return undefined;
          const arr = Array.isArray(ids) ? ids : [ids];
          if (arr.length === 0) return undefined;
          
          return arr.map(id => students.find(s => s.id === id)?.fullName).filter(Boolean).join(', ');
      };
      
      const getPrimaryHouse = (ids: string[] | string | undefined) => {
          if (!ids) return undefined;
          const arr = Array.isArray(ids) ? ids : [ids];
          if (arr.length === 0) return undefined;
          return students.find(s => s.id === arr[0])?.house; // House of first winner
      };

      const winnerNames = getNames(r.firstPlaceStudentIds || r.firstPlaceStudentId);
      const secondNames = getNames(r.secondPlaceStudentIds || r.secondPlaceStudentId);
      const thirdNames = getNames(r.thirdPlaceStudentIds || r.thirdPlaceStudentId);
      const winnerHouse = getPrimaryHouse(r.firstPlaceStudentIds || r.firstPlaceStudentId);

      return {
        ...r,
        eventName: event?.name || 'Unknown',
        category: event?.category,
        ageGroup: event?.ageGroup,
        genderCategory: event?.genderCategory, // Add gender
        winner: winnerNames || 'Unknown',
        winnerHouse: winnerHouse,
        second: secondNames,
        third: thirdNames,
        timestamp: event?.schedule ? new Date(event.schedule).getTime() : 0 // approximate sort
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Recent first

    // 3. Champions Calculation
    // A. Individual: 3 First Places in INDIVIDUAL events
    const championCandidates = new Map<string, number>(); // studentId -> count
    results.forEach(r => {
        const evt = events.find(e => e.id === r.eventId);
        if (evt && !evt.isTeamEvent) {
             const winners = r.firstPlaceStudentIds || (r.firstPlaceStudentId ? [r.firstPlaceStudentId] : []);
             winners.forEach(id => {
                 championCandidates.set(id, (championCandidates.get(id) || 0) + 1);
             });
        }
    });

    const individualChampions = Array.from(championCandidates.entries())
        .filter(([_, count]) => count >= 3)
        .map(([id, wins]) => ({
            student: students.find(s => s.id === id)!,
            wins
        }))
        .filter(c => !!c.student)
        .sort((a, b) => b.wins - a.wins);

    // B. Major Game Champions (House)
    const majorGameWinners = events
        .filter(e => e.category === EventCategory.MAJOR_GAME && e.status === EventStatus.COMPLETED)
        .map(e => {
            const r = results.find(res => res.eventId === e.id);
            const winners = r?.firstPlaceStudentIds || (r?.firstPlaceStudentId ? [r.firstPlaceStudentId] : []);
            if (winners.length === 0) return null;
            
            // Just take first winner house for Major games display
            const house = getHouse(winners[0]);
            return house ? { eventName: e.name, house } : null;
        })
        .filter((i): i is { eventName: string; house: House } => !!i);


    // 4. Events Stats
    const total = events.length;
    const completed = results.length;
    
    // 5. Schedules
    const upcoming = events
        .filter(e => e.schedule && e.status !== EventStatus.COMPLETED)
        .sort((a, b) => new Date(a.schedule!).getTime() - new Date(b.schedule!).getTime());

    setStats({
        houseStats: rankedHouses,
        results: processedResults,
        upcomingEvents: upcoming,
        allEvents: events,
        students: students,
        progress: { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 },
        champions: { individual: individualChampions, majorGames: majorGameWinners },
        maxHousePoints: maxPts
    });
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const calculateAge = (dobString: string | undefined): number => {
    if (!dobString) return 0;
    const birthYear = new Date(dobString).getFullYear();
    if (isNaN(birthYear)) return 0;
    return 2026 - birthYear;
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-up">
        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Meet Progress</h3>
                    <p className="text-xs text-gray-500">{stats.progress.completed} of {stats.progress.total} events completed</p>
                </div>
            </div>
            <div className="flex-1 mx-6">
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${stats.progress.percentage}%` }}
                    />
                </div>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.progress.percentage}%</span>
        </div>

        {/* Overall Standings */}
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-yellow-500" /> Overall Standings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.houseStats.map((h, idx) => (
                    <HouseRankCard key={h.name} stat={h} rank={idx + 1} maxPoints={stats.maxHousePoints} />
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Medal Tally */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 flex items-center">
                        <Medal className="mr-2 text-yellow-500" size={20} /> Medal Tally
                    </h2>
                </div>
                <div className="flex-1 p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">House</th>
                                <th className="px-2 py-3 text-center text-yellow-600">G</th>
                                <th className="px-2 py-3 text-center text-gray-500">S</th>
                                <th className="px-2 py-3 text-center text-orange-600">B</th>
                                <th className="px-2 py-3 text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.houseStats.map(h => (
                                <tr key={h.name}>
                                    <td className="px-4 py-3 font-medium text-gray-900 border-l-4" style={{borderLeftColor: h.fill}}>{h.name}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.gold}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.silver}</td>
                                    <td className="px-2 py-3 text-center font-bold">{h.bronze}</td>
                                    <td className="px-2 py-3 text-center font-bold text-gray-900">{h.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

             {/* Recent Results (Top 5) */}
             <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="font-bold text-gray-800 flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={20} /> Recently Completed
                    </h2>
                    <button onClick={() => setActiveTab('results')} className="text-xs text-blue-600 hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-100">
                    {stats.results.slice(0, 5).map(r => (
                        <div key={r.id} className="p-4 hover:bg-gray-50 flex flex-col gap-3 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-base font-bold text-gray-900">{r.eventName}</h4>
                                    <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-2">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{r.category}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">{r.ageGroup}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className={`font-bold uppercase ${
                                            r.genderCategory === 'Boys' ? 'text-blue-600' : 
                                            r.genderCategory === 'Girls' ? 'text-pink-600' : 'text-purple-600'
                                        }`}>{r.genderCategory}</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase ${
                                    r.winnerHouse === House.ANKARA ? 'bg-purple-100 text-purple-700' :
                                    r.winnerHouse === House.BAGDAD ? 'bg-pink-100 text-pink-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {r.winnerHouse}
                                </span>
                            </div>
                            
                            {/* Places List */}
                            <div className="text-sm space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex items-baseline">
                                    <span className="w-8 shrink-0 font-bold text-yellow-600">1st</span>
                                    <span className="font-medium text-gray-900">{r.winner}</span>
                                </div>
                                {r.second && (
                                    <div className="flex items-baseline">
                                        <span className="w-8 shrink-0 font-bold text-gray-500">2nd</span>
                                        <span className="text-gray-700">{r.second}</span>
                                    </div>
                                )}
                                {r.third && (
                                    <div className="flex items-baseline">
                                        <span className="w-8 shrink-0 font-bold text-amber-700">3rd</span>
                                        <span className="text-gray-700">{r.third}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {stats.results.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No results yet.</div>}
                </div>
            </section>
        </div>

        {/* Upcoming */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 flex items-center">
                    <Clock className="mr-2 text-blue-500" size={20} /> Upcoming Events
                </h2>
            </div>
            <div className="divide-y divide-gray-100">
                {stats.upcomingEvents.slice(0, 5).map(e => (
                    <div key={e.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        e.genderCategory === 'Boys' ? 'bg-blue-50/30' : 'bg-pink-50/30'
                    }`}>
                        <div>
                            <p className="font-medium text-gray-900">{e.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {e.category} • {e.ageGroup} • <span className={`font-bold ${
                                    e.genderCategory === 'Boys' ? 'text-blue-600' : 'text-pink-600'
                                }`}>{e.genderCategory}</span></p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-blue-600 block">
                                {new Date(e.schedule!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(e.schedule!).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                            </span>
                        </div>
                    </div>
                ))}
                {stats.upcomingEvents.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No upcoming scheduled events.</div>}
            </div>
        </section>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6 animate-fade-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="mr-3 text-yellow-500" /> Completed Event Results
        </h2>
        <div className="grid grid-cols-1 gap-4">
            {stats.results.map(r => (
                <ResultCard key={r.id} result={r} />
            ))}
            {stats.results.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <p className="text-gray-500">No events have been completed yet.</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderChampions = () => (
    <div className="space-y-10 animate-fade-up">
        {/* Individual Champions */}
        <section>
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                    <Star size={24} fill="currentColor" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ground Champions</h2>
                    <p className="text-gray-500 text-sm">Students with 3 Gold Medals in Individual Events</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.champions.individual.map((c, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm flex items-center space-x-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                             c.student.house === House.ANKARA ? 'bg-purple-600' : 
                             c.student.house === House.BAGDAD ? 'bg-pink-600' : 'bg-red-800'
                         }`}>
                             {c.student.fullName.charAt(0)}
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 text-lg">{c.student.fullName}</h3>
                             <p className="text-sm text-gray-500">{c.student.admissionNo} • Grade {c.student.grade}</p>
                             <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-yellow-50 border border-yellow-100 text-xs font-bold text-yellow-700">
                                 <Trophy size={12} className="mr-1" /> {c.wins} Gold Medals
                             </div>
                         </div>
                    </div>
                ))}
                 {stats.champions.individual.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                        No individual champions qualified yet.
                    </div>
                )}
            </div>
        </section>

        {/* Major Game Champions */}
        <section>
             <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Award size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Major Game Champions</h2>
                    <p className="text-gray-500 text-sm">Winning Houses of Major Team Events</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.champions.majorGames.map((g, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">{g.eventName}</h3>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase ${
                            g.house === House.ANKARA ? 'bg-purple-100 text-purple-700' :
                            g.house === House.BAGDAD ? 'bg-pink-100 text-pink-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {g.house}
                        </span>
                    </div>
                ))}
                 {stats.champions.majorGames.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                        No major games completed yet.
                    </div>
                )}
            </div>
        </section>
    </div>
  );

  const renderEvents = () => {
    // Unique values for dropdowns
    const categories = ['All', ...Array.from(new Set(stats.allEvents.map(e => e.category)))];
    const ageGroups = ['All', ...Array.from(new Set(stats.allEvents.map(e => e.ageGroup))).sort()];

    const filteredEvents = stats.allEvents.filter(e => {
        const matchCat = filterCategory === 'All' || e.category === filterCategory;
        const matchAge = filterAge === 'All' || e.ageGroup === filterAge;
        return matchCat && matchAge;
    });

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <List className="mr-3 text-blue-500" /> Event List
                </h2>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 pl-9 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <Filter size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={filterAge}
                            onChange={(e) => setFilterAge(e.target.value)}
                            className="px-4 py-2 pl-9 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                        >
                            {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <Filter size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Event Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Group</th>
                            <th className="px-6 py-4">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredEvents.map(e => (
                             <tr key={e.id} className={`transition-colors ${
                                e.genderCategory === 'Boys' ? 'bg-blue-50/40 hover:bg-blue-50' : 'bg-pink-50/40 hover:bg-pink-50'
                            }`}>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center bg-white border border-gray-200 ${
                                        e.status === EventStatus.COMPLETED ? 'text-gray-500' : 
                                        e.status === EventStatus.OPEN ? 'text-green-700 border-green-200 bg-green-50' : 'text-yellow-700 border-yellow-200 bg-yellow-50'
                                    }`}>
                                        {e.status === EventStatus.COMPLETED && <CheckCircle size={12} className="mr-1"/>}
                                        {e.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 font-medium ${e.status === EventStatus.COMPLETED ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-900'}`}>{e.name}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{e.category}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    {e.ageGroup} / <span className={`font-bold ${
                                        e.genderCategory === 'Boys' ? 'text-blue-600' : 'text-pink-600'
                                    }`}>{e.genderCategory}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{e.isTeamEvent ? 'Team' : 'Individual'}</td>
                            </tr>
                        ))}
                        {filteredEvents.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No events found matching filters.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
    );
  };

  const renderHouseMembers = () => {
    const grades = Array.from({length: 8}, (_, i) => (i + 6).toString()); 
    const ages = Array.from({length: 12}, (_, i) => (i + 10).toString());

    const filteredStudents = stats.students.filter(s => {
        // 1. Search
        const searchLower = memSearch.toLowerCase();
        const matchSearch = s.fullName.toLowerCase().includes(searchLower) || s.admissionNo.includes(searchLower);

        // 2. House
        const matchHouse = memHouse === 'All' || s.house === memHouse;

        // 3. Grade
        const matchGrade = memGrade === 'All' || s.grade === memGrade;

        // 4. Gender
        const matchGender = memGender === 'All' || s.gender === memGender;

        // 5. Age
        let matchAge = true;
        if (memAge !== 'All') {
            const age = calculateAge(s.dateOfBirth);
            switch (memAge) {
                case 'U12': matchAge = [10, 11].includes(age); break;
                case 'U14': matchAge = [12, 13].includes(age); break;
                case 'U16': matchAge = [14, 15].includes(age); break;
                case 'U18': matchAge = [16, 17].includes(age); break;
                case 'U20': matchAge = [18, 19].includes(age); break;
                case 'U15': matchAge = [10, 11, 12, 13, 14].includes(age); break;
                case 'O15': matchAge = age >= 15; break;
                default: matchAge = age.toString() === memAge;
            }
        }

        return matchSearch && matchHouse && matchGrade && matchGender && matchAge;
    });

    return (
        <div className="space-y-6 animate-fade-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-3 text-blue-600" /> House Members
            </h2>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4">
                 {/* Search Row */}
                 <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by name or admission number..." 
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        value={memSearch}
                        onChange={(e) => setMemSearch(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                         value={memHouse}
                         onChange={(e) => setMemHouse(e.target.value)}
                         className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="All">House: All</option>
                        {Object.values(House).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>

                    <select
                         value={memGrade}
                         onChange={(e) => setMemGrade(e.target.value)}
                         className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="All">Grade: All</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>

                    <select
                         value={memAge}
                         onChange={(e) => setMemAge(e.target.value)}
                         className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="All">Age: All</option>
                        <optgroup label="Categories">
                            <option value="U12">Under 12 (10-11)</option>
                            <option value="U14">Under 14 (12-13)</option>
                            <option value="U15">Under 15 (10-14)</option>
                            <option value="O15">Over 15 (15+)</option>
                            <option value="U16">Under 16 (14-15)</option>
                            <option value="U18">Under 18 (16-17)</option>
                            <option value="U20">Under 20 (18-19)</option>
                        </optgroup>
                        <optgroup label="Specific Age">
                            {ages.map(a => <option key={a} value={a}>{a}</option>)}
                        </optgroup>
                    </select>

                    <select
                         value={memGender}
                         onChange={(e) => setMemGender(e.target.value)}
                         className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="All">Gender: All</option>
                        <option value={Gender.MALE}>Male</option>
                        <option value={Gender.FEMALE}>Female</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Admsn No</th>
                            <th className="px-6 py-4">Name with Initials</th>
                            <th className="px-6 py-4">Grade</th>
                            <th className="px-6 py-4">Age / Gender</th>
                            <th className="px-6 py-4">House</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map(student => {
                            const age = calculateAge(student.dateOfBirth);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{student.admissionNo}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                                    <td className="px-6 py-4 text-gray-600">{student.grade}</td>
                                    <td className="px-6 py-4 text-gray-600">{age} / {student.gender[0]}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                          ${student.house === House.ANKARA ? 'bg-purple-100 text-purple-700' : 
                                            student.house === House.BAGDAD ? 'bg-pink-100 text-pink-700' : 
                                            'bg-red-100 text-red-900'}`}>
                                          {student.house}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No students found matching filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderSchedule = () => {
    const sortedEvents = [...stats.allEvents]
        .filter(e => e.schedule)
        .sort((a, b) => new Date(a.schedule!).getTime() - new Date(b.schedule!).getTime());

    return (
        <div className="space-y-6 animate-fade-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="mr-3 text-green-600" /> Event Schedule
            </h2>

            <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-8">
                {sortedEvents.map((e, idx) => {
                    const date = new Date(e.schedule!);
                    const isPast = date.getTime() < Date.now();
                    const isCompleted = e.status === EventStatus.COMPLETED;
                    return (
                        <div key={e.id} className="relative pl-8">
                            {/* Dot */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                                isPast ? 'bg-gray-300 border-gray-100' : 'bg-blue-600 border-white shadow-sm'
                            }`} />
                            
                            <div className={`p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center ${
                                isPast ? 'bg-gray-50 opacity-75' : 'bg-white'
                            } ${
                                e.genderCategory === 'Boys' ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-pink-400'
                            }`}>
                                <div>
                                    <div className="flex items-center space-x-2 text-sm font-bold text-blue-600 mb-1">
                                        <Calendar size={14} />
                                        <span>{date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                        <span className="text-gray-300">|</span>
                                        <Clock size={14} />
                                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h3 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{e.name}</h3>
                                    <p className="text-sm text-gray-500">{e.category} • {e.ageGroup} • <span className={`font-bold ${
                                        e.genderCategory === 'Boys' ? 'text-blue-500' : 'text-pink-500'
                                    }`}>{e.genderCategory}</span></p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        e.status === EventStatus.COMPLETED ? 'bg-gray-100 text-gray-500' : 
                                        'bg-blue-50 text-blue-700'
                                    }`}>
                                        {e.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {sortedEvents.length === 0 && (
                    <div className="pl-8 text-gray-500 italic">No scheduled events yet.</div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes textShimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .animate-text-shimmer { background-size: 200% auto; animation: textShimmer 3s linear infinite; }
      `}</style>

      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-3 md:py-0">
            <div className="flex items-center space-x-3 mb-3 md:mb-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <Trophy className="text-yellow-400" size={24} />
              <div>
                <h1 className="text-base font-bold leading-none">Sulaimaniya College</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sports Meet 2026</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
               {['dashboard', 'results', 'champions', 'events', 'members', 'schedule'].map((tab) => (
                   <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                            activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                   >
                       {tab === 'members' ? 'House Members' : tab}
                   </button>
               ))}
            </div>

            <button 
              onClick={() => navigate('/login')}
              className="hidden md:flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ml-4 border border-slate-700"
            >
              <LogIn size={14} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - ONLY on Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden bg-slate-900 shadow-lg">
            {heroImages.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-40' : 'opacity-0'}`}
                style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pb-8">
                <h1 className="animate-fade-up text-4xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl text-white">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-100 animate-text-shimmer">
                        Sulaimaniya College
                    </span>
                </h1>
                <p className="animate-fade-up text-lg md:text-2xl text-blue-100 font-light tracking-wide border-b border-yellow-500 pb-2 mb-4" style={{animationDelay: '0.2s'}}>
                    Inter House Sports Meet 2026
                </p>
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full ${activeTab !== 'dashboard' ? 'mt-4' : ''}`}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'results' && renderResults()}
        {activeTab === 'champions' && renderChampions()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'members' && renderHouseMembers()}
        {activeTab === 'schedule' && renderSchedule()}
      </main>

      <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-200 mt-12 bg-white">
            <p>&copy; 2026 Sulaimaniya College Sports Meet.</p>
            <p className="text-xs mt-1 text-gray-300">Official Event Management System</p>
      </footer>
    </div>
  );
};