import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiPlus,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
} from 'react-icons/fi';

const HodStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    course: 'B.Sc. IT',
    semester: 4,
    division: 'A',
    rollNumber: '',
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [semesterFilter, divisionFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (semesterFilter) params.semester = semesterFilter;
      if (divisionFilter) params.division = divisionFilter;
      if (search) params.search = search;

      const res = await api.get('/hod/students', { params });
      setStudents(res.data.data || []);
      setDepartmentName(res.data.department || 'Department');
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

  const handleExportCsv = () => {
    const today = new Date().toISOString().substring(0, 10);
    const columns = [
      { label: 'Roll Number', key: 'rollNumber' },
      { label: 'Student ID', key: 'studentId' },
      { label: 'Name', key: 'name' },
      { label: 'Semester', key: 'semester' },
      { label: 'Division', key: 'division' },
      { label: 'Program / Course', key: 'course' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
    ];
    exportToCsv(columns, filteredStudents, `hod-${departmentName.toLowerCase().replace(/\s+/g, '-')}-students-${today}.csv`);
  };

  const handleOpenAdd = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      phone: '',
      course: 'B.Sc. IT',
      semester: 4,
      division: 'A',
      rollNumber: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (stu) => {
    setSelectedStudent(stu);
    setFormData({
      studentId: stu.studentId,
      name: stu.name,
      email: stu.email,
      phone: stu.phone || '',
      course: stu.course || 'B.Sc. IT',
      semester: stu.semester || 1,
      division: stu.division || 'A',
      rollNumber: stu.rollNumber || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (isEditOpen && selectedStudent) {
        await api.put(`/students/${selectedStudent._id}`, formData);
        success('Student updated successfully');
        setIsEditOpen(false);
      } else {
        await api.post('/students', formData);
        success('Student added successfully to department');
        setIsAddOpen(false);
      }
      fetchStudents();
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  const filteredStudents = students.filter((stu) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      stu.name?.toLowerCase().includes(q) ||
      stu.studentId?.toLowerCase().includes(q) ||
      stu.rollNumber?.toString().includes(q) ||
      stu.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {departmentName} — Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise enrolled students, semester divisions, academic records, and contact details
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <FiDownload className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:w-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, ID, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Divisions</option>
            {['A', 'B', 'C', 'D'].map((d) => (
              <option key={d} value={d}>
                Division {d}
              </option>
            ))}
          </select>

          <div className="text-xs font-semibold text-slate-500 pl-2">
            Total: <span className="text-slate-900 font-bold">{filteredStudents.length}</span>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Roll</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Program / Degree</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Division</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
                    Loading department student directory...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{stu.rollNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{stu.name}</p>
                      <p className="text-[11px] text-indigo-600 font-mono mt-0.5">{stu.studentId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{stu.course}</td>
                    <td className="py-3.5 px-4 font-medium">Semester {stu.semester}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        Div {stu.division}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <FiMail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{stu.email}</span>
                      </div>
                      {stu.phone && (
                        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                          <FiPhone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{stu.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(stu)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        title="Edit Student"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddOpen || isEditOpen) && (
        <Modal
          title={isEditOpen ? 'Edit Student Details' : 'Register Department Student'}
          onClose={() => {
            setIsAddOpen(false);
            setIsEditOpen(false);
          }}
        >
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU1021"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                  disabled={isEditOpen}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Roll Number *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 21"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Student full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@attendance.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
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
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Program *</label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="B.Sc. IT">B.Sc. IT</option>
                  <option value="B.Sc. CS">B.Sc. CS</option>
                  <option value="B.Sc. DS">B.Sc. DS</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Sc. IT">M.Sc. IT</option>
                  <option value="M.Sc. CS">M.Sc. CS</option>
                  <option value="M.Sc. DS">M.Sc. DS</option>
                  <option value="M.Tech">M.Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Division *</label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
                >
                  {['A', 'B', 'C', 'D'].map((d) => (
                    <option key={d} value={d}>
                      Division {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                {isEditOpen ? 'Save Changes' : 'Register Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default HodStudentsPage;
