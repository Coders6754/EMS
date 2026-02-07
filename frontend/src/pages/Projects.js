import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Loader, { ButtonLoader } from '../components/Loader';
import Modal from '../components/Modal';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectManager: '',
    budget: '',
    submissionDate: '',
    teamMembers: [{ employee: '', role: '' }],
    status: 'Submitted',
    rejectionReason: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      setFetching(true);
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load projects. Please refresh the page and try again.';
      toast.error(errorMessage);
    } finally {
      setFetching(false);
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
    setLoading(true);
    
    try {
      if (editId) {
        const oldProject = projects.find(p => p._id === editId);
        const statusChanged = oldProject && oldProject.status !== formData.status;
        
        await API.put(`/projects/${editId}`, formData);
        
        if (statusChanged) {
          toast.success(`Project updated successfully! Email notifications sent to team members.`);
        } else {
          toast.success('Project updated successfully!');
        }
      } else {
        await API.post('/projects', formData);
        toast.success('Project created successfully! Email sent to approvers.');
      }
      
      resetForm();
      fetchProjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save project. Please check all fields and try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditId(project._id);
    setFormData({
      projectName: project.projectName,
      projectManager: project.projectManager?._id || '',
      budget: project.budget,
      submissionDate: project.submissionDate?.split('T')[0] || '',
      teamMembers: project.teamMembers?.map(tm => ({
        employee: tm.employee?._id || tm.employee,
        role: tm.role
      })) || [{ employee: '', role: '' }],
      status: project.status || 'Submitted',
      rejectionReason: project.rejectionReason || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/projects/${deleteId}`);
      toast.success('Project deleted successfully!');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchProjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project. Only Administrators can delete projects.';
      toast.error(errorMessage);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, { employee: '', role: '' }]
    });
  };

  const removeTeamMember = (index) => {
    const newTeamMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: newTeamMembers });
  };

  const updateTeamMember = (index, field, value) => {
    const newTeamMembers = [...formData.teamMembers];
    newTeamMembers[index][field] = value;
    setFormData({ ...formData, teamMembers: newTeamMembers });
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      projectManager: '',
      budget: '',
      submissionDate: '',
      teamMembers: [{ employee: '', role: '' }],
      status: 'Submitted',
      rejectionReason: ''
    });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {fetching && (
        <Loader 
          message="Loading projects..."
          fullScreen={true}
        />
      )}
      {loading && (
        <Loader 
          message={
            editId 
              ? (projects.find(p => p._id === editId)?.status !== formData.status 
                  ? 'Updating project & sending email notifications...' 
                  : 'Updating project...')
              : 'Creating project & sending emails to approvers...'
          }
          fullScreen={true}
        />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
          <p className="text-gray-500 mt-1">Track and manage project proposals and workflows</p>
        </div>
        {(user?.role === 'Manager' || user?.role === 'Admin') && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Add Project</span>
          </button>
        )}
      </div>

      <Modal
        isOpen={showForm && !editId}
        onClose={resetForm}
        title="Add New Project"
        size="xl"
        headerColor="from-purple-600 to-purple-700"
      >
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.projectManager}
                  onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                >
                  <option value="">Select Manager</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={formData.submissionDate}
                      onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    />
                  </div>

            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Team Members *</label>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Member
                </button>
              </div>
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    value={member.employee}
                    onChange={(e) => updateTeamMember(index, 'employee', e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Role"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                  />
                  {formData.teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <ButtonLoader />
                ) : (
                  'Create Project'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      {showForm && editId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100 animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Project</h2>
                    <p className="text-purple-100 text-sm">Update project details and status</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.projectManager}
                      onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                    >
                      <option value="">Select Manager</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.submissionDate}
                      onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Status *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Submitted">📝 Submitted</option>
                      <option value="Under Review">🔍 Under Review</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Changing status will send email notifications to project manager and team members</p>
                  </div>

                  {formData.status === 'Rejected' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        rows="3"
                        placeholder="Enter reason for rejection..."
                        value={formData.rejectionReason}
                        onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Team Members *</label>
                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Member</span>
                    </button>
                  </div>
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        value={member.employee}
                        onChange={(e) => updateTeamMember(index, 'employee', e.target.value)}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Role"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                      />
                      {formData.teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <ButtonLoader />
                    ) : (
                      'Update Project'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.length === 0 ? (
          <div className="lg:col-span-2 bg-white p-12 rounded-xl shadow-lg border-2 border-dashed border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</p>
              <p className="text-sm text-gray-500 max-w-md text-center">Get started by creating your first project. Click the "Add New Project" button above to create a new project and assign team members.</p>
            </div>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-purple-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{project.projectName}</h3>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                project.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                project.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1"><strong>Manager:</strong> {project.projectManager?.employeeName}</p>
            <p className="text-sm text-gray-600 mb-1"><strong>Budget:</strong> ${project.budget}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Submission:</strong> {new Date(project.submissionDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Team:</strong> {project.teamMembers?.length || 0} members</p>
            
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  ✏️ Edit
                </button>
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            )}
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
              <h3 className="text-2xl font-bold text-white text-center mt-4">Delete Project?</h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600 text-center text-base leading-relaxed">
                Are you sure you want to delete this project? This action cannot be undone and all associated data will be permanently removed.
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

export default Projects;
