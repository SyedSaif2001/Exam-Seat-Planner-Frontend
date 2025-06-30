import React from "react";
import Container from "../../components/shared/container/Container";

const mockStudentExams = [
  {
    title: "Mid-Term Examination",
    date: "2024-04-15",
    time: "09:00 AM",
    seat: { row: 1, column: 12 },
    room: { name: "Room 1" },
  },
  {
    title: "Final-Term Examination",
    date: "2024-06-01",
    time: "10:00 AM",
    seat: { row: 2, column: 7 },
    room: { name: "Room 2" },
  },
];

const StudentDashboard = () => {
  // TODO: Integrate with backend API to fetch student exam schedule and seat assignments
  // Example placeholder function:
  // async function fetchStudentSchedule() { /* ... */ }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Exam Schedule & Seat</h1>
        <Container>
          <table className="w-full border mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Exam</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Seat</th>
                <th className="p-2 border">Hall/Room</th>
              </tr>
            </thead>
            <tbody>
              {mockStudentExams.map((exam, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{exam.title}</td>
                  <td className="p-2 border">{exam.date}</td>
                  <td className="p-2 border">{exam.time}</td>
                  <td className="p-2 border">Row {exam.seat.row}, Col {exam.seat.column}</td>
                  <td className="p-2 border">{exam.room.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
      </div>
    </div>
  );
};

export default StudentDashboard; 