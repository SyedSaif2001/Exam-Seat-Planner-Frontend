import React, { useState, useEffect } from "react";
import { UserCircle, X } from "lucide-react";
import Container from "../../components/shared/container/Container";
import Modal from "../../components/Modal";
import SeatingPlanVisualizer from "../../components/SeatingPlanVisualizer";

const StaffDashboard = () => {
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingDuties, setLoadingDuties] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [dutiesError, setDutiesError] = useState("");
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [invigilatorDuties, setInvigilatorDuties] = useState([]);
  const [exams, setExams] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [profile, setProfile] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, plan: null, examTitle: "", examDate: null });
  const [roomMap, setRoomMap] = useState({ open: false, plan: null, seating: [], rooms: [] });

  const [loadingRoom, setLoadingRoom] = useState(false);

  // Get staff name from localStorage
  let userName = "Staff";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userName = user.name || user.Name || user.email || "Staff";
  } catch {
    userName = "Staff";
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingPlans(true);
      setLoadingDuties(true);
      setPlansError("");
      setDutiesError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found.");

        const profileRes = await fetch("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const profileData = await profileRes.json();
        setProfile(profileData);

        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (profileData._id) user._id = profileData._id;
          localStorage.setItem("user", JSON.stringify(user));
        } catch {}

        const plansRes = await fetch("http://localhost:8080/api/seating/plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!plansRes.ok) throw new Error("Seating plans fetch failed");
        const allPlans = await plansRes.json();

        const relevantPlans = (allPlans || []).filter(plan =>
          plan.faculty === profileData.faculty || plan.department === profileData.department
        );
        relevantPlans.sort((a, b) => {
          const dateA = new Date(a.created_at || a.CreatedAt || a.date || a.Date || 0).getTime();
          const dateB = new Date(b.created_at || b.CreatedAt || b.date || b.Date || 0).getTime();
          return dateB - dateA;
        });

        setSeatingPlans(relevantPlans.slice(0, 5));
        setLoadingPlans(false);

        const examsRes = await fetch("http://localhost:8080/api/seating/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let allExams = [];
        if (examsRes.ok) {
          allExams = await examsRes.json();
          setExams(Array.isArray(allExams) ? allExams : []);
        }

        let duties = [];
        let staffId = undefined;
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          staffId = user._id || user.id;
        } catch {}

        allPlans.forEach(plan => {
          const rooms = plan.rooms || plan.Rooms || [];
          rooms.forEach(room => {
            if (Array.isArray(room.invigilators) && staffId && room.invigilators.includes(staffId)) {
              const planExamId = plan.exam_id || plan.ExamID;
              let examObj = allExams.find(e => (e._id || e.ID)?.toString() === planExamId?.toString());
              if (!examObj) {
                examObj = allExams.find(e => Object.values(e).map(v => v?.toString()).includes(planExamId?.toString()));
              }

              const examTitle = examObj?.title || examObj?.Title || plan.exam_title || plan.ExamTitle || plan.examId || plan.ExamID || "Exam Title";
              let examDate = examObj?.date || examObj?.Date;
              if (examDate) {
                try {
                  const d = new Date(examDate);
                  if (!isNaN(d.getTime())) {
                    examDate = d.toLocaleString();
                  } else {
                    examDate = examDate.toString();
                  }
                } catch {
                  examDate = examDate.toString();
                }
              }

              duties.push({
                exam_title: examTitle,
                room_name: room.name || room.room_name || room.RoomName || room.Room || "Room",
                exam_date: examDate || "",
              });
            }
          });
        });

        const sortedDuties = [...duties].sort((a, b) => {
          const getTime = (obj) => {
            if (obj.exam_date) {
              try {
                const d = new Date(obj.exam_date);
                if (!isNaN(d.getTime())) {
                  return d.getTime();
                }
              } catch {}
            }
            return 0;
          };
          return getTime(b) - getTime(a);
        });

        setInvigilatorDuties(sortedDuties);
        setLoadingDuties(false);

      } catch (err) {
        setPlansError(err.message);
        setDutiesError(err.message);
        setLoadingPlans(false);
        setLoadingDuties(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewDetails = async (plan) => {
    const token = localStorage.getItem("token");
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) {
      alert("No exam ID found.");
      return;
    }

    const exam = exams.find(e => (e._id || e.ID) === examId);
    const examTitle = exam?.title || exam?.Title || "Exam";
    const examDate = exam?.date || exam?.Date || null;

    setLoadingRoom(true);

    try {
      const res = await fetch(`http://localhost:8080/api/seating/exams/${examId}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load exam rooms");

      const rooms = await res.json();
      const map = {};

      rooms.forEach(room => {
        (room.student_lists || []).forEach(list => {
          (list.students || []).forEach(s => {
            const studentWithDept = {
              ...s,
              department: s.department || list.department || "",
              batch: s.batch || list.batch || "",
            };
            if (studentWithDept.student_id) map[String(studentWithDept.student_id)] = studentWithDept;
            if (studentWithDept.StudentID) map[String(studentWithDept.StudentID)] = studentWithDept;
            if (studentWithDept.cms_id) map[String(studentWithDept.cms_id)] = studentWithDept;
          });
        });
      });
      setStudentMap(map);
      setViewModal({ open: true, plan, examTitle, examDate });
    } catch {
      alert("Failed to load plan details.");
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleShowMap = async (plan) => {
    const token = localStorage.getItem("token");
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) {
      alert("No exam ID found.");
      return;
    }

    try {
      const planRes = await fetch(`http://localhost:8080/api/seating/plans/${plan._id || plan.ID}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!planRes.ok) throw new Error("Plan fetch failed");
      const planData = await planRes.json();

      const roomRes = await fetch(`http://localhost:8080/api/seating/exams/${examId}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roomData = roomRes.ok ? await roomRes.json() : [];

      // Build studentMap directly from planData.rooms (like admin dashboard)
      const map = {};
      (planData.rooms || []).forEach(room => {
        (room.student_lists || []).forEach(list => {
          (list.students || []).forEach(s => {
            const studentWithDept = {
              ...s,
              department: s.department || list.department || "",
              batch: s.batch || list.batch || "",
            };
            if (studentWithDept.student_id) map[String(studentWithDept.student_id)] = studentWithDept;
            if (studentWithDept.StudentID) map[String(studentWithDept.StudentID)] = studentWithDept;
            if (studentWithDept.cms_id) map[String(studentWithDept.cms_id)] = studentWithDept;
          });
        });
      });
      // Debug log
      console.log('[DEBUG] Built studentMap:', map);
      console.log('[DEBUG] planData.rooms:', planData.rooms);
      console.log('[DEBUG] roomData:', roomData);
      setStudentMap(map);
      setTimeout(() => {
        setRoomMap({ open: true, plan, seating: planData.rooms || [], rooms: roomData });
      }, 0);

    } catch {
      alert("Failed to load map.");
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

        {loadingPlans ? (
          <div>Loading plans...</div>
        ) : plansError ? (
          <div className="text-red-500">{plansError}</div>
        ) : (
          <>
            <Container className="py-10">
              <h2 className="text-xl font-semibold mb-4">Recent Seating Plans</h2>
              {!Array.isArray(seatingPlans) || seatingPlans.length === 0 ? (
                <div>No seating plans found.</div>
              ) : exams.length === 0 ? (
                <div>Loading exam details...</div>
              ) : (
                seatingPlans.map((plan, index) => {
                  const planExamId = plan.exam_id || plan.ExamID;
                  let examObj = exams.find(e => (e._id || e.ID)?.toString() === planExamId?.toString());
                  if (!examObj) {
                    examObj = exams.find(e => Object.values(e).map(v => v?.toString()).includes(planExamId?.toString()));
                  }

                  const examTitle = examObj?.title || examObj?.Title || plan.exam_title || plan.ExamTitle || "Exam Title";
                  let examDate = examObj?.date || examObj?.Date;
                  if (examDate) {
                    try {
                      const d = new Date(examDate);
                      if (!isNaN(d.getTime())) {
                        examDate = d.toLocaleString();
                      } else {
                        examDate = examDate.toString();
                      }
                    } catch {
                      examDate = examDate.toString();
                    }
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
                        <button onClick={() => handleViewDetails(plan)} className="text-blue-500 hover:underline">
                          View Details
                        </button>
                        <button onClick={() => handleShowMap(plan)} className="text-green-600 hover:underline">
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
              {loadingDuties ? (
                <div>Loading duties...</div>
              ) : dutiesError ? (
                <div className="text-red-500">{dutiesError}</div>
              ) : exams.length === 0 ? (
                <div>Loading exam details...</div>
              ) : invigilatorDuties.length === 0 ? (
                <div>No invigilator duties assigned.</div>
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
                    {invigilatorDuties.map((duty, i) => (
                      <tr key={i}>
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

      {viewModal.open && (
        <Modal
          onClose={() => setViewModal({ open: false })}
          plan={viewModal.plan}
          studentMap={studentMap}
          loading={loadingRoom}
          examTitle={viewModal.examTitle}
          examDate={viewModal.examDate}
        />
      )}

      {roomMap.open && Object.keys(studentMap).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setRoomMap({ open: false, plan: null, seating: [], rooms: [] })}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              Room Map: {roomMap.plan?.exam_title || "Exam"}
            </h2>
            <SeatingPlanVisualizer roomData={roomMap.seating} studentMap={studentMap} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
