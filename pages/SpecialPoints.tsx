import React, { useState, useEffect } from 'react';
import { House, SpecialPoint, Student } from '../types';
import { getSpecialPoints, saveSpecialPoint, deleteSpecialPoint, getStudents } from '../services/storage';
import { Plus, Trash2, Star, User as UserIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const SpecialPoints: React.FC = () => {
  const [specialPoints, setSpecialPoints] = useState<SpecialPoint[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  
  // Form State
  const [description, setDescription] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House>(House.ANKARA);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [points, setPoints] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHouse) {
      setFilteredStudents(students.filter(s => s.house === selectedHouse));
    }
  }, [selectedHouse, students]);

  const loadData = () => {
    setSpecialPoints(getSpecialPoints());
    setStudents(getStudents());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
        alert("Please enter a description for this event.");
        return;
    }

    if (points < 1 || points > 10) {
        alert("Points must be between 1 and 10.");
        return;
    }

    const payload: SpecialPoint = {
      id: uuidv4(),
      description,
      house: selectedHouse,
      studentId: selectedStudentId || undefined,
      points
    };

    saveSpecialPoint(payload);
    
    // Reset Form
    setDescription('');
    setPoints(1);
    setSelectedStudentId('');
    
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove these points?')) {
      deleteSpecialPoint(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Special Points Allocation</h1>
        <p className="text-gray-500">Award extra points for special events, march pasts, or decor.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Plus size={18} className="mr-2" />
                Add Points
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Event Name</label>
                <input 
                  type="text" 
                  required
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="e.g., March Past Winner"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select House</label>
                <select 
                    value={selectedHouse} 
                    onChange={e => {
                        setSelectedHouse(e.target.value as House);
                        setSelectedStudentId(''); // Reset student when house changes
                    }} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {Object.values(House).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student (Optional)
                </label>
                <select 
                    value={selectedStudentId} 
                    onChange={e => setSelectedStudentId(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                    <option value="">-- Assign to House Only --</option>
                    {filteredStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.admissionNo} - {s.fullName}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Leave blank if points are for the whole House.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points (1 - 10)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  required
                  value={points} 
                  onChange={e => setPoints(parseInt(e.target.value))} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Award Points
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800">History of Special Points</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Beneficiary</th>
                            <th className="px-6 py-4 text-center">Points</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {specialPoints.map(sp => {
                            const studentName = sp.studentId ? students.find(s => s.id === sp.studentId)?.fullName : null;
                            return (
                                <tr key={sp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-800 font-medium">{sp.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold px-2 py-0.5 w-fit rounded 
                                                ${sp.house === House.ANKARA ? 'bg-red-100 text-red-700' : 
                                                  sp.house === House.BAGDAD ? 'bg-green-100 text-green-700' : 
                                                  'bg-blue-100 text-blue-700'}`}>
                                                {sp.house}
                                            </span>
                                            {studentName && (
                                                <span className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <UserIcon size={10} className="mr-1"/> {studentName}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded-full text-sm border border-yellow-200">
                                            +{sp.points}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(sp.id)}
                                            className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {specialPoints.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                    No special points awarded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};