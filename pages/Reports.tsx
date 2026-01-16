import React, { useEffect, useState } from 'react';
import { getResults, getEvents, getStudents, getSpecialPoints } from '../services/storage';
import { Result, Event, Student, House, SpecialPoint } from '../types';
import { Printer, Download, Star } from 'lucide-react';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<{
    results: (Result & { eventName: string; winnerNames: string[] })[];
    medalTally: { house: string; gold: number; silver: number; bronze: number; total: number; special: number }[];
    specialPoints: (SpecialPoint & { studentName?: string })[];
  }>({ results: [], medalTally: [], specialPoints: [] });

  useEffect(() => {
    const results = getResults();
    const events = getEvents();
    const students = getStudents();
    const specialPointsData = getSpecialPoints();

    // 1. Process Results List
    const processedResults = results.map(r => {
      const event = events.find(e => e.id === r.eventId);
      
      const getStudentStr = (ids: string[] | string | undefined) => {
          if (!ids) return 'N/A';
          const arr = Array.isArray(ids) ? ids : [ids];
          if (arr.length === 0) return 'N/A';

          return arr.map(id => {
              const s = students.find(st => st.id === id);
              return s ? `${s.fullName} (${s.house})` : 'Unknown';
          }).join(', ');
      };

      return {
        ...r,
        eventName: event ? `${event.name} (${event.ageGroup}) [${event.isTeamEvent ? 'Team' : 'Indiv'}]` : 'Unknown Event',
        winnerNames: [
          getStudentStr(r.firstPlaceStudentIds || r.firstPlaceStudentId),
          getStudentStr(r.secondPlaceStudentIds || r.secondPlaceStudentId),
          getStudentStr(r.thirdPlaceStudentIds || r.thirdPlaceStudentId),
          r.fourthPlaceStudentId ? getStudentStr(r.fourthPlaceStudentId) : '',
          r.fifthPlaceStudentId ? getStudentStr(r.fifthPlaceStudentId) : '',
          r.sixthPlaceStudentId ? getStudentStr(r.sixthPlaceStudentId) : '',
        ]
      };
    });

    // 2. Process Medal Tally
    const tally: Record<string, { gold: number, silver: number, bronze: number, points: number, special: number }> = {
      [House.ANKARA]: { gold: 0, silver: 0, bronze: 0, points: 0, special: 0 },
      [House.BAGDAD]: { gold: 0, silver: 0, bronze: 0, points: 0, special: 0 },
      [House.CAIRO]: { gold: 0, silver: 0, bronze: 0, points: 0, special: 0 },
    };

    // Calculate Event Points
    results.forEach(r => {
        const event = events.find(e => e.id === r.eventId);
        if (!event) return;

        const isTeam = event.isTeamEvent;
        const pts1 = isTeam ? 7 : 5;
        const pts2 = isTeam ? 5 : 3;
        const pts3 = isTeam ? 3 : 1;

        const getHouse = (sid?: string) => students.find(s => s.id === sid)?.house;
        
        // Handle Tie Arrays
        const w1 = r.firstPlaceStudentIds || (r.firstPlaceStudentId ? [r.firstPlaceStudentId] : []);
        const w2 = r.secondPlaceStudentIds || (r.secondPlaceStudentId ? [r.secondPlaceStudentId] : []);
        const w3 = r.thirdPlaceStudentIds || (r.thirdPlaceStudentId ? [r.thirdPlaceStudentId] : []);

        w1.forEach(id => {
            const h = getHouse(id);
            if (h && tally[h]) { tally[h].gold++; tally[h].points += pts1; }
        });
        w2.forEach(id => {
            const h = getHouse(id);
            if (h && tally[h]) { tally[h].silver++; tally[h].points += pts2; }
        });
        w3.forEach(id => {
            const h = getHouse(id);
            if (h && tally[h]) { tally[h].bronze++; tally[h].points += pts3; }
        });
    });

    // Calculate Special Points
    specialPointsData.forEach(sp => {
        if (tally[sp.house]) {
            tally[sp.house].points += sp.points;
            tally[sp.house].special += sp.points;
        }
    });

    const medalTallyArray = Object.keys(tally).map(house => ({
      house,
      gold: tally[house].gold,
      silver: tally[house].silver,
      bronze: tally[house].bronze,
      special: tally[house].special,
      total: tally[house].points
    })).sort((a, b) => b.total - a.total);

    // Process Special Points List
    const processedSpecialPoints = specialPointsData.map(sp => ({
        ...sp,
        studentName: sp.studentId ? students.find(s => s.id === sp.studentId)?.fullName : undefined
    }));

    setReportData({ results: processedResults, medalTally: medalTallyArray, specialPoints: processedSpecialPoints });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center no-print">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Reports Center</h1>
           <p className="text-gray-500">View and export official event statistics.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
        >
          <Printer size={18} />
          <span>Print Report</span>
        </button>
      </div>

      {/* Medal Tally */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">🏆 Official Medal Tally & Points</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="px-4 py-3">House</th>
                <th className="px-4 py-3 text-center text-yellow-600 font-bold">Gold</th>
                <th className="px-4 py-3 text-center text-gray-500 font-bold">Silver</th>
                <th className="px-4 py-3 text-center text-amber-700 font-bold">Bronze</th>
                <th className="px-4 py-3 text-center text-purple-600 font-bold">Special Pts</th>
                <th className="px-4 py-3 text-right font-bold text-blue-900">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {reportData.medalTally.map((row) => (
                <tr key={row.house} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-bold text-gray-800">{row.house}</td>
                  <td className="px-4 py-3 text-center font-mono">{row.gold}</td>
                  <td className="px-4 py-3 text-center font-mono">{row.silver}</td>
                  <td className="px-4 py-3 text-center font-mono">{row.bronze}</td>
                  <td className="px-4 py-3 text-center font-mono text-purple-600">+{row.special}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-lg text-blue-600">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-right">
            Individual (5, 3, 1) | Team (7, 5, 3) | Special Points Included
        </div>
      </section>

      {/* Special Points Breakdown */}
      {reportData.specialPoints.length > 0 && (
         <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid">
             <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                 <Star className="mr-2 text-yellow-500" size={20} /> Special Achievements
             </h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-left">
                     <thead>
                         <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                             <th className="px-4 py-2">Description</th>
                             <th className="px-4 py-2">House</th>
                             <th className="px-4 py-2">Attributed Student</th>
                             <th className="px-4 py-2 text-right">Points Awarded</th>
                         </tr>
                     </thead>
                     <tbody>
                         {reportData.specialPoints.map(sp => (
                             <tr key={sp.id} className="border-b border-gray-100 last:border-0">
                                 <td className="px-4 py-2 font-medium">{sp.description}</td>
                                 <td className="px-4 py-2">
                                     <span className={`text-xs font-bold px-2 py-0.5 rounded 
                                        ${sp.house === House.ANKARA ? 'bg-purple-100 text-purple-700' : 
                                          sp.house === House.BAGDAD ? 'bg-pink-100 text-pink-700' : 
                                          'bg-red-100 text-red-900'}`}>
                                         {sp.house}
                                     </span>
                                 </td>
                                 <td className="px-4 py-2 text-gray-600 text-sm">{sp.studentName || '-'}</td>
                                 <td className="px-4 py-2 text-right font-bold text-green-600">+{sp.points}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </section>
      )}

      {/* Detailed Results */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-before-page">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">📝 Completed Event Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="px-4 py-3 min-w-[200px]">Event</th>
                <th className="px-4 py-3 text-yellow-700">1st</th>
                <th className="px-4 py-3 text-gray-600">2nd</th>
                <th className="px-4 py-3 text-amber-800">3rd</th>
                <th className="px-4 py-3 text-gray-400 font-normal">4th</th>
                <th className="px-4 py-3 text-gray-400 font-normal">5th</th>
                <th className="px-4 py-3 text-gray-400 font-normal">6th</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reportData.results.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{r.eventName}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 font-medium">{r.winnerNames[0]}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{r.winnerNames[1]}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{r.winnerNames[2]}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.winnerNames[3] || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.winnerNames[4] || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.winnerNames[5] || '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 italic">{r.remarks || '-'}</td>
                </tr>
              ))}
              {reportData.results.length === 0 && (
                <tr>
                   <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No completed events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .shadow-sm { shadow: none; border: 1px solid #eee; }
        }
      `}</style>
    </div>
  );
};