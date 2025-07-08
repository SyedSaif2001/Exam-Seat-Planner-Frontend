import React, { useEffect, useState } from "react";
import { Plus, Trash2, Users, X, CheckCircle, Pencil, Eye } from "lucide-react";

const EditStudentListModal = ({ open, onClose, list, onSave, loading, error }) => {
  const [form, setForm] = useState({ ...list });
  useEffect(() => { setForm({ ...list }); }, [list]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"><X /></button>
        <h2 className="text-xl font-semibold mb-4">{list && list._id ? "Edit Student List" : "Add Student List"}</h2>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.department || ""} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch *</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.batch || ""} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Faculty *</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.faculty || ""} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))} required />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">{loading ? "Saving..." : list && list._id ? "Update List" : "Add List"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// StudentListModal for managing students in a list
const StudentListModal = ({ open, onClose, list, token }) => {
  const [students, setStudents] = useState(list?.students || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addForm, setAddForm] = useState({ student_id: "", name: "" });
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({ student_id: "", name: "" });

  useEffect(() => {
    setStudents(list?.students || []);
  }, [list]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8080/api/seating/student-lists/${list._id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error("Failed to add student");
      setStudents([...students, { ...addForm }]);
      setAddForm({ student_id: "", name: "" });
    } catch (err) {
      setError(err.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditForm(students[idx]);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8080/api/seating/student-lists/${list._id}/students/${students[editIdx].student_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        let msg = "Failed to update student";
        try {
          const data = await res.json();
          if (data && data.error && data.error.toLowerCase().includes("student_id already exists")) {
            msg = "A student with this Student ID already exists in this list.";
          } else if (data && data.error) {
            msg = data.error;
          }
        } catch {}
        throw new Error(msg);
      }
      const updated = [...students];
      updated[editIdx] = { ...editForm };
      setStudents(updated);
      setEditIdx(null);
    } catch (err) {
      setError(err.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student_id) => {
    if (!window.confirm("Delete this student?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8080/api/seating/student-lists/${list._id}/students/${student_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete student");
      // Re-fetch the updated list from the backend
      const updatedListRes = await fetch(`http://localhost:8080/api/seating/student-lists/${list._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updatedListRes.ok) {
        const updatedList = await updatedListRes.json();
        setStudents(updatedList.students || []);
      } else {
        // fallback: remove from local state
        setStudents(students.filter(s => s.student_id !== student_id));
      }
    } catch (err) {
      setError(err.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"><X /></button>
        <h2 className="text-xl font-semibold mb-4">Manage Students in {list.name}</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input className="border px-2 py-1 rounded" placeholder="Student ID" value={addForm.student_id} onChange={e => setAddForm(f => ({ ...f, student_id: e.target.value }))} required />
          <input className="border px-2 py-1 rounded" placeholder="Name" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>Add</button>
        </form>
        <div className="overflow-x-auto" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((s, idx) => (
                <tr key={s.student_id}>
                  <td className="px-4 py-2">{editIdx === idx ? <input className="border px-2 py-1 rounded" value={editForm.student_id} onChange={e => setEditForm(f => ({ ...f, student_id: e.target.value }))} /> : s.student_id}</td>
                  <td className="px-4 py-2">{editIdx === idx ? <input className="border px-2 py-1 rounded" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /> : s.name}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {editIdx === idx ? (
                      <>
                        <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleEditSave} disabled={loading}>Save</button>
                        <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditIdx(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(idx)} title="Edit"><Pencil size={16} /></button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(s.student_id)} title="Delete"><Trash2 size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-gray-500">No students in this list.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const ManageStudentLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editList, setEditList] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [studentModal, setStudentModal] = useState({ open: false, list: null });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/seating/student-lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch student lists");
      const data = await res.json();
      const user = getCurrentUser();
      const isStaff = user.role === "staff";
      // Debug logs
      console.log("[DEBUG] user:", user);
      console.log("[DEBUG] fetched lists:", data);
      console.log("[DEBUG] uploaded_by values:", (Array.isArray(data) ? data : []).map(l => l.uploaded_by));
      if (isStaff) {
        const filtered = (Array.isArray(data) ? data : []).filter(list => list.uploaded_by === user.email || list.uploaded_by === user._id);
        console.log("[DEBUG] filtered lists for staff:", filtered);
        setLists(filtered);
      } else {
        setLists(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || "Failed to load student lists");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (list = null) => {
    setEditList(list);
    setModalError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditList(null);
    setModalError("");
  };

  const handleSaveEdit = async (form) => {
    setModalLoading(true);
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      const user = getCurrentUser();
      const id = form._id || form.ID;
      let res;
      if (id) {
        // Update
        res = await fetch(`http://localhost:8080/api/seating/student-lists/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to update student list");
        setLists(lists => lists.map(l => (l._id || l.ID) === id ? { ...l, ...form } : l));
        setSuccess("Student list updated successfully");
      } else {
        // Add
        if (user.role === "staff") {
          form.uploaded_by = user.email || user._id;
        }
        res = await fetch("http://localhost:8080/api/seating/student-lists", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to add student list");
        const newList = await res.json();
        setLists(lists => [...lists, newList]);
        setSuccess("Student list added successfully");
      }
      setModalOpen(false);
      setEditList(null);
    } catch (err) {
      setModalError(err.message || "Failed to save student list");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student list?")) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/seating/student-lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete student list");
      setLists(lists => lists.filter(l => (l._id || l.ID) !== id));
      setSuccess("Student list deleted successfully");
    } catch (err) {
      setError(err.message || "Failed to delete student list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users /> Student List Management</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-md mb-4"><CheckCircle className="w-5 h-5 text-green-400 mr-2" /> <span className="text-green-700">{success}</span></div>}
      {loading ? (
        <div>Loading student lists...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lists.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4">No student lists found.</td></tr>
              ) : (
                lists.map((list, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{list.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{list.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{list.batch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{list.faculty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Array.isArray(list.students) ? list.students.length : 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => handleOpenModal(list)} title="Edit"><Pencil size={16} /></button>
                      <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(list._id || list.ID)} title="Delete"><Trash2 size={16} /></button>
                      <button className="text-sky-600 hover:text-sky-800" onClick={() => setStudentModal({ open: true, list })} title="View Students"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <EditStudentListModal open={modalOpen} onClose={handleCloseModal} list={editList || {}} onSave={handleSaveEdit} loading={modalLoading} error={modalError} />
      <StudentListModal open={studentModal.open} onClose={() => setStudentModal({ open: false, list: null })} list={studentModal.list} token={token} />
    </div>
  );
};

export default ManageStudentLists; 