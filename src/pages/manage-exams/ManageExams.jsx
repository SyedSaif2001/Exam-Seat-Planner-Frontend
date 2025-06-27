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
      name: "Mid-Term Examination",
      date: "2024-04-15 at 09:00",
      students: 120,
      rooms: 4,
    },
    {
      name: "Final-Term Examination",
      date: "2024-04-20 at 10:00",
      students: 80,
      rooms: 3,
    },
  ]);

  const handleDelete = (examName) => {
    const updatedExams = exams.filter((exam) => exam.name !== examName);
    setExams(updatedExams);
  };

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Exam Name" },
    { key: "date", label: "Date & Time" },
    { key: "students", label: "Students" },
    { key: "rooms", label: "Rooms" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <Pencil className="text-blue-500 cursor-pointer" />
          <Trash2
            className="text-red-500 cursor-pointer"
            onClick={() => handleDelete(row.name)}
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
