import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { getEvents, saveEvent } from '../services/storage';
import { Calendar, Clock, ArrowRight, AlertCircle, Check, X, CalendarClock } from 'lucide-react';

export const EventScheduler: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempSchedule, setTempSchedule] = useState('');

  const loadData = () => {
    setEvents(getEvents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSchedule = (event: Event, newDate?: string) => {
    const updatedEvent = { ...event, schedule: newDate };
    saveEvent(updatedEvent);
    setEditingId(null);
    setTempSchedule('');
    loadData();
  };

  const startEditing = (event: Event) => {
    setEditingId(event.id);
    setTempSchedule(event.schedule || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempSchedule('');
  };

  const formatSchedule = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const unscheduledEvents = events.filter(e => !e.schedule);
  const scheduledEvents = events.filter(e => !!e.schedule).sort((a, b) => new Date(a.schedule!).getTime() - new Date(b.schedule!).getTime());

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarClock className="mr-3 text-blue-600" />
            Event Scheduler
        </h1>
        <p className="text-gray-500">Manage dates and times for all sports events.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* Unscheduled Column */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 flex items-center">
                    <AlertCircle size={18} className="mr-2 text-orange-500"/>
                    Unscheduled Events
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{unscheduledEvents.length}</span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {unscheduledEvents.map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        {editingId === event.id ? (
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900">{event.name}</h3>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Set Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full text-sm p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={tempSchedule}
                                        onChange={(e) => setTempSchedule(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleUpdateSchedule(event, tempSchedule)}
                                        disabled={!tempSchedule}
                                        className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Set Schedule
                                    </button>
                                    <button 
                                        onClick={cancelEditing}
                                        className="flex-1 bg-gray-100 text-gray-600 text-sm py-1.5 rounded hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {event.category} • {event.ageGroup} • {event.genderCategory}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => startEditing(event)}
                                    className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm transition-colors"
                                >
                                    <span>Schedule</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {unscheduledEvents.length === 0 && (
                    <div className="text-center py-10 text-gray-400 italic">
                        All events have been scheduled!
                    </div>
                )}
            </div>
        </div>

        {/* Scheduled Column */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 flex items-center">
                    <Calendar size={18} className="mr-2 text-green-600"/>
                    Scheduled Events
                </h2>
                <span className="bg-white border text-gray-600 px-2 py-1 rounded text-xs font-bold">{scheduledEvents.length}</span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
                 {scheduledEvents.map(event => (
                    <div key={event.id} className="bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-300 transition-colors group relative">
                        {editingId === event.id ? (
                            <div className="space-y-3">
                                <h3 className="font-medium text-gray-900">{event.name}</h3>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Update Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full text-sm p-2 border rounded bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={tempSchedule}
                                        onChange={(e) => setTempSchedule(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleUpdateSchedule(event, tempSchedule)}
                                        className="flex-1 bg-green-600 text-white text-sm py-1.5 rounded hover:bg-green-700"
                                    >
                                        Update
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateSchedule(event, undefined)}
                                        className="px-3 bg-red-100 text-red-600 text-sm py-1.5 rounded hover:bg-red-200"
                                        title="Clear Schedule"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button 
                                        onClick={cancelEditing}
                                        className="flex-1 bg-gray-100 text-gray-600 text-sm py-1.5 rounded hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                                    <div className="flex items-center text-sm text-blue-600 font-medium mt-1">
                                        <Clock size={14} className="mr-1.5" />
                                        {formatSchedule(event.schedule)}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {event.category} • {event.ageGroup}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => startEditing(event)}
                                    className="text-gray-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Calendar size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                 {scheduledEvents.length === 0 && (
                    <div className="text-center py-10 text-gray-400 italic">
                        No events scheduled yet.
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};