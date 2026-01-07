import React, { useState, useEffect } from 'react';
import { Event, EventCategory, EventStatus, User, UserRole } from '../types';
import { getEvents, saveEvent, deleteEvent, getUsers } from '../services/storage';
import { Plus, Trash2, Edit2, Search, X, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [judges, setJudges] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form Data (removed schedule)
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    category: EventCategory.ATHLETIC,
    ageGroup: '',
    isTeamEvent: false,
    genderCategory: 'Boys',
    status: EventStatus.OPEN,
    judgeId: ''
  });

  const loadData = () => {
    setEvents(getEvents());
    setJudges(getUsers().filter(u => u.role === UserRole.JUDGE));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // When saving details, preserve the existing schedule if editing, or undefined if new
    const existingSchedule = editingEvent?.schedule;

    const payload: Event = {
      id: editingEvent ? editingEvent.id : uuidv4(),
      name: formData.name!,
      category: formData.category!,
      ageGroup: formData.ageGroup!,
      isTeamEvent: formData.isTeamEvent!,
      genderCategory: formData.genderCategory as any,
      status: formData.status!,
      judgeId: formData.judgeId || undefined,
      schedule: existingSchedule // Preserve schedule
    };

    saveEvent(payload);
    closeModal();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this event? All registrations and results associated with it will be orphaned.')) {
      deleteEvent(id);
      loadData();
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        category: event.category,
        ageGroup: event.ageGroup,
        isTeamEvent: event.isTeamEvent,
        genderCategory: event.genderCategory,
        status: event.status,
        judgeId: event.judgeId || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: '',
        category: EventCategory.ATHLETIC,
        ageGroup: 'Under 12',
        isTeamEvent: false,
        genderCategory: 'Boys',
        status: EventStatus.OPEN,
        judgeId: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatSchedule = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Event</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            {Object.values(EventStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Assigned Judge</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map(event => {
                  const judgeName = judges.find(j => j.id === event.judgeId)?.username || 'Unassigned';
                  return (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{event.name}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                          {event.schedule ? (
                              <div className="flex items-center">
                                  <Calendar size={14} className="mr-1.5 text-blue-500"/>
                                  {formatSchedule(event.schedule)}
                              </div>
                          ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{event.category}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                          {event.ageGroup}
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                              event.genderCategory === 'Boys' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              event.genderCategory === 'Girls' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                              'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                              {event.genderCategory}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{event.isTeamEvent ? 'Team' : 'Indiv.'}</td>
                      <td className="px-6 py-4 text-gray-600">
                          <span className={`text-xs px-2 py-1 rounded border ${event.judgeId ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                              {judgeName}
                          </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${event.status === EventStatus.OPEN ? 'bg-green-100 text-green-700' : 
                            event.status === EventStatus.COMPLETED ? 'bg-gray-100 text-gray-700' : 
                            'bg-red-100 text-red-700'}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openModal(event)} className="text-blue-600 hover:text-blue-800 p-1">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
              })}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No events found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEvent ? 'Edit Event Details' : 'Add New Event'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as EventCategory})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {Object.values(EventCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                     <select value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Under 12">Under 12</option>
                        <option value="Under 14">Under 14</option>
                        <option value="Under 15">Under 15</option>
                        <option value="Under 16">Under 16</option>
                        <option value="Under 18">Under 18</option>
                        <option value="Under 20">Under 20</option>
                        <option value="Over 15">Over 15</option>
                        <option value="Open">Open</option>
                     </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender Group</label>
                    <select value={formData.genderCategory} onChange={e => setFormData({...formData, genderCategory: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                     <select value={formData.isTeamEvent ? "true" : "false"} onChange={e => setFormData({...formData, isTeamEvent: e.target.value === 'true'})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="false">Individual</option>
                        <option value="true">Team</option>
                     </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as EventStatus})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Assign Judge</label>
                   <select value={formData.judgeId || ''} onChange={e => setFormData({...formData, judgeId: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50">
                      <option value="">-- No Judge Assigned --</option>
                      {judges.map(j => <option key={j.id} value={j.id}>{j.username}</option>)}
                   </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};