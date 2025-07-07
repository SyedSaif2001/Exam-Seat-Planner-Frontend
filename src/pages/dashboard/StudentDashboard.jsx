import React, { useEffect, useState } from "react";
import Container from "../../components/shared/container/Container";
import { UserCircle } from "lucide-react";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentExams, setStudentExams] = useState([]);

  useEffect(() => {
    const fetchStudentSchedule = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Fetch student profile to get _id
        const profileRes = await fetch("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profile = await profileRes.json();

        // Fetch all seating plans
        const plansRes = await fetch("http://localhost:8080/api/seating/my-plans", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!plansRes.ok) throw new Error("Failed to fetch plans");
        let allPlans = await plansRes.json();
        if (!Array.isArray(allPlans)) allPlans = [];

        // Filter plans where the student is assigned a seat
        const myExams = [];
        for (const plan of allPlans) {
          if (plan.seats && Array.isArray(plan.seats)) {
            const mySeat = plan.seats.find(
              seat => seat.student_id === profile._id // or adjust as needed
            );
            if (mySeat) {
              myExams.push({
                title: plan.exam_title || plan.examId,
                date: plan.exam_date || plan.date,
                time: plan.exam_time || "",
                seat: mySeat,
                room: plan.room_name || plan.roomId,
              });
            }
          }
        }
        setStudentExams(myExams);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch exam schedule");
        setLoading(false);
      }
    };
    fetchStudentSchedule();
  }, []);

  // Get user name from localStorage
  let userName = "Student";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userName = user.name || user.Name || user.email || "Student";
  } catch {
    userName = "Student";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Exam Schedule & Seat</h1>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            {userName}
          </button>
        </div>
        <Container>
          {loading ? (
            <div>Loading exam schedule...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : studentExams.length === 0 ? (
            <div>No exams or seat assignments found.</div>
          ) : (
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
                {studentExams.map((exam, idx) => (
                <tr key={idx}>
                    <td className="p-2 border">{exam.title}</td>
                  <td className="p-2 border">{exam.date}</td>
                  <td className="p-2 border">{exam.time}</td>
                    <td className="p-2 border">Row {exam.seat.row}, Col {exam.seat.column}</td>
                    <td className="p-2 border">{exam.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </Container>
      </div>
    </div>
  );
};

export default StudentDashboard; 