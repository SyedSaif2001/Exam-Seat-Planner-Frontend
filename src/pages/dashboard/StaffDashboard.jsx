import React, { useState } from "react";
import Container from "../../components/shared/container/Container";

const StaffDashboard = () => {
  // State for student list upload
  const [studentFile, setStudentFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [uploadError, setUploadError] = useState("");

  // State for seating plans and invigilator duties
  const [seatingPlans, setSeatingPlans] = useState([]); // TODO: Fetch from backend
  const [invigilatorDuties, setInvigilatorDuties] = useState([]); // TODO: Fetch from backend

  // Parse CSV/Excel file client-side (placeholder logic)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setStudentFile(file);
    // TODO: Parse file and setParsedStudents([...])
    // Use a library like PapaParse for CSV or SheetJS for Excel
    setParsedStudents([
      { cms_id: "FA20-BCS-001", name: "Ali", email: "ali@email.com", department: "CS", batch: "2020" },
      { cms_id: "FA20-BCS-002", name: "Sara", email: "sara@email.com", department: "CS", batch: "2020" }
    ]);
  };

  const handleUpload = () => {
    // TODO: Send parsedStudents to backend
    // Example: await uploadStudentList(parsedStudents)
    alert("Student list uploaded! (API integration pending)");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpload}>
                Upload to Database
              </button>
            </>
          )}
          {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
        </Container>
        <Container className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Seating Plans</h2>
          {/* TODO: Fetch and display seating plans relevant to staff */}
          <div>No seating plans to display (API integration pending).</div>
        </Container>
        <Container>
          <h2 className="text-xl font-semibold mb-4">Invigilator Duties</h2>
          {/* TODO: Fetch and display invigilator duties */}
          <div>No invigilator duties to display (API integration pending).</div>
        </Container>
      </div>
    </div>
  );
};

export default StaffDashboard; 