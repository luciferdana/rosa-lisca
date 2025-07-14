import { useState, useEffect } from 'react';
import { dummyData } from '../data/dummyData';

export const useProject = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState(dummyData.projects);
  const [billings, setBillings] = useState(dummyData.billings);
  const [transactions, setTransactions] = useState(dummyData.transactions);
  const [cashRequests, setCashRequests] = useState(dummyData.cashRequests);

  // Load selected project from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('rosa_lisca_selected_project');
    if (savedProjectId) {
      const project = projects.find(p => p.id === parseInt(savedProjectId));
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects]);

  const selectProject = (project) => {
    setSelectedProject(project);
    localStorage.setItem('rosa_lisca_selected_project', project.id.toString());
  };

  const clearSelectedProject = () => {
    setSelectedProject(null);
    localStorage.removeItem('rosa_lisca_selected_project');
  };

  const getProjectBillings = (projectId) => {
    return billings[projectId] || [];
  };

  const getProjectTransactions = (projectId) => {
    return transactions[projectId] || [];
  };

  const getProjectCashRequests = (projectId) => {
    return cashRequests[projectId] || [];
  };

  const addBilling = (projectId, billing) => {
    const newBilling = {
      ...billing,
      id: Date.now(), // Simple ID generation for prototype
    };

    setBillings(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newBilling]
    }));

    return newBilling;
  };

  const updateBilling = (projectId, billingId, updatedBilling) => {
    setBillings(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(billing =>
        billing.id === billingId ? { ...billing, ...updatedBilling } : billing
      )
    }));
  };

  const deleteBilling = (projectId, billingId) => {
    setBillings(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(billing => billing.id !== billingId)
    }));
  };

  const addTransaction = (projectId, transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(), // Simple ID generation for prototype
    };

    setTransactions(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newTransaction]
    }));

    return newTransaction;
  };

  const updateTransaction = (projectId, transactionId, updatedTransaction) => {
    setTransactions(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(transaction =>
        transaction.id === transactionId ? { ...transaction, ...updatedTransaction } : transaction
      )
    }));
  };

  const deleteTransaction = (projectId, transactionId) => {
    setTransactions(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(transaction => transaction.id !== transactionId)
    }));
  };

  const updateProject = (projectId, updatedProject) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId ? { ...project, ...updatedProject } : project
      )
    );

    // Update selected project if it's the one being updated
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(prev => ({ ...prev, ...updatedProject }));
    }
  };

  const updateBillingStatus = (billingId, newStatus) => {
    // Find the billing across all projects
    let targetProjectId = null;
    let targetBilling = null;
    
    Object.entries(billings).forEach(([projectId, projectBillings]) => {
      const billing = projectBillings.find(b => b.id === billingId);
      if (billing) {
        targetProjectId = projectId;
        targetBilling = billing;
      }
    });
    
    if (targetProjectId && targetBilling) {
      setBillings(prev => ({
        ...prev,
        [targetProjectId]: prev[targetProjectId].map(billing =>
          billing.id === billingId 
            ? { 
                ...billing, 
                status: newStatus,
                tanggalPembayaran: newStatus !== 'Belum Dibayar' 
                  ? (billing.tanggalPembayaran || new Date().toISOString().split('T')[0])
                  : null,
                retensiDibayar: newStatus === 'Dibayar'
              } 
            : billing
        )
      }));
    }
  };

  // Cash Request functions
  const addCashRequest = (projectId, cashRequest) => {
    const newCashRequest = {
      ...cashRequest,
      id: Date.now(),
      projectId: parseInt(projectId),
      projectName: projects.find(p => p.id === parseInt(projectId))?.name || '',
      history: [
        {
          id: 1,
          action: 'Submitted',
          actionBy: cashRequest.requestedBy,
          actionDate: new Date().toISOString(),
          comments: 'Pengajuan kas baru dibuat'
        }
      ]
    };

    setCashRequests(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newCashRequest]
    }));

    return newCashRequest;
  };

  const updateCashRequest = (projectId, requestId, updatedRequest) => {
    setCashRequests(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(request =>
        request.id === requestId ? { ...request, ...updatedRequest } : request
      )
    }));
  };

  const deleteCashRequest = (projectId, requestId) => {
    setCashRequests(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(request => request.id !== requestId)
    }));
  };

  const updateCashRequestStatus = (requestId, newStatus, comments = '') => {
    // Find the request across all projects
    let targetProjectId = null;
    let targetRequest = null;
    
    Object.entries(cashRequests).forEach(([projectId, projectRequests]) => {
      const request = projectRequests.find(r => r.id === requestId);
      if (request) {
        targetProjectId = projectId;
        targetRequest = request;
      }
    });
    
    if (targetProjectId && targetRequest) {
      const newHistoryItem = {
        id: Date.now(),
        action: newStatus,
        actionBy: 'Admin Rosa Lisca',
        actionDate: new Date().toISOString(),
        comments: comments
      };

      setCashRequests(prev => ({
        ...prev,
        [targetProjectId]: prev[targetProjectId].map(request =>
          request.id === requestId 
            ? { 
                ...request, 
                status: newStatus,
                approvedBy: 'Admin Rosa Lisca',
                approvedDate: new Date().toISOString().split('T')[0],
                history: [...(request.history || []), newHistoryItem]
              } 
            : request
        )
      }));
    }
  };

  return {
    selectedProject,
    projects,
    billings,
    cashRequests,
    selectProject,
    clearSelectedProject,
    getProjectBillings,
    getProjectTransactions,
    getProjectCashRequests,
    addBilling,
    updateBilling,
    deleteBilling,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateProject,
    updateBillingStatus,
    addCashRequest,
    updateCashRequest,
    deleteCashRequest,
    updateCashRequestStatus
  };
};