import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Loader, { ButtonLoader } from '../components/Loader';
import Modal from '../components/Modal';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // 'submit', 'approve', 'reject', 'delete'
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Auto-select employee's own record if they are an employee
    if (user?.role === 'Employee' && user?.employeeId && employees.length > 0) {
      const ownEmployee = employees.find(emp => emp._id === user.employeeId._id || emp._id === user.employeeId);
      if (ownEmployee && !formData.employee) {
        setFormData(prev => ({ ...prev, employee: ownEmployee._id }));
      }
    }
  }, [user, employees]);

  useEffect(() => {
    // Auto-select employee's own record if they are an employee
    if (user?.role === 'Employee' && user?.employeeId && employees.length > 0) {
      const ownEmployee = employees.find(emp => emp._id === user.employeeId._id || emp._id === user.employeeId);
      if (ownEmployee && !formData.employee) {
        setFormData(prev => ({ ...prev, employee: ownEmployee._id }));
      }
    }
  }, [user, employees]);

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves');
      setLeaves(res.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load leave requests. Please refresh the page and try again.';
      toast.error(errorMessage);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPendingLeave(formData);
    setShowConfirmPopup(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setLoadingAction('submit');
    try {
      await API.post('/leaves', pendingLeave);
      toast.success('Leave request submitted successfully! Email sent to manager.');
      setShowConfirmPopup(false);
      setPendingLeave(null);
      resetForm();
      fetchLeaves();
    } catch (error) {
      // Filter out "Invalid leave type" error - don't show to user
      const errorMessage = error.response?.data?.message || 'Error submitting leave request';
      if (errorMessage.toLowerCase().includes('invalid leave type')) {
        toast.error('Please select a valid leave type');
      } else {
        toast.error(errorMessage);
      }
      setShowConfirmPopup(false);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleApproval = async (id, status) => {
    setLoading(true);
    setLoadingAction(status.toLowerCase());
    try {
      await API.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()} successfully! Email sent to employee.`);
      fetchLeaves();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update leave status. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    setLoadingAction('delete');
    try {
      await API.delete(`/leaves/${deleteId}`);
      toast.success('Leave request deleted successfully!');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchLeaves();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete leave request. Only Administrators can delete leave requests.';
      toast.error(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      employee: '',
      leaveType: 'Casual Leave',
      startDate: '',
      endDate: '',
      reason: ''
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <Loader 
          message={
            loadingAction === 'submit' ? 'Submitting leave request & sending email...' :
            loadingAction === 'approved' ? 'Approving leave & sending email notification...' :
            loadingAction === 'rejected' ? 'Rejecting leave & sending email notification...' :
            loadingAction === 'delete' ? 'Deleting leave request...' :
            'Processing...'
          }
          fullScreen={true}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leave Request Management</h1>
          <p className="text-gray-500 mt-1">Submit and manage employee leave requests</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold">Request Leave</span>
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title="Request Leave"
        size="lg"
        headerColor="from-red-600 to-red-700"
      >
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                {user?.role === 'Employee' && user?.employeeId ? (
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    value={employees.find(emp => emp._id === (user.employeeId._id || user.employeeId))?.employeeName || 'Your Employee Record'}
                  />
                ) : (
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                    ))}
                  </select>
                )}
                {user?.role === 'Employee' && !user?.employeeId && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Please link your employee account to request leaves</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                >
                  <option value="Casual Leave">🏖️ Casual Leave (8 days/year)</option>
                  <option value="Sick Leave">🤒 Sick Leave (8 days/year)</option>
                  <option value="Earned Leave">✈️ Earned Leave (14 days/year)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {(user?.role === 'Manager' || user?.role === 'Admin') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'Manager' || user?.role === 'Admin' ? 7 : 6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xl font-semibold text-gray-700 mb-2">No Leave Requests Found</p>
                    <p className="text-sm text-gray-500 max-w-md">
                      {user?.role === 'Employee' 
                        ? "You haven't submitted any leave requests yet. Click the 'Request Leave' button to submit your first leave request."
                        : "No leave requests have been submitted yet. Employees can submit leave requests from their dashboard."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leaves.map(leave => {
                const isEmployeeDeleted = leave.employee?._deleted || (!leave.employee && leave.employeeName);
                const employeeName = leave.employee?.employeeName || leave.employeeName || 'Unknown';
                
                return (
                <tr key={leave._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={isEmployeeDeleted ? 'text-gray-400 line-through' : ''}>
                      {employeeName}
                    </span>
                    {isEmployeeDeleted && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded font-medium">
                        Deleted
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(leave.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(leave.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">{leave.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
                {(user?.role === 'Manager' || user?.role === 'Admin') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {leave.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApproval(leave._id, 'Approved')}
                          disabled={loading}
                          className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {loading && loadingAction === 'approved' ? (
                            <>
                              <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            'Approve'
                          )}
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleApproval(leave._id, 'Rejected')}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {loading && loadingAction === 'rejected' ? (
                            <>
                              <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            'Reject'
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(leave._id)}
                      className="ml-2 text-red-600 hover:text-red-900 font-medium"
                      title="Delete Leave Request"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Confirm Leave Request</h3>
            <div className="mb-4 space-y-2 text-gray-700">
              <p><strong>Leave Type:</strong> {pendingLeave?.leaveType}</p>
              <p><strong>Start Date:</strong> {new Date(pendingLeave?.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(pendingLeave?.endDate).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> {pendingLeave?.reason}</p>
            </div>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to submit this leave request?</p>
            <div className="flex space-x-2">
              <button
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading && loadingAction === 'submit' ? (
                  <ButtonLoader />
                ) : (
                  'Confirm'
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirmPopup(false);
                  setPendingLeave(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mt-4">Delete Leave Request?</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-center text-base leading-relaxed">
                Are you sure you want to delete this leave request? This action cannot be undone and all associated data will be permanently removed.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading && loadingAction === 'delete' ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
