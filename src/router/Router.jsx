import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/dashboard/Dashboard";
import AuthLayout from "../components/layout/auth-layout";
import LoginPage from "../pages/login/Login";
import DashboardLayout from "../components/layout/dashboard-layout";
import SignupPage from "../pages/sign-up/SignupPage";
import ManageExams from "../pages/manage-exams/ManageExams";
import UploadStudentList from "../pages/manage-exams/UploadStudentList";
import NotificationPage from "../pages/notifications/Notifications";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import StaffDashboard from "../pages/dashboard/StaffDashboard";
import VerifyEmail from "../pages/verify-email/VerifyEmail";
import ForgotPassword from "../pages/forgot-password/ForgotPassword";
import ResetPassword from "../pages/reset-password/ResetPassword";
import ManageRooms from "../pages/manage-rooms/ManageRooms";
import ManageStudentLists from "../pages/manage-exams/ManageStudentLists";
import StaffManageStudentLists from "../pages/manage-exams/StaffManageStudentLists";
// import ProfilePage from "../pages/profile/Profile";
// import { Outlet } from "react-router-dom"; // Required for layouts

// RBAC ProtectedRoute
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/unauthorized" element={<div className='p-10 text-center text-2xl text-red-600'>Unauthorized</div>} />

        {/* Dashboard routes with sidebar layout */}
        <Route element={<DashboardLayout />}>
          {/* Admin routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/manage-exams" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageExams />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NotificationPage />
            </ProtectedRoute>
          } />
          <Route path="/manage-rooms" element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <ManageRooms />
            </ProtectedRoute>
          } />
          <Route path="/manage-student-lists" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageStudentLists />
            </ProtectedRoute>
          } />
          <Route path="/staff-student-lists" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffManageStudentLists />
            </ProtectedRoute>
          } />
          {/* Staff routes */}
          <Route path="/staff-dashboard" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/upload-student-list" element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <UploadStudentList />
            </ProtectedRoute>
          } />
          {/* Student routes */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Default route: redirect to dashboard based on role */}
        <Route path="/" element={<RoleRedirect />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Redirect to dashboard based on role
const RoleRedirect = () => {
  const role = localStorage.getItem("role");
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "staff") return <Navigate to="/staff-dashboard" replace />;
  if (role === "student") return <Navigate to="/student-dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default AppRouter;
