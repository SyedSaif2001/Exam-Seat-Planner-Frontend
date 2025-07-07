import React, { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, X, CheckCircle, Building, Users } from "lucide-react";
import Table from "../../components/shared/table/Table";
import AddNewExamModal from "./AddNewExamModal";
import ReactModal from "react-modal";

// Modal for selecting student list (reused from AddNewExamModal)
const StudentListModal = ({ open, onClose, studentLists, onSelect, selected }) => {
  const [search, setSearch] = React.useState("");
  if (!open) return null;
  const filteredLists = (studentLists || []).filter(list =>
    (list.name || "").toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold mb-4">Select Student List(s)</h3>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Search by list name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto">
          {filteredLists.length === 0 ? (
            <div className="text-gray-500">No lists found.</div>
          ) : (
            filteredLists.map(list => {
              const isSelected = selected?.includes(list._id);
              return (
                <div
                  key={list._id}
                  className={`p-2 rounded cursor-pointer hover:bg-blue-100 ${isSelected ? "bg-blue-200" : ""}`}
                  onClick={() => onSelect(list._id)}
                >
                  <span className="font-medium">{list.name}</span> <span className="text-xs text-gray-500">({list.total_count} students)</span>
                  {isSelected && <CheckCircle className="inline ml-2 text-green-500 w-4 h-4" />}
                </div>
              );
            })
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-md">Done</button>
        </div>
      </div>
    </div>
  );
};

// Modal for selecting invigilator (reused from AddNewExamModal)
const InvigilatorModal = ({ open, onClose, invigilators, onSelect, selected, assignedInvigilators = [] }) => {
  const [search, setSearch] = React.useState("");
  if (!open) return null;
  const filteredInvigilators = (invigilators || []).filter(inv =>
    (inv.role === "admin" || inv.role === "staff") &&
    ((inv.name || "").toLowerCase().includes(search.toLowerCase()) ||
     (inv.email || "").toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold mb-4">Select Invigilator</h3>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto">
          {filteredInvigilators.length === 0 ? (
            <div className="text-gray-500">No invigilators found.</div>
          ) : (
            filteredInvigilators.map(inv => {
              const isAssigned = assignedInvigilators.includes(inv._id);
              return (
                <div
                  key={inv._id}
                  className={`p-2 rounded cursor-pointer hover:bg-blue-100 ${selected === inv._id ? "bg-blue-200" : ""} ${isAssigned ? "opacity-50 bg-gray-100" : ""}`}
                  onClick={() => !isAssigned && onSelect(inv._id)}
                  title={isAssigned ? "Already assigned to another room" : ""}
                >
                  <span className="font-medium">{inv.name}</span> <span className="text-xs text-gray-500">({inv.email})</span> <span className="text-xs text-gray-400">[{inv.role}]</span>
                  {isAssigned && <span className="text-xs text-red-500 ml-2">(Assigned)</span>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const EditExamModal = ({ isOpen, onClose, exam, onSave }) => {
  // Guard: if exam is missing, show error and close modal
  if (!isOpen || !exam) {
    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">Close</button>
          </div>
          <div className="text-red-500">Exam data not found. Please try again.</div>
        </div>
      </div>
    ) : null;
  }
  const [step, setStep] = useState(1); // 1: Exam details, 2: Room management
  const [form, setForm] = useState({
    title: exam?.Title || "",
    date: exam?.Date ? exam.Date.slice(0, 16) : "",
    duration: exam?.Duration || "",
    faculty: exam?.Faculty || "",
    algorithm: exam?.Algorithm || "matrix", // Default algorithm
  });
  const [rooms, setRooms] = useState([]); // Assigned rooms for this exam
  const [allRooms, setAllRooms] = useState([]); // All available rooms
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  // Add these missing state variables
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentLists, setStudentLists] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [studentListModal, setStudentListModal] = useState({ open: false, roomIndex: null });
  const [invigilatorModal, setInvigilatorModal] = useState({ open: false, roomIndex: null });

  useEffect(() => {
    if (isOpen) {
      // Fetch all available rooms
      const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:8080/api/seating/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch rooms");
          const data = await res.json();
          setAllRooms(
            Array.isArray(data)
              ? data.map(room => ({
                  ...room,
                  name: room.name || room.Name || "",
                  building: room.building || room.Building || "",
                  rows: room.rows || room.Rows || "",
                  columns: room.columns || room.Columns || "",
                  capacity: room.capacity || room.Capacity || "",
                }))
              : []
          );
        } catch {
          setAllRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchRooms();
      // Load assigned rooms for this exam (existing logic)
      loadExamRooms();
      // Fetch student lists and invigilators for mapping names
      fetchStudentLists();
      fetchInvigilators();
    }
  }, [isOpen]);

  // Filter rooms by search
  const filteredRooms = allRooms.filter(r => {
    const q = roomSearch.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.building?.toLowerCase().includes(q) ||
      String(r.capacity || "").includes(q)
    );
  });

  // Add selected room to assigned rooms
  const handleAddRoom = () => {
    if (!selectedRoomId) return;
    const room = allRooms.find(r => r._id === selectedRoomId || r.ID === selectedRoomId);
    if (!room) return;
    // Prevent duplicate assignment
    if (rooms.some(r => (r._id || r.ID) === (room._id || room.ID))) return;
    setRooms([...rooms, room]);
    setSelectedRoomId("");
    setRoomSearch("");
  };

  // Remove assigned room
  const handleRemoveRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const loadExamRooms = async () => {
    const examId = exam?.ID || exam?._id;
    if (!examId) return;
    try {
      const token = localStorage.getItem("token");
      console.log("Loading rooms for exam:", examId);
      console.log("Token available:", !!token);
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() > exp) {
          console.error("Token is expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          window.location.href = "/login";
          return;
        }
        console.log("Token is valid, expires at:", new Date(exp));
      } catch (e) {
        console.error("Error parsing token:", e);
      }
      const response = await fetch(`http://localhost:8080/api/seating/exams/${examId}/rooms`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      console.log("Response status:", response.status);
      if (response.ok) {
        const examRooms = await response.json();
        console.log("Exam rooms data:", examRooms);
        console.log("First exam room structure:", examRooms[0]);
        console.log("Room object:", examRooms[0]?.room);
        console.log("Student list object:", examRooms[0]?.student_list);
        console.log("Invigilators array:", examRooms[0]?.invigilators);
        
        // Transform exam rooms to room form data (use nested objects)
        const roomData = examRooms.map(er => ({
          name: er.room?.Name || er.room?.name || "",
          building: er.room?.Building || er.room?.building || "",
          capacity: er.room?.Capacity || er.room?.capacity || 0,
          rows: er.room?.Rows || er.room?.rows || "",
          columns: er.room?.Columns || er.room?.columns || "",
          studentListIds: er.student_list_ids || [],
          studentLists: er.student_lists || [],
          invigilatorIds: er.invigilator_ids || [],
          invigilators: Array.isArray(er.invigilators) ? er.invigilators : [],
        }));
        setRooms(roomData);
      } else {
        console.error("Failed to load exam rooms, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (err) {
      console.error("Failed to load exam rooms:", err);
    }
  };

  const fetchStudentLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = localStorage.getItem("role");
      
      const endpoint = role === "admin" 
        ? "http://localhost:8080/api/seating/student-lists/faculty"
        : "http://localhost:8080/api/seating/student-lists";
        
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudentLists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch student lists:", err);
    }
  };

  const fetchInvigilators = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/seating/invigilators", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInvigilators(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch invigilators:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.title || !form.date || !form.duration || !form.faculty) {
        setError("Please fill in all exam details");
        return;
      }
      setStep(2);
      setError("");
    } else {
      await updateExamWithRooms();
    }
  };

  const handleGenerateSeatingPlan = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const examId = exam?.ID || exam?._id;
      
      // Get the first invigilator from the first room (for demo purposes)
      let invigilatorEmail = "";
      if (rooms.length > 0 && rooms[0].invigilatorIds && rooms[0].invigilatorIds.length > 0) {
        const firstInvigilator = invigilators.find(inv => inv._id === rooms[0].invigilatorIds[0]);
        invigilatorEmail = firstInvigilator?.email || "";
      }

      if (!invigilatorEmail) {
        setError("Please assign at least one invigilator to generate seating plans");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8080/api/seating/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_id: examId,
          invigilator_email: invigilatorEmail,
          algorithm: form.algorithm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate seating plan");
      }

      setSuccess("Seating plan generated successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to generate seating plan");
    } finally {
      setLoading(false);
    }
  };

  const updateExamWithRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      // Format date to RFC3339
      let dateString = form.date;
      if (dateString && dateString.length === 16) {
        dateString = dateString + ":00Z";
      }

      const examId = exam?.ID || exam?._id;
      
      // Update exam details only
      const examResponse = await fetch(`http://localhost:8080/api/seating/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          date: dateString,
          duration: parseInt(form.duration),
          faculty: form.faculty,
          algorithm: form.algorithm,
        }),
      });

      if (!examResponse.ok) {
        throw new Error("Failed to update exam");
      }

      // For now, just update the exam details
      // Room assignments will be handled separately if needed
      setSuccess("Exam updated successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  const getStudentListNames = (studentListIds) => {
    if (!Array.isArray(studentListIds) || studentListIds.length === 0) return "Not selected";
    return studentListIds.map(id => {
      const list = studentLists.find(l => l._id === id);
      return list ? list.name : id;
    }).join(", ");
  };

  const getInvigilatorNames = (invigilatorIds) => {
    if (!Array.isArray(invigilatorIds) || invigilatorIds.length === 0) return "";
    return invigilatorIds
      .map(id => {
        const inv = invigilators.find(i => i._id === id);
        return inv ? inv.name : "";
      })
      .filter(name => name)
      .join(", ");
  };

  const handleStudentListSelect = (roomIndex, studentListId) => {
    const updatedRooms = [...rooms];
    if (!updatedRooms[roomIndex].studentListIds) {
      updatedRooms[roomIndex].studentListIds = [];
    }
    // Toggle selection
    const index = updatedRooms[roomIndex].studentListIds.indexOf(studentListId);
    if (index > -1) {
      updatedRooms[roomIndex].studentListIds.splice(index, 1);
    } else {
      updatedRooms[roomIndex].studentListIds.push(studentListId);
    }
    setRooms(updatedRooms);
  };

  const handleInvigilatorSelect = (roomIndex, invigilatorId) => {
    if (!invigilatorId) return;
    
    // Check if this invigilator is already assigned to another room in this exam
    const isAlreadyAssigned = rooms.some((room, idx) => 
      idx !== roomIndex && 
      room.invigilatorIds && 
      room.invigilatorIds.includes(invigilatorId)
    );
    
    if (isAlreadyAssigned) {
      const invigilator = invigilators.find(inv => inv._id === invigilatorId);
      const invigilatorName = invigilator ? invigilator.name : invigilatorId;
      setError(`Invigilator "${invigilatorName}" is already assigned to another room in this exam. Each invigilator can only be assigned to one room per exam.`);
      return;
    }
    
    const updatedRooms = [...rooms];
    if (!updatedRooms[roomIndex].invigilatorIds) {
      updatedRooms[roomIndex].invigilatorIds = [];
    }
    // Replace existing invigilators with the new one (single invigilator per room)
    updatedRooms[roomIndex].invigilatorIds = [invigilatorId];
    setRooms(updatedRooms);
    setInvigilatorModal({ open: false, roomIndex: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 1 ? "Edit Exam Details" : "Edit Room Assignments"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 ? (
          // Exam Details Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Final Exam - Database Systems"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="120"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty *
                </label>
                <input
                  name="faculty"
                  value={form.faculty}
                  onChange={handleChange}
                  placeholder="e.g., Faculty of Computing"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seating Algorithm *
                </label>
                <select
                  name="algorithm"
                  value={form.algorithm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="parallel">Parallel (Column by Column)</option>
                  <option value="random">Random (Random Arrangement)</option>
                  <option value="snake">Snake (Serpentine Row-by-Row)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Parallel: Students arranged by columns | Random: Students arranged randomly | Snake: Students arranged in a serpentine (left-to-right, right-to-left) row pattern
                </p>
              </div>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Next: Edit Rooms
              </button>
            </div>
          </form>
        ) : (
          // Room Management
          <div className="space-y-6">
            {/* Room Add Section (card/grid-based) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Select Rooms
              </h3>
              <input
                type="text"
                placeholder="Search by room name or building..."
                value={roomSearch}
                onChange={e => setRoomSearch(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4"
                disabled={loadingRooms}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRooms.length === 0 ? (
                  <div className="col-span-full text-gray-500">No rooms found.</div>
                ) : (
                  filteredRooms.map(room => {
                    const isAssigned = rooms.some(r => (r._id || r.ID) === (room._id || room.ID));
                    return (
                      <div
                        key={room._id || room.ID}
                        className={`border rounded-lg p-4 shadow-sm cursor-pointer transition-all ${isAssigned ? "bg-blue-100 border-blue-400" : "hover:bg-blue-50"}`}
                        onClick={() => {
                          if (!isAssigned) setRooms([...rooms, room]);
                        }}
                        style={{ opacity: isAssigned ? 0.6 : 1 }}
                      >
                        <div className="font-bold text-lg mb-1">{room.name}</div>
                        <div className="text-gray-600 text-sm mb-1">{room.building}</div>
                        <div className="text-xs text-gray-500 mb-1">Rows: {room.rows}, Cols: {room.columns}, Cap: {room.capacity}</div>
                        <div className="text-blue-600 text-xs font-semibold mt-2">
                          {isAssigned ? "Added" : "Click to add"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Rooms Table */}
            {rooms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Assigned Rooms</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Building
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invigilators
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.map((room, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.building}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.capacity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => setStudentListModal({ open: true, roomIndex: index })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {getStudentListNames(room.studentListIds)}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => setInvigilatorModal({ open: true, roomIndex: index })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {getInvigilatorNames(room.invigilatorIds) || "Add Invigilator"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => handleRemoveRoom(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {error && <div className="text-red-500">{error}</div>}
            {success && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateSeatingPlan}
                  disabled={loading || rooms.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Seating Plan"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Exam"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <StudentListModal
          open={studentListModal.open}
          onClose={() => setStudentListModal({ open: false, roomIndex: null })}
          studentLists={studentLists || []}
          onSelect={id => handleStudentListSelect(studentListModal.roomIndex, id)}
          selected={rooms[studentListModal.roomIndex]?.studentListIds || []}
        />

        <InvigilatorModal
          open={invigilatorModal.open}
          onClose={() => setInvigilatorModal({ open: false, roomIndex: null })}
          invigilators={invigilators || []}
          onSelect={id => handleInvigilatorSelect(invigilatorModal.roomIndex, id)}
          selected={rooms[invigilatorModal.roomIndex]?.invigilatorIds?.[0]}
          assignedInvigilators={rooms.flatMap(room => room.invigilatorIds || [])}
        />
      </div>
    </div>
  );
};

const ManageExams = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editExam, setEditExam] = useState(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/seating/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch exams");
        const data = await res.json();
        console.log("Fetched exams:", data); // <-- Debug log
        setExams(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load exams");
        setLoading(false);
      }
    };
    fetchExams();
  }, [isModalOpen]);

  const handleDelete = async (examId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/seating/exams/${examId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      setExams((exams || []).filter((exam) => exam.ID !== examId));
    } catch (err) {
      alert(err.message || "Failed to delete exam");
    }
  };

  const handleEditSave = (updatedExam) => {
    setExams((prev) => prev.map((exam) => exam.ID === updatedExam.ID ? { ...exam, ...updatedExam } : exam));
  };

  const filteredExams = (exams || []).filter((exam) =>
    (exam.Title || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    let date;
    if (typeof dateValue === "object" && dateValue.$date) {
      date = new Date(dateValue.$date);
    } else {
      date = new Date(dateValue);
    }
    // Show in UTC
    return isNaN(date.getTime()) ? "" : date.toLocaleString("en-US", { timeZone: "UTC" });
  };

  const columns = [
    { key: "Title", label: "Exam Title" },
    { 
      key: "Date", 
      label: "Date & Time",
      render: (row) => formatDate(row.Date)
    },
    { 
      key: "Duration", 
      label: "Duration (min)",
      render: (row) => {
        console.log("Duration cell row:", row);
        return row.Duration !== undefined && row.Duration !== null ? row.Duration : "-";
      }
    },
    { key: "Faculty", label: "Faculty" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <Pencil className="text-blue-500 cursor-pointer" onClick={() => setEditExam(row)} />
          <Trash2
            className="text-red-500 cursor-pointer"
            onClick={() => handleDelete(row.ID)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-start mb-4">
          <h1 className="text-3xl font-bold">Manage Exams</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search exams..."
            className="w-1/2 p-2 mb-4 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Exam
          </button>
        </div>
        {loading ? (
          <div>Loading exams...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
        <Table columns={columns} data={filteredExams} />
        )}
      </div>
      {isModalOpen && <AddNewExamModal setIsModalOpen={setIsModalOpen} />}
      {editExam && (
        <EditExamModal
          isOpen={!!editExam}
          onClose={() => setEditExam(null)}
          exam={editExam}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default ManageExams;
