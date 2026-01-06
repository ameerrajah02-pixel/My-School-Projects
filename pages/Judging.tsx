import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Student, EventStatus, UserRole } from '../types';
import { getEvents, getStudents, getRegistrations, saveResult, getCurrentUser } from '../services/storage';
import { Medal, Save, FileBarChart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Judging: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState<Student[]>([]);
  
  // Results State
  const [firstPlace, setFirstPlace] = useState('');
  const [secondPlace, setSecondPlace] = useState('');
  const [thirdPlace, setThirdPlace] = useState('');
  const [fourthPlace, setFourthPlace] = useState('');
  const [fifthPlace, setFifthPlace] = useState('');
  const [sixthPlace, setSixthPlace] = useState('');
  
  const [remarks, setRemarks] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    // 1. Get all pending events
    let pendingEvents = getEvents().filter(e => e.status !== EventStatus.COMPLETED);
    
    // 2. If User is a JUDGE (not ADMIN), only show events assigned to them
    if (currentUser && currentUser.role === UserRole.JUDGE) {
        pendingEvents = pendingEvents.filter(e => e.judgeId === currentUser.id);
    }

    setEvents(pendingEvents);
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const allRegs = getRegistrations();
      const allStudents = getStudents();
      const eventRegIds = allRegs.filter(r => r.eventId === selectedEventId).map(r => r.studentId);
      
      const eventParticipants = allStudents.filter(s => eventRegIds.includes(s.id));
      setParticipants(eventParticipants);
      
      // Reset form
      setFirstPlace('');
      setSecondPlace('');
      setThirdPlace('');
      setFourthPlace('');
      setFifthPlace('');
      setSixthPlace('');
      setRemarks('');
    }
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleSaveResult = () => {
    if (!firstPlace) {
      alert("Please select at least the First Place winner.");
      return;
    }

    // Check if distinct students are selected (ignoring empty selections)
    const winners = [firstPlace, secondPlace, thirdPlace, fourthPlace, fifthPlace, sixthPlace].filter(Boolean);
    const uniqueWinners = new Set(winners);
    if (winners.length !== uniqueWinners.size) {
      alert("A student cannot win multiple places in the same event.");
      return;
    }

    const result = {
      id: uuidv4(),
      eventId: selectedEventId,
      firstPlaceStudentId: firstPlace || undefined,
      secondPlaceStudentId: secondPlace || undefined,
      thirdPlaceStudentId: thirdPlace || undefined,
      fourthPlaceStudentId: fourthPlace || undefined,
      fifthPlaceStudentId: fifthPlace || undefined,
      sixthPlaceStudentId: sixthPlace || undefined,
      remarks
    };

    saveResult(result);
    
    if (confirm("Results saved successfully! Event marked as Completed.\n\nWould you like to view the Reports now?")) {
      navigate('/reports');
    } else {
      // Refresh events list to remove completed event and reset form
      // Re-fetch to respect logic
      let pendingEvents = getEvents().filter(e => e.status !== EventStatus.COMPLETED);
      if (currentUser && currentUser.role === UserRole.JUDGE) {
          pendingEvents = pendingEvents.filter(e => e.judgeId === currentUser.id);
      }
      setEvents(pendingEvents);
      
      setSelectedEventId('');
      setParticipants([]);
      setFirstPlace('');
      setSecondPlace('');
      setThirdPlace('');
      setFourthPlace('');
      setFifthPlace('');
      setSixthPlace('');
      setRemarks('');
    }
  };

  const renderSelect = (value: string, onChange: (val: string) => void, label: string, colorClass: string) => (
    <div className="space-y-2">
      <label className={`block text-sm font-bold ${colorClass}`}>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
      >
        <option value="">-- Select Winner --</option>
        {participants.map(s => (
          <option key={s.id} value={s.id}>
            {s.admissionNo} - {s.fullName} ({s.house})
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Judging & Results</h1>
          <p className="text-gray-500">Record official results for your assigned events.</p>
        </div>
        <button 
          onClick={() => navigate('/reports')}
          className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
        >
          <FileBarChart size={18} />
          <span>View Reports</span>
        </button>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event to Judge</label>
        <select 
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Choose an Event --</option>
          {events.length === 0 ? (
            <option disabled>No pending events available (or assigned)</option>
          ) : (
            events.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.ageGroup} - {e.genderCategory}) {e.isTeamEvent ? '[Team]' : '[Indiv]'}
              </option>
            ))
          )}
        </select>
      </div>

      {selectedEventId && participants.length === 0 && (
         <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No participants registered for this event yet. You cannot enter results without participants.
         </div>
      )}

      {selectedEventId && participants.length > 0 && selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Medal className="mr-2 text-yellow-500" />
              Enter Winners for {selectedEvent.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                {selectedEvent.isTeamEvent ? 'Team Event (Places 1-3)' : 'Individual Event (Places 1-6)'}
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderSelect(firstPlace, setFirstPlace, '1st Place (Gold) *', 'text-yellow-600')}
              {renderSelect(secondPlace, setSecondPlace, '2nd Place (Silver)', 'text-gray-500')}
              {renderSelect(thirdPlace, setThirdPlace, '3rd Place (Bronze)', 'text-amber-700')}
            </div>

            {!selectedEvent.isTeamEvent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-dashed border-gray-200">
                  {renderSelect(fourthPlace, setFourthPlace, '4th Place', 'text-gray-600')}
                  {renderSelect(fifthPlace, setFifthPlace, '5th Place', 'text-gray-600')}
                  {renderSelect(sixthPlace, setSixthPlace, '6th Place', 'text-gray-600')}
                </div>
            )}
            
            <p className="text-xs text-gray-400 italic">* First place is mandatory.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judge's Remarks / Notes</label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any observations, disqualifications, or record-breaking notes..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={handleSaveResult}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all transform hover:scale-105"
              >
                <Save size={20} />
                <span>Submit Official Results</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};