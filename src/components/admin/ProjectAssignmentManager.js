'use client';

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import Modal from '../common/Modal';

const ProjectAssignmentManager = () => {
  const [keuanganUsers, setKeuanganUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    projectId: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  // Load data
  useEffect(() => {
    loadKeuanganUsers();
    loadProjects();
    loadAssignments();
  }, []);

  const loadKeuanganUsers = async () => {
    try {
      const response = await fetch('/api/users/keuangan');
      if (response.ok) {
        const users = await response.json();
        setKeuanganUsers(users);
      }
    } catch (error) {
      console.error('Error loading keuangan users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        const projectsData = data.projects || data || [];
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/project-assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssignForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user changes input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAssignForm = () => {
    const newErrors = {};

    if (!assignForm.userId) {
      newErrors.userId = 'Pilih user keuangan';
    }

    if (!assignForm.projectId) {
      newErrors.projectId = 'Pilih proyek';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAssignment = async () => {
    if (!validateAssignForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/project-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(assignForm.userId),
          projectId: parseInt(assignForm.projectId),
          isActive: assignForm.isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan');
      }

      // Success - reload assignments and close modal
      await loadAssignments();
      setShowAssignModal(false);
      setAssignForm({ userId: '', projectId: '', isActive: true });
      setErrors({});
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = async (assignmentId, currentStatus) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) return;

      const response = await fetch('/api/project-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: assignment.userId,
          projectId: assignment.projectId,
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        await loadAssignments();
      }
    } catch (error) {
      console.error('Error toggling assignment:', error);
    }
  };

  // Get project options that are not assigned to selected user
  const getAvailableProjects = () => {
    if (!assignForm.userId) return projects;
    
    const userAssignments = assignments.filter(a => 
      a.userId === parseInt(assignForm.userId) && a.isActive
    );
    const assignedProjectIds = userAssignments.map(a => a.projectId);
    
    return projects.filter(p => !assignedProjectIds.includes(p.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Manajemen Assignment Proyek
          </h2>
          <p className="text-gray-600">
            Kelola assignment proyek untuk user keuangan
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAssignModal(true)}
          icon={<i className="fas fa-plus"></i>}
        >
          Assign Proyek
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <i className="fas fa-users text-blue-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total User Keuangan</p>
              <p className="text-2xl font-bold text-blue-600">{keuanganUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <i className="fas fa-project-diagram text-green-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Proyek</p>
              <p className="text-2xl font-bold text-green-600">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <i className="fas fa-link text-purple-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Assignments</p>
              <p className="text-2xl font-bold text-purple-600">
                {assignments.filter(a => a.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Assignment Proyek
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User Keuangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Proyek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status Proyek
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status Assignment
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Tanggal Assign
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {assignment.project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      assignment.project.status === 'BERJALAN' 
                        ? 'bg-green-100 text-green-800'
                        : assignment.project.status === 'SELESAI'
                        ? 'bg-blue-100 text-blue-800'  
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      assignment.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {new Date(assignment.assignedAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant={assignment.isActive ? "danger" : "success"}
                      size="xs"
                      onClick={() => handleToggleAssignment(assignment.id, assignment.isActive)}
                    >
                      {assignment.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {assignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada assignment proyek</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssignForm({ userId: '', projectId: '', isActive: true });
          setErrors({});
        }}
        title="Assign Proyek ke User Keuangan"
      >
        <div className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <Select
            label="User Keuangan"
            name="userId"
            value={assignForm.userId}
            onChange={handleAssignFormChange}
            error={errors.userId}
            options={[
              { value: '', label: 'Pilih User Keuangan' },
              ...keuanganUsers.map(user => ({ 
                value: user.id.toString(), 
                label: `${user.name} (${user.email})` 
              }))
            ]}
            required
          />

          <Select
            label="Proyek"
            name="projectId"
            value={assignForm.projectId}
            onChange={handleAssignFormChange}
            error={errors.projectId}
            options={[
              { value: '', label: 'Pilih Proyek' },
              ...getAvailableProjects().map(project => ({ 
                value: project.id.toString(), 
                label: project.name 
              }))
            ]}
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={assignForm.isActive}
              onChange={handleAssignFormChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Assignment aktif
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModal(false);
                setAssignForm({ userId: '', projectId: '', isActive: true });
                setErrors({});
              }}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAssignment}
              loading={loading}
            >
              Assign Proyek
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectAssignmentManager;