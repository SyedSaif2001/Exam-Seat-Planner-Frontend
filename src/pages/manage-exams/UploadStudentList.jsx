import React, { useState } from "react";
import { Upload, FileText, Users, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

const UploadStudentList = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    department: "",
    batch: "",
    faculty: "",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setSuccess("");

    // Parse Excel file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Assume first row is header: [student_id, name]
        const students = [];
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (row && row[0] && row[1]) {
            students.push({
              student_id: row[0].toString().trim(),
              name: row[1].toString().trim(),
            });
          }
        }
        setPreview(students);
      } catch (err) {
        setError("Error parsing file. Please ensure it's a valid Excel file with columns: Student ID, Name.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || preview.length === 0) {
      setError("Please select a file and ensure it contains valid data.");
      return;
    }

    if (!formData.department || !formData.batch || !formData.faculty) {
      setError("Please fill in all required fields.");
      return;
    }

    // Check for unique student_id in preview
    const seen = new Set();
    for (let s of preview) {
      if (seen.has(s.student_id)) {
        setError(`Duplicate Student ID found: ${s.student_id}. Each student must have a unique Student ID.`);
        return;
      }
      seen.add(s.student_id);
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Attach department, batch, and faculty to each student
      const studentsWithDeptBatch = preview.map(s => ({
        ...s,
        department: formData.department,
        batch: formData.batch,
        faculty: formData.faculty,
      }));

      const requestData = {
        department: formData.department,
        batch: formData.batch,
        faculty: formData.faculty,
        students: studentsWithDeptBatch,
        uploaded_by: user.id || "unknown",
      };

      const response = await fetch("http://localhost:8080/api/seating/student-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload student list");
      }

      const result = await response.json();
      setSuccess(`Successfully uploaded ${preview.length} students for ${formData.department}/${formData.batch}`);
      setFile(null);
      setPreview([]);
      setFormData({
        department: "",
        batch: "",
        faculty: "",
      });
    } catch (err) {
      setError(err.message || "Failed to upload student list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-start mb-4">
        <h1 className="text-3xl font-bold">Upload Student List</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Student List</h2>
          <p className="text-gray-600 mb-4">
            Upload an Excel file (.xlsx, .xls) containing student information. The file should have the following columns: <b>Student ID, Name</b>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : "Click to select an Excel file (.xlsx, .xls)"}
                </span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch *
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                placeholder="e.g., 2022, 2023"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty *
              </label>
              <input
                type="text"
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                placeholder="e.g., Faculty of Computing"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                List Name (auto-generated)
              </label>
              <div className="p-2 bg-gray-100 rounded">
                {formData.department && formData.batch
                  ? `${formData.department}/${formData.batch}`
                  : "Enter Department and Batch"}
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Preview ({preview.length} students)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(0, 5).map((student, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.student_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                        </tr>
                      ))}
                      {preview.length > 5 && (
                        <tr>
                          <td colSpan="2" className="px-6 py-4 text-sm text-gray-500 text-center">
                            ... and {preview.length - 5} more students
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file || preview.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Student List
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadStudentList; 