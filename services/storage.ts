
import { User, Student, Event, Registration, Result, UserRole, House, EventCategory, EventStatus, Gender, SpecialPoint, RegistrationLog, GalleryImage, HeroImage, SiteConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  USERS: 'sms_users',
  STUDENTS: 'sms_students',
  EVENTS: 'sms_events',
  REGISTRATIONS: 'sms_registrations',
  RESULTS: 'sms_results',
  SPECIAL_POINTS: 'sms_special_points',
  LOGS: 'sms_registration_logs',
  GALLERY: 'sms_gallery',
  HERO_IMAGES: 'sms_hero_images',
  SITE_CONFIG: 'sms_site_config',
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
  const needsUpdate = currentUsers.length === 0 || !currentUsers[0].password || !currentUsers.find(u => u.role === UserRole.EDITOR);

  if (needsUpdate) {
    const defaultUsers: User[] = [
      { id: 'u1', username: 'admin', password: 'admin123', role: UserRole.ADMIN },
      { id: 'u2', username: 'ankara_capt', password: '1234', role: UserRole.CAPTAIN, house: House.ANKARA },
      { id: 'u3', username: 'bagdad_capt', password: '1234', role: UserRole.CAPTAIN, house: House.BAGDAD },
      { id: 'u4', username: 'cairo_capt', password: '1234', role: UserRole.CAPTAIN, house: House.CAIRO },
      { id: 'u5', username: 'judge', password: 'judge123', role: UserRole.JUDGE },
      { id: 'u6', username: 'editor', password: 'editor123', role: UserRole.EDITOR },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const defaultEvents: Event[] = [
      { id: 'e1', name: '100m Sprint', category: EventCategory.ATHLETIC, ageGroup: 'Under 20', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-15T09:00' },
      { id: 'e2', name: 'Relay 4x100m', category: EventCategory.ATHLETIC, ageGroup: 'Under 18', isTeamEvent: true, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-15T11:30' },
      { id: 'e3', name: 'Volleyball', category: EventCategory.MAJOR_GAME, ageGroup: 'Open', isTeamEvent: true, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-16T15:00' },
      // Added 10 new events for testing
      { id: 'e4', name: '200m Sprint', category: EventCategory.ATHLETIC, ageGroup: 'Under 16', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-15T10:00' },
      { id: 'e5', name: 'Long Jump', category: EventCategory.ATHLETIC, ageGroup: 'Under 18', isTeamEvent: false, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-15T13:00' },
      { id: 'e6', name: 'High Jump', category: EventCategory.ATHLETIC, ageGroup: 'Under 20', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-15T14:30' },
      { id: 'e7', name: 'Shot Put', category: EventCategory.ATHLETIC, ageGroup: 'Over 15', isTeamEvent: false, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-16T09:30' },
      { id: 'e8', name: 'Discus Throw', category: EventCategory.ATHLETIC, ageGroup: 'Under 16', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-16T11:00' },
      { id: 'e9', name: 'Cricket', category: EventCategory.MAJOR_GAME, ageGroup: 'Under 20', isTeamEvent: true, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-17T09:00' },
      { id: 'e10', name: 'Netball', category: EventCategory.MAJOR_GAME, ageGroup: 'Under 18', isTeamEvent: true, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-17T14:00' },
      { id: 'e11', name: '4x400m Relay', category: EventCategory.ATHLETIC, ageGroup: 'Under 20', isTeamEvent: true, genderCategory: 'Mixed', status: EventStatus.OPEN, schedule: '2026-03-18T16:00' },
      { id: 'e12', name: '800m Run', category: EventCategory.ATHLETIC, ageGroup: 'Under 14', isTeamEvent: false, genderCategory: 'Boys', status: EventStatus.OPEN, schedule: '2026-03-16T08:00' },
      { id: 'e13', name: 'Javelin Throw', category: EventCategory.ATHLETIC, ageGroup: 'Under 18', isTeamEvent: false, genderCategory: 'Girls', status: EventStatus.OPEN, schedule: '2026-03-16T10:30' },
    ];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const defaultStudents: Student[] = [
        // Ankara (Purple)
        { id: 's1', fullName: 'K. Perera', admissionNo: '7001', grade: '12', dateOfBirth: '2008-05-15', gender: Gender.MALE, house: House.ANKARA },
        { id: 's2', fullName: 'N. Silva', admissionNo: '7002', grade: '10', dateOfBirth: '2010-08-20', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's3', fullName: 'M. Fazil', admissionNo: '7003', grade: '13', dateOfBirth: '2007-01-10', gender: Gender.MALE, house: House.ANKARA },
        { id: 's4', fullName: 'S. Jones', admissionNo: '7004', grade: '8', dateOfBirth: '2012-03-15', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's5', fullName: 'R. Dissanaike', admissionNo: '7005', grade: '11', dateOfBirth: '2009-11-05', gender: Gender.MALE, house: House.ANKARA },
        { id: 's6', fullName: 'K. Jayasuriya', admissionNo: '7006', grade: '9', dateOfBirth: '2011-06-22', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's7', fullName: 'A. Riaz', admissionNo: '7007', grade: '7', dateOfBirth: '2013-09-12', gender: Gender.MALE, house: House.ANKARA },
        { id: 's8', fullName: 'Y. Banu', admissionNo: '7008', grade: '12', dateOfBirth: '2008-02-14', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's9', fullName: 'D. Gunathilaka', admissionNo: '7009', grade: '6', dateOfBirth: '2014-05-30', gender: Gender.MALE, house: House.ANKARA },
        { id: 's10', fullName: 'A. Takia', admissionNo: '7010', grade: '10', dateOfBirth: '2010-12-01', gender: Gender.FEMALE, house: House.ANKARA },
        // Added 10 more for Ankara
        { id: 's31', fullName: 'M. Amir', admissionNo: '7011', grade: '9', dateOfBirth: '2011-03-12', gender: Gender.MALE, house: House.ANKARA },
        { id: 's32', fullName: 'K. Perera', admissionNo: '7012', grade: '11', dateOfBirth: '2009-07-22', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's33', fullName: 'J. Silva', admissionNo: '7013', grade: '8', dateOfBirth: '2012-11-05', gender: Gender.MALE, house: House.ANKARA },
        { id: 's34', fullName: 'R. Fernando', admissionNo: '7014', grade: '13', dateOfBirth: '2007-02-14', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's35', fullName: 'S. Cooray', admissionNo: '7015', grade: '10', dateOfBirth: '2010-09-30', gender: Gender.MALE, house: House.ANKARA },
        { id: 's36', fullName: 'T. Dilshan', admissionNo: '7016', grade: '7', dateOfBirth: '2013-05-18', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's37', fullName: 'A. Mendis', admissionNo: '7017', grade: '12', dateOfBirth: '2008-12-01', gender: Gender.MALE, house: House.ANKARA },
        { id: 's38', fullName: 'P. Jayawardena', admissionNo: '7018', grade: '6', dateOfBirth: '2014-08-20', gender: Gender.FEMALE, house: House.ANKARA },
        { id: 's39', fullName: 'D. Karunaratne', admissionNo: '7019', grade: '11', dateOfBirth: '2009-04-10', gender: Gender.MALE, house: House.ANKARA },
        { id: 's40', fullName: 'N. Dickwella', admissionNo: '7020', grade: '9', dateOfBirth: '2011-01-25', gender: Gender.FEMALE, house: House.ANKARA },

        // Bagdad (Pink)
        { id: 's11', fullName: 'F. Ahmed', admissionNo: '8001', grade: '13', dateOfBirth: '2007-04-10', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's12', fullName: 'S. Peiris', admissionNo: '8002', grade: '9', dateOfBirth: '2011-09-15', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's13', fullName: 'R. Teja', admissionNo: '8003', grade: '11', dateOfBirth: '2009-02-28', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's14', fullName: 'M. George', admissionNo: '8004', grade: '7', dateOfBirth: '2013-11-20', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's15', fullName: 'I. Udana', admissionNo: '8005', grade: '12', dateOfBirth: '2008-07-07', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's16', fullName: 'H. Ziyad', admissionNo: '8006', grade: '8', dateOfBirth: '2012-01-05', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's17', fullName: 'K. Rajitha', admissionNo: '8007', grade: '10', dateOfBirth: '2010-06-18', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's18', fullName: 'Z. Rimzan', admissionNo: '8008', grade: '6', dateOfBirth: '2014-08-25', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's19', fullName: 'O. Khayam', admissionNo: '8009', grade: '13', dateOfBirth: '2007-12-12', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's20', fullName: 'S. Perera', admissionNo: '8010', grade: '11', dateOfBirth: '2009-03-30', gender: Gender.FEMALE, house: House.BAGDAD },
        // Added 10 more for Bagdad
        { id: 's41', fullName: 'B. Azam', admissionNo: '8011', grade: '10', dateOfBirth: '2010-06-15', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's42', fullName: 'M. Rizwan', admissionNo: '8012', grade: '12', dateOfBirth: '2008-03-22', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's43', fullName: 'S. Afridi', admissionNo: '8013', grade: '8', dateOfBirth: '2012-09-05', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's44', fullName: 'H. Rauf', admissionNo: '8014', grade: '13', dateOfBirth: '2007-11-14', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's45', fullName: 'N. Shah', admissionNo: '8015', grade: '9', dateOfBirth: '2011-02-28', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's46', fullName: 'I. Ul-Haq', admissionNo: '8016', grade: '7', dateOfBirth: '2013-07-18', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's47', fullName: 'W. Riaz', admissionNo: '8017', grade: '11', dateOfBirth: '2009-12-01', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's48', fullName: 'Y. Shah', admissionNo: '8018', grade: '6', dateOfBirth: '2014-04-20', gender: Gender.FEMALE, house: House.BAGDAD },
        { id: 's49', fullName: 'A. Ali', admissionNo: '8019', grade: '12', dateOfBirth: '2008-08-10', gender: Gender.MALE, house: House.BAGDAD },
        { id: 's50', fullName: 'S. Khan', admissionNo: '8020', grade: '10', dateOfBirth: '2010-01-25', gender: Gender.FEMALE, house: House.BAGDAD },

        // Cairo (Maroon)
        { id: 's21', fullName: 'S. Jayasuriya', admissionNo: '9001', grade: '12', dateOfBirth: '2008-01-01', gender: Gender.MALE, house: House.CAIRO },
        { id: 's22', fullName: 'F. Nuzha', admissionNo: '9002', grade: '8', dateOfBirth: '2012-05-10', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's23', fullName: 'D. Chandimal', admissionNo: '9003', grade: '13', dateOfBirth: '2007-09-22', gender: Gender.MALE, house: House.CAIRO },
        { id: 's24', fullName: 'A. Weerasinghe', admissionNo: '9004', grade: '10', dateOfBirth: '2010-02-15', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's25', fullName: 'B. Hassim', admissionNo: '9005', grade: '7', dateOfBirth: '2013-07-08', gender: Gender.MALE, house: House.CAIRO },
        { id: 's26', fullName: 'S. Nazeer', admissionNo: '9006', grade: '11', dateOfBirth: '2009-10-12', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's27', fullName: 'N. Pradeep', admissionNo: '9007', grade: '9', dateOfBirth: '2011-04-18', gender: Gender.MALE, house: House.CAIRO },
        { id: 's28', fullName: 'R. Faleel', admissionNo: '9008', grade: '6', dateOfBirth: '2014-11-30', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's29', fullName: 'T. Kaushal', admissionNo: '9009', grade: '12', dateOfBirth: '2008-08-05', gender: Gender.MALE, house: House.CAIRO },
        { id: 's30', fullName: 'M. Muneer', admissionNo: '9010', grade: '13', dateOfBirth: '2007-03-25', gender: Gender.FEMALE, house: House.CAIRO },
        // Added 10 more for Cairo
        { id: 's51', fullName: 'V. Kohli', admissionNo: '9011', grade: '11', dateOfBirth: '2009-05-15', gender: Gender.MALE, house: House.CAIRO },
        { id: 's52', fullName: 'R. Sharma', admissionNo: '9012', grade: '13', dateOfBirth: '2007-10-22', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's53', fullName: 'K. Rahul', admissionNo: '9013', grade: '9', dateOfBirth: '2011-01-05', gender: Gender.MALE, house: House.CAIRO },
        { id: 's54', fullName: 'H. Pandya', admissionNo: '9014', grade: '12', dateOfBirth: '2008-04-14', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's55', fullName: 'R. Jadeja', admissionNo: '9015', grade: '8', dateOfBirth: '2012-11-30', gender: Gender.MALE, house: House.CAIRO },
        { id: 's56', fullName: 'J. Bumrah', admissionNo: '9016', grade: '7', dateOfBirth: '2013-06-18', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's57', fullName: 'M. Shami', admissionNo: '9017', grade: '10', dateOfBirth: '2010-09-01', gender: Gender.MALE, house: House.CAIRO },
        { id: 's58', fullName: 'S. Gill', admissionNo: '9018', grade: '6', dateOfBirth: '2014-03-20', gender: Gender.FEMALE, house: House.CAIRO },
        { id: 's59', fullName: 'I. Kishan', admissionNo: '9019', grade: '11', dateOfBirth: '2009-07-10', gender: Gender.MALE, house: House.CAIRO },
        { id: 's60', fullName: 'S. Iyer', admissionNo: '9020', grade: '9', dateOfBirth: '2011-12-25', gender: Gender.FEMALE, house: House.CAIRO },
    ];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
  }

  if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
    const defaultGallery: GalleryImage[] = [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600', caption: 'Sprint Start', timestamp: new Date().toISOString() },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1531685250784-756f9f674884?auto=format&fit=crop&q=80&w=600', caption: 'Victory Celebration', timestamp: new Date().toISOString() },
      { id: 'g3', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=600', caption: 'Focus', timestamp: new Date().toISOString() },
      { id: 'g4', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600', caption: 'Track and Field', timestamp: new Date().toISOString() },
      { id: 'g5', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=600', caption: 'Team Spirit', timestamp: new Date().toISOString() },
      { id: 'g6', url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=600', caption: 'Hurdles', timestamp: new Date().toISOString() },
      { id: 'g7', url: 'https://images.unsplash.com/photo-1587280501635-68a6e82cd5ff?auto=format&fit=crop&q=80&w=600', caption: 'Volleyball Match', timestamp: new Date().toISOString() },
      { id: 'g8', url: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?auto=format&fit=crop&q=80&w=600', caption: 'High Jump', timestamp: new Date().toISOString() },
      { id: 'g9', url: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&q=80&w=600', caption: 'Marathon', timestamp: new Date().toISOString() },
      { id: 'g10', url: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=600', caption: 'Relay Pass', timestamp: new Date().toISOString() },
      { id: 'g11', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=600', caption: 'Start Line', timestamp: new Date().toISOString() },
      { id: 'g12', url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=600', caption: 'Discuss Throw', timestamp: new Date().toISOString() },
      { id: 'g13', url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&q=80&w=600', caption: 'Javelin', timestamp: new Date().toISOString() },
      { id: 'g14', url: 'https://images.unsplash.com/photo-1595183866299-4d6cbdb88753?auto=format&fit=crop&q=80&w=600', caption: 'Trophy Award', timestamp: new Date().toISOString() },
      { id: 'g15', url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600', caption: 'Race Finish', timestamp: new Date().toISOString() },
      { id: 'g16', url: 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?auto=format&fit=crop&q=80&w=600', caption: 'Coach Talk', timestamp: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(defaultGallery));
  }

  if (!localStorage.getItem(STORAGE_KEYS.HERO_IMAGES)) {
    const defaultHero: HeroImage[] = [
      { id: 'h1', url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=2070", timestamp: new Date().toISOString() },
      { id: 'h2', url: "https://images.unsplash.com/photo-1531685250784-756f9f674884?auto=format&fit=crop&q=80&w=2070", timestamp: new Date().toISOString() },
      { id: 'h3', url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=2070", timestamp: new Date().toISOString() },
      { id: 'h4', url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=2070", timestamp: new Date().toISOString() },
      { id: 'h5', url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=2070", timestamp: new Date().toISOString() }
    ];
    localStorage.setItem(STORAGE_KEYS.HERO_IMAGES, JSON.stringify(defaultHero));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SITE_CONFIG)) {
    const defaultConfig: SiteConfig = {
      logoUrl: '',
      faviconUrl: '',
      ogImageUrl: '',
      heroTitle: 'Sulaimaniya College',
      heroSubtitle: 'Inter House Sports Meet 2026',
      newsHeadlines: [
        "Welcome to the Annual Sports Meet 2026!",
        "Live scores will be updated as events complete.",
        "Check the schedule for upcoming events.",
        "Team Ankara currently leading the table!",
        "Closing ceremony starts at 4:30 PM."
      ]
    };
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(defaultConfig));
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

// --- Gallery Service ---

export const getGalleryImages = (): GalleryImage[] => getItems<GalleryImage>(STORAGE_KEYS.GALLERY);

export const saveGalleryImage = (image: GalleryImage): void => {
  const images = getGalleryImages();
  images.unshift(image); // Add to top
  setItems(STORAGE_KEYS.GALLERY, images);
};

export const deleteGalleryImage = (id: string): void => {
  const images = getGalleryImages().filter(img => img.id !== id);
  setItems(STORAGE_KEYS.GALLERY, images);
};

// --- Hero Image Service ---

export const getHeroImages = (): HeroImage[] => getItems<HeroImage>(STORAGE_KEYS.HERO_IMAGES);

export const saveHeroImage = (image: HeroImage): void => {
  const images = getHeroImages();
  images.unshift(image); // Add to top
  setItems(STORAGE_KEYS.HERO_IMAGES, images);
};

export const deleteHeroImage = (id: string): void => {
  const images = getHeroImages().filter(img => img.id !== id);
  setItems(STORAGE_KEYS.HERO_IMAGES, images);
};

// --- Site Config Service ---

export const getSiteConfig = (): SiteConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
  if (data) return JSON.parse(data);
  // Fallback to defaults
  return {
      logoUrl: '',
      faviconUrl: '',
      ogImageUrl: '',
      heroTitle: 'Sulaimaniya College',
      heroSubtitle: 'Inter House Sports Meet 2026',
      newsHeadlines: [
        "Welcome to the Annual Sports Meet 2026!",
        "Live scores will be updated as events complete.",
        "Check the schedule for upcoming events.",
        "Team Ankara currently leading the table!",
        "Closing ceremony starts at 4:30 PM."
      ]
  };
};

export const saveSiteConfig = (config: SiteConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(config));
};
