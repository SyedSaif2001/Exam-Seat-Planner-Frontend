import React, { useState } from "react";
import { UserCircle, Bell } from "lucide-react";
import NotificationModal from "../../components/NotificationModal";
import NotificationModalTwo from "../../components/NotificationModalTwo";

const NotificationPage = () => {

  const [isModalOneOpen, setIsModalOneOpen] = useState(false);
  const [isModalTwoOpen, setIsModalTwoOpen] = useState(false);

  const handleViewDetail = () => {
    setIsModalOneOpen(true);
  };

  const handleViewDetailTwo = () => {
    setIsModalTwoOpen(true);
  };

  const emailLogs = [
    { id: 1, title: "Email No. 1", date: "01/01/2025 19:50" },
    { id: 2, title: "Email No. 2", date: "04/01/2025 2:15" },
    { id: 3, title: "Email No. 3", date: "05/01/2025 13:30" },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Notification</h1>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              Admin
            </button>
          </div>

          {/* Email Logs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Email Logs</h2>
            {emailLogs.map((email) => (
              <div
                key={email.id}
                className="flex justify-between py-4 border-b last:border-b-0"
              >
                <div>
                  <h3 className="text-lg font-medium">{email.title}</h3>
                  <p className="text-gray-500">{email.date}</p>
                </div>
                <button onClick={handleViewDetailTwo} className="text-blue-500 hover:underline">
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={handleViewDetail}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
            >
              <Bell className="w-5 h-5" />
              Draft new Notification
            </button>
          </div>
        </div>
      </div>

      {isModalOneOpen && <NotificationModal onClose={() => setIsModalOneOpen(false)} />}
      {isModalTwoOpen && <NotificationModalTwo onClose={() => setIsModalTwoOpen(false)} />}
    </>
  );
};

export default NotificationPage;
