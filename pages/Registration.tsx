import React, { useState, useEffect } from 'react';
import { User, Event, Student, EventStatus, Gender, Registration, House } from '../types';
import { getEvents, getStudents, getRegistrations, registerStudent, unregisterStudent } from '../services/storage';
import { Check, X, AlertCircle, Info, Users, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface RegistrationProps {
  user: User;
}

export const RegistrationPage: React.FC<RegistrationProps> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // For lookup
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // Team Selection State
  const [pendingTeam, setPendingTeam] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const eventsData = getEvents();
    setAllEvents(eventsData);
    setEvents(eventsData.filter(e => e.status === EventStatus.OPEN));
    
    setRegistrations(getRegistrations());

    const allStudents = getStudents();
    // Admin can see all, Captains only see their house
    if (user.house) {
      setStudents(allStudents.filter(s => s.house === user.house));
    } else {
      setStudents(allStudents);
    }
  };

  // Sync pending team selection when event or actual registrations change
  useEffect(() => {
    if (selectedEventId) {
      const evt = allEvents.find(e => e.id === selectedEventId);
      if (evt?.isTeamEvent) {
          const currentIds = registrations
            .filter(r => r.eventId === selectedEventId)
            .map(r => r.studentId);
          setPendingTeam(new Set(currentIds));
      }
    }
  }, [selectedEventId, registrations, allEvents]);

  const getStudentIndividualCount = (studentId: string) => {
    return registrations
      .filter(r => r.studentId === studentId)
      .reduce((count, r) => {
        const ev = allEvents.find(e => e.id === r.eventId);
        // Count if event found and is NOT a team event
        return (ev && !ev.isTeamEvent) ? count + 1 : count;
      }, 0);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Helper to get current count for a specific house in the selected event (from registrations for Indiv, or pending for Team)
  const getHouseRegistrationCount = (house: House) => {
    if (!selectedEventId) return 0;
    
    // For Team events, we use the live pending count to show immediate feedback
    if (selectedEvent?.isTeamEvent) {
       // Count how many students in the pending set belong to this house
       return [...pendingTeam].filter(id => students.find(s => s.id === id)?.house === house).length;
    }

    return registrations.filter(r => r.eventId === selectedEventId && r.house === house).length;
  };

  const handleToggleRegistration = (studentId: string, isRegistered: boolean, individualCount: number, isIndividualEvent: boolean) => {
    if (!selectedEventId || !selectedEvent) return;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Constraint 1: Student Limit (3 individual events) - Only applies to individual events
    if (!isRegistered && isIndividualEvent && individualCount >= 3) {
      alert("This student has already registered for the maximum of 3 individual events.");
      return;
    }

    // Constraint 2: House Limit (2 for Individual) - Team limit checked in bulk select
    const houseCount = getHouseRegistrationCount(student.house);
    const limit = 2; // Only for individual

    if (!isRegistered && isIndividualEvent && houseCount >= limit) {
        alert(`House limit reached! ${student.house} can only register ${limit} students for this individual event.`);
        return;
    }

    if (isRegistered) {
      unregisterStudent(selectedEventId, studentId);
    } else {
      const newReg: Registration = {
        id: uuidv4(),
        eventId: selectedEventId,
        studentId: studentId,
        house: student.house 
      };
      registerStudent(newReg);
    }
    setRegistrations(getRegistrations()); 
  };

  // Team Batch Handlers
  const handleTeamCheckbox = (studentId: string) => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const newSet = new Set<string>(pendingTeam);
      if (newSet.has(studentId)) {
          newSet.delete(studentId);
      } else {
          // Check limit (25)
          // We must count based on the newSet state + the prospective add
          const currentCount = [...newSet].filter(id => students.find(s => s.id === id)?.house === student.house).length;
          if (currentCount >= 25) {
              alert(`House limit (25) reached for ${student.house}. Cannot add more players.`);
              return;
          }
          newSet.add(studentId);
      }
      setPendingTeam(newSet);
  };

  const saveTeamRegistration = () => {
    if (!selectedEventId) return;
    
    const visibleStudentIds = new Set(eligibleStudents.map(s => s.id));
    
    // Calculate differences relative to what is visible (to support Admin filtering if added later)
    // We only touch registrations for students currently in the list
    const currentRegIds = new Set(registrations.filter(r => r.eventId === selectedEventId).map(r => r.studentId));
    
    const toAdd = [...pendingTeam].filter(id => !currentRegIds.has(id) && visibleStudentIds.has(id));
    const toRemove = [...currentRegIds].filter(id => !pendingTeam.has(id) && visibleStudentIds.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
        alert("No changes to save.");
        return;
    }

    if (confirm(`Confirm Team Update?\nAdding: ${toAdd.length}\nRemoving: ${toRemove.length}`)) {
        toAdd.forEach(id => {
            const s = students.find(st => st.id === id);
            if (s) registerStudent({ id: uuidv4(), eventId: selectedEventId, studentId: id, house: s.house });
        });
        
        toRemove.forEach(id => {
            unregisterStudent(selectedEventId, id);
        });

        setRegistrations(getRegistrations());
    }
  };

  // Helper: check if student matches event age
  const checkAgeEligibility = (dob: string, ageGroup: string): boolean => {
      if (!dob) return false;
      const birthYear = new Date(dob).getFullYear();
      if (isNaN(birthYear)) return false;
      const age = 2026 - birthYear;

      switch (ageGroup) {
          case 'Under 12': return [10, 11].includes(age);
          case 'Under 14': return [12, 13].includes(age);
          case 'Under 16': return [14, 15].includes(age);
          case 'Under 18': return [16, 17].includes(age);
          case 'Under 20': return [18, 19].includes(age);
          case 'Under 15': return [10, 11, 12, 13, 14].includes(age);
          case 'Over 15': return age >= 16;
          case 'Open': return true;
          default: return true;
      }
  };

  // Filter students eligible for the selected event
  const eligibleStudents = selectedEvent ? students.filter(s => {
    // 1. Gender Check
    if (selectedEvent.genderCategory === 'Boys' && s.gender !== Gender.MALE) return false;
    if (selectedEvent.genderCategory === 'Girls' && s.gender !== Gender.FEMALE) return false;
    
    // 2. Age Check
    if (!checkAgeEligibility(s.dateOfBirth, selectedEvent.ageGroup)) return false;

    return true;
  }) : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Event Registration</h1>
        <p className="text-gray-500">Register students for upcoming events.</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <span><strong>Student Limit:</strong> Max 3 Individual Events per student.</span>
             </div>
             <div className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <span><strong>House Limits:</strong> Max 2 students per Individual Event.<br/>Max 25 students per Team Event.</span>
             </div>
        </div>
      </header>

      {/* Event Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event to Register For</label>
        <select 
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Choose an Event --</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.ageGroup} - {e.genderCategory}) [{e.isTeamEvent ? 'Team' : 'Individual'}]
            </option>
          ))}
        </select>
      </div>

      {/* Student List */}
      {selectedEvent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
             <div className="flex flex-col md:flex-row md:items-center">
                 <h2 className="font-bold text-gray-800 mr-4">
                   Eligible Students {user.house ? `(${user.house})` : ''}
                 </h2>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit mt-1 md:mt-0 ${selectedEvent.isTeamEvent ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedEvent.isTeamEvent ? 'Team Event' : 'Individual Event'}
                 </span>
                 {/* Age Group Badge */}
                 <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                    {selectedEvent.ageGroup}
                 </span>
             </div>
             
             <div className="flex items-center space-x-4">
                 {/* Count Display */}
                 {user.house && (
                     <span className={`text-sm font-medium hidden sm:inline ${
                         getHouseRegistrationCount(user.house) >= (selectedEvent.isTeamEvent ? 25 : 2) ? 'text-red-600' : 'text-gray-600'
                     }`}>
                        Selected: {getHouseRegistrationCount(user.house)} / {selectedEvent.isTeamEvent ? 25 : 2}
                     </span>
                 )}

                 {/* Team Bulk Action Button */}
                 {selectedEvent.isTeamEvent && (
                     <button 
                        onClick={saveTeamRegistration}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                     >
                         <Save size={16} />
                         <span>Save Team</span>
                     </button>
                 )}
             </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {eligibleStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No eligible students found matching the criteria (Gender, Age Group).
                </div>
            ) : (
                eligibleStudents.map(student => {
                    const isRegistered = selectedEvent.isTeamEvent 
                        ? pendingTeam.has(student.id) 
                        : registrations.some(r => r.eventId === selectedEvent.id && r.studentId === student.id);

                    const indivCount = getStudentIndividualCount(student.id);
                    const age = 2026 - new Date(student.dateOfBirth).getFullYear();
                    
                    // Logic for INDIVIDUAL mode buttons
                    const isStudentLimitReached = !selectedEvent.isTeamEvent && !isRegistered && indivCount >= 3;
                    const currentHouseCount = getHouseRegistrationCount(student.house);
                    const isHouseLimitReached = !selectedEvent.isTeamEvent && !isRegistered && currentHouseCount >= 2;
                    const isDisabledIndiv = !isRegistered && (isStudentLimitReached || isHouseLimitReached);

                    return (
                        <div key={student.id} className={`flex items-center justify-between p-4 transition-colors ${isRegistered ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                            <div className="flex-1 flex items-center">
                                {/* Checkbox for Team Mode */}
                                {selectedEvent.isTeamEvent && (
                                    <div className="mr-4">
                                        <input 
                                            type="checkbox"
                                            checked={isRegistered}
                                            onChange={() => handleTeamCheckbox(student.id)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center space-x-2">
                                      <p className={`font-medium ${isRegistered ? 'text-blue-900' : 'text-gray-900'}`}>{student.fullName}</p>
                                      {isStudentLimitReached && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded border border-red-200">Max Events</span>}
                                      {isHouseLimitReached && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded border border-orange-200">House Full</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 font-mono">{student.admissionNo} • Grade {student.grade} • Age {age}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Indiv. Events</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${indivCount >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {indivCount}/3
                                    </span>
                                </div>

                                {/* Toggle Button for INDIVIDUAL Mode */}
                                {!selectedEvent.isTeamEvent && (
                                    <button 
                                        onClick={() => handleToggleRegistration(student.id, isRegistered, indivCount, true)}
                                        disabled={isDisabledIndiv}
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-lg transition-all min-w-[120px] justify-center
                                            ${isRegistered 
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' 
                                                : isDisabledIndiv
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                                            }
                                        `}
                                    >
                                        {isRegistered ? (
                                            <>
                                                <X size={16} />
                                                <span>Remove</span>
                                            </>
                                        ) : (
                                            <>
                                                {isDisabledIndiv ? <AlertCircle size={16} /> : <Check size={16} />}
                                                <span>{isHouseLimitReached ? 'Full' : isStudentLimitReached ? 'Maxed' : 'Register'}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};