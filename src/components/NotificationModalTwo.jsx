// components/EmailDetailModal.jsx
import React, { useEffect } from "react";

const NotificationModalTwo = ({ onClose, email }) => {
  console.log("Component rendered!");

    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto'; // Reset on modal close
      };
    }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-red-600"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold text-blue-600 mb-1">Email Details</h2>
        <p className="text-gray-500 mb-4">Review the details of the sent email notification.</p>
        <hr className="mb-4" />

        {email ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Sent By:</p>
                <p className="text-gray-800">Admin</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date:</p>
                <p className="text-gray-800">{email.date || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Time:</p>
                <p className="text-gray-800">{email.time || "N/A"}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Message:</p>
              <div className="bg-gray-50 border rounded-md p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {email.message || "No message available"}
              </div>
            </div>
          </>
        ) : (
          <p className="text-red-500 text-center">No email data found.</p>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Back to Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModalTwo;