import React, { useState, useEffect } from 'react';
import { User, Event, Student, EventStatus, Gender, Registration, House } from '../types';
import { getEvents, getStudents, getRegistrations, registerStudent, unregisterStudent } from '../services/storage';
import { Check, X, AlertCircle, Info } from 'lucide-react';
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

  // Helper to get current count for a specific house in the selected event
  const getHouseRegistrationCount = (house: House) => {
    if (!selectedEventId) return 0;
    return registrations.filter(r => r.eventId === selectedEventId && r.house === house).length;
  };

  const handleToggleRegistration = (studentId: string, isRegistered: boolean, individualCount: number, isIndividualEvent: boolean) => {
    if (!selectedEventId || !selectedEvent) return;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Constraint 1: Student Limit (3 individual events)
    if (!isRegistered && isIndividualEvent && individualCount >= 3) {
      alert("This student has already registered for the maximum of 3 individual events.");
      return;
    }

    // Constraint 2: House Limit (2 for Individual, 25 for Team)
    const houseCount = getHouseRegistrationCount(student.house);
    const limit = selectedEvent.isTeamEvent ? 25 : 2;

    if (!isRegistered && houseCount >= limit) {
        alert(`House limit reached! ${student.house} can only register ${limit} students for this ${selectedEvent.isTeamEvent ? 'team' : 'individual'} event.`);
        return;
    }

    if (isRegistered) {
      unregisterStudent(selectedEventId, studentId);
    } else {
      const newReg: Registration = {
        id: uuidv4(),
        eventId: selectedEventId,
        studentId: studentId,
        house: student.house // Use student's house correctly
      };
      registerStudent(newReg);
    }
    // Refresh registrations
    setRegistrations(getRegistrations()); 
  };

  // Filter students eligible for the selected event
  const eligibleStudents = selectedEvent ? students.filter(s => {
    // Gender Check
    if (selectedEvent.genderCategory === 'Boys' && s.gender !== Gender.MALE) return false;
    if (selectedEvent.genderCategory === 'Girls' && s.gender !== Gender.FEMALE) return false;
    // Note: Mixed events allow both
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
             <h2 className="font-bold text-gray-800">
               Eligible Students {user.house ? `(${user.house})` : ''}
             </h2>
             <div className="flex items-center space-x-4">
                 {/* Only show aggregate count if user is tied to a house (Captain) */}
                 {user.house && (
                     <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                        Registered: {getHouseRegistrationCount(user.house)} / {selectedEvent.isTeamEvent ? 25 : 2}
                     </span>
                 )}
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedEvent.isTeamEvent ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedEvent.isTeamEvent ? 'Team Event' : 'Individual Event'}
                 </span>
             </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {eligibleStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No eligible students found matching the event criteria (Gender/House).
                </div>
            ) : (
                eligibleStudents.map(student => {
                    const isRegistered = registrations.some(r => r.eventId === selectedEvent.id && r.studentId === student.id);
                    const indivCount = getStudentIndividualCount(student.id);
                    
                    // Check Limits
                    const isStudentLimitReached = !isRegistered && !selectedEvent.isTeamEvent && indivCount >= 3;
                    
                    const currentHouseCount = getHouseRegistrationCount(student.house);
                    const houseLimit = selectedEvent.isTeamEvent ? 25 : 2;
                    const isHouseLimitReached = !isRegistered && currentHouseCount >= houseLimit;

                    // Disable if not registered AND (student limit reached OR house limit reached)
                    const isDisabled = !isRegistered && (isStudentLimitReached || isHouseLimitReached);

                    return (
                        <div key={student.id} className={`flex items-center justify-between p-4 transition-colors ${isRegistered ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-gray-900">{student.fullName}</p>
                                  {isStudentLimitReached && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded border border-red-200">Max Events</span>}
                                  {isHouseLimitReached && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded border border-orange-200">House Full</span>}
                                </div>
                                <p className="text-sm text-gray-500 font-mono">{student.admissionNo} • Grade {student.grade} • {student.house}</p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Indiv. Events</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${indivCount >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {indivCount}/3
                                    </span>
                                </div>

                                <button 
                                    onClick={() => handleToggleRegistration(student.id, isRegistered, indivCount, !selectedEvent.isTeamEvent)}
                                    disabled={isDisabled}
                                    className={`
                                        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all min-w-[120px] justify-center
                                        ${isRegistered 
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' 
                                            : isDisabled
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
                                            {isDisabled ? <AlertCircle size={16} /> : <Check size={16} />}
                                            <span>{isHouseLimitReached ? 'Full' : isStudentLimitReached ? 'Maxed' : 'Register'}</span>
                                        </>
                                    )}
                                </button>
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