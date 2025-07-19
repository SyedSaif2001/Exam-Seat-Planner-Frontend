import React, { useEffect, useState } from "react";
import Container from "../../components/shared/container/Container";
import { UserCircle } from "lucide-react";
import { useCallback } from "react";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentExams, setStudentExams] = useState([]);
  const [exams, setExams] = useState([]);

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
        if (!profileRes.ok) throw   new Error("Failed to fetch profile");
        const profile = await profileRes.json();

        // Fetch all seating plans
        const plansRes = await fetch("http://localhost:8080/api/seating/my-plans", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!plansRes.ok) throw new Error("Failed to fetch plans");
        let allPlans = await plansRes.json();
        if (!Array.isArray(allPlans)) allPlans = [];

        // Fetch all exams for title/date/time
        const examsRes = await fetch("http://localhost:8080/api/seating/exams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        let allExams = [];
        if (examsRes.ok) {
          allExams = await examsRes.json();
        }
        setExams(Array.isArray(allExams) ? allExams : []);
        // Log all exam IDs and objects
        console.log("[DEBUG] Exams fetched:", allExams);
        if (Array.isArray(allExams)) {
          allExams.forEach(e => {
            console.log("[DEBUG] Exam candidate:", JSON.stringify(e));
          });
        }

        // Filter plans where the student is assigned a seat
        const myExams = [];
        const cmsId = profile.cms_id || profile.cmsID || profile.CMSID;
        const mongoId = profile._id;
        // Build a studentMap for the student's seats, assigning department and batch from the list if missing
        const studentMap = {};
        for (const plan of allPlans) {
          const rooms = plan.rooms || plan.Rooms || [];
          for (const room of rooms) {
            (room.student_lists || []).forEach(list => {
              (list.students || []).forEach(s => {
                const studentWithDept = {
                  ...s,
                  department: s.department || list.department || "",
                  batch: s.batch || list.batch || "",
                };
                if (studentWithDept.student_id) studentMap[String(studentWithDept.student_id)] = studentWithDept;
                if (studentWithDept.cms_id) studentMap[String(studentWithDept.cms_id)] = studentWithDept;
              });
            });
          }
        }
        for (const plan of allPlans) {
          const rooms = plan.rooms || plan.Rooms || [];
          for (const room of rooms) {
            const seats = room.seats || room.Seats || [];
            const mySeat = seats.find(
              seat => String(seat.student_id || seat.StudentID) === String(cmsId) || String(seat.student_id || seat.StudentID) === String(mongoId)
            );
            if (mySeat) {
              // Find exam details by matching any field
              const planExamId = plan.exam_id || plan.ExamID;
              let examObj = allExams.find(e => (e._id || e.ID)?.toString() === (planExamId?.toString()));
              if (!examObj) {
                // Try matching any field value
                examObj = allExams.find(e => Object.values(e).map(v => v?.toString()).includes(planExamId?.toString()));
              }
              console.log("[DEBUG] Matching exam for plan", planExamId, examObj);
              let rawDate = examObj?.date || examObj?.Date || plan.exam_date || plan.date;
              let displayDate = "(No date found)";
              let displayTime = "(No time found)";
              if (rawDate) {
                try {
                  const d = new Date(rawDate);
                  if (!isNaN(d.getTime())) {
                    // Format as UTC, but show as AM/PM without 'UTC'
                    displayDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
                    let hours = d.getUTCHours();
                    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    displayTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                  } else {
                    displayDate = rawDate;
                  }
                } catch {
                  displayDate = rawDate;
                }
              }
              myExams.push({
                title: examObj?.title || examObj?.Title || plan.exam_title || plan.examId || "(No exam title found)",
                date: displayDate,
                time: displayTime,
                seat: mySeat,
                room: room.name || room.room_name || room.RoomName || room.Room || plan.room_name || plan.roomId,
                examDebug: { planExamId, examObj, allExamIds: allExams.map(e => e._id || e.ID || JSON.stringify(e)) }
              });
            }
          }
        }
        setStudentExams(myExams);
        setLoading(false);
        // Optionally, if you use SeatingPlanVisualizer for students, pass studentMap as prop
        // setStudentMap(studentMap);
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

  // Group seat assignments by exam title/date/time
  // Sort by date descending (newest first)
  const sortedStudentExams = [...studentExams].sort((a, b) => {
    const dateA = new Date(a.date || a.Date || a.created_at || a.CreatedAt || 0).getTime();
    const dateB = new Date(b.date || b.Date || b.created_at || b.CreatedAt || 0).getTime();
    return dateB - dateA;
  });
  const grouped = {};
  for (const exam of sortedStudentExams) {
    const key = `${exam.title}__${exam.date}__${exam.time}`;
    if (!grouped[key]) grouped[key] = { ...exam, seats: [] };
    grouped[key].seats.push({ seat: exam.seat, room: exam.room });
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
          ) : Object.keys(grouped).length === 0 ? (
            <div>No exams or seat assignments found.</div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Exams & Seats</h2>
              <div className="divide-y divide-gray-200">
                {Object.values(grouped).map((exam, idx) => (
                  <div key={idx} className="flex justify-between items-center py-6">
                    <div>
                      <div className="text-lg font-bold mb-1">{exam.title}</div>
                      <div className="text-gray-500 text-sm mb-1">
                        {exam.date && !exam.date.startsWith("(No") ? `Exam Date: ${exam.date}` : "No date found"}
                        {exam.time && !exam.time.startsWith("(No") ? ` | Time: ${exam.time}` : ""}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {exam.seats.length === 1 ? (
                          <span>Seat: Row {exam.seats[0].seat.row || exam.seats[0].seat.Row}, Col {exam.seats[0].seat.column || exam.seats[0].seat.Column} | Room: {exam.seats[0].room}</span>
                        ) : (
                          <span>Seats: {exam.seats.map(s => `Row ${s.seat.row || s.seat.Row}, Col ${s.seat.column || s.seat.Column} (Room: ${s.room})`).join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default StudentDashboard; 