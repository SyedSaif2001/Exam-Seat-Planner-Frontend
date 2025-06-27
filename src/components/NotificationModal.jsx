import React from "react";

const NotificationModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-red-600"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">Draft New Notification</h2>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-32"
              placeholder="Type your message..."
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="w-1/2">
              <label className="block font-medium mb-1">Time</label>
              <input
                type="time"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Department</label>
            <select className="w-full border rounded px-3 py-2">
              <option value="">Select Department</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="CE">Computer Engineering</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send Notification
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
