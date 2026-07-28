import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // ── Navigation ──
    dashboard:     'Dashboard',
    students:      'Students',
    teachers:      'Teachers',
    classes:       'Classes',
    subjects:      'Subjects',
    announcements: 'Announcements',
    reports:       'Reports',
    schedules:     'Schedules',
    primarytimetable: 'Primary Timetable',
    donors:        'Donors',
    scholarshipresult: 'Scholarship Result',
    usermanagement: 'User Management',
    schoolcalendar: 'School Calendar',
    logout:        'Logout',

    // ── Dashboard ──
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
    goodMorning:   'Good Morning',
    pendingRequestsCount: 'Pending',
    attendanceOverview: 'Attendance Overview',

    // ── Students ──
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

    // ── Add Student ──
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
    male:             'Male',
    female:           'Female',

    // ── Login ──
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

    // ── Teacher ──
    myClasses:        'My Classes',
    markAttendance:   'Mark Attendance',
    enterMarks:       'Enter Marks',
    viewRequests:     'View Requests',
    mySchedule:        'My Schedule',
    pendingRequests:  'Pending Requests',

    // ── Student ──
    viewAttendance:   'View Attendance',
    viewMyMarks:      'View My Marks',
    classSchedule:    'Class Schedule',
    submitRequest:    'Submit Request',
    recentMarks:      'Recent Marks',
    overallGrade:     'Overall Grade',

    // ── Attendance ──
    present:  'Present',
    absent:   'Absent',
    late:     'Late',
    saveAttendance: 'Save Attendance',
    allPresent: 'All Present',
    allAbsent:  'All Absent',

    // ── Reports ──
    reportsSubtitle: 'Generate and download PDF reports for school records.',
    studentsReport: 'Students Report',
    attendanceReport: 'Attendance Report',
    marksReport: 'Marks Report',
    teachersReport: 'Teachers Report',
    overviewSummary: 'Overview Summary',
    downloadPdf: 'Download PDF',
    generatingPdf: 'Generating PDF...',
    filterByClass: 'Class',
    filterByYear: 'Year',
    filterBySubject: 'Subject',
    filterByExamType: 'Exam Type',
    fromDate: 'From',
    toDate: 'To',
    resetFilters: 'Reset',
    allClasses: 'All Classes',
    allYears: 'All Years',
    allSubjects: 'All Subjects',
    allExamTypes: 'All Exam Types',

    // ── Donors / Meal Sheet ──
    foodDonors: 'Food Donors',
    addDonor: 'Add Donor',
    donorName: 'Donor Name',
    nic: 'NIC',
    monthlySchedules: 'Monthly Schedules',
    addMonthSchedule: 'Add Month Schedule',
    assignClasses: 'Assign Classes',
    mealRate: 'Meal Rate',
    foodItems: 'Food Items',
    mealSheet: 'Meal Sheet',
    exportPdf: 'Export PDF',
    maleCount: 'Male',
    femaleCount: 'Female',
    totalCount: 'Total',

    // ── Scholarship ──
    scholarshipTitle: 'Grade 5 Scholarship Result',
    scholarshipOfficialNote: 'The Grade 5 Scholarship Examination is conducted by the government. Results are only available on the official Department of Examinations website.',
    goToOfficialResults: 'Go to Official Results',

    // ── School Calendar ──
    calendarTitle: 'School Calendar',
    calendarSubtitle: 'Weekdays are school days by default. Click any date to mark it as a holiday or a special program.',
    markSchoolDay: 'Mark as School Day',
    markHoliday: 'Mark as Holiday / No School',
    revertDefault: 'Revert to Default',
    markDateRange: 'Mark Date Range',
    reason: 'Reason',

    // ── Common ──
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
    view:     'View',
    add:      'Add',
    notes:    'Notes',
    total:    'Total',
    confirm:  'Confirm',
    saving:   'Saving...',
  },

  si: {
    // ── Navigation ──
    dashboard:     'උපකරණ පුවරුව',
    students:      'සිසුන්',
    teachers:      'ගුරුවරුන්',
    classes:       'පන්ති',
    subjects:      'විෂයයන්',
    announcements: 'නිවේදන',
    reports:       'වාර්තා',
    schedules:     'කාලසටහන්',
    primarytimetable: 'ප්‍රාථමික කාලසටහන',
    donors:        'ආධාරකරුවන්',
    scholarshipresult: 'ශිෂ්‍යත්ව ප්‍රතිඵලය',
    usermanagement: 'පරිශීලක කළමනාකරණය',
    schoolcalendar: 'පාසල් දින දර්ශනය',
    logout:        'පිටවීම',

    // ── Dashboard ──
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
    goodMorning:   'සුභ උදෑසනක්',
    pendingRequestsCount: 'අපේක්ෂිත',
    attendanceOverview: 'පැමිණීම දළ විශ්ලේෂණය',

    // ── Students ──
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

    // ── Add Student ──
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
    male:             'පිරිමි',
    female:           'ගැහැණු',

    // ── Login ──
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

    // ── Teacher ──
    myClasses:        'මගේ පන්ති',
    markAttendance:   'පැමිණීම සටහන් කරන්න',
    enterMarks:       'ලකුණු ඇතුළත් කරන්න',
    viewRequests:     'ඉල්ලීම් බලන්න',
    mySchedule:       'මගේ කාලසටහන',
    pendingRequests:  'අපේක්ෂිත ඉල්ලීම්',

    // ── Student ──
    viewAttendance:   'පැමිණීම බලන්න',
    viewMyMarks:      'මගේ ලකුණු බලන්න',
    classSchedule:    'පන්ති කාලසටහන',
    submitRequest:    'ඉල්ලීමක් ඉදිරිපත් කරන්න',
    recentMarks:      'මෑත ලකුණු',
    overallGrade:     'සමස්ත ශ්‍රේණිය',

    // ── Attendance ──
    present:  'පැමිණ ඇත',
    absent:   'නොපැමිණ',
    late:     'ප්‍රමාද',
    saveAttendance: 'පැමිණීම සුරකින්න',
    allPresent: 'සියල්ලෝ පැමිණ ඇත',
    allAbsent:  'සියල්ලෝ නොපැමිණ',

    // ── Reports ──
    reportsSubtitle: 'පාසල් වාර්තා සඳහා PDF ජනනය කර බාගත කරන්න.',
    studentsReport: 'සිසුන් වාර්තාව',
    attendanceReport: 'පැමිණීම් වාර්තාව',
    marksReport: 'ලකුණු වාර්තාව',
    teachersReport: 'ගුරු වාර්තාව',
    overviewSummary: 'සමස්ත සාරාංශය',
    downloadPdf: 'PDF බාගත කරන්න',
    generatingPdf: 'PDF ජනනය වෙමින්...',
    filterByClass: 'පන්තිය',
    filterByYear: 'වර්ෂය',
    filterBySubject: 'විෂය',
    filterByExamType: 'විභාග වර්ගය',
    fromDate: 'සිට',
    toDate: 'දක්වා',
    resetFilters: 'යළි සකසන්න',
    allClasses: 'සියලුම පන්ති',
    allYears: 'සියලුම වර්ෂ',
    allSubjects: 'සියලුම විෂයයන්',
    allExamTypes: 'සියලුම විභාග වර්ග',

    // ── Donors / Meal Sheet ──
    foodDonors: 'ආහාර ආධාරකරුවන්',
    addDonor: 'ආධාරකරුවෙකු එකතු කරන්න',
    donorName: 'ආධාරකරුගේ නම',
    nic: 'ජා.හැ. අංකය',
    monthlySchedules: 'මාසික කාලසටහන්',
    addMonthSchedule: 'මාසික කාලසටහනක් එකතු කරන්න',
    assignClasses: 'පන්ති පවරන්න',
    mealRate: 'ආහාර මිල',
    foodItems: 'ආහාර වර්ග',
    mealSheet: 'ආහාර වාර්තා පත්‍රය',
    exportPdf: 'PDF බාගත කරන්න',
    maleCount: 'පිරිමි',
    femaleCount: 'ගැහැණු',
    totalCount: 'එකතුව',

    // ── Scholarship ──
    scholarshipTitle: 'ශිෂ්‍යත්ව විභාග ප්‍රතිඵලය - 5 ශ්‍රේණිය',
    scholarshipOfficialNote: 'ශිෂ්‍යත්ව විභාගය රජය මගින් පවත්වනු ලබන අතර, ප්‍රතිඵල විභාග දෙපාර්තමේන්තුවේ නිල වෙබ් අඩවියේ පමණක් ලබා ගත හැක.',
    goToOfficialResults: 'නිල ප්‍රතිඵල වෙත යන්න',

    // ── School Calendar ──
    calendarTitle: 'පාසල් දින දර්ශනය',
    calendarSubtitle: 'සති දින සාමාන්‍යයෙන් පාසල් දින වේ. නිවාඩු දිනයක් ලෙස හෝ විශේෂ වැඩසටහනක් ලෙස සලකුණු කිරීමට ඕනෑම දිනයක් ක්ලික් කරන්න.',
    markSchoolDay: 'පාසල් දිනයක් ලෙස සලකුණු කරන්න',
    markHoliday: 'නිවාඩු දිනයක් ලෙස සලකුණු කරන්න',
    revertDefault: 'ප්‍රකෘතියට හරවන්න',
    markDateRange: 'දින පරාසයක් සලකුණු කරන්න',
    reason: 'හේතුව',

    // ── Common ──
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
    view:     'බලන්න',
    add:      'එකතු කරන්න',
    notes:    'සටහන්',
    total:    'එකතුව',
    confirm:  'තහවුරු කරන්න',
    saving:   'සුරකිමින්...',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

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