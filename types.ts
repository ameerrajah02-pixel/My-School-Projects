export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CAPTAIN = 'CAPTAIN',
  JUDGE = 'JUDGE'
}

export enum House {
  ANKARA = 'Ankara',
  BAGDAD = 'Bagdad',
  CAIRO = 'Cairo'
}

export enum EventCategory {
  MAJOR_GAME = 'Major Game',
  ATHLETIC = 'Athletic Event'
}

export enum EventStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  COMPLETED = 'Completed'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for types, but required for logic
  role: UserRole;
  house?: House; // Only for captains
}

export interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  grade: string;
  dateOfBirth: string;
  gender: Gender;
  house: House;
}

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  ageGroup: string;
  isTeamEvent: boolean;
  genderCategory: 'Boys' | 'Girls' | 'Mixed';
  status: EventStatus;
  judgeId?: string; // ID of the assigned judge
  schedule?: string; // ISO string for date and time
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  house: House;
}

export interface Result {
  id: string;
  eventId: string;
  // Arrays to support ties (up to 3)
  firstPlaceStudentIds: string[]; 
  secondPlaceStudentIds: string[];
  thirdPlaceStudentIds: string[];
  // Legacy fields for backward compatibility or single entries if needed
  firstPlaceStudentId?: string; 
  secondPlaceStudentId?: string; 
  thirdPlaceStudentId?: string;
  
  // Lower places usually don't have ties recorded in this system, keeping simple
  fourthPlaceStudentId?: string;
  fifthPlaceStudentId?: string;
  sixthPlaceStudentId?: string;
  remarks: string;
}

export interface SpecialPoint {
  id: string;
  description: string;
  house: House;
  studentId?: string; // Optional
  points: number;
}

export interface RegistrationLog {
  id: string;
  timestamp: string;
  actorUsername: string;
  actorRole: UserRole;
  studentName: string;
  studentAdmissionNo: string;
  eventName: string;
  action: 'REGISTERED' | 'REMOVED';
  house: House;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}