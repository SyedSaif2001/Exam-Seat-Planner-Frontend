import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { useState } from "react";

const DashboardLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  const handleSidebar = () => {
    setOpenSidebar(!openSidebar);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Sidebar for large screens */}
      <div className="hidden sm:block">
        <Sidebar />
      </div>

      {/* Sidebar for small screens */}
      {openSidebar && (
        <div className="absolute top-0 left-0 z-50 w-64 h-full bg-white shadow-lg sm:hidden">
          <Sidebar />
          <button
            className="absolute top-4 right-4 text-gray-600"
            onClick={handleSidebar}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8">
        {/* Toggle Button - visible only on small screens */}
        <div className="sm:hidden mb-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSidebar}
          >
            {openSidebar ? "Close Sidebar" : "Open Sidebar"}
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
