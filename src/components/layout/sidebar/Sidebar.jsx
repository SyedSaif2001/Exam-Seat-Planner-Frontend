import { Link } from "react-router-dom";
import { LogOut, Settings, ClipboardList, LayoutDashboard } from "lucide-react";

const Sidebar = () => {
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
        <SidebarItem
          to="/"
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
        />
        <SidebarItem
          to="/manage-exams"
          icon={<ClipboardList size={20} />}
          text="Manage Exams"
        />
        <SidebarItem
          to="/notifications"
          icon={<Settings size={20} />}
          text="Notifications"
        />
      </nav>

      {/* Logout Button */}
      <button className="flex items-center gap-2 p-3 bg-black rounded-md w-full">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

const SidebarItem = ({ to, icon, text }) => {
  return (
    <Link
      to={to}
      className="flex items-center text-black gap-3 p-3 hover:bg-gray-500 rounded-md"
    >
      {icon} {text}
    </Link>
  );
};

export default Sidebar;
