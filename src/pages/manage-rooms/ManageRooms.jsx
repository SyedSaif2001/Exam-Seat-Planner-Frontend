import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Building2, X, CheckCircle } from "lucide-react";

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ name: "", rows: "", columns: "", building: "" });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/seating/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      // Sort newest first by created_at, CreatedAt, or _id/ID (ObjectID timestamp)
      const sorted = [...data].sort((a, b) => {
        const getTime = (obj) => {
          if (obj.created_at || obj.CreatedAt) {
            return new Date(obj.created_at || obj.CreatedAt).getTime();
          }
          // If _id is a MongoDB ObjectID string, extract timestamp
          if (obj._id && typeof obj._id === "string" && obj._id.length === 24) {
            return parseInt(obj._id.substring(0, 8), 16) * 1000;
          }
          if (obj.ID && typeof obj.ID === "string" && obj.ID.length === 24) {
            return parseInt(obj.ID.substring(0, 8), 16) * 1000;
          }
          return 0;
        };
        return getTime(b) - getTime(a);
      });
      setRooms(sorted);
    } catch (err) {
      setError(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    setEditRoom(room);
    setForm(room ? {
      name: room.Name || room.name || "",
      rows: room.Rows || room.rows || "",
      columns: room.Columns || room.columns || "",
      building: room.Building || room.building || "",
    } : { name: "", rows: "", columns: "", building: "" });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditRoom(null);
    setForm({ name: "", rows: "", columns: "", building: "" });
    setError("");
    setSuccess("");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rows || !form.columns || !form.building) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const body = {
        name: form.name,
        rows: parseInt(form.rows),
        columns: parseInt(form.columns),
        building: form.building,
        capacity: parseInt(form.rows) * parseInt(form.columns),
      };
      let res;
      if (editRoom) {
        // Update existing room
        const roomId = editRoom._id || editRoom.ID;
        res = await fetch(`http://localhost:8080/api/seating/rooms/${roomId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      } else {
        // Create new room
        res = await fetch("http://localhost:8080/api/seating/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error("Failed to save room");
      setSuccess(editRoom ? "Room updated!" : "Room created!");
      fetchRooms();
      setTimeout(handleCloseModal, 1000);
    } catch (err) {
      setError(err.message || "Failed to save room");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/seating/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete room");
      setSuccess("Room deleted!");
      fetchRooms();
    } catch (err) {
      setError(err.message || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 /> Room Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Room
        </button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md mb-4"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> <span className="text-green-700">{success}</span></div>}
      {loading ? (
        <div>Loading rooms...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Columns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4">No rooms found.</td></tr>
              ) : (
                rooms.map((room, idx) => (
                  <tr key={room._id || room.ID || idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Name || room.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Building || room.building}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Rows || room.rows}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Columns || room.columns}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.Capacity || room.capacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                      <button onClick={() => handleOpenModal(room)} className="text-blue-600 hover:text-blue-800"><Pencil /></button>
                      <button onClick={() => handleDelete(room._id || room.ID)} className="text-red-600 hover:text-red-800"><Trash2 /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal for add/edit room */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"><X /></button>
            <h2 className="text-xl font-semibold mb-4">{editRoom ? "Edit Room" : "Add Room"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rows *</label>
                <input name="rows" type="number" value={form.rows} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Columns *</label>
                <input name="columns" type="number" value={form.columns} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Building *</label>
                <input name="building" value={form.building} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              {error && <div className="text-red-500">{error}</div>}
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">{loading ? "Saving..." : editRoom ? "Update Room" : "Add Room"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms; 