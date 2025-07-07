import React, { useEffect } from 'react';

const Modal = ({ onClose, plan, studentMap, loading, examTitle, examDate }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Reset on modal close
    };
  }, []);

  // Robust normalization for rooms array
  const rooms = Array.isArray(plan?.rooms)
    ? plan.rooms
    : Array.isArray(plan?.Rooms)
      ? plan.Rooms
      : [];

  // If no plan, show nothing
  if (!plan) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
          <div className="text-center py-8">Loading student details...</div>
        </div>
      </div>
    );
  }

  // Helper to get student details
  const getStudentDetails = (student_id) => {
    if (!student_id) return null;
    const key = String(student_id);
    const student = studentMap[key] || null;
    return student;
  };

  // Build a map of invigilator IDs to names if available
  // Try to extract invigilator names from the room objects if present
  const invigilatorNameMap = {};
  rooms.forEach(room => {
    if (Array.isArray(room.invigilators) && Array.isArray(room.invigilatorDetails)) {
      room.invigilators.forEach((id, idx) => {
        const inv = room.invigilatorDetails[idx];
        if (inv && inv.name) invigilatorNameMap[id] = inv.name;
      });
    }
  });

  // Helper to get invigilator names (if available)
  const getInvigilatorNames = (invigilatorIds = []) => {
    if (!Array.isArray(invigilatorIds) || invigilatorIds.length === 0) return "-";
    return invigilatorIds.map(id => invigilatorNameMap[id] || id).join(", ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-center mb-2">{examTitle || 'Exam Title'}</h2>
        <p className="text-sm text-center text-gray-600 mb-4">
          {examDate ? new Date(examDate).toLocaleString('en-US', { timeZone: 'UTC' }) : ''}
        </p>

        <div className="mt-6 space-y-10">
          {rooms.length === 0 ? (
            <div className="text-center text-gray-500">No rooms found in this plan.</div>
          ) : (
            rooms.map((room, idx) => {
              // Support both camelCase and PascalCase
              const seats = room.seats || room.Seats || [];
              return (
                <div key={room.room_id || room.RoomID || idx} className="mb-8 border rounded-lg p-4 shadow-sm">
                  <h3 className="text-xl font-bold mb-1">Room: {room.name || room.Name}</h3>
                  <div className="text-gray-600 mb-2">
                    Building: {room.building || room.Building} | Capacity: {room.capacity || room.Capacity} | Rows: {room.rows || room.Rows} | Columns: {room.columns || room.Columns}
                  </div>
                  <div className="text-gray-600 mb-2">
                    Invigilators: {getInvigilatorNames(room.invigilators || room.Invigilators)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-300 rounded-md">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-2 border">Seat Number</th>
                          <th className="px-4 py-2 border">Student Name</th>
                          <th className="px-4 py-2 border">CMS ID</th>
                          <th className="px-4 py-2 border">Department</th>
                          <th className="px-4 py-2 border">Batch</th>
                          <th className="px-4 py-2 border">Row</th>
                          <th className="px-4 py-2 border">Column</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seats.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-4">No seat assignments found.</td></tr>
                        ) : (
                          seats.filter(
                            seat => (seat.IsEmpty === false || seat.is_empty === false || seat.StudentID || seat.student_id)
                          ).map((seat, i) => {
                            const student = getStudentDetails(seat.StudentID ?? seat.student_id);
                            return (
                              <tr key={i} className="border-t">
                                <td className="px-4 py-2 border">{i + 1}</td>
                                <td className="px-4 py-2 border">{student?.name || '-'}</td>
                                <td className="px-4 py-2 border">{student?.student_id || '-'}</td>
                                <td className="px-4 py-2 border">{student?.department || '-'}</td>
                                <td className="px-4 py-2 border">{student?.batch || '-'}</td>
                                <td className="px-4 py-2 border">{seat.Row ?? seat.row}</td>
                                <td className="px-4 py-2 border">{seat.Column ?? seat.column}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
