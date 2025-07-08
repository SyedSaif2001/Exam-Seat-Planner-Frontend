import React, { useState, useEffect } from "react";
import { UserCircle, X } from "lucide-react";
import Container from "../../components/shared/container/Container";
import Modal from "../../components/Modal";
import SeatingPlanVisualizer from "../../components/SeatingPlanVisualizer";

const StaffDashboard = () => {
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const [roomLoading, setRoomLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [isOpen, setIsOpen] = useState({ open: false, examTitle: "", examDate: null });
  const [showMap, setShowMap] = useState({ open: false, plan: null, seating: [], rooms: [] });
  const [invigilatorDuties, setInvigilatorDuties] = useState([]);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [dutiesError, setDutiesError] = useState("");
  const [profile, setProfile] = useState(null);

  // Get user name from localStorage
  let userName = "Staff";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userName = user.name || user.Name || user.email || "Staff";
  } catch {
    userName = "Staff";
  }

  useEffect(() => {
    const fetchProfileAndPlans = async () => {
      setPlansLoading(true);
      setDutiesLoading(true);
      setPlansError("");
      setDutiesError("");
      try {
        const token = localStorage.getItem("token");
        // 1. Fetch staff profile
        const profileRes = await fetch("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
        // 2. Fetch all seating plans
        const plansRes = await fetch("http://localhost:8080/api/seating/plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!plansRes.ok) throw new Error("Failed to fetch seating plans");
        const allPlans = await plansRes.json();
        if (!Array.isArray(allPlans)) {
          setPlansError("Unexpected response from server.");
          setPlansLoading(false);
          setDutiesLoading(false);
          return;
        }
        // Filter plans for staff's faculty/department
        const relevantPlans = allPlans.filter(
          plan => plan.faculty === profileData.faculty || plan.department === profileData.department
        );
        // Sort by created_at/CreatedAt descending
        relevantPlans.sort((a, b) => {
          const dateA = new Date(a.created_at || a.CreatedAt || 0).getTime();
          const dateB = new Date(b.created_at || b.CreatedAt || 0).getTime();
          return dateB - dateA;
        });
        setSeatingPlans(relevantPlans.slice(0, 5));
        setPlansLoading(false);
        // 3. Filter invigilator duties (where staff is invigilator)
        const duties = allPlans.filter(
          plan => plan.invigilator_email === profileData.email
        );
        setInvigilatorDuties(duties);
        setDutiesLoading(false);
        // 4. Fetch all exams for plan details
        const examsRes = await fetch("http://localhost:8080/api/seating/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(Array.isArray(examsData) ? examsData : []);
        }
      } catch (err) {
        setPlansError(err.message || "Failed to fetch seating plans");
        setDutiesError(err.message || "Failed to fetch invigilator duties");
        setPlansLoading(false);
        setDutiesLoading(false);
      }
    };
    fetchProfileAndPlans();
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            {userName}
          </button>
        </div>
        {plansLoading ? (
          <div>Loading dashboard...</div>
        ) : plansError ? (
          <div className="text-red-500">{plansError}</div>
        ) : (
          <>
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
                      </div>
                    </div>
                  );
                })
              )}
        </Container>
        <Container>
          <h2 className="text-xl font-semibold mb-4">Invigilator Duties</h2>
          {dutiesLoading ? (
            <div>Loading invigilator duties...</div>
          ) : dutiesError ? (
            <div className="text-red-500">{dutiesError}</div>
          ) : invigilatorDuties.length === 0 ? (
            <div>No invigilator duties to display.</div>
          ) : (
            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Exam</th>
                  <th className="p-2 border">Room</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {invigilatorDuties.map((duty, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{duty.exam_title || duty.examId}</td>
                    <td className="p-2 border">{duty.room_name || duty.roomId}</td>
                    <td className="p-2 border">{duty.exam_date || duty.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default StaffDashboard; 