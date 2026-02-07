import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const Reports = () => {
  const [reportType, setReportType] = useState('employees');
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    joiningDateFrom: '',
    joiningDateTo: '',
    status: ''
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchReport = async (filterParams = null) => {
    try {
      let url = `/reports/${reportType}`;
      const params = new URLSearchParams();
      const activeFilters = filterParams || filters;
      
      if (activeFilters.department) params.append('department', activeFilters.department);
      if (activeFilters.joiningDateFrom) params.append('joiningDateFrom', activeFilters.joiningDateFrom);
      if (activeFilters.joiningDateTo) params.append('joiningDateTo', activeFilters.joiningDateTo);
      if (activeFilters.status) params.append('status', activeFilters.status);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await API.get(url);
      setData(res.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleFilter = () => {
    fetchReport();
  };

  const clearFilters = () => {
    const clearedFilters = {
      department: '',
      joiningDateFrom: '',
      joiningDateTo: '',
      status: ''
    };
    setFilters(clearedFilters);
    // Fetch report with cleared filters immediately
    fetchReport(clearedFilters);
  };

  const renderEmployeeReport = () => (
    <div>
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-blue-300"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
          <input
            type="date"
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-blue-300"
            placeholder="From Date"
            value={filters.joiningDateFrom}
            onChange={(e) => setFilters({ ...filters, joiningDateFrom: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-blue-300"
            placeholder="To Date"
            value={filters.joiningDateTo}
            onChange={(e) => setFilters({ ...filters, joiningDateTo: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleFilter}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No Employees Found</p>
            <p className="text-sm text-gray-500 max-w-md text-center">No employees match your current filters. Try adjusting your search criteria to see more results.</p>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(emp => (
              <tr key={emp._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{emp.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{emp.department?.name || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(emp.joiningDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderDepartmentReport = () => (
    <>
      {data.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No Departments Found</p>
            <p className="text-sm text-gray-500 max-w-md text-center">No departments are available in the system. Create departments from the Departments page to organize your employees.</p>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(dept => (
              <tr key={dept._id}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dept.head?.employeeName || ''}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dept.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );

  const renderProjectReport = () => (
    <div>
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            className="flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:border-purple-300"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={handleFilter}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filter
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</p>
            <p className="text-sm text-gray-500 max-w-md text-center">No projects match your current filters. Try adjusting your search criteria to see more results.</p>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(proj => (
              <tr key={proj._id}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{proj.projectName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{proj.projectManager?.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap">${proj.budget}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    proj.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    proj.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    proj.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {proj.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderInvoiceReport = () => (
    <div>
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            className="flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all bg-white shadow-sm hover:border-yellow-300"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
          <button
            onClick={handleFilter}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filter
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</p>
            <p className="text-sm text-gray-500 max-w-md text-center">No invoices match your current filters. Try adjusting your search criteria to see more results.</p>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(inv => (
              <tr key={inv._id}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{inv.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">${inv.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    inv.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderLeaveReport = () => (
    <div>
      <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-xl border border-red-100 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <select
            className="flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white shadow-sm hover:border-red-300"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={handleFilter}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filter
          </button>
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700 mb-2">No Leave Requests Found</p>
            <p className="text-sm text-gray-500 max-w-md text-center">No leave requests match your current filters. Try adjusting your search criteria to see more results.</p>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(leave => (
              <tr key={leave._id}>
                <td className="px-6 py-4 whitespace-nowrap">{leave.employee?.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(leave.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(leave.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Generate and analyze organizational reports</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('employees')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${reportType === 'employees' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            👥 Employees
          </button>
          <button
            onClick={() => setReportType('departments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${reportType === 'departments' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            🏢 Departments
          </button>
          <button
            onClick={() => setReportType('projects')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${reportType === 'projects' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📋 Projects
          </button>
          <button
            onClick={() => setReportType('invoices')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${reportType === 'invoices' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📄 Invoices
          </button>
          <button
            onClick={() => setReportType('leaves')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${reportType === 'leaves' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📅 Leave Requests
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {reportType === 'employees' && renderEmployeeReport()}
        {reportType === 'departments' && renderDepartmentReport()}
        {reportType === 'projects' && renderProjectReport()}
        {reportType === 'invoices' && renderInvoiceReport()}
        {reportType === 'leaves' && renderLeaveReport()}
      </div>
    </div>
  );
};

export default Reports;
