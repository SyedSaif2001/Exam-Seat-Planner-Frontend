import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, LogOut, Settings, ClipboardList, LayoutDashboard, Upload, Users, Building2 } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Check if we are on the student dashboard route
  const isStudentDashboard = location.pathname === "/student-dashboard";
  const isStaff = role === "staff";

  return (
    <div className="h-screen w-64 bg-[#E5E7EB] text-white flex flex-col justify-between p-4">
      {/* Logo */}
      <div className="flex items-center justify-center py-4">
        <img
          src="/assets/esp-Logo.png"
          alt="logo"
          className="h-[70px] w-[100px]"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 flex-grow">
        {/* Admin Navigation */}
        {role === "admin" && (
          <>
            <SidebarItem
              to="/dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
            />
            <SidebarItem
              to="/manage-exams"
              icon={<ClipboardList size={20} />}
              text="Manage Exams"
            />
            <SidebarItem
              to="/manage-student-lists"
              icon={<Users size={20} />}
              text="Student List Management"
            />
            <SidebarItem
              to="/manage-rooms"
              icon={<Building2 size={20} />}
              text="Room Management"
            />
            <SidebarItem
              to="/notifications"
              icon={<Settings size={20} />}
              text="Notifications"
            />
          </>
        )}

        {/* Staff Navigation */}
        {role === "staff" && (
          <>
            <SidebarItem
              to="/staff-dashboard"
              icon={<LayoutDashboard size={20} />}
              text="Dashboard"
            />
            <SidebarItem
              to="/upload-student-list"
              icon={<Upload size={20} />}
              text="Upload Student List"
            />
            <SidebarItem
              to="/staff-student-lists"
              icon={<Users size={20} />}
              text="Student List Management"
            />
          </>
        )}

        {/* Student Navigation */}
        {role === "student" && (
          <>
            <SidebarItem
              to="/student-dashboard"
              icon={<Users size={20} />}
              text="My Exams"
            />
          </>
        )}
      </nav>

      {/* Logout Button */}
      <button onClick={handleLogout} className="flex items-center gap-2 p-3 bg-orange-500 rounded-md w-full">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

const SidebarItem = ({ to, icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-colors ${
        isActive 
          ? "bg-sky-600 text-white" 
          : "text-black hover:text-white hover:bg-sky-600"
      }`}
    >
      {icon} {text}
    </Link>
  );
};

export default Sidebar;
