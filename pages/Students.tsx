import React, { useState, useEffect } from 'react';
import { User, Student, House, Gender, UserRole, Registration, Event } from '../types';
import { getStudents, saveStudent, deleteStudent, getRegistrations, getEvents } from '../services/storage';
import { Plus, Trash2, Edit2, Search, X, Printer, Filter } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface StudentsProps {
  user: User;
}

export const Students: React.FC<StudentsProps> = ({ user }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyRegistered, setShowOnlyRegistered] = useState(false);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>(''); // New filter state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    admissionNo: '',
    grade: '6',
    dateOfBirth: '2005-01-01',
    gender: Gender.MALE,
    house: user.house || House.ANKARA
  });

  // Helpers for Dropdowns
  const grades = Array.from({length: 8}, (_, i) => (i + 6).toString()); // ['6', '7', ..., '13']
  const days = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')); // ['01', ..., '31']
  const months = [
    { val: '01', label: 'January' }, { val: '02', label: 'February' }, { val: '03', label: 'March' },
    { val: '04', label: 'April' }, { val: '05', label: 'May' }, { val: '06', label: 'June' },
    { val: '07', label: 'July' }, { val: '08', label: 'August' }, { val: '09', label: 'September' },
    { val: '10', label: 'October' }, { val: '11', label: 'November' }, { val: '12', label: 'December' }
  ];
  // Year range: 2005 to 2018 (Assuming student age range approx 8-21 for Grade 6-13 context)
  const years = Array.from({length: 16}, (_, i) => (2005 + i).toString());

  const loadData = () => {
    const allStudents = getStudents();
    const allRegs = getRegistrations();
    const allEvents = getEvents();

    setRegistrations(allRegs);
    setEvents(allEvents);

    if (user.role === UserRole.CAPTAIN && user.house) {
      setStudents(allStudents.filter(s => s.house === user.house));
    } else {
      setStudents(allStudents);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.admissionNo || !formData.dateOfBirth || !formData.grade) {
        alert("Please fill in all required fields.");
        return;
    }

    // Validate Admission Number Range
    const admNo = parseInt(formData.admissionNo);
    if (isNaN(admNo) || admNo < 6500 || admNo > 8500) {
        alert("Admission Number must be between 6500 and 8500.");
        return;
    }

    // Validate Grade Range (Redundant with dropdown but good for safety)
    const gradeVal = parseInt(formData.grade);
    if (isNaN(gradeVal) || gradeVal < 6 || gradeVal > 13) {
        alert("Grade must be between 6 and 13.");
        return;
    }

    // Validate Birth Year
    const birthYear = new Date(formData.dateOfBirth).getFullYear();
    if (birthYear < 2005) {
        alert("Birth year cannot be before 2005.");
        return;
    }

    // Validation: Check duplicate Admission No (if new student)
    if (!editingStudent) {
        const exists = getStudents().some(s => s.admissionNo === formData.admissionNo);
        if (exists) {
            alert("Admission Number must be unique!");
            return;
        }
    }

    const payload: Student = {
      id: editingStudent ? editingStudent.id : uuidv4(),
      fullName: formData.fullName!,
      admissionNo: formData.admissionNo!,
      grade: formData.grade!,
      dateOfBirth: formData.dateOfBirth!,
      gender: formData.gender as Gender,
      house: user.role === UserRole.CAPTAIN ? user.house! : (formData.house as House)
    };

    saveStudent(payload);
    closeModal();
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student profile?')) {
      deleteStudent(id);
      loadData();
    }
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        fullName: '',
        admissionNo: '',
        grade: '6', // Default
        dateOfBirth: '2005-01-01', // Default
        gender: Gender.MALE,
        house: user.house || House.ANKARA
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const getStudentEvents = (studentId: string) => {
    const studentRegs = registrations.filter(r => r.studentId === studentId);
    return studentRegs.map(r => {
      const e = events.find(ev => ev.id === r.eventId);
      return e ? e.name : 'Unknown Event';
    });
  };

  const calculateAge2026 = (dobString: string | undefined) => {
    if (!dobString) return '-';
    const birthYear = new Date(dobString).getFullYear();
    if (isNaN(birthYear)) return '-';
    return 2026 - birthYear;
  };

  // Helper to update specific part of date
  const updateDate = (part: 'day' | 'month' | 'year', value: string) => {
    const current = formData.dateOfBirth || '2005-01-01';
    let [year, month, day] = current.split('-');
    
    // Safety check if split fails
    if (!year) year = '2005';
    if (!month) month = '01';
    if (!day) day = '01';

    if (part === 'day') day = value;
    if (part === 'month') month = value;
    if (part === 'year') year = value;

    setFormData({ ...formData, dateOfBirth: `${year}-${month}-${day}` });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.admissionNo.includes(searchTerm);
    
    // Priority 1: Event Filter
    if (selectedEventFilter) {
      const isRegisteredForEvent = registrations.some(r => r.studentId === s.id && r.eventId === selectedEventFilter);
      return matchesSearch && isRegisteredForEvent;
    }

    // Priority 2: General "Registered Only" Toggle
    if (showOnlyRegistered) {
      const hasRegs = registrations.some(r => r.studentId === s.id);
      return matchesSearch && hasRegs;
    }

    return matchesSearch;
  });

  // Derived state for current date selections
  const [currentYear, currentMonth, currentDay] = (formData.dateOfBirth || '2005-01-01').split('-');

  // Helpers for Print Title
  const getPrintTitle = () => {
    if (selectedEventFilter) {
      const evt = events.find(e => e.id === selectedEventFilter);
      return evt ? `Event Registration List: ${evt.name} (${evt.ageGroup})` : 'Event List';
    }
    if (user.role === UserRole.CAPTAIN) {
      return `House Registration List - ${user.house}`;
    }
    return 'Master Student List';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === UserRole.CAPTAIN ? `Team ${user.house}` : 'All Students'}
        </h1>
        
        <div className="flex items-center space-x-2">
           {/* Print Button */}
           <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Printer size={18} />
            <span>Print List</span>
          </button>

          {user.role !== UserRole.JUDGE && (
            <button 
              onClick={() => openModal()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Print Header (Only Visible when printing) */}
      <div className="hidden print:block mb-8">
         <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">Sulaimaniya College - Sports Meet 2026</h1>
            <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-800 pb-4 mb-4">
              {getPrintTitle()}
            </h2>
            <div className="flex justify-between text-sm text-gray-600 font-medium">
               <p>Date: {new Date().toLocaleDateString()}</p>
               <p>Total Students: {filteredStudents.length}</p>
               {user.house && <p>House: {user.house}</p>}
            </div>
         </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or admission number..." 
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Event Filter Dropdown */}
        <div className="w-full md:w-64">
           <select
             value={selectedEventFilter}
             onChange={(e) => setSelectedEventFilter(e.target.value)}
             className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
           >
             <option value="">Filter by Event (All)</option>
             {events.map(e => (
               <option key={e.id} value={e.id}>{e.name} ({e.ageGroup})</option>
             ))}
           </select>
        </div>
        
        <button 
          onClick={() => setShowOnlyRegistered(!showOnlyRegistered)}
          disabled={!!selectedEventFilter} // Disable if event filter is active
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors 
            ${selectedEventFilter 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : showOnlyRegistered 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-600'
            }`}
        >
          <Filter size={18} />
          <span>{showOnlyRegistered ? 'Show All Students' : 'Registered Only'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none print:overflow-visible">
        <table className="w-full text-left print:w-full print:border-collapse print:border print:border-gray-400">
          <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider print:bg-gray-200 print:text-black print:border-b-2 print:border-gray-800">
            <tr>
              <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400">Admsn No</th>
              <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400">Name</th>
              <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400">Grade</th>
              <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400">Age / Gender</th>
              <th className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400">House</th>
              <th className="px-6 py-4 print:px-2 print:py-2 w-1/3 print:border print:border-gray-400">Registered Events</th>
              <th className="px-6 py-4 text-right print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 print:divide-gray-300">
            {filteredStudents.map(student => {
              const studentEvents = getStudentEvents(student.id);
              const age = calculateAge2026(student.dateOfBirth);
              return (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors print:hover:bg-transparent">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">{student.admissionNo}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">{student.fullName}</td>
                  <td className="px-6 py-4 text-gray-600 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">{student.grade}</td>
                  <td className="px-6 py-4 text-gray-600 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">{age} / {student.gender[0]}</td>
                  <td className="px-6 py-4 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium print:border-none print:p-0 print:text-black
                      ${student.house === House.ANKARA ? 'bg-red-100 text-red-700' : 
                        student.house === House.BAGDAD ? 'bg-green-100 text-green-700' : 
                        'bg-blue-100 text-blue-700'}`}>
                      {student.house}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 print:px-2 print:py-2 print:border print:border-gray-400 print:text-black">
                    {studentEvents.length > 0 ? (
                      <div className="flex flex-wrap gap-1 print:block">
                        {studentEvents.map((evt, idx) => (
                           <span key={idx} className={`bg-gray-100 px-2 py-0.5 rounded text-xs print:bg-transparent print:p-0 print:text-black print:inline print:after:content-[',_'] last:print:after:content-[''] ${evt === events.find(e => e.id === selectedEventFilter)?.name ? 'bg-yellow-100 font-bold border border-yellow-300 print:font-bold' : ''}`}>
                             {evt}
                           </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs print:text-gray-500">-</span>
                    )}
                  </td>
                  {user.role !== UserRole.JUDGE && (
                    <td className="px-6 py-4 text-right space-x-2 print:hidden">
                      <button onClick={() => openModal(student)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 print:border print:border-gray-400">
                  No students found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission No</label>
                  <input required type="text" value={formData.admissionNo} onChange={e => setFormData({...formData, admissionNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="6500 - 8500" />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                   <select 
                        required 
                        value={formData.grade} 
                        onChange={e => setFormData({...formData, grade: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                   >
                       {grades.map(g => (
                           <option key={g} value={g}>{g}</option>
                       ))}
                   </select>
                </div>

                <div className="col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                   <div className="grid grid-cols-3 gap-2">
                       {/* Day */}
                       <div className="flex flex-col">
                           <span className="text-xs text-gray-400 mb-1">Day</span>
                           <select 
                                value={currentDay}
                                onChange={(e) => updateDate('day', e.target.value)}
                                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                           >
                               {days.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                       </div>
                       {/* Month */}
                       <div className="flex flex-col">
                           <span className="text-xs text-gray-400 mb-1">Month</span>
                           <select 
                                value={currentMonth}
                                onChange={(e) => updateDate('month', e.target.value)}
                                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                           >
                               {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                           </select>
                       </div>
                       {/* Year */}
                       <div className="flex flex-col">
                           <span className="text-xs text-gray-400 mb-1">Year</span>
                           <select 
                                value={currentYear}
                                onChange={(e) => updateDate('year', e.target.value)}
                                className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                           >
                               {years.map(y => <option key={y} value={y}>{y}</option>)}
                           </select>
                       </div>
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Order: Day - Month - Year (2005+)</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                     <option value={Gender.MALE}>Male</option>
                     <option value={Gender.FEMALE}>Female</option>
                   </select>
                </div>

                {user.role === UserRole.ADMIN && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
                     <select value={formData.house} onChange={e => setFormData({...formData, house: e.target.value as House})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                       {Object.values(House).map(h => <option key={h} value={h}>{h}</option>)}
                     </select>
                   </div>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          @page { margin: 10mm; size: landscape; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: sans-serif; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:text-black { color: black !important; }
          .print\\:bg-gray-200 { background-color: #e5e7eb !important; }
          .print\\:border { border-width: 1px !important; }
          .print\\:border-gray-400 { border-color: #9ca3af !important; }
          .print\\:border-gray-800 { border-color: #1f2937 !important; }
          
          table { width: 100%; border-collapse: collapse; font-size: 10pt; }
          th, td { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};