import { useEffect, useState } from "react";

// Helper to calculate number of seats
const getSeatCount = (rows, cols) => {
  const r = parseInt(rows, 10);
  const c = parseInt(cols, 10);
  if (isNaN(r) || isNaN(c)) return 0;
  return r * c;
};

// Modal for uploading student list
const StudentListModal = ({ open, onClose, onFileChange }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4">Upload Student List</h3>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} />
        <p className="text-xs text-gray-500 mt-2">Accepted: CSV, Excel</p>
      </div>
    </div>
  );
};

// Modal for selecting invigilator
const InvigilatorModal = ({ open, onClose, invigilators, onSelect, selected }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4">Select Invigilator</h3>
        <select
          className="w-full border rounded px-3 py-2"
          value={selected || ""}
          onChange={e => onSelect(e.target.value)}
        >
          <option value="">Select Invigilator</option>
          {invigilators.map((inv, idx) => (
            <option key={idx} value={inv}>{inv}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const AddNewExamModal = ({ setIsModalOpen }) => {
  const [rooms, setRooms] = useState([]);
  const [roomInput, setRoomInput] = useState({ name: "", rows: "", cols: "" });
  const [studentModal, setStudentModal] = useState({ open: false, idx: null });
  const [invigilatorModal, setInvigilatorModal] = useState({ open: false, idx: null });
  const [studentFiles, setStudentFiles] = useState({}); // { idx: file }
  const [roomInvigilators, setRoomInvigilators] = useState({}); // { idx: invigilator }
  // Placeholder invigilators (simulate DB fetch)
  const [invigilators] = useState(["Dr. Ali", "Prof. Sara", "Mr. John", "Ms. Fatima"]);
  const [examData, setExamData] = useState({
    title: "",
    date: "",
    duration: "",
    faculty: "",
    department: "",
    course: "",
    batch: "",
    total_students: ""
  });
  const [algorithm, setAlgorithm] = useState("matrix");

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleAddRoom = () => {
    if (!roomInput.name || !roomInput.rows || !roomInput.cols) return;
    setRooms([...rooms, { ...roomInput }]);
    setRoomInput({ name: "", rows: "", cols: "" });
  };

  const handleRemoveRoom = idx => {
    setRooms(rooms.filter((_, i) => i !== idx));
    setStudentFiles(prev => { const copy = { ...prev }; delete copy[idx]; return copy; });
    setRoomInvigilators(prev => { const copy = { ...prev }; delete copy[idx]; return copy; });
  };

  const handleStudentFileChange = (idx, e) => {
    setStudentFiles({ ...studentFiles, [idx]: e.target.files[0] });
    setStudentModal({ open: false, idx: null });
  };

  const handleInvigilatorSelect = (idx, invigilator) => {
    setRoomInvigilators({ ...roomInvigilators, [idx]: invigilator });
    setInvigilatorModal({ open: false, idx: null });
  };

  const handleExamInputChange = (field, value) => {
    setExamData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-h-fit max-w-4xl relative">
        <button
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Exam</h2>
        {/* Add Room Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Add Room & Layout</h3>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Room Name"
              className="border border-gray-300 rounded px-3 py-2"
              value={roomInput.name}
              onChange={e => setRoomInput({ ...roomInput, name: e.target.value })}
            />
            <input
              placeholder="Rows"
              type="number"
              min={1}
              className="border border-gray-300 rounded px-3 py-2 w-20"
              value={roomInput.rows}
              onChange={e => setRoomInput({ ...roomInput, rows: e.target.value })}
            />
            <input
              placeholder="Cols"
              type="number"
              min={1}
              className="border border-gray-300 rounded px-3 py-2 w-20"
              value={roomInput.cols}
              onChange={e => setRoomInput({ ...roomInput, cols: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleAddRoom}
            >Add Room</button>
          </div>
        </div>
        {/* Rooms Table */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Rooms</h3>
          <table className="w-full border mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Room Name</th>
                <th className="p-2 border">Layout</th>
                <th className="p-2 border"># Seats</th>
                <th className="p-2 border">Student List</th>
                <th className="p-2 border">Add Invigilator</th>
                <th className="p-2 border">Remove</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{room.name}</td>
                  <td className="p-2 border">{room.rows} x {room.cols}</td>
                  <td className="p-2 border">{getSeatCount(room.rows, room.cols)}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => setStudentModal({ open: true, idx })}
                    >{studentFiles[idx] ? studentFiles[idx].name : "Upload"}</button>
                  </td>
                  <td className="p-2 border">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => setInvigilatorModal({ open: true, idx })}
                    >{roomInvigilators[idx] ? roomInvigilators[idx] : "Add"}</button>
                  </td>
                  <td className="p-2 border">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleRemoveRoom(idx)}
                    >Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Exam Details Section */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Exam Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Exam Title"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.title}
              onChange={e => handleExamInputChange("title", e.target.value)}
            />
            <input
              placeholder="Date & Time"
              type="datetime-local"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.date}
              onChange={e => handleExamInputChange("date", e.target.value)}
            />
            <input
              placeholder="Duration (minutes)"
              type="number"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.duration}
              onChange={e => handleExamInputChange("duration", e.target.value)}
            />
            <input
              placeholder="Faculty"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.faculty}
              onChange={e => handleExamInputChange("faculty", e.target.value)}
            />
            <input
              placeholder="Department"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.department}
              onChange={e => handleExamInputChange("department", e.target.value)}
            />
            <input
              placeholder="Course"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.course}
              onChange={e => handleExamInputChange("course", e.target.value)}
            />
            <input
              placeholder="Batch"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.batch}
              onChange={e => handleExamInputChange("batch", e.target.value)}
            />
            <input
              placeholder="Total Students"
              type="number"
              className="border border-gray-300 rounded px-3 py-2"
              value={examData.total_students}
              onChange={e => handleExamInputChange("total_students", e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block font-medium mb-1">Seating Algorithm</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
            >
              <option value="matrix">Matrix (Diagonal by group)</option>
              <option value="parallel">Parallel (Column by group)</option>
              <option value="random">Random</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-8 justify-end">
          <button
            onClick={handleCloseModal}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >Cancel</button>
        </div>
        {/* Student List Modal */}
        <StudentListModal
          open={studentModal.open}
          onClose={() => setStudentModal({ open: false, idx: null })}
          onFileChange={e => handleStudentFileChange(studentModal.idx, e)}
        />
        {/* Invigilator Modal */}
        <InvigilatorModal
          open={invigilatorModal.open}
          onClose={() => setInvigilatorModal({ open: false, idx: null })}
          invigilators={invigilators}
          selected={roomInvigilators[invigilatorModal.idx]}
          onSelect={inv => handleInvigilatorSelect(invigilatorModal.idx, inv)}
        />
      </div>
    </div>
  );
};

export default AddNewExamModal;
