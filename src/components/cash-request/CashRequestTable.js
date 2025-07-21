import React, { useState } from 'react';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { CASH_REQUEST_STATUS_OPTIONS } from '../../constants/cashRequestStatus';

const CashRequestTable = ({ 
  cashRequests, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  onViewDetail 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'requestDate'
  });
  const [sortDirection, setSortDirection] = useState('desc');
  // Filter and sort cash requests
  const filteredRequests = cashRequests.filter(request => {
    const requestedByText = typeof request.requestedBy === 'string' ? request.requestedBy : request.requestedBy?.name || '';
    
    const matchesSearch = !filters.search || 
      request.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      requestedByText.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[filters.sortBy];
    const bValue = b[filters.sortBy];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (filters.sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setFilters(prev => ({ ...prev, sortBy: field }));
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return 'fas fa-sort text-gray-400';
    return sortDirection === 'asc' 
      ? 'fas fa-sort-up text-blue-600' 
      : 'fas fa-sort-down text-blue-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'fas fa-clock';
      case 'Approved': return 'fas fa-check-circle';
      case 'Rejected': return 'fas fa-times-circle';
      default: return 'fas fa-circle';
    }
  };

  const handleStatusUpdate = (requestId, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`)) {
      onUpdateStatus(requestId, newStatus);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sortBy: 'requestDate'
    });
  };

  const hasActiveFilters = filters.search || filters.status;

  // Calculate statistics
  const stats = {
    total: cashRequests.length,
    pending: cashRequests.filter(r => r.status === 'Pending').length,
    approved: cashRequests.filter(r => r.status === 'Approved').length,
    rejected: cashRequests.filter(r => r.status === 'Rejected').length,
    totalAmount: cashRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    approvedAmount: cashRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  };

  if (cashRequests.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-file-invoice-dollar text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Belum ada pengajuan kas
        </h3>
        <p className="text-gray-500">
          Buat pengajuan kas pertama untuk proyek ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <div className="md:col-span-2">
            <Input
              placeholder="Cari berdasarkan judul, pengaju, atau deskripsi..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: '', label: 'Semua Status' },
              ...CASH_REQUEST_STATUS_OPTIONS
            ]}
          />
          
          <div className="flex items-end gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                icon={<i className="fas fa-times"></i>}
              >
                Clear
              </Button>
            )}
            <span className="text-sm text-gray-600">
              {sortedRequests.length} pengajuan
            </span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('requestDate')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    <i className={getSortIcon('requestDate')}></i>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    Judul Pengajuan
                    <i className={getSortIcon('title')}></i>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pengaju
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total
                    <i className={getSortIcon('totalAmount')}></i>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateShort(request.requestDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {request.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {request.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {request.items?.length || 0} item
                    </div>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof request.requestedBy === 'string' ? request.requestedBy : request.requestedBy?.name || 'Unknown'}
                    </div>
                    {request.approvedBy && (
                      <div className="text-xs text-gray-500">
                        {request.status === 'Approved' ? 'Disetujui' : 'Ditolak'} oleh: {
                          typeof request.approvedBy === 'string' ? request.approvedBy : request.approvedBy?.name || 'Unknown'
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(request.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      <i className={`${getStatusIcon(request.status)} mr-1`}></i>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onViewDetail(request)}
                        icon={<i className="fas fa-eye"></i>}
                      >
                        Detail
                      </Button>
                      
                      {request.status === 'Pending' && (
                        <>
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => handleStatusUpdate(request.id, 'Approved')}
                            icon={<i className="fas fa-check"></i>}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                            icon={<i className="fas fa-times"></i>}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <div className="relative group">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={<i className="fas fa-ellipsis-v"></i>}
                        >
                        </Button>
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="py-1">
                            <button
                              onClick={() => onEdit(request)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(request.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
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
            <p className="text-gray-500 mb-4">
              Coba ubah filter pencarian Anda
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                icon={<i className="fas fa-times"></i>}
              >
                Hapus Semua Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashRequestTable;