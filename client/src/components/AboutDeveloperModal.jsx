import React from 'react';
import {
  FiX,
  FiGithub,
  FiLinkedin,
  FiExternalLink,
  FiUser,
  FiBookOpen,
  FiTrendingUp,
  FiCalendar,
  FiMapPin,
  FiCode,
} from 'react-icons/fi';

const AboutDeveloperModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/80 text-white border border-indigo-400/30">
              <FiUser className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">About the Developer</h3>
              <p className="text-xs text-indigo-200/80 mt-0.5">MERN Attendance Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Developer Identity Card */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md shadow-indigo-600/20">
              AS
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900 leading-tight">Ayush Shedge</h4>
              <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                <FiTrendingUp className="h-3.5 w-3.5" /> Aspiring Data Analyst
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                <FiBookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>B.Sc. Information Technology</span>
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <FiMapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Vidyalankar School of Information Technology, Mumbai</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <FiCalendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Expected Graduation: 2027</span>
              </p>
            </div>
          </div>

          {/* Project Context */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Architecture & Technology
            </h5>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <p className="leading-relaxed">
                Full-stack academic mini-project architected with the <strong>MERN</strong> stack (MongoDB, Express.js, React, Node.js, Vite, and Tailwind CSS). Designed with role-isolated dashboards for Administrators, Faculty Teachers, and Students, complete with automated attendance analytics.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">MongoDB</span>
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">Express.js</span>
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">React.js</span>
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">Node.js</span>
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">JWT Auth</span>
                <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">Tailwind CSS</span>
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Professional Profiles
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://github.com/ayushshedge24-tech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition text-slate-800 text-xs font-semibold group"
              >
                <div className="flex items-center space-x-2">
                  <FiGithub className="h-4 w-4 text-slate-700 group-hover:text-black" />
                  <span>GitHub Profile</span>
                </div>
                <FiExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
              </a>

              <a
                href="https://linkedin.com/in/ayush-shedge-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition text-slate-800 text-xs font-semibold group"
              >
                <div className="flex items-center space-x-2">
                  <FiLinkedin className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
                  <span>LinkedIn Profile</span>
                </div>
                <FiExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Attendance Management System • 2024–2027
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutDeveloperModal;
