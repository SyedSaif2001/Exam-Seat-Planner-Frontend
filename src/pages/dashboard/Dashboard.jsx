import React, { useEffect, useState } from "react";
import { Calendar, Users, LayoutGrid, Clock, UserCircle, Trash2, X } from "lucide-react";
import Container from "../../components/shared/container/Container";
import Modal from "../../components/Modal";
import SeatingPlanVisualizer from "../../components/SeatingPlanVisualizer";

const DashboardPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ exams: 0, students: 0, rooms: 0, upcoming: 0 });
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const [roomStudentMap, setRoomStudentMap] = useState({}); // For modal
  const [roomLoading, setRoomLoading] = useState(false);
  const [exams, setExams] = useState([]); // Add this state to store exams
  const [showMap, setShowMap] = useState({ open: false, plan: null, seating: [], rooms: [] });

  // Get user name from localStorage
  let userName = "Admin";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userName = user.name || user.Name || user.email || "Admin";
  } catch {
    userName = "Admin";
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const examsRes = await fetch("http://localhost:8080/api/seating/exams", { headers: { Authorization: `Bearer ${token}` } });
        const studentsRes = await fetch("http://localhost:8080/api/seating/students", { headers: { Authorization: `Bearer ${token}` } });
        const roomsRes = await fetch("http://localhost:8080/api/seating/rooms", { headers: { Authorization: `Bearer ${token}` } });
        const plansRes = await fetch("http://localhost:8080/api/seating/plans", { headers: { Authorization: `Bearer ${token}` } });
        if (!examsRes.ok || !studentsRes.ok || !roomsRes.ok || !plansRes.ok) throw new Error("Failed to fetch dashboard data");
        const examsData = await examsRes.json();
        setExams(Array.isArray(examsData) ? examsData : []); // Store exams
        const studentsData = await studentsRes.json();
        const roomsData = await roomsRes.json();
        const plansData = await plansRes.json();
        const exams = Array.isArray(examsData) ? examsData : [];
        const students = Array.isArray(studentsData) ? studentsData : [];
        const rooms = Array.isArray(roomsData) ? roomsData : [];
        let plans = Array.isArray(plansData) ? plansData : [];

        // Deduplicate students by student_id
        const uniqueStudentMap = {};
        students.forEach(s => {
          if (s.student_id) uniqueStudentMap[String(s.student_id)] = s;
          else if (s.StudentID) uniqueStudentMap[String(s.StudentID)] = s;
        });
        const uniqueStudents = Object.values(uniqueStudentMap);

        setStats({
          exams: exams.length,
          students: uniqueStudents.length, // Use unique count
          rooms: rooms.length,
          upcoming: exams.filter(e => {
            const date = e.Date || e.date;
            return date && new Date(date).getTime() > new Date().getTime();
          }).length,
        });

        // Sort plans by created_at/CreatedAt descending (newest first)
        plans.sort((a, b) => {
          const dateA = new Date(a.created_at || a.CreatedAt || 0).getTime();
          const dateB = new Date(b.created_at || b.CreatedAt || 0).getTime();
          return dateB - dateA;
        });
        setSeatingPlans(plans.slice(0, 5));

        // Build student map with both student_id and cms_id as keys (force string keys)
        const map = {};
        students.forEach(s => {
          if (s.student_id) map[String(s.student_id)] = s;
          if (s.cms_id) map[String(s.cms_id)] = s;
        });
        setStudentMap(map);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleViewDetail = async (plan) => {
    const token = localStorage.getItem("token");
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) {
      alert("Exam ID not found for this plan.");
      return;
    }
    // Find the exam object for title/date
    const examObj = exams.find(e => (e._id || e.ID) === examId);
    const examTitle = examObj?.title || examObj?.Title || "Exam Title";
    const examDate = examObj?.date || examObj?.Date || null;
    setRoomLoading(true);
    try {
      // Fetch all rooms for this exam (to get all assigned student lists)
      const res = await fetch(`http://localhost:8080/api/seating/exams/${examId}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch exam rooms");
      const examRooms = await res.json();
      // Aggregate all students from all assigned student lists
      let map = {};
      examRooms.forEach(room => {
        (room.student_lists || []).forEach(list => {
          (list.students || []).forEach(s => {
            if (s.student_id) map[String(s.student_id)] = s;
            if (s.cms_id) map[String(s.cms_id)] = s;
            if (!s.department && list.department) s.department = list.department;
            if (!s.batch && list.batch) s.batch = list.batch;
          });
        });
      });
      setStudentMap(map);
      setSelectedPlan(plan);
      setIsOpen({ open: true, examTitle, examDate });
    } catch (err) {
      alert("Failed to load student data for this plan.");
    } finally {
      setRoomLoading(false);
    }
  };

  const handleShowRoomMap = async (plan) => {
    const token = localStorage.getItem("token");
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) {
      alert("Exam ID not found for this plan.");
      return;
    }
    try {
      // Fetch seating plan details (seats per room)
      const res = await fetch(`http://localhost:8080/api/seating/plans/${plan._id || plan.ID || plan.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch seating plan details");
      const planData = await res.json();
      // Fetch room info for this exam
      const roomsRes = await fetch(`http://localhost:8080/api/seating/exams/${examId}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomData = roomsRes.ok ? await roomsRes.json() : [];
      // Build studentMap from all student lists in all rooms, or fallback to all student lists for the exam
      let map = {};
      let foundLists = false;
      (planData.rooms || planData.Rooms || []).forEach(room => {
        if (room.student_lists && room.student_lists.length > 0) {
          foundLists = true;
          room.student_lists.forEach(list => {
            (list.students || []).forEach(s => {
              if (s.student_id) map[String(s.student_id)] = s;
              if (s.cms_id) map[String(s.cms_id)] = s;
              if (!s.department && list.department) s.department = list.department;
              if (!s.batch && list.batch) s.batch = list.batch;
            });
          });
        }
      });
      // Fallback: fetch all student lists for the exam if none found in planData
      if (!foundLists) {
        let listsRes = await fetch(`http://localhost:8080/api/seating/exams/${examId}/student-lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let allLists = [];
        if (listsRes.ok) {
          allLists = await listsRes.json();
        } else if (listsRes.status === 404) {
          // Fallback: fetch all student lists globally
          listsRes = await fetch(`http://localhost:8080/api/seating/student-lists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (listsRes.ok) {
            allLists = await listsRes.json();
          } else {
            console.log('[RoomMap Fallback] global listsRes not ok:', listsRes.status);
          }
        } else {
          console.log('[RoomMap Fallback] listsRes not ok:', listsRes.status);
        }
        console.log('[RoomMap Fallback] allLists:', allLists);
        if (Array.isArray(allLists) && allLists.length > 0) {
          console.log('[RoomMap Fallback] First list:', allLists[0]);
          if (allLists[0].students) {
            console.log('[RoomMap Fallback] First list students:', allLists[0].students.slice(0, 3));
          }
        }
        (allLists || []).forEach(list => {
          (list.students || []).forEach(s => {
            if (s.student_id) map[String(s.student_id)] = s;
            if (s.cms_id) map[String(s.cms_id)] = s;
            if (!s.department && list.department) s.department = list.department;
            if (!s.batch && list.batch) s.batch = list.batch;
          });
        });
      }
      setStudentMap(map);
      setShowMap({ open: true, plan, seating: planData.rooms || planData.Rooms || [], rooms: roomData });
    } catch (err) {
      alert("Failed to load seating plan map.");
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm("Are you sure you want to delete this seating plan?")) return;
    try {
      const token = localStorage.getItem("token");
      const planId = plan._id || plan.ID || plan.id;
      if (!planId) throw new Error("Plan ID not found");
      const res = await fetch(`http://localhost:8080/api/seating/plans/${planId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete seating plan");
      setSeatingPlans((prev) => prev.filter((p) => (p._id || p.ID || p.id) !== planId));
    } catch (err) {
      alert(err.message || "Failed to delete seating plan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Exam Seat Planner</h1>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            {userName}
          </button>
        </div>
        {loading ? (
          <div>Loading dashboard...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Container className="flex items-center justify-between py-12">
            <span>Total Exams</span>
                <span className="font-bold text-lg">{stats.exams}</span>
            <Calendar className="text-blue-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Total Students</span>
                <span className="font-bold text-lg">{stats.students}</span>
            <Users className="text-green-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Available Rooms</span>
                <span className="font-bold text-lg">{stats.rooms}</span>
            <LayoutGrid className="text-purple-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Upcoming Exams</span>
                <span className="font-bold text-lg">{stats.upcoming}</span>
            <Clock className="text-orange-500" />
          </Container>
        </div>
        <Container className="py-10">
          <h2 className="text-xl font-semibold mb-4">Recent Seating Plans</h2>
              {!Array.isArray(seatingPlans) || seatingPlans.length === 0 ? (
                <div>No seating plans found.</div>
              ) : (
                seatingPlans.map((plan, index) => {
                  // Support both plan.rooms and plan.Rooms
                  const rooms = plan.rooms || plan.Rooms || [];
                  // Find exam for this plan
                  const examObj = exams.find(e => (e._id || e.ID)?.toString() === (plan.exam_id || plan.ExamID)?.toString());
                  const examTitle = examObj?.title || examObj?.Title || plan.exam_title || plan.ExamTitle || plan.examId || plan.ExamID || "Exam Title";
                  let examDate = examObj?.date || examObj?.Date;
                  if (examDate) {
                    try {
                      examDate = new Date(examDate).toLocaleDateString(); // Only date
                    } catch {}
                  }
                  const planDate = plan.created_at || plan.CreatedAt;
                  let planDateStr = planDate ? new Date(planDate).toLocaleDateString() : "";
                  return (
                    <div key={index} className="flex justify-between py-4 border-b last:border-b-0 items-center">
                      <div>
                        <h3 className="text-lg font-medium">{examTitle}</h3>
                        <p className="text-gray-500">
                          {examDate && <span>Exam Date: {examDate} | </span>}
                          {planDateStr && <span>Plan Created: {planDateStr}</span>}
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <button onClick={() => handleViewDetail(plan)} className="text-blue-500 hover:underline">
                          View Details
                        </button>
                        <button onClick={() => handleShowRoomMap(plan)} className="text-green-600 hover:underline">
                          Show Room Map
                        </button>
                        <button onClick={() => handleDeletePlan(plan)} className="text-red-500 hover:text-red-700" title="Delete Seating Plan">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
        </Container>
          </>
        )}
      </div>
      {isOpen.open && selectedPlan && (
        <Modal onClose={() => setIsOpen({ open: false })} plan={selectedPlan} studentMap={studentMap} loading={roomLoading} examTitle={isOpen.examTitle} examDate={isOpen.examDate} />
      )}
      {showMap.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowMap({ open: false, plan: null, seating: [], rooms: [] })} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Room Map: {showMap.plan?.exam_title || showMap.plan?.ExamTitle || "Exam"}</h2>
            <SeatingPlanVisualizer roomData={showMap.seating} studentMap={studentMap} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
