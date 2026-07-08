import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    dashboard:     'Dashboard',
    students:      'Students',
    teachers:      'Teachers',
    classes:       'Classes',
    subjects:      'Subjects',
    announcements: 'Announcements',
    reports:       'Reports',
    logout:        'Logout',

    // Dashboard
    totalStudents: 'Total Students',
    totalTeachers: 'Total Teachers',
    totalClasses:  'Total Classes',
    totalSubjects: 'Total Subjects',
    recentStudents:'Recent Students',
    quickActions:  'Quick Actions',
    addStudent:    'Add New Student',
    addTeacher:    'Add New Teacher',
    postAnnouncement: 'Post Announcement',
    viewReports:   'View Reports',

    // Students
    studentList:   'Students',
    addNewStudent: 'Add Student',
    searchStudents:'Search students...',
    admNo:         'Adm No',
    name:          'Name',
    email:         'Email',
    phone:         'Phone',
    className:     'Class',
    status:        'Status',
    actions:       'Actions',
    active:        'Active',
    inactive:      'Inactive',
    edit:          'Edit',
    delete:        'Delete',
    noStudents:    'No students found.',

    // Add Student
    addStudentTitle:  'Add New Student',
    personalInfo:     'Personal Information',
    academicInfo:     'Academic Information',
    fullName:         'Full Name',
    gender:           'Gender',
    dateOfBirth:      'Date of Birth',
    address:          'Address',
    parentName:       'Parent Name',
    parentContact:    'Parent Contact',
    selectClass:      'Select Class',
    selectGender:     'Select Gender',
    saveStudent:      'Save Student',
    cancel:           'Cancel',
    back:             'Back',

    // Login
    signIn:           'Sign In',
    signingIn:        'Signing in...',
    emailAddress:     'Email Address',
    password:         'Password',
    enterEmail:       'Enter your email',
    enterPassword:    'Enter your password',
    demoCredentials:  'DEMO CREDENTIALS',
    invalidLogin:     'Invalid email or password.',
    systemTitle:      'Olcott Primary School Management System',
    systemSubtitle:   'Cloud-Based Academic System',

    // Teacher
    myClasses:        'My Classes',
    markAttendance:   'Mark Attendance',
    enterMarks:       'Enter Marks',
    viewRequests:     'View Requests',
    mySchedule:       'My Schedule',
    pendingRequests:  'Pending Requests',

    // Student
    viewAttendance:   'View Attendance',
    viewMyMarks:      'View My Marks',
    classSchedule:    'Class Schedule',
    submitRequest:    'Submit Request',
    recentMarks:      'Recent Marks',
    overallGrade:     'Overall Grade',

    // Attendance
    present:  'Present',
    absent:   'Absent',
    late:     'Late',
    saveAttendance: 'Save Attendance',
    allPresent: 'All Present',
    allAbsent:  'All Absent',

    // Common
    save:     'Save',
    update:   'Update',
    close:    'Close',
    search:   'Search',
    filter:   'Filter',
    all:      'All',
    yes:      'Yes',
    no:       'No',
    loading:  'Loading...',
    success:  'Success',
    error:    'Error',
    date:     'Date',
    subject:  'Subject',
    score:    'Score',
    grade:    'Grade',
    welcome:  'Welcome',
  },

  si: {
    // Navigation
    dashboard:     'උපකරණ පුවරුව',
    students:      'සිසුන්',
    teachers:      'ගුරුවරුන්',
    classes:       'පන්ති',
    subjects:      'විෂයයන්',
    announcements: 'නිවේදන',
    reports:       'වාර්තා',
    logout:        'පිටවීම',

    // Dashboard
    totalStudents: 'සිසුන් සංඛ්‍යාව',
    totalTeachers: 'ගුරුවරුන් සංඛ්‍යාව',
    totalClasses:  'පන්ති සංඛ්‍යාව',
    totalSubjects: 'විෂය සංඛ්‍යාව',
    recentStudents:'මෑත සිසුන්',
    quickActions:  'ඉක්මන් ක්‍රියා',
    addStudent:    'සිසුවෙකු එකතු කරන්න',
    addTeacher:    'ගුරුවරයෙකු එකතු කරන්න',
    postAnnouncement: 'නිවේදනයක් පළ කරන්න',
    viewReports:   'වාර්තා බලන්න',

    // Students
    studentList:   'සිසුන්',
    addNewStudent: 'සිසුවෙකු එකතු කරන්න',
    searchStudents:'සිසුන් සොයන්න...',
    admNo:         'ඇතුළත් අංකය',
    name:          'නම',
    email:         'විද්‍යුත් තැපෑල',
    phone:         'දුරකථනය',
    className:     'පන්තිය',
    status:        'තත්ත්වය',
    actions:       'ක්‍රියා',
    active:        'සක්‍රිය',
    inactive:      'අක්‍රිය',
    edit:          'සංස්කරණය',
    delete:        'මකන්න',
    noStudents:    'සිසුන් හමු නොවීය.',

    // Add Student
    addStudentTitle:  'නව සිසුවෙකු එකතු කරන්න',
    personalInfo:     'පෞද්ගලික තොරතුරු',
    academicInfo:     'අධ්‍යාපනික තොරතුරු',
    fullName:         'සම්පූර්ණ නම',
    gender:           'ස්ත්‍රී පුරුෂ භාවය',
    dateOfBirth:      'උපන් දිනය',
    address:          'ලිපිනය',
    parentName:       'දෙමාපිය නම',
    parentContact:    'දෙමාපිය දුරකථනය',
    selectClass:      'පන්තිය තෝරන්න',
    selectGender:     'ස්ත්‍රී පුරුෂ භාවය තෝරන්න',
    saveStudent:      'සිසුවා සුරකින්න',
    cancel:           'අවලංගු කරන්න',
    back:             'ආපසු',

    // Login
    signIn:           'පිවිසෙන්න',
    signingIn:        'පිවිසෙමින්...',
    emailAddress:     'විද්‍යුත් තැපෑල',
    password:         'මුරපදය',
    enterEmail:       'විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
    enterPassword:    'මුරපදය ඇතුළත් කරන්න',
    demoCredentials:  'නිරූපණ අක්තපත්‍ර',
    invalidLogin:     'වලංගු නොවන විද්‍යුත් තැපෑල හෝ මුරපදය.',
    systemTitle:      'ඔල්කට් ප්‍රාථමික පාසල් කළමනාකරණ පද්ධතිය',
    systemSubtitle:   'වලාකුළු පදනම් කළ අධ්‍යාපන පද්ධතිය',

    // Teacher
    myClasses:        'මගේ පන්ති',
    markAttendance:   'පැමිණීම සටහන් කරන්න',
    enterMarks:       'ලකුණු ඇතුළත් කරන්න',
    viewRequests:     'ඉල්ලීම් බලන්න',
    mySchedule:       'මගේ කාලසටහන',
    pendingRequests:  'අපේක්ෂිත ඉල්ලීම්',

    // Student
    viewAttendance:   'පැමිණීම බලන්න',
    viewMyMarks:      'මගේ ලකුණු බලන්න',
    classSchedule:    'පන්ති කාලසටහන',
    submitRequest:    'ඉල්ලීමක් ඉදිරිපත් කරන්න',
    recentMarks:      'මෑත ලකුණු',
    overallGrade:     'සමස්ත ශ්‍රේණිය',

    // Attendance
    present:  'පැමිණ ඇත',
    absent:   'නොපැමිණ',
    late:     'ප්‍රමාද',
    saveAttendance: 'පැමිණීම සුරකින්න',
    allPresent: 'සියල්ලෝ පැමිණ ඇත',
    allAbsent:  'සියල්ලෝ නොපැමිණ',

    // Common
    save:     'සුරකින්න',
    update:   'යාවත්කාලීන කරන්න',
    close:    'වසන්න',
    search:   'සොයන්න',
    filter:   'පෙරහන',
    all:      'සියල්ල',
    yes:      'ඔව්',
    no:       'නැත',
    loading:  'පූරණය වෙමින්...',
    success:  'සාර්ථකයි',
    error:    'දෝෂයකි',
    date:     'දිනය',
    subject:  'විෂය',
    score:    'ලකුණු',
    grade:    'ශ්‍රේණිය',
    welcome:  'සාදරයෙන් පිළිගනිමු',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'si' : 'en');
  };

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}