'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Navigation from '../layout/Navigation';
import ProjectList from './ProjectList';
import ProjectMonitoring from './ProjectMonitoring';
import ProjectCash from './ProjectCash';
import ProjectCashRequest from './ProjectCashRequest';
import EditProjectModal from './EditProjectModal';
import ProjectAssignmentManager from '../admin/ProjectAssignmentManager';
import { apiService } from '../../lib/api';

export default function DashboardClient() {
  const { data: session } = useSession();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [billings, setBillings] = useState<any>({});
  const [transactions, setTransactions] = useState<any>({});
  const [cashRequests, setCashRequests] = useState<any>({});
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Load projects and data
  useEffect(() => {
    loadProjects();
  }, []);  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading projects from local API...');
      
      const response = await apiService.getProjects();
      console.log('📊 Projects response:', response);
      
      // Handle response format: { projects: [...], pagination: {...} }
      const projectsData = (response as any)?.projects || response || [];
      
      // Ensure projectsData is an array
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
        
        // Load related data for each project
        for (const project of projectsData) {
          await loadProjectData(project.id);
        }
      } else {
        console.warn('⚠️ Projects data is not an array:', projectsData);
        setProjects([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      setProjects([]);
      alert('Gagal memuat data proyek. Pastikan koneksi internet stabil dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };  // Load project-specific data
  const loadProjectData = async (projectId: number, force: boolean = false) => {
    try {
      const billingsKey = projectId.toString();
      
      // Load billings (force reload if specified or not already loaded)
      if (force || !billings[billingsKey]) {
        const billingsResponse = await apiService.getBillings({ projectId: projectId.toString() });
        const billingsData = (billingsResponse as any)?.billings || billingsResponse || [];
        setBillings(prev => ({ ...prev, [projectId]: billingsData }));
      }

      // Load transactions (force reload if specified or not already loaded)
      if (force || !transactions[billingsKey]) {
        const transactionsResponse = await apiService.getTransactions({ projectId: projectId.toString() });
        const transactionsData = (transactionsResponse as any)?.transactions || transactionsResponse || [];
        setTransactions(prev => ({ ...prev, [projectId]: transactionsData }));
      }

      // Load cash requests (force reload if specified or not already loaded)
      if (force || !cashRequests[billingsKey]) {
        const cashRequestsResponse = await apiService.getCashRequests({ projectId: projectId.toString() });
        const cashRequestsData = (cashRequestsResponse as any)?.cashRequests || cashRequestsResponse || [];
        setCashRequests(prev => ({ ...prev, [projectId]: cashRequestsData }));
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const handleProjectSelect = async (project, type) => {
    setSelectedProject(project);
    setCurrentView(type);
    // Force refresh project data when selecting a project
    if (project) {
      await loadProjectData(project.id, true);
    }
  };

  const handleBackToDashboard = async () => {
    setCurrentView('dashboard');
    setSelectedProject(null);
    // Refresh projects data when returning to dashboard
    await loadProjects();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getCurrentPageTitle = () => {
    switch (currentView) {
      case 'monitoring':
        return 'Monitoring Proyek';
      case 'cash':
        return 'Kas Proyek';
      case 'cash-request':
        return 'Pengajuan Kas';
      case 'project-assignments':
        return 'Manajemen Assignment Proyek';
      default:
        return 'Dashboard';
    }
  };

  const handleAddProject = async (newProject: any) => {
    try {
      console.log('➕ Creating new project:', newProject);
      
      const response = await apiService.createProject(newProject);
      console.log('✅ Project created:', response);
      
      // Refresh projects list
      await loadProjects();
      
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('Gagal membuat proyek: ' + error.message);
    }
  };
  const handleEditProject = async (project: any) => {
    try {
      console.log('✏️ Opening edit modal for project:', project);
      setProjectToEdit(project);
      setEditModalOpen(true);
    } catch (error) {
      console.error('❌ Error opening edit modal:', error);
      alert('Gagal membuka form edit proyek: ' + error.message);
    }
  };

  const handleSaveProject = async (projectId: any, updatedData: any) => {
    try {
      console.log('💾 Saving project changes:', projectId, updatedData);
      
      const response = await apiService.updateProject(projectId, updatedData);
      console.log('✅ Project updated:', response);
      
      // Refresh projects list
      await loadProjects();
      
      setEditModalOpen(false);
      setProjectToEdit(null);
      
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert('Gagal mengupdate proyek: ' + error.message);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: any) => {
    try {
      console.log('🗑️ Deleting project:', projectId);
      
      const response = await apiService.deleteProject(projectId);
      console.log('✅ Project deleted:', response);
      
      // Refresh projects list
      await loadProjects();
      
      // If the deleted project was selected, go back to dashboard
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
        setCurrentView('dashboard');
      }
      
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      alert('Gagal menghapus proyek: ' + error.message);
    }
  };

  // API handlers for updating data
  const handleAddBilling = async (projectId: any, billing: any) => {
    try {
      console.log('➕ Creating billing for project:', projectId, billing);
      
      const response = await apiService.createBilling({ ...billing, projectId });
      console.log('✅ Billing created:', response);
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      
    } catch (error) {
      console.error('❌ Error creating billing:', error);
      alert('Gagal membuat tagihan: ' + error.message);
      throw error; // Re-throw error so BillingForm can handle it
    }
  };

  const handleUpdateBilling = async (projectId: any, billingId: any, billing: any) => {
    try {
      console.log('🔄 Updating billing:', billingId, billing);
      
      const response = await apiService.updateBilling(billingId, billing);
      console.log('✅ Billing updated');
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      return response;
      
    } catch (error) {
      console.error('❌ Error updating billing:', error);
      alert('Gagal mengupdate tagihan: ' + error.message);
      throw error;
    }
  };

  const handleDeleteBilling = async (projectId: any, billingId: any) => {
    try {
      console.log('🗑️ Deleting billing:', billingId);
      
      await apiService.deleteBilling(billingId);
      console.log('✅ Billing deleted');
      
      // Refresh projects to get updated data
      await loadProjects();
      
    } catch (error) {
      console.error('❌ Error deleting billing:', error);
      alert('Gagal menghapus tagihan: ' + error.message);
      throw error;
    }
  };

  const handleUpdateBillingStatus = async (billingId: any, newStatus: any) => {
    try {
      console.log('🔄 Updating billing status:', billingId, newStatus);
      
      const response = await apiService.updateBillingStatus(billingId, newStatus);
      console.log('✅ Billing status updated');
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      return response;
      
    } catch (error) {
      console.error('❌ Error updating billing status:', error);
      alert('Gagal mengupdate status tagihan: ' + error.message);
      throw error;
    }
  };

  const handleAddTransaction = async (projectId: any, transaction: any) => {
    try {
      console.log('➕ Creating transaction for project:', projectId, transaction);
      
      const response = await apiService.createTransaction({ ...transaction, projectId });
      console.log('✅ Transaction created:', response);
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      alert('Gagal membuat transaksi: ' + error.message);
    }
  };

  const handleUpdateTransaction = async (projectId: any, transactionId: any, transaction: any) => {
    try {
      console.log('🔄 Updating transaction:', transactionId, transaction);
      
      const response = await apiService.updateTransaction(transactionId, transaction);
      console.log('✅ Transaction updated');
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      return response;
      
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      alert('Gagal mengupdate transaksi: ' + error.message);
      throw error;
    }
  };

  const handleDeleteTransaction = async (projectId: any, transactionId: any) => {
    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      
      await apiService.deleteTransaction(transactionId);
      console.log('✅ Transaction deleted');
      
      // Refresh projects to get updated data
      await loadProjects();
      
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      alert('Gagal menghapus transaksi: ' + error.message);
      throw error;
    }
  };

  const handleAddCashRequest = async (projectId: any, cashRequest: any) => {
    try {
      console.log('➕ Creating cash request for project:', projectId, cashRequest);
      
      const response = await apiService.createCashRequest({ ...cashRequest, projectId });
      console.log('✅ Cash request created:', response);
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      
    } catch (error) {
      console.error('❌ Error creating cash request:', error);
      alert('Gagal membuat pengajuan kas: ' + error.message);
      throw error;
    }
  };

  const handleUpdateCashRequest = async (projectId: any, requestId: any, cashRequest: any) => {
    try {
      console.log('🔄 Updating cash request:', requestId, cashRequest);
      
      const response = await apiService.updateCashRequest(requestId, cashRequest);
      console.log('✅ Cash request updated');
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      return response;
      
    } catch (error) {
      console.error('❌ Error updating cash request:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Cannot update cash request that is not pending')) {
        alert('Pengajuan kas yang sudah disetujui atau ditolak tidak dapat diubah untuk keperluan audit.');
      } else {
        alert('Gagal mengupdate pengajuan kas: ' + error.message);
      }
      throw error;
    }
  };

  const handleDeleteCashRequest = async (projectId: any, requestId: any) => {
    try {
      console.log('🗑️ Deleting cash request:', requestId);
      
      await apiService.deleteCashRequest(requestId);
      console.log('✅ Cash request deleted');
      
      // Refresh projects to get updated data
      await loadProjects();
      
    } catch (error) {
      console.error('❌ Error deleting cash request:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Cannot delete cash request that is not pending')) {
        alert('Pengajuan kas yang sudah disetujui atau ditolak tidak dapat dihapus untuk keperluan audit.');
      } else {
        alert('Gagal menghapus pengajuan kas: ' + error.message);
      }
      throw error;
    }
  };

  const handleUpdateCashRequestStatus = async (requestId: any, newStatus: any, comments: string = '') => {
    try {
      console.log('🔄 Updating cash request status:', requestId, newStatus);
      
      const response = await apiService.updateCashRequestStatus(requestId, newStatus, comments);
      console.log('✅ Cash request status updated');
      
      // Force refresh projects and project-specific data
      await loadProjects();
      if (selectedProject) {
        await loadProjectData(selectedProject.id, true); // Force refresh project data
      }
      
      return response;
    } catch (error) {
      console.error('Error updating cash request status:', error);
      throw error;
    }
  };

  const handleUpdateProject = async (projectId: any, updatedProject: any) => {
    try {
      const response = await apiService.updateProject(projectId, updatedProject);
      // Update local state
      setProjects(prev => 
        (prev as any[]).map((project: any) => 
          project.id === projectId ? { ...project, ...(response as any) } : project
        )
      );
      
      // Update selected project if it's the one being updated
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(prev => ({ ...(prev as any), ...(response as any) }));
      }
      
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'monitoring':
        if (!selectedProject) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <ProjectMonitoring
            project={selectedProject}
            billings={billings[selectedProject.id] || []}
            onAddBilling={(billing) => handleAddBilling(selectedProject.id, billing)}
            onUpdateBilling={(billingId, billing) => handleUpdateBilling(selectedProject.id, billingId, billing)}
            onDeleteBilling={(billingId) => handleDeleteBilling(selectedProject.id, billingId)}
            onUpdateProject={(updatedProject) => handleUpdateProject(selectedProject.id, updatedProject)}
            onUpdateBillingStatus={handleUpdateBillingStatus}
          />
        );

      case 'cash':
        if (!selectedProject) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <ProjectCash
            project={selectedProject}
            transactions={transactions[selectedProject.id] || []}
            onAddTransaction={(transaction) => handleAddTransaction(selectedProject.id, transaction)}
            onUpdateTransaction={(transactionId, transaction) => handleUpdateTransaction(selectedProject.id, transactionId, transaction)}
            onDeleteTransaction={(transactionId) => handleDeleteTransaction(selectedProject.id, transactionId)}
          />
        );

      case 'cash-request':
        if (!selectedProject) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <ProjectCashRequest
            project={selectedProject}
            cashRequests={cashRequests[selectedProject.id] || []}
            onAddCashRequest={(cashRequest) => handleAddCashRequest(selectedProject.id, cashRequest)}
            onUpdateCashRequest={(requestId, cashRequest) => handleUpdateCashRequest(selectedProject.id, requestId, cashRequest)}
            onDeleteCashRequest={(requestId) => handleDeleteCashRequest(selectedProject.id, requestId)}
            onUpdateRequestStatus={handleUpdateCashRequestStatus}
          />
        );
        
      case 'project-assignments':
        // Only admin can access project assignments
        if (session?.user?.role !== 'ADMIN') {
          setCurrentView('dashboard');
          return null;
        }
        return <ProjectAssignmentManager />;
        
      default:
        return (
          <ProjectList
            projects={projects}
            billings={billings}
            cashRequests={cashRequests}
            onSelectProject={handleProjectSelect}
            onUpdateBillingStatus={handleUpdateBillingStatus}
            onUpdateRequestStatus={handleUpdateCashRequestStatus}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            userRole={session?.user?.role}
            onSetCurrentView={setCurrentView}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={session?.user}
        onLogout={handleLogout}
        selectedProject={selectedProject}
        onBackToDashboard={handleBackToDashboard}
        currentPage={getCurrentPageTitle()}
      />
      
      <main className="fade-in">
        {renderCurrentView()}
      </main>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setProjectToEdit(null);
        }}
        project={projectToEdit}
        onSave={handleSaveProject}
      />
    </div>
  );
}