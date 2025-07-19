import React, { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  LayoutGrid,
  Clock,
  UserCircle,
  Trash2,
  X,
} from "lucide-react";
import Container from "../../components/shared/container/Container";
import Modal from "../../components/Modal";
import SeatingPlanVisualizer from "../../components/SeatingPlanVisualizer";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardCounts, setDashboardCounts] = useState({
    exams: 0,
    students: 0,
    rooms: 0,
    upcoming: 0,
  });

  const [exams, setExams] = useState([]);
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});

  const [viewModal, setViewModal] = useState({
    isOpen: false,
    plan: null,
    examTitle: "",
    examDate: "",
  });
  const [viewMap, setViewMap] = useState({
    isOpen: false,
    plan: null,
    seating: [],
    rooms: [],
  });

  const [planLoading, setPlanLoading] = useState(false);

  // Get logged-in username from localStorage
  let username = "Admin";
  try {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    username = userData.name || userData.Name || userData.email || "Admin";
  } catch {
    username = "Admin";
  }

  // Load all dashboard data on mount
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      try {
        const [examsRes, studentsRes, roomsRes, plansRes] = await Promise.all([
          fetch("http://localhost:8080/api/seating/exams", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/seating/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/seating/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/seating/plans", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!examsRes.ok || !studentsRes.ok || !roomsRes.ok || !plansRes.ok) {
          throw new Error("Could not load dashboard data.");
        }

        const [examsData, studentsData, roomsData, plansData] = await Promise.all([
          examsRes.json(),
          studentsRes.json(),
          roomsRes.json(),
          plansRes.json(),
        ]);

        setExams(Array.isArray(examsData) ? examsData : []);

        // Deduplicate students by ID
        const uniqueStudents = {};
        studentsData.forEach((student) => {
          const id = student.student_id || student.StudentID;
          if (id) uniqueStudents[id] = student;
        });

        const upcomingExams = (examsData || []).filter((exam) => {
          const date = exam.Date || exam.date;
          return new Date(date).getTime() > Date.now();
        });

        setDashboardCounts({
          exams: examsData.length,
          students: Object.keys(uniqueStudents).length,
          rooms: roomsData.length,
          upcoming: upcomingExams.length,
        });

        // Sort seating plans by created_at descending
        const sortedPlans = [...plansData].sort((a, b) => {
          const aDate = new Date(a.created_at || a.CreatedAt).getTime();
          const bDate = new Date(b.created_at || b.CreatedAt).getTime();
          return bDate - aDate;
        });

        setSeatingPlans(sortedPlans.slice(0, 5));

        // Create students map for quick lookup
        const studentsLookup = {};
        studentsData.forEach((student) => {
          if (student.student_id) studentsLookup[student.student_id] = student;
          if (student.cms_id) studentsLookup[student.cms_id] = student;
        });
        setStudentsMap(studentsLookup);
      } catch (err) {
        setError(err.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Show plan details modal
  const handleViewPlan = async (plan) => {
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) return alert("Exam ID not found.");

    const token = localStorage.getItem("token");
    setPlanLoading(true);

    try {
      const planRes = await fetch(
        `http://localhost:8080/api/seating/plans/${plan._id || plan.ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!planRes.ok) throw new Error("Plan fetch failed");
      const planData = await planRes.json();

      // Build studentMap from student_lists in planData.rooms (like seat map)
      const studentMap = {};
      (planData.rooms || []).forEach(room => {
        (room.student_lists || []).forEach(list => {
          (list.students || []).forEach(s => {
            const studentWithDept = {
              ...s,
              department: s.department || list.department || "",
              batch: s.batch || list.batch || "",
            };
            if (studentWithDept.student_id) studentMap[String(studentWithDept.student_id)] = studentWithDept;
            if (studentWithDept.StudentID) studentMap[String(studentWithDept.StudentID)] = studentWithDept;
            if (studentWithDept.cms_id) studentMap[String(studentWithDept.cms_id)] = studentWithDept;
          });
        });
      });

      const exam = exams.find(
        (e) => (e._id || e.ID) === examId
      );
      setStudentsMap(studentMap);
      setViewModal({
        isOpen: true,
        plan: planData,
        examTitle: exam?.title || exam?.Title || "Exam",
        examDate: exam?.date || exam?.Date || "",
      });
    } catch {
      alert("Could not load plan details.");
    } finally {
      setPlanLoading(false);
    }
  };

  // Show seating plan map view
  const handleShowMap = async (plan) => {
    const examId = plan.exam_id || plan.ExamID;
    if (!examId) return alert("Exam ID not found.");

    const token = localStorage.getItem("token");
    try {
      const planRes = await fetch(
        `http://localhost:8080/api/seating/plans/${plan._id || plan.ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!planRes.ok) throw new Error("Plan fetch failed");
      const planData = await planRes.json();

      const roomsRes = await fetch(
        `http://localhost:8080/api/seating/exams/${examId}/rooms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const roomsData = await roomsRes.json();

      // Build studentMap from student_lists in planData.rooms (like staff dashboard)
      const studentMap = {};
      (planData.rooms || []).forEach(room => {
        (room.student_lists || []).forEach(list => {
          (list.students || []).forEach(s => {
            const studentWithDept = {
              ...s,
              department: s.department || list.department || "",
              batch: s.batch || list.batch || "",
            };
            if (studentWithDept.student_id) studentMap[String(studentWithDept.student_id)] = studentWithDept;
            if (studentWithDept.StudentID) studentMap[String(studentWithDept.StudentID)] = studentWithDept;
            if (studentWithDept.cms_id) studentMap[String(studentWithDept.cms_id)] = studentWithDept;
          });
        });
      });
      setStudentsMap(studentMap);
      setViewMap({
        isOpen: true,
        plan,
        seating: planData.rooms || [],
        rooms: roomsData,
      });
    } catch {
      alert("Could not load seating map.");
    }
  };

  // Delete a seating plan
  const handleDeletePlan = async (plan) => {
    if (!window.confirm("Are you sure to delete this plan?")) return;

    const planId = plan._id || plan.ID;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8080/api/seating/plans/${planId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed.");

      setSeatingPlans((prev) =>
        prev.filter((p) => (p._id || p.ID) !== planId)
      );
    } catch (err) {
      alert(err.message || "Could not delete plan.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Exam Seat Planner</h1>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            {username}
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Container>
                <span>Total Exams</span>
                <span className="font-bold text-lg">{dashboardCounts.exams}</span>
                <Calendar className="text-blue-500" />
              </Container>
              <Container>
                <span>Total Students</span>
                <span className="font-bold text-lg">
                  {dashboardCounts.students}
                </span>
                <Users className="text-green-500" />
              </Container>
              <Container>
                <span>Available Rooms</span>
                <span className="font-bold text-lg">{dashboardCounts.rooms}</span>
                <LayoutGrid className="text-purple-500" />
              </Container>
              <Container>
                <span>Upcoming Exams</span>
                <span className="font-bold text-lg">
                  {dashboardCounts.upcoming}
                </span>
                <Clock className="text-orange-500" />
              </Container>
            </div>

            <Container className="py-10">
              <h2 className="text-xl font-semibold mb-4">Recent Seating Plans</h2>
              {seatingPlans.length === 0 ? (
                <p>No seating plans found.</p>
              ) : (
                seatingPlans.map((plan, idx) => {
                  const exam = exams.find(
                    (e) => (e._id || e.ID)?.toString() === (plan.exam_id || plan.ExamID)?.toString()
                  );
                  const examTitle =
                    exam?.title || exam?.Title || plan.exam_title || "Exam";
                  const examDate = exam?.date || exam?.Date || "";
                  const createdAt = plan.created_at || plan.CreatedAt;

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-4 border-b"
                    >
                      <div>
                        <h3 className="font-medium">{examTitle}</h3>
                        <p className="text-gray-500">
                          {examDate && `Exam: ${new Date(examDate).toLocaleDateString()} | `}
                          {createdAt && `Created: ${new Date(createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleViewPlan(plan)}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleShowMap(plan)}
                          className="text-green-600 hover:underline"
                        >
                          Show Room Map
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="text-red-600"
                        >
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

      {viewModal.isOpen && viewModal.plan && (
        <Modal
          onClose={() =>
            setViewModal({ isOpen: false, plan: null, examTitle: "", examDate: "" })
          }
          plan={viewModal.plan}
          studentMap={studentsMap}
          loading={planLoading}
          examTitle={viewModal.examTitle}
          examDate={viewModal.examDate}
        />
      )}

      {viewMap.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative">
            <button
              onClick={() =>
                setViewMap({ isOpen: false, plan: null, seating: [], rooms: [] })
              }
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              Room Map: {viewMap.plan?.exam_title || "Exam"}
            </h2>
            <SeatingPlanVisualizer
              roomData={viewMap.seating}
              studentMap={studentsMap}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
  