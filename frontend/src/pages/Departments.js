import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import Modal from '../components/Modal';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    head: '',
    location: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load departments. Please try again.');
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
    
    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    
    if (!formData.location || !formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    
    try {
      if (editId) {
        await API.put(`/departments/${editId}`, formData);
        toast.success(`Department "${formData.name}" updated successfully!`);
      } else {
        await API.post('/departments', formData);
        toast.success(`Department "${formData.name}" created successfully!`);
      }
      
      resetForm();
      fetchDepartments();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save department. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (dept) => {
    setEditId(dept._id);
    setFormData({
      name: dept.name,
      head: dept.head?._id || '',
      location: dept.location
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/departments/${deleteId}`);
      toast.success('Department deleted successfully!');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchDepartments();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete department. Please try again.';
      toast.error(errorMessage);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({ name: '', head: '', location: '' });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Department Management</h1>
          <p className="text-gray-500 mt-1">Organize and manage company departments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold">Add Department</span>
        </button>
      </div>

      <Modal
        isOpen={showForm && !editId}
        onClose={resetForm}
        title="Add New Department"
        size="lg"
        headerColor="from-green-600 to-green-700"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              >
                <option value="">Select Head</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Create Department
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

      <Modal
        isOpen={showForm && editId}
        onClose={resetForm}
        title="Edit Department"
        size="lg"
        headerColor="from-green-600 to-green-700"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              >
                <option value="">Select Head</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              Update Department
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xl font-semibold text-gray-700 mb-2">No Departments Found</p>
              <p className="text-sm text-gray-500 max-w-md text-center">Get started by creating your first department. Click the "Add New Department" button above to organize your employees into departments.</p>
            </div>
          </div>
        ) : (
          departments.map(dept => (
            <div key={dept._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-green-500">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{dept.name}</h3>
            <p className="text-sm text-gray-600 mb-1"><strong>Head:</strong> {dept.head?.employeeName || ''}</p>
            <p className="text-sm text-gray-600 mb-4"><strong>Location:</strong> {dept.location}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(dept)}
                className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept._id)}
                className="bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          ))
        )}
      </div>

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
              <h3 className="text-2xl font-bold text-white text-center mt-4">Delete Department?</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-center text-base leading-relaxed">
                Are you sure you want to delete this department? This action cannot be undone and all associated data will be permanently removed.
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
