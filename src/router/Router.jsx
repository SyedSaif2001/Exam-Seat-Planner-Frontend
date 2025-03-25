import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/dashboard/Dashboard";
import AuthLayout from "../components/layout/auth-layout";
import LoginPage from "../pages/login/Login";
import DashboardLayout from "../components/layout/dashboard-layout";
import SignupPage from "../pages/sign-up/SignupPage";
import ManageExams from "../pages/manage-exams/ManageExams";
import NotificationPage from "../pages/notifications/Notifications";
// import ProfilePage from "../pages/profile/Profile";
// import { Outlet } from "react-router-dom"; // Required for layouts

const AppRouter = () => {
  return (
    <Routes>
      {/* Dashboard Layout Wrapping Multiple Pages */}
      <Route element={<DashboardLayout />}>
        <Route path="/" index element={<DashboardPage />} />
        <Route path="manage-exams" element={<ManageExams />} />
        <Route path="notifications" element={<NotificationPage />} />
      </Route>

      {/* Auth Layout Wrapping Multiple Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
