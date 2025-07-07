import React, { useState } from "react";

const NotificationModal = ({ onClose }) => {
  // Get faculty from localStorage user object
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const defaultFaculty = user.faculty || "";
  const [message, setMessage] = useState("");
  const [sendTime, setSendTime] = useState("");
  const [roles, setRoles] = useState([]);
  const [faculties, setFaculties] = useState(defaultFaculty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setRoles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      // Fix send_time format: add seconds and Z if missing
      let formattedSendTime = sendTime;
      if (sendTime && sendTime.length === 16) {
        formattedSendTime = sendTime + ":00Z";
      }
      const response = await fetch("http://localhost:8080/api/notifications/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          send_time: formattedSendTime,
          roles,
          faculties: faculties.split(',').map(f => f.trim()),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to schedule notification");
        setLoading(false);
        return;
      }
      setLoading(false);
      alert("Notification scheduled successfully!");
      onClose();
    } catch (err) {
      setError("Failed to schedule notification. Please try again.");
      setLoading(false);
    }
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
              placeholder="Faculty"
              name="faculties"
              value={faculties}
              onChange={e => setFaculties(e.target.value)}
              required
              readOnly
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Send Notification"}
          </button>
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
