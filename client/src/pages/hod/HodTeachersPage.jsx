import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportToCsv } from '../../utils/exportCsv';
import {
  FiUserCheck,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiDownload,
  FiShield,
  FiSearch,
} from 'react-icons/fi';

const HodTeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { error } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hod/teachers');
      setTeachers(res.data.data || []);
      setDepartmentName(res.data.department || 'Department');
    } catch (err) {
      error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const today = new Date().toISOString().substring(0, 10);
    const columns = [
      { label: 'Faculty Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
      { label: 'Department', key: 'department' },
      { label: 'Assigned Courses Count', accessor: (t) => t.assignedSubjects?.length || 0 },
      { label: 'Assigned Subjects', accessor: (t) => t.assignedSubjects?.map((s) => s.subjectCode).join(', ') || 'None' },
    ];
    exportToCsv(columns, filteredTeachers, `hod-${departmentName.toLowerCase().replace(/\s+/g, '-')}-faculty-${today}.csv`);
  };

  const filteredTeachers = teachers.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.assignedSubjects?.some((s) => s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {departmentName} — Faculty Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department teaching staff, instructional assignments, and course responsibilities
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <FiDownload className="h-4 w-4 text-slate-500" />
          <span>Export Faculty CSV</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search faculty by name, email, or subject code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Faculty Count: <span className="text-slate-900 font-bold">{filteredTeachers.length}</span>
        </span>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
            Loading department faculty members...
          </div>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base">
                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{teacher.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 mt-0.5">
                        <FiShield className="mr-1 h-3 w-3" />
                        Teaching Faculty
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <FiMail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center space-x-2">
                      <FiPhone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Courses list */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Assigned Subjects</span>
                    <span className="font-semibold text-indigo-600">{teacher.assignedSubjects?.length || 0}</span>
                  </p>
                  {teacher.assignedSubjects && teacher.assignedSubjects.length > 0 ? (
                    <div className="space-y-1.5">
                      {teacher.assignedSubjects.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs border border-slate-100"
                        >
                          <span className="font-semibold text-slate-800">
                            <span className="font-mono text-indigo-600 mr-1">{sub.subjectCode}</span>
                            {sub.subjectName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">Sem {sub.semester}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No assigned subjects currently.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{departmentName}</span>
                <span className="text-emerald-600 font-medium">● Active Staff</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No faculty members found in this department.
          </div>
        )}
      </div>
    </div>
  );
};

export default HodTeachersPage;
