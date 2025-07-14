import React, { useState } from 'react';
import CashRequestForm from '../cash-request/CashRequestForm';
import CashRequestTable from '../cash-request/CashRequestTable';
import CashRequestDetailModal from '../cash-request/CashRequestDetailModal';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const ProjectCashRequest = ({
  project,
  cashRequests,
  onAddCashRequest,
  onUpdateCashRequest,
  onDeleteCashRequest,
  onUpdateRequestStatus
}) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'form'
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    cashRequest: null
  });

  // Calculate summary
  const summary = {
    total: cashRequests.length,
    pending: cashRequests.filter(r => r.status === 'Pending').length,
    approved: cashRequests.filter(r => r.status === 'Approved').length,
    rejected: cashRequests.filter(r => r.status === 'Rejected').length,
    totalAmount: cashRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    approvedAmount: cashRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  };

  const handleAddRequest = () => {
    setEditingRequest(null);
    setShowRequestForm(true);
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  const handleSaveRequest = (requestData) => {
    if (editingRequest) {
      onUpdateCashRequest(editingRequest.id, requestData);
    } else {
      onAddCashRequest(requestData);
    }
    setShowRequestForm(false);
    setEditingRequest(null);
    setActiveTab('list');
  };

  const handleDeleteRequest = (requestId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
      onDeleteCashRequest(requestId);
    }
  };

  const handleCloseRequestForm = () => {
    setShowRequestForm(false);
    setEditingRequest(null);
    setActiveTab('list');
  };

  const handleViewDetail = (cashRequest) => {
    setDetailModal({
      isOpen: true,
      cashRequest
    });
  };

  const handleCloseDetailModal = () => {
    setDetailModal({
      isOpen: false,
      cashRequest: null
    });
  };

  const handleUpdateStatus = async (requestId, newStatus, comments = '') => {
    await onUpdateRequestStatus(requestId, newStatus, comments);
  };

  const tabs = [
    { id: 'list', label: 'Daftar Pengajuan', icon: 'fas fa-list' },
    { id: 'form', label: 'Buat Pengajuan', icon: 'fas fa-plus-circle' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'form':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Buat Pengajuan Kas Baru
            </h2>
            <CashRequestForm
              cashRequest={editingRequest}
              onSave={handleSaveRequest}
              onCancel={() => setActiveTab('list')}
            />
          </div>
        );
      
      case 'list':
      default:
        return (
          <div className="space-y-6">
            {/* Action Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Daftar Pengajuan Kas
                </h2>
                <p className="text-gray-600">
                  Kelola pengajuan kas untuk proyek {project.name}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setActiveTab('form')}
                icon={<i className="fas fa-plus"></i>}
              >
                Buat Pengajuan
              </Button>
            </div>

            <CashRequestTable
              cashRequests={cashRequests}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onUpdateStatus={handleUpdateStatus}
              onViewDetail={handleViewDetail}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pengajuan Kas Proyek
          </h1>
          <p className="text-gray-600">
            Kelola pengajuan kas untuk proyek {project.name}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <i className="fas fa-file-invoice-dollar text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Pengajuan</p>
                <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
                <p className="text-xs text-gray-500">{formatCurrency(summary.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
                <p className="text-xs text-gray-500">{formatCurrency(summary.approvedAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <i className="fas fa-times-circle text-red-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="fade-in">
          {renderTabContent()}
        </div>

        {/* Request Form Modal */}
        <Modal
          isOpen={showRequestForm}
          onClose={handleCloseRequestForm}
          title={editingRequest ? 'Edit Pengajuan Kas' : 'Buat Pengajuan Kas Baru'}
          size="xl"
        >
          <CashRequestForm
            cashRequest={editingRequest}
            onSave={handleSaveRequest}
            onCancel={handleCloseRequestForm}
          />
        </Modal>

        {/* Detail Modal */}
        <CashRequestDetailModal
          isOpen={detailModal.isOpen}
          onClose={handleCloseDetailModal}
          cashRequest={detailModal.cashRequest}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default ProjectCashRequest;
