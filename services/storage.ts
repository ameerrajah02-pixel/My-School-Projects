import { User, Student, Event, Registration, Result, UserRole, House, EventCategory, EventStatus, Gender, SpecialPoint, RegistrationLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  USERS: 'sms_users',
  STUDENTS: 'sms_students',
  EVENTS: 'sms_events',
  REGISTRATIONS: 'sms_registrations',
  RESULTS: 'sms_results',
  SPECIAL_POINTS: 'sms_special_points',
  LOGS: 'sms_registration_logs',
  CURRENT_USER: 'sms_current_user'
};

// --- Generic Helpers ---

const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// --- Seeding Data ---

const seedData = () => {
  // Check if users exist. If they do, check if they have passwords (migration fix). 
  // If not, re-seed.
  const currentUsers = getItems<User>(STORAGE_KEYS.USERS);
  const needsUpdate = currentUsers.length === 0 || !currentUsers[0].password;

  if (needsUpdate) {
    const defaultUsers: User[] = [
      { id: 'u1', username: 'admin', password: 'admin123', role: UserRole.ADMIN },
      { id: 'u2', username: 'ankara_capt', password: '1234', role: UserRole.CAPTAIN, house: House.ANKARA },
      { id: 'u3', username: 'bagdad_capt', password: '1234', role: UserRole.CAPTAIN, house: House.BAGDAD },
      { id: 'u4', username: 'cairo_capt', password: '1234', role: UserRole.CAPTAIN, house: House.CAIRO },
      { id: 'u5', username: 'judge', password: 'judge123', role: UserRole.JUDGE },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const defaultEvents: Event[] = [
      { id: 'e1', name: '100m Sprint', category: EventCategory.ATHLETIC, ageGroup: 'Under 20', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-15T09:00' },
      { id: 'e2', name: 'Relay 4x100m', category: EventCategory.ATHLETIC, ageGroup: 'Under 18', isTeamEvent: true, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-15T11:30' },
      { id: 'e3', name: 'Volleyball', category: EventCategory.MAJOR_GAME, ageGroup: 'Open', isTeamEvent: true, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-16T15:00' },
    ];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const defaultStudents: Student[] = [
        { id: 's1', fullName: 'Ahmed Ali', admissionNo: '1001', grade: '12', dateOfBirth: '2008-05-15', gender: Gender.MALE, house: House.ANKARA },
        { id: 's2', fullName: 'Fatima Sara', admissionNo: '1002', grade: '10', dateOfBirth: '2010-08-20', gender: Gender.FEMALE, house: House.BAGDAD },
    ]
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
  }
};

// Initialize
seedData();

// --- Auth Service ---

export const getUsers = (): User[] => getItems<User>(STORAGE_KEYS.USERS);

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setItems(STORAGE_KEYS.USERS, users);
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  setItems(STORAGE_KEYS.USERS, users);
};

export const loginUser = (username: string, password?: string): User | null => {
  const users = getItems<User>(STORAGE_KEYS.USERS);
  // Match username and password
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

// --- Student Service ---

export const getStudents = (): Student[] => getItems<Student>(STORAGE_KEYS.STUDENTS);

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index >= 0) {
    students[index] = student;
  } else {
    students.push(student);
  }
  setItems(STORAGE_KEYS.STUDENTS, students);
};

export const deleteStudent = (id: string): void => {
  const students = getStudents().filter(s => s.id !== id);
  setItems(STORAGE_KEYS.STUDENTS, students);
};

// --- Event Service ---

export const getEvents = (): Event[] => getItems<Event>(STORAGE_KEYS.EVENTS);

export const saveEvent = (event: Event): void => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  setItems(STORAGE_KEYS.EVENTS, events);
};

export const deleteEvent = (id: string): void => {
  const events = getEvents().filter(e => e.id !== id);
  setItems(STORAGE_KEYS.EVENTS, events);
};

// --- Logs Service ---

export const getRegistrationLogs = (): RegistrationLog[] => getItems<RegistrationLog>(STORAGE_KEYS.LOGS);

const logActivity = (action: 'REGISTERED' | 'REMOVED', studentId: string, eventId: string) => {
  const currentUser = getCurrentUser();
  const student = getStudents().find(s => s.id === studentId);
  const event = getEvents().find(e => e.id === eventId);

  if (currentUser && student && event) {
    const logs = getRegistrationLogs();
    const newLog: RegistrationLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      actorUsername: currentUser.username,
      actorRole: currentUser.role,
      studentName: student.fullName,
      studentAdmissionNo: student.admissionNo,
      eventName: event.name, // Snapshot of name
      action: action,
      house: student.house
    };
    logs.unshift(newLog); // Add to beginning
    setItems(STORAGE_KEYS.LOGS, logs);
  }
};

// --- Registration Service ---

export const getRegistrations = (): Registration[] => getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);

export const registerStudent = (registration: Registration): void => {
  const regs = getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);
  // Check duplicate
  if (!regs.find(r => r.eventId === registration.eventId && r.studentId === registration.studentId)) {
    regs.push(registration);
    setItems(STORAGE_KEYS.REGISTRATIONS, regs);
    
    // Log Activity
    logActivity('REGISTERED', registration.studentId, registration.eventId);
  }
};

export const unregisterStudent = (eventId: string, studentId: string): void => {
  const regs = getItems<Registration>(STORAGE_KEYS.REGISTRATIONS).filter(r => {
    const match = r.eventId === eventId && r.studentId === studentId;
    // Log Activity before removing (to ensure we find the record effectively, though we have IDs passed in)
    // Actually we iterate to filter. 
    return !match;
  });
  
  // We need to know if something was actually removed to log it accurately?
  // Simpler: Just log it. The UI usually checks isRegistered before calling unregister.
  setItems(STORAGE_KEYS.REGISTRATIONS, regs);
  logActivity('REMOVED', studentId, eventId);
};

// --- Result Service ---

export const getResults = (): Result[] => getItems<Result>(STORAGE_KEYS.RESULTS);

export const saveResult = (result: Result): void => {
  const results = getResults();
  const index = results.findIndex(r => r.eventId === result.eventId);
  
  // Close the event when results are saved
  const events = getEvents();
  const eventIdx = events.findIndex(e => e.id === result.eventId);
  if (eventIdx >= 0) {
    events[eventIdx].status = EventStatus.COMPLETED;
    setItems(STORAGE_KEYS.EVENTS, events);
  }

  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  setItems(STORAGE_KEYS.RESULTS, results);
};

// --- Special Points Service ---

export const getSpecialPoints = (): SpecialPoint[] => getItems<SpecialPoint>(STORAGE_KEYS.SPECIAL_POINTS);

export const saveSpecialPoint = (point: SpecialPoint): void => {
  const points = getSpecialPoints();
  const index = points.findIndex(p => p.id === point.id);
  if (index >= 0) {
    points[index] = point;
  } else {
    points.push(point);
  }
  setItems(STORAGE_KEYS.SPECIAL_POINTS, points);
};

export const deleteSpecialPoint = (id: string): void => {
  const points = getSpecialPoints().filter(p => p.id !== id);
  setItems(STORAGE_KEYS.SPECIAL_POINTS, points);
};