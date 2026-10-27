import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiLayers,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiGrid,
  FiInfo,
} from 'react-icons/fi';

const ProgramsPage = () => {
  const [activeTab, setActiveTab] = useState('programs'); // 'programs' | 'departments'
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals for Programs
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({
    name: '',
    code: '',
    department: 'Information Technology',
    totalSemesters: 6,
    divisions: ['A', 'B', 'C', 'D'],
    academicYears: ['2026-2027', '2025-2026'],
    description: '',
    status: 'Active',
  });

  // Modal for Department
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progRes, deptRes] = await Promise.all([
        api.get('/programs'),
        api.get('/programs/departments/all'),
      ]);
      setPrograms(progRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      error(getErrorMessage(err, 'Failed to fetch programs and departments'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      name: '',
      code: '',
      department: departments[0]?.name || 'Information Technology',
      totalSemesters: 6,
      divisions: ['A', 'B', 'C', 'D'],
      academicYears: ['2026-2027', '2025-2026'],
      description: '',
      status: 'Active',
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog) => {
    setEditingProgram(prog);
    setProgramForm({
      name: prog.name,
      code: prog.code,
      department: prog.department,
      totalSemesters: prog.totalSemesters,
      divisions: prog.divisions || ['A', 'B', 'C', 'D'],
      academicYears: prog.academicYears || ['2026-2027'],
      description: prog.description || '',
      status: prog.status || 'Active',
    });
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        await api.put(`/programs/${editingProgram._id}`, programForm);
        success('College program updated successfully');
      } else {
        await api.post('/programs', programForm);
        success('New college program created successfully');
      }
      setIsProgramModalOpen(false);
      fetchData();
    } catch (err) {
      error(getErrorMessage(err, 'Failed to save program'));
    }
  };

  const handleDeleteProgram = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete program "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/programs/${id}`);
      success('Program deleted successfully');
      fetchData();
    } catch (err) {
      error(getErrorMessage(err, 'Failed to delete program'));
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/programs/departments', deptForm);
      success('Department created successfully');
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      error(getErrorMessage(err, 'Failed to create department'));
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'programs') {
      const exportData = filteredPrograms.map((p) => ({
        'Program Code': p.code,
        'Program Name': p.name,
        Department: p.department,
        'Total Semesters': p.totalSemesters,
        Divisions: (p.divisions || []).join(', '),
        'Academic Years': (p.academicYears || []).join(', '),
        Status: p.status,
      }));
      exportToCsv(exportData, `College_Programs_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const exportData = departments.map((d) => ({
        'Dept Code': d.code,
        'Dept Name': d.name,
        HOD: d.hod?.name || 'Not Appointed',
        Programs: d.programCount,
        Subjects: d.subjectCount,
        Students: d.studentCount,
      }));
      exportToCsv(exportData, `College_Departments_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || p.department === deptFilter;
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            College Programs &amp; Departments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure college degree programs, divisions (A&ndash;D), semesters, academic years, and faculties.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          {activeTab === 'programs' ? (
            <button
              onClick={handleOpenAddProgram}
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Program</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('programs')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'programs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FiLayers className="h-4 w-4" />
          <span>College Programs ({programs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FiGrid className="h-4 w-4" />
          <span>Academic Departments ({departments.length})</span>
        </button>
      </div>

      {/* 1. PROGRAMS TAB */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search program name or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Programs Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FiLayers className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No Programs Found</h3>
                <p className="text-sm mt-1 text-slate-500">
                  Try clearing your search filters or click "Add Program" above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Program</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5 text-center">Duration</th>
                      <th className="px-6 py-3.5">Divisions Supported</th>
                      <th className="px-6 py-3.5">Academic Years</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPrograms.map((prog) => (
                      <tr key={prog._id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{prog.name}</div>
                          <div className="text-xs text-indigo-600 font-mono mt-0.5">
                            Code: {prog.code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                            {prog.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-700">
                          {prog.totalSemesters} Semesters
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(prog.divisions || ['A', 'B', 'C', 'D']).map((div) => (
                              <span
                                key={div}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs"
                              >
                                {div}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(prog.academicYears || ['2026-2027']).map((yr) => (
                              <span
                                key={yr}
                                className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono"
                              >
                                {yr}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              prog.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {prog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditProgram(prog)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                              title="Edit Program"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProgram(prog._id, prog.name)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Delete Program"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-mono font-bold text-indigo-700 text-sm">
                    {dept.code}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Active Dept
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{dept.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {dept.description || 'College academic department'}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Head of Department:</span>{' '}
                  {dept.hod?.name ? (
                    <strong className="text-indigo-600">{dept.hod.name}</strong>
                  ) : (
                    <span className="text-slate-400 italic">Not Assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Programs</span>
                  <p className="text-base font-bold text-slate-800">{dept.programCount || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Subjects</span>
                  <p className="text-base font-bold text-slate-800">{dept.subjectCount || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Students</span>
                  <p className="text-base font-bold text-slate-800">{dept.studentCount || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Create/Edit Modal */}
      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        title={editingProgram ? 'Edit College Program' : 'Create New College Program'}
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Program Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. B.Sc. IT or M.Sc. Data Science"
              value={programForm.name}
              onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Program Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BSCIT or MSCIT"
                value={programForm.code}
                onChange={(e) => setProgramForm({ ...programForm, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={programForm.department}
                onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Semesters
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={programForm.totalSemesters}
                onChange={(e) => setProgramForm({ ...programForm, totalSemesters: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={programForm.status}
                onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Divisions Supported
            </label>
            <div className="flex items-center space-x-4">
              {['A', 'B', 'C', 'D'].map((div) => {
                const isChecked = (programForm.divisions || []).includes(div);
                return (
                  <label key={div} className="flex items-center space-x-1.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const current = programForm.divisions || [];
                        if (e.target.checked) {
                          setProgramForm({ ...programForm, divisions: [...current, div].sort() });
                        } else {
                          setProgramForm({
                            ...programForm,
                            divisions: current.filter((x) => x !== div),
                          });
                        }
                      }}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Division {div}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Program overview and degree guidelines..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {editingProgram ? 'Save Changes' : 'Create Program'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Department Create Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Add New Academic Department"
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence &amp; Robotics"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AIR or AI"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Department faculties and academic jurisdiction..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgramsPage;
