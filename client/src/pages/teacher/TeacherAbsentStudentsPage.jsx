import React, { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../services/api';
import {
  FiUserX,
  FiCalendar,
  FiAlertTriangle,
  FiPrinter,
  FiPhone,
  FiMail,
  FiBookOpen,
  FiCheckCircle,
} from 'react-icons/fi';

const TeacherAbsentStudentsPage = () => {
  const [activeTab, setActiveTab] = useState('date'); // 'date' or 'chronic'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [absentRecords, setAbsentRecords] = useState([]);
  const [chronicStudents, setChronicStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedSubjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'date') {
      fetchDateAbsentees();
    } else {
      fetchChronicAbsentees();
    }
  }, [activeTab, selectedDate, selectedSubject]);

  const fetchAssignedSubjects = async () => {
    try {
      const res = await api.get('/teacher/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDateAbsentees = async () => {
    setLoading(true);
    try {
      const params = {
        mode: 'date',
        date: selectedDate,
      };
      if (selectedSubject) params.subject = selectedSubject;

      const res = await api.get('/teacher/absent-students', { params });
      setAbsentRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChronicAbsentees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/absent-students', {
        params: { mode: 'chronic' },
      });
      setChronicStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Absentee Monitoring & Shortage Defaulters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily class absentees, parent communication details, and students with chronic attendance shortages
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900 transition self-start sm:self-auto"
        >
          <FiPrinter className="h-4 w-4" />
          <span>Print Absentee Report</span>
        </button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('date')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'date'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiUserX className="h-4 w-4" />
            <span>Daily Absentees by Date</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chronic')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'chronic'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiAlertTriangle className="h-4 w-4" />
            <span>Chronic Shortage Defaulters (&lt;75%)</span>
          </button>
        </div>

        {activeTab === 'date' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
            />

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="">All My Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-4 border-b border-slate-300 pb-2">
        <h2 className="text-lg font-bold text-slate-900">
          Faculty Absentee Report — {activeTab === 'date' ? `Date: ${selectedDate}` : 'Chronic Defaulter List (<75%)'}
        </h2>
        <p className="text-xs text-slate-600">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* View 1: Date-wise Absent Students */}
      {activeTab === 'date' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Students Absent on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {absentRecords.length} Students Absent
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Missed Subject</th>
                  <th className="px-6 py-3.5">Contact Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Absence Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Loading absentee records...
                    </td>
                  </tr>
                ) : absentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-emerald-600">
                      <FiCheckCircle className="h-8 w-8 mx-auto mb-1 text-emerald-500" />
                      <p className="font-bold text-sm">Perfect Attendance!</p>
                      <p className="text-xs text-slate-500">No students were recorded absent for the selected date and course.</p>
                    </td>
                  </tr>
                ) : (
                  absentRecords.map((rec) => (
                    <tr key={rec._id} className="hover:bg-rose-50/20">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        #{rec.student?.rollNumber || '-'}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                        {rec.student?.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {rec.student?.name}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-slate-800">{rec.subject?.subjectCode}</span>
                        <span className="text-slate-500 text-[11px] block">{rec.subject?.subjectName}</span>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {rec.student?.email}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {rec.student?.phone || 'Not available'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {rec.remarks || 'Absent without prior intimation'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Chronic Attendance Shortage Defaulters (<75%) */}
      {activeTab === 'chronic' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Attendance Shortage Defaulter List (&lt;75% Attendance)
              </h3>
              <p className="text-xs text-slate-500">Students whose overall attendance in your courses is below university quota</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              {chronicStudents.length} Defaulters Identified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Roll No</th>
                  <th className="px-6 py-3.5">Student ID</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5 text-center">Conducted</th>
                  <th className="px-6 py-3.5 text-center text-emerald-700">Attended</th>
                  <th className="px-6 py-3.5 text-center text-rose-700">Missed</th>
                  <th className="px-6 py-3.5 text-center">Rate</th>
                  <th className="px-6 py-3.5 text-center">Classes Needed to Reach 75%</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      Analyzing attendance records for defaulters...
                    </td>
                  </tr>
                ) : chronicStudents.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-emerald-600">
                      <FiCheckCircle className="h-8 w-8 mx-auto mb-1 text-emerald-500" />
                      <p className="font-bold text-sm">All Students Above Threshold!</p>
                      <p className="text-xs text-slate-500">All enrolled students in your courses currently have 75% or higher attendance.</p>
                    </td>
                  </tr>
                ) : (
                  chronicStudents.map((row) => (
                    <tr key={row.student._id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        #{row.student.rollNumber}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-semibold">
                        {row.student.studentId}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {row.student.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        Sem {row.student.semester} ({row.student.division})
                      </td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                        {row.totalClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                        {row.presentClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                        {row.absentClasses}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-700 text-sm">
                        {row.percentage}%
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-indigo-700">
                        +{row.neededClasses} consecutive classes
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          row.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {row.status === 'Critical' ? 'Critical (<60%)' : 'Warning (<75%)'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAbsentStudentsPage;
