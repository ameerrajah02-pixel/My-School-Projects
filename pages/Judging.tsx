import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event, Student, EventStatus, UserRole } from '../types';
import { getEvents, getStudents, getRegistrations, saveResult, getCurrentUser } from '../services/storage';
import { Medal, Save, FileBarChart, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Judging: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState<Student[]>([]);
  
  // Results State (Arrays for 1-3 to support ties)
  const [firstPlaceIds, setFirstPlaceIds] = useState<string[]>(['']);
  const [secondPlaceIds, setSecondPlaceIds] = useState<string[]>(['']);
  const [thirdPlaceIds, setThirdPlaceIds] = useState<string[]>(['']);
  
  // Single values for 4-6
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
      setFirstPlaceIds(['']);
      setSecondPlaceIds(['']);
      setThirdPlaceIds(['']);
      setFourthPlace('');
      setFifthPlace('');
      setSixthPlace('');
      setRemarks('');
    }
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Helper to get all currently selected IDs to filter dropdowns
  const getAllSelectedIds = () => {
    return [
        ...firstPlaceIds,
        ...secondPlaceIds,
        ...thirdPlaceIds,
        fourthPlace,
        fifthPlace,
        sixthPlace
    ].filter(id => id !== '');
  };

  const handleSaveResult = () => {
    // Filter out empty strings
    const cleanFirst = firstPlaceIds.filter(Boolean);
    const cleanSecond = secondPlaceIds.filter(Boolean);
    const cleanThird = thirdPlaceIds.filter(Boolean);

    if (cleanFirst.length === 0) {
      alert("Please select at least one First Place winner.");
      return;
    }

    const result = {
      id: uuidv4(),
      eventId: selectedEventId,
      // Save arrays
      firstPlaceStudentIds: cleanFirst,
      secondPlaceStudentIds: cleanSecond,
      thirdPlaceStudentIds: cleanThird,
      // Save singles
      fourthPlaceStudentId: fourthPlace || undefined,
      fifthPlaceStudentId: fifthPlace || undefined,
      sixthPlaceStudentId: sixthPlace || undefined,
      remarks
    };

    saveResult(result);
    
    if (confirm("Results saved successfully! Event marked as Completed.\n\nWould you like to view the Reports now?")) {
      navigate('/reports');
    } else {
      // Refresh events list
      let pendingEvents = getEvents().filter(e => e.status !== EventStatus.COMPLETED);
      if (currentUser && currentUser.role === UserRole.JUDGE) {
          pendingEvents = pendingEvents.filter(e => e.judgeId === currentUser.id);
      }
      setEvents(pendingEvents);
      
      setSelectedEventId('');
      setParticipants([]);
    }
  };

  // Generic handler for array updates
  const updateIdInArray = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    newValue: string
  ) => {
    setter(prev => {
        const copy = [...prev];
        copy[index] = newValue;
        return copy;
    });
  };

  const addSlot = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
        if (prev.length >= 3) return prev;
        return [...prev, ''];
    });
  };

  const removeSlot = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
      setter(prev => {
          const copy = [...prev];
          copy.splice(index, 1);
          return copy.length ? copy : ['']; // Always keep at least one slot
      });
  };

  // Reusable Component for a "Place" Row (supports ties)
  const renderPlaceRow = (
      title: string, 
      ids: string[], 
      setIds: React.Dispatch<React.SetStateAction<string[]>>, 
      colorClass: string,
      limit: number = 3
  ) => {
      return (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
              <div className="flex justify-between items-center mb-2">
                  <label className={`block text-sm font-bold ${colorClass}`}>{title}</label>
                  {ids.length < limit && (
                      <button 
                        onClick={() => addSlot(setIds)}
                        className="text-xs flex items-center bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                          <Plus size={12} className="mr-1" /> Add Tie
                      </button>
                  )}
              </div>
              <div className="space-y-2">
                  {ids.map((id, idx) => (
                      <div key={idx} className="flex gap-2">
                          <select 
                            value={id} 
                            onChange={(e) => updateIdInArray(setIds, idx, e.target.value)}
                            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                          >
                            <option value="">-- Select Winner --</option>
                            {participants
                                .filter(s => !getAllSelectedIds().includes(s.id) || s.id === id) // Filter out selected, allow current
                                .map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.admissionNo} - {s.fullName} ({s.house})
                                </option>
                            ))}
                          </select>
                          {ids.length > 1 && (
                              <button 
                                onClick={() => removeSlot(setIds, idx)}
                                className="text-red-400 hover:text-red-600 p-2"
                                title="Remove Tie"
                              >
                                  <Trash2 size={16} />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // Simple Select for 4th-6th
  const renderSimpleSelect = (value: string, onChange: (val: string) => void, label: string) => (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
      >
        <option value="">-- Select Winner --</option>
        {participants
            .filter(s => !getAllSelectedIds().includes(s.id) || s.id === value)
            .map(s => (
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
          <p className="text-gray-500">Record official results. Supports ties for top 3 places.</p>
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
                {selectedEvent.isTeamEvent ? 'Team Event' : 'Individual Event'}
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                     {renderPlaceRow('1st Place (Gold)', firstPlaceIds, setFirstPlaceIds, 'text-yellow-600')}
                </div>
                <div>
                     {renderPlaceRow('2nd Place (Silver)', secondPlaceIds, setSecondPlaceIds, 'text-gray-500')}
                </div>
                <div>
                     {renderPlaceRow('3rd Place (Bronze)', thirdPlaceIds, setThirdPlaceIds, 'text-amber-700')}
                </div>
            </div>

            {!selectedEvent.isTeamEvent && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Runners Up</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderSimpleSelect(fourthPlace, setFourthPlace, '4th Place')}
                        {renderSimpleSelect(fifthPlace, setFifthPlace, '5th Place')}
                        {renderSimpleSelect(sixthPlace, setSixthPlace, '6th Place')}
                    </div>
                </div>
            )}
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Judge's Remarks / Notes</label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any observations, disqualifications, or record-breaking notes..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
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