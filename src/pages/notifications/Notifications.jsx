import React, { useEffect, useState } from "react";
import { Plus, Trash2, Eye, CheckCircle } from "lucide-react";
import Table from "../../components/shared/table/Table";
import NotificationModal from "../../components/NotificationModal";
import NotificationModalTwo from "../../components/NotificationModalTwo";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState({ open: false, notification: null });

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load notifications");
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [isModalOpen]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setSuccess("Notification deleted!");
      setNotifications(notifications.filter((n) => n._id !== id && n.ID !== id));
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      setError(err.message || "Failed to delete notification");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "send_time", label: "Send Time", render: (row) => new Date(row.send_time || row.SendTime).toLocaleString("en-US", { timeZone: "UTC" }) },
    { key: "roles", label: "Sent To", render: (row) => (Array.isArray(row.roles) ? row.roles.join(", ") : Array.isArray(row.Roles) ? row.Roles.join(", ") : row.roles || row.Roles || "-") },
    { key: "status", label: "Status", render: (row) => <span className={(row.status || row.Status) === "sent" ? "text-green-600" : "text-yellow-600"}>{row.status || row.Status || "-"}</span> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => setViewModal({ open: true, notification: row })} className="text-blue-600 hover:text-blue-800" title="View"><Eye size={18} /></button>
          <button onClick={() => handleDelete(row._id || row.ID)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Schedule Notification
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md mb-4"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> <span className="text-green-700">{success}</span></div>}
      {loading ? (
        <div>Loading notifications...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table columns={columns} data={notifications} />
        </div>
      )}
      {/* Schedule Notification Modal */}
      {isModalOpen && <NotificationModal onClose={() => setIsModalOpen(false)} />}
      {/* View Notification Modal */}
      {viewModal.open && (
        <NotificationModalTwo onClose={() => setViewModal({ open: false, notification: null })} email={viewModal.notification} />
      )}
    </div>
  );
};

export default Notifications;
