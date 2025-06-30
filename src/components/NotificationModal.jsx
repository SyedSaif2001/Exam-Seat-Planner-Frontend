import React, { useState } from "react";

const NotificationModal = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [sendTime, setSendTime] = useState("");
  const [roles, setRoles] = useState([]);
  const [faculties, setFaculties] = useState("");

  const handleRoleChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setRoles(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API to schedule notification
    // Example payload:
    // {
    //   message,
    //   send_time: sendTime,
    //   roles,
    //   faculties: faculties.split(',').map(f => f.trim())
    // }
    onClose();
  };

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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-32"
              placeholder="Type your message..."
              name="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block font-medium mb-1">Send Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-3 py-2"
                name="send_time"
                value={sendTime}
                onChange={e => setSendTime(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block font-medium mb-1">Roles</label>
              <select
                className="w-full border rounded px-3 py-2"
                name="roles"
                multiple
                value={roles}
                onChange={handleRoleChange}
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Faculties</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter faculties (comma separated)"
              name="faculties"
              value={faculties}
              onChange={e => setFaculties(e.target.value)}
              required
            />
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
