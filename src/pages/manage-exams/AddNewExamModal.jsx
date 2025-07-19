import React, { useState, useEffect } from "react";
import { Plus, Users, Building, X, CheckCircle } from "lucide-react";

// Modal for selecting student list
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

// Modal for selecting invigilator
const InvigilatorModal = ({ open, onClose, invigilators, onSelect, selected = [], assignedInvigilators = [] }) => {
  const [search, setSearch] = React.useState("");
  if (!open) return null;
  // Only show admin and staff
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
        <h3 className="text-lg font-semibold mb-4">Select Invigilators</h3>
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
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-100 ${isAssigned ? "opacity-50 bg-gray-100" : ""}`}
                  title={isAssigned ? "Already assigned to another room" : ""}
                >
                  <input
                    type="checkbox"
                    disabled={isAssigned}
                    checked={Array.isArray(selected) && selected.includes(inv._id)}
                    onChange={() => !isAssigned && onSelect(inv._id)}
                  />
                  <span className="font-medium">{inv.name}</span> <span className="text-xs text-gray-500">({inv.email})</span> <span className="text-xs text-gray-400">[{inv.role}]</span>
                  {isAssigned && <span className="text-xs text-red-500 ml-2">(Assigned)</span>}
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

const AddNewExamModal = ({ setIsModalOpen }) => {
  const [step, setStep] = useState(1); // 1: Exam details, 2: Room management
  const [examForm, setExamForm] = useState({
    title: "",
    date: "",
    duration: "",
    faculty: "",
    algorithm: "parallel", // Default algorithm
  });
  const [rooms, setRooms] = useState([]);
  const [studentLists, setStudentLists] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [studentListModal, setStudentListModal] = useState({ open: false, roomIndex: null });
  const [invigilatorModal, setInvigilatorModal] = useState({ open: false, roomIndex: null });

  // Remove roomForm and handleRoomFormChange, handleAddRoom, handleRemoveRoom, and all code related to adding new rooms inline
  // Add state for availableRooms and selectedRooms
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]); // [{ roomId, studentListIds: [], invigilators: [] }]
  // Add state for room search
  const [roomSearch, setRoomSearch] = useState("");

  // Fetch available rooms on step 2
  useEffect(() => {
    if (step === 2) {
      fetchAvailableRooms();
    }
    // eslint-disable-next-line
  }, [step]);

  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/seating/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setAvailableRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setAvailableRooms([]);
    }
  };

  // Handle room selection
  const handleRoomSelect = (roomId) => {
    if (selectedRooms.some(r => r.roomId === roomId)) {
      setSelectedRooms(selectedRooms.filter(r => r.roomId !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, { roomId, studentListIds: [], invigilators: [] }]);
    }
  };

  // Handle student list assignment per room
  const handleStudentListSelect = (roomIndex, studentListId) => {
    const updated = [...selectedRooms];
    const currentIds = updated[roomIndex].studentListIds || [];
    if (currentIds.includes(studentListId)) {
      updated[roomIndex].studentListIds = currentIds.filter(id => id !== studentListId);
    } else {
      updated[roomIndex].studentListIds = [...currentIds, studentListId];
    }
    setSelectedRooms(updated);
  };

  // Handle invigilator assignment per room
  const handleInvigilatorSelect = (roomIndex, invigilatorId) => {
    if (!invigilatorId) return;
    const updated = [...selectedRooms];
    if (!updated[roomIndex].invigilators) {
      updated[roomIndex].invigilators = [];
    }
    // If already selected, remove; else, add (but only if not assigned elsewhere)
    const isAlreadyAssigned = selectedRooms.some((room, idx) =>
      idx !== roomIndex &&
      room.invigilators &&
      room.invigilators.includes(invigilatorId)
    );
    if (isAlreadyAssigned) {
      const invigilator = invigilators.find(inv => inv._id === invigilatorId);
      const invigilatorName = invigilator ? invigilator.name : invigilatorId;
      setError(`Invigilator "${invigilatorName}" is already assigned to another room in this exam. Each invigilator can only be assigned to one room per exam.`);
      return;
    }
    if (updated[roomIndex].invigilators.includes(invigilatorId)) {
      updated[roomIndex].invigilators = updated[roomIndex].invigilators.filter(id => id !== invigilatorId);
    } else {
      updated[roomIndex].invigilators.push(invigilatorId);
    }
    setSelectedRooms(updated);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchStudentLists();
    fetchInvigilators();
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const fetchStudentLists = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = localStorage.getItem("role");
      
      // Use different endpoint based on role
      const endpoint = role === "admin" 
        ? "http://localhost:8080/api/seating/student-lists/faculty"
        : "http://localhost:8080/api/seating/student-lists";
        
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudentLists(Array.isArray(data) ? data : []);
      } else {
        setStudentLists([]);
      }
    } catch (err) {
      console.error("Failed to fetch student lists:", err);
      setStudentLists([]);
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
      } else {
        setInvigilators([]);
      }
    } catch (err) {
      console.error("Failed to fetch invigilators:", err);
      setInvigilators([]);
    }
  };

  const handleExamFormChange = (e) => {
    setExamForm({ ...examForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!examForm.title || !examForm.date || !examForm.duration || !examForm.faculty) {
        setError("Please fill in all exam details");
        return;
      }
      setStep(2);
      setError("");
    } else {
      if (selectedRooms.length === 0) {
        setError("Please select at least one room");
        return;
      }
      await createExamWithRooms();
    }
  };

  const handleGenerateSeatingPlan = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      // Format date to RFC3339 (YYYY-MM-DDTHH:mm:ssZ)
      let dateString = examForm.date;
      if (dateString && dateString.length === 16) {
        dateString = dateString + ":00Z";
      }

      // Create exam first
      const examResponse = await fetch("http://localhost:8080/api/seating/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examForm.title,
          date: dateString,
          duration: parseInt(examForm.duration),
          faculty: examForm.faculty,
          algorithm: examForm.algorithm,
        }),
      });

      if (!examResponse.ok) {
        throw new Error("Failed to create exam");
      }

      const exam = await examResponse.json();
      const examId = exam._id || exam.ID;

      // Create rooms and add them to exam
      for (const selRoom of selectedRooms) {
        const room = availableRooms.find(r => (r._id || r.ID) === selRoom.roomId);
        if (!room) {
          console.error("Room not found in availableRooms:", selRoom.roomId);
          alert("Error: Room not found in available rooms.");
          continue;
        }

        // Add room to exam if student lists are selected
        if (selRoom.studentListIds && selRoom.studentListIds.length > 0) {
          const roomId = room._id || room.ID;
          const examRoomResponse = await fetch("http://localhost:8080/api/seating/exam-rooms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              exam_id: examId,
              room_id: roomId,
              student_list_ids: selRoom.studentListIds, // Array
            }),
          });

          if (!examRoomResponse.ok) {
            throw new Error("Failed to add room to exam");
          }

          const examRoom = await examRoomResponse.json();
          console.log("ExamRoom response from backend:", examRoom);
          const examRoomId = examRoom._id || examRoom.ID;

          // Add invigilators to the room
          for (const invigilatorId of selRoom.invigilators) {
            if (!examRoomId || !invigilatorId) {
              console.error("Missing examRoomId or invigilatorId", { examRoomId, invigilatorId });
              alert("Error: Missing exam room ID or invigilator ID when assigning invigilator.");
              continue;
            }
            console.log("Assigning invigilator", { exam_room_id: examRoomId, invigilator_id: invigilatorId });
            const resp = await fetch("http://localhost:8080/api/seating/exam-rooms/invigilators", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                exam_room_id: examRoomId,
                invigilator_id: invigilatorId,
              }),
            });
            
            if (!resp.ok) {
              const errorText = await resp.text();
              console.log("Invigilator assignment response", resp.status, errorText);
              if (resp.status === 409) {
                throw new Error("Invigilator is already assigned to another room in this exam");
              } else {
                throw new Error(`Failed to assign invigilator: ${errorText}`);
              }
            } else {
              console.log("Invigilator assignment response", resp.status, await resp.text());
            }
          }
        }
      }

      // Get the first invigilator from the first room (for demo purposes)
      let invigilatorEmail = "";
      if (selectedRooms.length > 0 && selectedRooms[0].invigilators && selectedRooms[0].invigilators.length > 0) {
        const firstInvigilator = invigilators.find(inv => inv._id === selectedRooms[0].invigilators[0]);
        invigilatorEmail = firstInvigilator?.email || "";
      }

      if (!invigilatorEmail) {
        setError("Please assign at least one invigilator to generate seating plans");
        setLoading(false);
        return;
      }

      // Generate seating plan
      const generateResponse = await fetch("http://localhost:8080/api/seating/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_id: examId,
          invigilator_email: invigilatorEmail,
          algorithm: examForm.algorithm,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate seating plan");
      }

      setSuccess("Exam created and seating plan generated successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create exam and generate seating plan");
    } finally {
      setLoading(false);
    }
  };

  const createExamWithRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      // Format date to RFC3339 (YYYY-MM-DDTHH:mm:ssZ)
      let dateString = examForm.date;
      if (dateString && dateString.length === 16) {
        dateString = dateString + ":00Z";
      }

      // Create exam
      const examResponse = await fetch("http://localhost:8080/api/seating/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examForm.title,
          date: dateString,
          duration: parseInt(examForm.duration),
          faculty: examForm.faculty,
          algorithm: examForm.algorithm,
        }),
      });

      if (!examResponse.ok) {
        throw new Error("Failed to create exam");
      }

      const exam = await examResponse.json();

      // Create rooms and add them to exam
      for (const selRoom of selectedRooms) {
        const room = availableRooms.find(r => (r._id || r.ID) === selRoom.roomId);
        if (!room) {
          console.error("Room not found in availableRooms:", selRoom.roomId);
          alert("Error: Room not found in available rooms.");
          continue;
        }

        // Add room to exam if student lists are selected
        if (selRoom.studentListIds && selRoom.studentListIds.length > 0) {
          // Use either _id or ID for exam and room
          const examId = exam._id || exam.ID;
          const roomId = room._id || room.ID;
          const examRoomResponse = await fetch("http://localhost:8080/api/seating/exam-rooms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              exam_id: examId,
              room_id: roomId,
              student_list_ids: selRoom.studentListIds, // Array
            }),
          });

          if (!examRoomResponse.ok) {
            throw new Error("Failed to add room to exam");
          }

          const examRoom = await examRoomResponse.json();

          // Add invigilators to the room
          for (const invigilatorId of selRoom.invigilators) {
            if (!examRoom._id || !invigilatorId) {
              console.error("Missing examRoom._id or invigilatorId", { examRoomId: examRoom._id, invigilatorId });
              alert("Error: Missing exam room ID or invigilator ID when assigning invigilator.");
              continue;
            }
            console.log("Assigning invigilator", { exam_room_id: examRoom._id, invigilator_id: invigilatorId });
            const resp = await fetch("http://localhost:8080/api/seating/exam-rooms/invigilators", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                exam_room_id: examRoom._id,
                invigilator_id: invigilatorId,
              }),
            });
            console.log("Invigilator assignment response", resp.status, await resp.text());
          }
        }
      }

      setSuccess("Exam created successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create exam");
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
    return invigilatorIds
      .map(id => {
        const inv = invigilators.find(i => i._id === id);
        return inv ? inv.name : "";
      })
      .filter(name => name)
      .join(", ");
  };

  // Always recalculate unique students from selectedRooms and studentLists
  const getUniqueStudentCount = () => {
    const allStudentIds = new Set();
    selectedRooms.forEach(sel => {
      sel.studentListIds.forEach(listId => {
        const list = studentLists.find(l => l._id === listId);
        if (list && Array.isArray(list.students)) {
          list.students.forEach(s => {
            if (s.student_id) allStudentIds.add(String(s.student_id));
            else if (s.StudentID) allStudentIds.add(String(s.StudentID));
          });
        } else if (list && typeof list.total_count === 'number' && list.total_count > 0) {
          // If only count is available, add dummy IDs to simulate uniqueness
          for (let i = 0; i < list.total_count; i++) {
            allStudentIds.add(`${listId}_${i}`);
          }
        }
      });
    });
    return allStudentIds.size;
  };
  const getTotalCapacity = () => {
    return selectedRooms.reduce((sum, sel) => {
      const room = availableRooms.find(r => (r._id || r.ID) === sel.roomId);
      return sum + (room ? (room.Capacity || room.capacity || 0) : 0);
    }, 0);
  };
  const uniqueStudentCount = getUniqueStudentCount();
  const totalCapacity = getTotalCapacity();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 1 ? "Create New Exam" : "Add Rooms to Exam"}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
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
                  value={examForm.title}
                  onChange={handleExamFormChange}
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
                  value={examForm.date}
                  onChange={handleExamFormChange}
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
                  value={examForm.duration}
                  onChange={handleExamFormChange}
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
                  value={examForm.faculty}
                  onChange={handleExamFormChange}
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
                  value={examForm.algorithm}
                  onChange={handleExamFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="parallel">Parallel (Column by Column)</option>
                  <option value="simple">Simple Fill (Row-wise, No Constraints)</option>
                  <option value="separated">No Adjacent Same Department</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Parallel: Students arranged by columns | Simple Fill: Row-wise, no constraints | No Adjacent Same Department: Leaves seats empty if only adjacent-department students are available
                </p>
              </div>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Next: Add Rooms
              </button>
            </div>
          </form>
        ) : (
          // Room Selection and Assignment
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Select Rooms
              </h3>
              {/* Room Search Input */}
              <input
                type="text"
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Search by room name or building..."
                value={roomSearch}
                onChange={e => setRoomSearch(e.target.value)}
              />
              {/* Filtered Room List (click to add) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms.length === 0 ? (
                  <div className="col-span-full text-gray-500">No rooms available. Please add rooms in Room Management.</div>
                ) : (
                  availableRooms
                    .filter(room => {
                      // Exclude already selected rooms
                      const isSelected = selectedRooms.some(r => r.roomId === (room._id || room.ID));
                      if (isSelected) return false;
                      // Filter by search
                      const search = roomSearch.toLowerCase();
                      return (
                        (room.Name || room.name || "").toLowerCase().includes(search) ||
                        (room.Building || room.building || "").toLowerCase().includes(search)
                      );
                    })
                    .map(room => (
                      <div
                        key={room._id || room.ID}
                        className="border rounded p-4 flex flex-col gap-2 bg-white hover:bg-blue-50 cursor-pointer transition"
                        onClick={() => {
                          setSelectedRooms([...selectedRooms, { roomId: room._id || room.ID, studentListIds: [], invigilators: [] }]);
                          setRoomSearch("");
                        }}
                      >
                        <span className="font-medium">{room.Name || room.name}</span>
                        <span className="text-xs text-gray-500">{room.Building || room.building}</span>
                        <span className="text-xs text-gray-400">Rows: {room.Rows || room.rows}, Cols: {room.Columns || room.columns}, Cap: {room.Capacity || room.capacity}</span>
                        <span className="text-xs text-blue-600">Click to add</span>
                      </div>
                    ))
                )}
              </div>
            </div>
            {/* Table of selected rooms and assignments */}
            {selectedRooms.length > 0 && (
              <>
                {/* Student Count Card */}
                <div className="mb-4 flex gap-4">
                  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border border-gray-200 min-w-[180px]">
                    <span className="text-gray-700">Total Students</span>
                    <span className="font-bold text-2xl">{uniqueStudentCount}</span>
                    <Users className="text-green-500 mt-1" />
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border border-gray-200 min-w-[180px]">
                    <span className="text-gray-700">Total Capacity</span>
                    <span className="font-bold text-2xl">{totalCapacity}</span>
                    <Building className="text-blue-500 mt-1" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-4">Selected Rooms & Assignments</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invigilators</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRooms.map((sel, index) => {
                        const room = availableRooms.find(r => (r._id || r.ID) === sel.roomId);
                        return (
                          <tr key={sel.roomId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room?.Name || room?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room?.Building || room?.building}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button onClick={() => setStudentListModal({ open: true, roomIndex: index })} className="text-blue-600 hover:text-blue-800">
                                {getStudentListNames(sel.studentListIds)}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button onClick={() => setInvigilatorModal({ open: true, roomIndex: index })} className="text-blue-600 hover:text-blue-800">
                                {getInvigilatorNames(sel.invigilators) || "Add Invigilator(s)"}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button onClick={() => setSelectedRooms(selectedRooms.filter((_, i) => i !== index))} className="text-red-600 hover:text-red-800">Remove</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Capacity error message */}
                {uniqueStudentCount > totalCapacity && (
                  <div className="text-red-500 mt-2">total students exceed total room capacity</div>
                )}
              </>
            )}
            {error && <div className="text-red-500">{error}</div>}
            {success && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400">Back</button>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateSeatingPlan}
                  disabled={loading || selectedRooms.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Seating Plan"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedRooms.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Exam"}
                </button>
              </div>
            </div>
            {/* Modals */}
            <StudentListModal
              open={studentListModal.open}
              onClose={() => setStudentListModal({ open: false, roomIndex: null })}
              studentLists={studentLists || []}
              onSelect={id => handleStudentListSelect(studentListModal.roomIndex, id)}
              selected={selectedRooms[studentListModal.roomIndex]?.studentListIds || []}
            />
            <InvigilatorModal
              open={invigilatorModal.open}
              onClose={() => setInvigilatorModal({ open: false, roomIndex: null })}
              invigilators={invigilators || []}
              onSelect={id => handleInvigilatorSelect(invigilatorModal.roomIndex, id)}
              selected={selectedRooms[invigilatorModal.roomIndex]?.invigilators || []}
              assignedInvigilators={selectedRooms.flatMap((room, idx) => idx !== invigilatorModal.roomIndex ? (room.invigilators || []) : [])}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNewExamModal;
