import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../utils/api';
import LeaveWidget from '../components/LeaveWidget';
import { AuthContext } from '../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({});
  const [employeesByDept, setEmployeesByDept] = useState([]);
  const [projectsByStatus, setProjectsByStatus] = useState([]);
  const [leavesAnalysis, setLeavesAnalysis] = useState({ byType: [], byStatus: [] });
  const [employeeLeaveBalance, setEmployeeLeaveBalance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    if (user?.role === 'Employee' && user?.employeeId) {
      fetchEmployeeLeaveBalance();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, empByDeptRes, projStatusRes, leavesRes] = await Promise.all([
        API.get('/dashboard/summary'),
        API.get('/dashboard/employees-by-department'),
        API.get('/dashboard/projects-by-status'),
        API.get('/dashboard/leaves-analysis')
      ]);

      setSummary(summaryRes.data);
      setEmployeesByDept(empByDeptRes.data.map(d => ({ name: d._id, value: d.count })));
      setProjectsByStatus(projStatusRes.data.map(d => ({ name: d._id, value: d.count })));
      setLeavesAnalysis({
        byType: leavesRes.data.byType.map(d => ({ name: d._id, value: d.count })),
        byStatus: leavesRes.data.byStatus.map(d => ({ name: d._id, value: d.count }))
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchEmployeeLeaveBalance = async () => {
    try {
      const employeeId = user.employeeId?._id || user.employeeId;
      if (employeeId) {
        const res = await API.get(`/employees/${employeeId}/leave-balance`);
        setEmployeeLeaveBalance(res.data);
      }
    } catch (error) {
      console.error('Error fetching employee leave balance:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Monitor your organization's key metrics and performance</p>
      </div>

      {user?.role === 'Employee' && employeeLeaveBalance && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100 uppercase mb-1">Your Leave Balance</p>
              <h3 className="text-4xl font-bold mb-2">
                {employeeLeaveBalance.leaveBalance?.total || 0} days
              </h3>
              <p className="text-sm text-indigo-100">
                Available for {new Date().getFullYear()}
              </p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-indigo-400 border-opacity-30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-indigo-100 mb-1">Casual Leave</p>
                <p className="text-lg font-semibold">{employeeLeaveBalance.leaveBalance?.casualLeave || 0} days</p>
              </div>
              <div>
                <p className="text-xs text-indigo-100 mb-1">Sick Leave</p>
                <p className="text-lg font-semibold">{employeeLeaveBalance.leaveBalance?.sickLeave || 0} days</p>
              </div>
              <div>
                <p className="text-xs text-indigo-100 mb-1">Earned Leave</p>
                <p className="text-lg font-semibold">{employeeLeaveBalance.leaveBalance?.earnedLeave || 0} days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">Employees</p>
              <h3 className="text-3xl font-bold text-gray-800">{summary.totalEmployees || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3 font-semibold">↗ Active staff members</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">Departments</p>
              <h3 className="text-3xl font-bold text-gray-800">{summary.totalDepartments || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3 font-semibold">↗ Total divisions</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">Projects</p>
              <h3 className="text-3xl font-bold text-gray-800">{summary.totalProjects || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3 font-semibold">→ In progress</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">Invoices</p>
              <h3 className="text-3xl font-bold text-gray-800">{summary.totalInvoices || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-3 font-semibold">→ Generated</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase mb-1">Leave Requests</p>
              <h3 className="text-3xl font-bold text-gray-800">{summary.totalLeaves || 0}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-3 font-semibold">→ This month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Employees by Department</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeesByDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Projects by Status</h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Overview</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Leave Requests by Type</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leavesAnalysis.byType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {leavesAnalysis.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Leave Requests by Status</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Analysis</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leavesAnalysis.byStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#10B981" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <LeaveWidget />
    </div>
  );
};

export default Dashboard;
