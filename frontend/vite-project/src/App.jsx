import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';

// Admin pages
import AdminDashboard     from './pages/admin/AdminDashboard';
import StudentList        from './pages/admin/students/StudentList';
import StudentAdd         from './pages/admin/students/StudentAdd';
import StudentEdit        from './pages/admin/students/StudentEdit';
import TeacherList        from './pages/admin/teachers/TeacherList';
import TeacherAdd         from './pages/admin/teachers/TeacherAdd';
import ClassList          from './pages/admin/classes/ClassList';
import SubjectList        from './pages/admin/subjects/SubjectList';
import Announcements      from './pages/admin/announcements/Announcements';
import Reports            from './pages/admin/reports/Reports';
import DonorList          from './pages/admin/donors/DonorList';
import DonorAdd           from './pages/admin/donors/DonorAdd';
import DonorEdit          from './pages/admin/donors/DonorEdit';
import DonorDetail        from './pages/admin/donors/DonorDetail';
import ScheduleManagement from './pages/admin/schedule/ScheduleManagement';
import PrimaryTimetable   from './pages/admin/schedule/PrimaryTimetable';
import UserManagement     from './pages/admin/UserManagement';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Attendance       from './pages/teacher/Attendance';
import Marks            from './pages/teacher/Marks';
import Schedule         from './pages/teacher/Schedule';
import Requests         from './pages/teacher/Requests';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance     from './pages/student/MyAttendance';
import MyMarks          from './pages/student/MyMarks';
import MySchedule       from './pages/student/MySchedule';
import MyRequests       from './pages/student/MyRequests';

function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function AdminRoute({ children }) {
  return <ProtectedRoute role="Admin"><Layout>{children}</Layout></ProtectedRoute>;
}
function TeacherRoute({ children }) {
  return <ProtectedRoute role="Teacher"><Layout>{children}</Layout></ProtectedRoute>;
}
function StudentRoute({ children }) {
  return <ProtectedRoute role="Student"><Layout>{children}</Layout></ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Navigate to="/login" />} />
          <Route path="/login"     element={<Login />} />

          {/* Redirects */}
          <Route path="/students"  element={<Navigate to="/admin/students" />} />
          <Route path="/teachers"  element={<Navigate to="/admin/teachers" />} />
          <Route path="/classes"   element={<Navigate to="/admin/classes" />} />
          <Route path="/subjects"  element={<Navigate to="/admin/subjects" />} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" />} />

          {/* Admin */}
          <Route path="/admin/dashboard"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/students"           element={<AdminRoute><StudentList /></AdminRoute>} />
          <Route path="/admin/students/add"       element={<AdminRoute><StudentAdd /></AdminRoute>} />
          <Route path="/admin/students/edit/:id"  element={<AdminRoute><StudentEdit /></AdminRoute>} />
          <Route path="/admin/teachers"           element={<AdminRoute><TeacherList /></AdminRoute>} />
          <Route path="/admin/teachers/add"       element={<AdminRoute><TeacherAdd /></AdminRoute>} />
          <Route path="/admin/classes"            element={<AdminRoute><ClassList /></AdminRoute>} />
          <Route path="/admin/subjects"           element={<AdminRoute><SubjectList /></AdminRoute>} />
          <Route path="/admin/announcements"      element={<AdminRoute><Announcements /></AdminRoute>} />
          <Route path="/admin/reports"            element={<AdminRoute><Reports /></AdminRoute>} />
          <Route path="/admin/donors"             element={<AdminRoute><DonorList /></AdminRoute>} />
          <Route path="/admin/donors/add"         element={<AdminRoute><DonorAdd /></AdminRoute>} />
          <Route path="/admin/donors/edit/:id"    element={<AdminRoute><DonorEdit /></AdminRoute>} />
          <Route path="/admin/donors/:id"         element={<AdminRoute><DonorDetail /></AdminRoute>} />
          <Route path="/admin/schedule"           element={<AdminRoute><ScheduleManagement /></AdminRoute>} />
          <Route path="/admin/primary-timetable"  element={<AdminRoute><PrimaryTimetable /></AdminRoute>} />
          <Route path="/admin/users"              element={<AdminRoute><UserManagement /></AdminRoute>} />

          {/* Teacher */}
          <Route path="/teacher/dashboard"  element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/teacher/attendance" element={<TeacherRoute><Attendance /></TeacherRoute>} />
          <Route path="/teacher/marks"      element={<TeacherRoute><Marks /></TeacherRoute>} />
          <Route path="/teacher/schedule"   element={<TeacherRoute><Schedule /></TeacherRoute>} />
          <Route path="/teacher/requests"   element={<TeacherRoute><Requests /></TeacherRoute>} />

          {/* Student */}
          <Route path="/student/dashboard"  element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/student/attendance" element={<StudentRoute><MyAttendance /></StudentRoute>} />
          <Route path="/student/marks"      element={<StudentRoute><MyMarks /></StudentRoute>} />
          <Route path="/student/schedule"   element={<StudentRoute><MySchedule /></StudentRoute>} />
          <Route path="/student/requests"   element={<StudentRoute><MyRequests /></StudentRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}