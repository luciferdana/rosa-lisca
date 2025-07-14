'use client';

import { useState } from 'react';
import { Select } from '../common/Input';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ProjectCard from './ProjectCard';
import ProjectListView from './ProjectListView';
import AllBillingsView from './AllBillingsView';
import AllCashRequestsView from './AllCashRequestsView';
import ProjectForm from '../projects/ProjectForm';
import { dummyData } from '../../data/dummyData';

const ProjectList = ({ projects, billings, cashRequests, onSelectProject, onUpdateBillingStatus, onUpdateRequestStatus, onAddProject }) => {
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'billings', 'cash-requests'
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = !filters.status || project.status === filters.status;
    const matchesSearch = !filters.search || 
      project.name.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  const handleProjectSelect = (project, type) => {
    onSelectProject(project, type);
  };

  const handleAddProject = async (projectData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      
      // Call parent handler to update project list
      if (onAddProject) {
        onAddProject(newProject);
      }
      
      setShowAddProjectModal(false);
      
      // Show success notification (you can customize this)
      alert('Proyek berhasil ditambahkan!');
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Gagal menambahkan proyek. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderViewToggle = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('cards')}
        className={`
          px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${viewMode === 'cards' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <i className="fas fa-th-large mr-2"></i>
        Cards
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`
          px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${viewMode === 'list' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <i className="fas fa-list mr-2"></i>
        List
      </button>
      <button
        onClick={() => setViewMode('billings')}
        className={`
          px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${viewMode === 'billings' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <i className="fas fa-file-invoice mr-2"></i>
        Tagihan
      </button>
      <button
        onClick={() => setViewMode('cash-requests')}
        className={`
          px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${viewMode === 'cash-requests' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-800'
          }
        `}
      >
        <i className="fas fa-file-invoice-dollar mr-2"></i>
        Pengajuan
      </button>
    </div>
  );

  if (viewMode === 'billings') {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Dashboard Proyek
                </h2>
                <p className="text-gray-600">
                  Kelola proyek dan monitoring tagihan
                </p>
              </div>
              {renderViewToggle()}
            </div>
          </div>

          <AllBillingsView
            projects={projects}
            billings={billings}
            onUpdateBillingStatus={onUpdateBillingStatus}
            onSelectProject={handleProjectSelect}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'cash-requests') {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Dashboard Proyek
                </h2>
                <p className="text-gray-600">
                  Kelola proyek dan monitoring pengajuan kas
                </p>
              </div>
              {renderViewToggle()}
            </div>
          </div>

          <AllCashRequestsView
            projects={projects}
            cashRequests={cashRequests}
            onUpdateRequestStatus={onUpdateRequestStatus}
            onSelectProject={handleProjectSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Proyek
              </h2>
              <p className="text-gray-600">
                Pilih proyek untuk mengelola monitoring atau kas
              </p>
            </div>            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                onClick={() => setShowAddProjectModal(true)}
                icon={<i className="fas fa-plus"></i>}
              >
                Tambah Proyek
              </Button>
              {renderViewToggle()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Filter Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'Semua Status' },
                ...dummyData.statusProyek.map(status => ({ value: status, label: status }))
              ]}
            />
            
            <div className="md:col-span-2">
              <Input
                label="Cari Proyek"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nama proyek..."
                icon={<i className="fas fa-search"></i>}
              />
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <i className="fas fa-project-diagram text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Proyek</p>
                <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <i className="fas fa-play-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Berjalan</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'Berjalan').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <i className="fas fa-check-circle text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Selesai</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'Selesai').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Mendatang</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'Mendatang').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <i className="fas fa-file-invoice-dollar text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pengajuan Kas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(cashRequests || {}).reduce((total, projectRequests) => 
                    total + (projectRequests?.length || 0), 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600 text-sm">
            Menampilkan {filteredProjects.length} dari {projects.length} proyek
            {filters.status && ` dengan status "${filters.status}"`}
            {filters.search && ` yang mengandung "${filters.search}"`}
          </p>
          
          <div className="text-sm text-gray-500">
            Tampilan: <span className="font-medium capitalize">{viewMode}</span>
          </div>
        </div>

        {/* Project Display */}
        {filteredProjects.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={handleProjectSelect}
                />
              ))}
            </div>
          ) : (
            <ProjectListView
              projects={filteredProjects}
              onSelectProject={handleProjectSelect}
            />
          )
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Tidak ada proyek ditemukan
            </h3>            <p className="text-gray-500">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
          </div>
        )}

        {/* Add Project Modal */}
        <Modal
          isOpen={showAddProjectModal}
          onClose={() => setShowAddProjectModal(false)}
          title="Tambah Proyek Baru"
          size="lg"
        >
          <ProjectForm
            onSubmit={handleAddProject}
            onCancel={() => setShowAddProjectModal(false)}
            loading={loading}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProjectList;