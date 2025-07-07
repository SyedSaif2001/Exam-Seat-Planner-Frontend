import React, { useState, useEffect } from "react";
import Container from "../../components/shared/container/Container";
// import Papa from 'papaparse'; // Uncomment if using PapaParse for CSV
import { UserCircle } from "lucide-react";

const StaffDashboard = () => {
  // State for student list upload
  const [studentFile, setStudentFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // State for seating plans and invigilator duties
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [invigilatorDuties, setInvigilatorDuties] = useState([]);

  const [plansLoading, setPlansLoading] = useState(false);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
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

  // Parse CSV/Excel file client-side
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setStudentFile(file);
    setParsedStudents([]);
    setUploadError("");
    setUploadSuccess(false);
    if (!file) return;
    // TODO: Use PapaParse or SheetJS to parse file and setParsedStudents([...])
    // Example for CSV:
    // Papa.parse(file, {
    //   header: true,
    //   complete: (results) => {
    //     setParsedStudents(results.data.filter(row => row.cms_id && row.name && row.email));
    //   },
    //   error: (err) => setUploadError("Failed to parse file: " + err.message)
    // });
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const token = localStorage.getItem("token");
      for (const student of parsedStudents) {
        const res = await fetch("http://localhost:8080/api/seating/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(student),
        });
        if (!res.ok) throw new Error("Failed to upload student: " + student.cms_id);
      }
      setUploading(false);
      setUploadSuccess(true);
      alert("Student list uploaded successfully!");
    } catch (err) {
      setUploadError(err.message || "Failed to upload student list");
      setUploading(false);
    }
  };

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
        // Filter plans for staff's faculty/department
        const relevantPlans = allPlans.filter(
          plan => plan.faculty === profileData.faculty || plan.department === profileData.department
        );
        setSeatingPlans(relevantPlans);
        setPlansLoading(false);
        // 3. Filter invigilator duties (where staff is invigilator)
        const duties = allPlans.filter(
          plan => plan.invigilator_email === profileData.email
        );
        setInvigilatorDuties(duties);
        setDutiesLoading(false);
      } catch (err) {
        setPlansError(err.message || "Failed to fetch seating plans");
        setDutiesError(err.message || "Failed to fetch invigilator duties");
        setPlansLoading(false);
        setDutiesLoading(false);
      }
    };
    fetchProfileAndPlans();
  }, []);

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
        <Container className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Student List</h2>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
          {parsedStudents.length > 0 && (
            <>
              <table className="w-full border mt-4 mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">CMS ID</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Department</th>
                    <th className="p-2 border">Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{student.cms_id}</td>
                      <td className="p-2 border">{student.name}</td>
                      <td className="p-2 border">{student.email}</td>
                      <td className="p-2 border">{student.department}</td>
                      <td className="p-2 border">{student.batch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload to Database"}
              </button>
            </>
          )}
          {uploadSuccess && <div className="text-green-600 mt-2">Upload successful!</div>}
          {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
        </Container>
        <Container className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Seating Plans</h2>
          {plansLoading ? (
            <div>Loading seating plans...</div>
          ) : plansError ? (
            <div className="text-red-500">{plansError}</div>
          ) : seatingPlans.length === 0 ? (
            <div>No seating plans to display.</div>
          ) : (
            <table className="w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Exam</th>
                  <th className="p-2 border">Room</th>
                  <th className="p-2 border">Algorithm</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {seatingPlans.map((plan, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{plan.exam_title || plan.examId}</td>
                    <td className="p-2 border">{plan.room_name || plan.roomId}</td>
                    <td className="p-2 border">{plan.algorithm}</td>
                    <td className="p-2 border">{plan.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </div>
  );
};

export default StaffDashboard; 