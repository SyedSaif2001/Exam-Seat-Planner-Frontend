import React, { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Table from "../../components/shared/table/Table";
import AddNewExamModal from "./AddNewExamModal";

const ManageExams = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenButton = () => {
    setIsModalOpen(true);
  };

  const [exams, setExams] = useState([
    {
      title: "Mid-Term Examination",
      date: "2024-04-15T09:00:00Z",
      total_students: 120,
      rooms: 4,
      department: "CS",
      course: "CS101",
      batch: "2021",
      faculty: "Science",
      duration: 120
    },
    {
      title: "Final-Term Examination",
      date: "2024-04-20T10:00:00Z",
      total_students: 80,
      rooms: 3,
      department: "CS",
      course: "CS102",
      batch: "2021",
      faculty: "Science",
      duration: 180
    },
  ]);

  const handleDelete = (examTitle) => {
    const updatedExams = exams.filter((exam) => exam.title !== examTitle);
    setExams(updatedExams);
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Exam Title" },
    { key: "date", label: "Date & Time" },
    { key: "total_students", label: "Total Students" },
    { key: "rooms", label: "Rooms" },
    { key: "department", label: "Department" },
    { key: "course", label: "Course" },
    { key: "batch", label: "Batch" },
    { key: "faculty", label: "Faculty" },
    { key: "duration", label: "Duration (min)" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <Pencil className="text-blue-500 cursor-pointer" />
          <Trash2
            className="text-red-500 cursor-pointer"
            onClick={() => handleDelete(row.title)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-start mb-4">
          <h1 className="text-3xl font-bold">Manage Exams</h1>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search exams..."
            className="w-1/2 p-2 mb-4 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={handleOpenButton}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Exam
          </button>
        </div>
        <Table columns={columns} data={filteredExams} />
      </div>
      {isModalOpen && <AddNewExamModal setIsModalOpen={setIsModalOpen} />}
    </>
  );
};

export default ManageExams;
