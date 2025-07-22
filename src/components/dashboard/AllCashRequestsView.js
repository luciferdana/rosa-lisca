import React, { useState } from 'react';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import CashRequestDetailModal from '../cash-request/CashRequestDetailModal';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { CASH_REQUEST_STATUS_OPTIONS, CASH_REQUEST_STATUS } from '../../constants/cashRequestStatus';

const AllCashRequestsView = ({ projects, cashRequests, onUpdateRequestStatus, onSelectProject }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    projectId: '',
    sortBy: 'requestDate'
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    cashRequest: null
  });

  // Get all cash requests from all projects
  const getAllCashRequests = () => {
    const allRequests = [];
    Object.entries(cashRequests).forEach(([projectId, projectRequests]) => {
      projectRequests.forEach(request => {
        allRequests.push({
          ...request,
          projectId: parseInt(projectId)
        });
      });
    });
    return allRequests;
  };

  const allRequests = getAllCashRequests();

  // Filter cash requests
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = filters.search === '' || filters.search === null || filters.search === undefined ||
      request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === '' || filters.status === null || filters.status === undefined || request.status === filters.status;
    const matchesProject = filters.projectId === '' || filters.projectId === null || filters.projectId === undefined || request.projectId === parseInt(filters.projectId);

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Sort cash requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (filters.sortBy) {
      case 'requestDate':
        // Prioritize pending requests, then sort by date
        if (a.status === CASH_REQUEST_STATUS.PENDING && b.status !== CASH_REQUEST_STATUS.PENDING) return -1;
        if (b.status === CASH_REQUEST_STATUS.PENDING && a.status !== CASH_REQUEST_STATUS.PENDING) return 1;
        return new Date(b.requestDate) - new Date(a.requestDate);
      
      case 'totalAmount':
        return b.totalAmount - a.totalAmount;
      
      case 'projectName':
        return a.projectName.localeCompare(b.projectName);
      
      case 'title':
        return a.title.localeCompare(b.title);
      
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case CASH_REQUEST_STATUS.APPROVED: return 'bg-green-100 text-green-800 border-green-200';
      case CASH_REQUEST_STATUS.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'fas fa-clock';
      case CASH_REQUEST_STATUS.APPROVED: return 'fas fa-check-circle';
      case CASH_REQUEST_STATUS.REJECTED: return 'fas fa-times-circle';
      default: return 'fas fa-circle';
    }
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

  const handleStatusUpdate = (requestId, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) {
      handleUpdateStatus(requestId, newStatus, `Status diubah menjadi ${newStatus} oleh admin`);
    }
  };

  // Calculate statistics
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === CASH_REQUEST_STATUS.PENDING).length,
    approved: allRequests.filter(r => r.status === CASH_REQUEST_STATUS.APPROVED).length,
    rejected: allRequests.filter(r => r.status === CASH_REQUEST_STATUS.REJECTED).length,
    totalAmount: allRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    approvedAmount: allRequests.filter(r => r.status === CASH_REQUEST_STATUS.APPROVED).reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Semua Pengajuan Kas</h2>
          <p className="text-gray-600">Monitoring pengajuan kas dari seluruh proyek</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-3">
              <i className="fas fa-file-invoice-dollar text-blue-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pengajuan</p>
              <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-3">
              <i className="fas fa-clock text-yellow-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-3">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-lg font-bold text-green-600">{stats.approved}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.approvedAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-3">
              <i className="fas fa-times-circle text-red-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Cari pengajuan, proyek, atau pengaju..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            icon={<i className="fas fa-search"></i>}
          />
          
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={CASH_REQUEST_STATUS_OPTIONS}
          />
          
          <Select
            value={filters.projectId}
            onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value }))}
            options={projects.map(project => ({ value: project.id.toString(), label: project.name }))}
          />
          
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            options={[
              { value: 'requestDate', label: 'Tanggal Terbaru' },
              { value: 'totalAmount', label: 'Nilai Terbesar' },
              { value: 'projectName', label: 'Nama Proyek' },
              { value: 'title', label: 'Judul Pengajuan' }
            ]}
          />
        </div>
      </div>

      {/* Cash Requests Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Pengajuan Kas ({sortedRequests.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyek</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengajuan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengaju</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{request.projectName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {request.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {request.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {request.items?.length || 0} item
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateShort(request.requestDate)}
                    </div>
                    {request.approvedDate && (
                      <div className="text-xs text-gray-500">
                        {request.status}: {formatDateShort(request.approvedDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(request.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.requestedBy}</div>
                    {request.approvedBy && (
                      <div className="text-xs text-gray-500">
                        {request.status === CASH_REQUEST_STATUS.APPROVED ? 'Disetujui' : 'Ditolak'} oleh: {request.approvedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      <i className={`${getStatusIcon(request.status)} mr-1`}></i>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleViewDetail(request)}
                        icon={<i className="fas fa-eye"></i>}
                      >
                        Detail
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onSelectProject(projects.find(p => p.id === request.projectId), 'cash-request')}
                        icon={<i className="fas fa-external-link-alt"></i>}
                      >
                        Kelola
                      </Button>
                      
                      {request.status === CASH_REQUEST_STATUS.PENDING && (
                        <>
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => handleStatusUpdate(request.id, CASH_REQUEST_STATUS.APPROVED)}
                            icon={<i className="fas fa-check"></i>}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => handleStatusUpdate(request.id, CASH_REQUEST_STATUS.REJECTED)}
                            icon={<i className="fas fa-times"></i>}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRequests.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Tidak ada pengajuan ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter pencarian Anda
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <CashRequestDetailModal
        isOpen={detailModal.isOpen}
        onClose={handleCloseDetailModal}
        cashRequest={detailModal.cashRequest}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default AllCashRequestsView;