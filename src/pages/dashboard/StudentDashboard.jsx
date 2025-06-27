import React from "react";
import Container from "../../components/shared/container/Container";

const mockStudentExams = [
  {
    exam: "Mid-Term Examination",
    date: "2024-04-15",
    time: "09:00 AM",
    seat: "A-12",
    hall: "Room 1",
  },
  {
    exam: "Final-Term Examination",
    date: "2024-06-01",
    time: "10:00 AM",
    seat: "B-7",
    hall: "Room 2",
  },
];

const StudentDashboard = () => {
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
                  <td className="p-2 border">{exam.exam}</td>
                  <td className="p-2 border">{exam.date}</td>
                  <td className="p-2 border">{exam.time}</td>
                  <td className="p-2 border">{exam.seat}</td>
                  <td className="p-2 border">{exam.hall}</td>
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