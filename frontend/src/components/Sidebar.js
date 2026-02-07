import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [formsOpen, setFormsOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive(path) 
      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
      : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
    }
  `;

  const sectionHeaderClass = 'flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700';

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-xl border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">EMS</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <Link to="/" className={navLinkClass('/')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">Dashboard</span>
        </Link>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <>
            <div className={sectionHeaderClass} onClick={() => setFormsOpen(!formsOpen)}>
              <span>Forms</span>
              <svg className={`w-4 h-4 transition-transform ${formsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {formsOpen && (
              <div className="ml-2 space-y-1">
                {user?.role === 'Admin' && (
                  <Link to="/forms/departments" className={navLinkClass('/forms/departments')}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">Departments</span>
                  </Link>
                )}
                
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                  <>
                    <Link to="/forms/employees" className={navLinkClass('/forms/employees')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">Employees</span>
                    </Link>
                    
                    <Link to="/forms/projects" className={navLinkClass('/forms/projects')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span className="font-medium">Projects</span>
                    </Link>
                    
                    <Link to="/forms/invoices" className={navLinkClass('/forms/invoices')}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">Invoices</span>
                    </Link>
                  </>
                )}
                
                <Link to="/forms/leaves" className={navLinkClass('/forms/leaves')}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Leave Requests</span>
                </Link>
              </div>
            )}
          </>
        )}

        <div className={sectionHeaderClass} onClick={() => setReportsOpen(!reportsOpen)}>
          <span>Reports & Analytics</span>
          <svg className={`w-4 h-4 transition-transform ${reportsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {reportsOpen && (
          <div className="ml-2 space-y-1">
            <Link to="/reports" className={navLinkClass('/reports')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">All Reports</span>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
