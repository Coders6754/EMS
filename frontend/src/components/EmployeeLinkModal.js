import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const EmployeeLinkModal = ({ isOpen, onClose, onLinkSuccess }) => {
  const { user, login } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableEmployees();
    }
  }, [isOpen]);

  const fetchAvailableEmployees = async () => {
    try {
      const res = await API.get('/auth/available-employees');
      setEmployees(res.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleLink = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee record');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/link-employee', { employeeId: selectedEmployee });
      
      const updatedUser = { ...user, employeeId: res.data.user.employeeId };
      const token = localStorage.getItem('token');
      login(token, updatedUser);
      
      toast.success('Employee account linked successfully!');
      onLinkSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to link employee account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Link Employee Account</h2>
              <p className="text-blue-100 text-sm mt-1">Connect your account to an employee record</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> To access all features, you need to link your account to an employee record. 
              If you don't see your employee record, please contact your administrator.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Employee
            </label>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Employee List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Employee Record
            </label>
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No employees found matching your search' : 'No available employee records found'}
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <label
                    key={employee._id}
                    className={`flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmployee === employee._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="employee"
                      value={employee._id}
                      checked={selectedEmployee === employee._id}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{employee.employeeName}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">ID:</span> {employee.employeeId} | 
                        <span className="font-medium ml-2">Email:</span> {employee.email}
                        {employee.department && (
                          <> | <span className="font-medium ml-2">Dept:</span> {employee.department.name}</>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedEmployee || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Linking...</span>
                </>
              ) : (
                'Link Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLinkModal;
