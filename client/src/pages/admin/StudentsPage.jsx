import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiDownload,
} from 'react-icons/fi';
import { exportToCsv } from '../../utils/exportCsv';

const initialForm = {
  studentId: '',
  name: '',
  email: '',
  phone: '',
  course: 'B.Tech Information Technology',
  semester: 4,
  division: 'A',
  rollNumber: '',
  password: 'Student@123',
};

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [semesterFilter, divisionFilter]);

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      if (res.data?.data) {
        setPrograms(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load programs for student creation:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (semesterFilter) params.semester = semesterFilter;
      if (divisionFilter) params.division = divisionFilter;

      const res = await api.get('/students', { params });
      setStudents(res.data.data);
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      course: student.course,
      semester: student.semester,
      division: student.division,
      rollNumber: student.rollNumber,
      password: '', // leave empty unless changing
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (student) => {
    setCurrentStudent(student);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (student) => {
    setCurrentStudent(student);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/students', formData);
      success('Student added successfully!');
      setIsAddOpen(false);
      fetchStudents();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't overwrite if empty
      await api.put(`/students/${currentStudent._id}`, payload);
      success('Student updated successfully!');
      setIsEditOpen(false);
      fetchStudents();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete(`/students/${currentStudent._id}`);
      success(res.data.message || 'Student deleted successfully!');
      setIsDeleteOpen(false);
      fetchStudents();
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (!students || students.length === 0) {
      error('No student records available to export');
      return;
    }
    const today = new Date().toISOString().substring(0, 10);
    const columns = [
      { label: 'Roll No', accessor: (s) => s.rollNumber || '' },
      { label: 'Student ID', key: 'studentId' },
      { label: 'Student Name', key: 'name' },
      { label: 'Course / Program', key: 'course' },
      { label: 'Semester', key: 'semester' },
      { label: 'Division', key: 'division' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', accessor: (s) => s.phone || 'N/A' },
    ];
    exportToCsv(columns, students, `student-directory-${today}.csv`);
    success(`Exported ${students.length} student records to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain student profiles, enrollment, semester allotments, and academic credentials
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FiDownload className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by student name, ID, roll no, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All Divisions</option>
              {['A', 'B', 'C', 'D'].map((d) => (
                <option key={d} value={d}>Division {d}</option>
              ))}
            </select>

            <button
              onClick={fetchStudents}
              title="Refresh list"
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 transition"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Roll No</th>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Course & Sem</th>
                <th className="px-6 py-3.5">Division</th>
                <th className="px-6 py-3.5">Contact Email</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      #{student.rollNumber}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {student.name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {student.course} • Sem {student.semester}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                        Div {student.division}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenView(student)}
                          title="View details"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          title="Edit student"
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(student)}
                          title="Delete student"
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Student">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. STU1021"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 21"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arjun Mehta"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. arjun.stu@attendance.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Division *</label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {['A', 'B', 'C', 'D'].map((d) => (
                  <option key={d} value={d}>Div {d}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Program *</label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            >
              {programs.length > 0 ? (
                programs.map((prog) => (
                  <option key={prog._id || prog.code} value={prog.name}>
                    {prog.name} ({prog.code})
                  </option>
                ))
              ) : (
                <>
                  <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                  <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                  <option value="B.Sc. Information Technology">B.Sc. Information Technology</option>
                  <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                </>
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID *</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Division *</label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              >
                {['A', 'B', 'C', 'D'].map((d) => (
                  <option key={d} value={d}>Div {d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Program *</label>
            <select
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            >
              {programs.length > 0 ? (
                <>
                  {!programs.some((p) => p.name === formData.course) && formData.course && (
                    <option value={formData.course}>{formData.course}</option>
                  )}
                  {programs.map((prog) => (
                    <option key={prog._id || prog.code} value={prog.name}>
                      {prog.name} ({prog.code})
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value={formData.course}>{formData.course}</option>
                  <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                  <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                  <option value="B.Sc. Information Technology">B.Sc. Information Technology</option>
                  <option value="B.Sc. Computer Science">B.Sc. Computer Science</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reset Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Student Profile Details">
        {currentStudent && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-xl">
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentStudent.name}</h3>
                <p className="text-xs font-mono text-indigo-600 font-semibold">{currentStudent.studentId}</p>
                <p className="text-xs text-slate-500">Roll No #{currentStudent.rollNumber} • Semester {currentStudent.semester} (Div {currentStudent.division})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500">Email Address</span>
                <p className="font-medium text-slate-800 mt-1 break-all">{currentStudent.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500">Phone Number</span>
                <p className="font-medium text-slate-800 mt-1">{currentStudent.phone || 'Not provided'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 col-span-2">
                <span className="font-semibold text-slate-500">Course / Branch</span>
                <p className="font-medium text-slate-800 mt-1">{currentStudent.course}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Student Deletion">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete student{' '}
            <strong className="text-slate-900">{currentStudent?.name}</strong> ({currentStudent?.studentId})?
          </p>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <strong>Important:</strong> Deleting this student will also safely remove all their associated attendance history records.
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteSubmit}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsPage;
