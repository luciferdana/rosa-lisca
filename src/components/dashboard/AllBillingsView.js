import { useState } from 'react';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import BillingStatusModal from '../common/BillingStatusModal';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { BILLING_STATUS_OPTIONS, BILLING_STATUS } from '../../constants/billingStatus';

const AllBillingsView = ({ projects, billings, onUpdateBillingStatus, onSelectProject }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    projectId: '',
    sortBy: 'tanggalJatuhTempo'
  });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    billing: null
  });

  // Get all billings from all projects
  const getAllBillings = () => {
    const allBillings = [];
    Object.entries(billings).forEach(([projectId, projectBillings]) => {
      projectBillings.forEach(billing => {
        allBillings.push({
          ...billing,
          projectId: parseInt(projectId)
        });
      });
    });
    return allBillings;
  };

  const allBillings = getAllBillings();

  // Filter billings
  const filteredBillings = allBillings.filter(billing => {
    const matchesSearch = filters.search === '' || filters.search === null || filters.search === undefined ||
      billing.uraian.toLowerCase().includes(filters.search.toLowerCase()) ||
      billing.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
      billing.nomorFaktur.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === '' || filters.status === null || filters.status === undefined || billing.status === filters.status;
    const matchesProject = filters.projectId === '' || filters.projectId === null || filters.projectId === undefined || billing.projectId === parseInt(filters.projectId);

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Sort billings
  const sortedBillings = [...filteredBillings].sort((a, b) => {
    switch (filters.sortBy) {
      case 'tanggalJatuhTempo':
        // Prioritize unpaid bills, then sort by due date
        if (a.status === 'Belum Dibayar' && b.status !== 'Belum Dibayar') return -1;
        if (b.status === 'Belum Dibayar' && a.status !== 'Belum Dibayar') return 1;
        return new Date(a.tanggalJatuhTempo) - new Date(b.tanggalJatuhTempo);
      
      case 'nilaiTagihan':
        return b.nilaiTagihan - a.nilaiTagihan;
      
      case 'projectName':
        return a.projectName.localeCompare(b.projectName);
      
      case 'tanggalMasukBerkas':
        return new Date(b.tanggalMasukBerkas) - new Date(a.tanggalMasukBerkas);
      
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Belum Dibayar': return 'bg-red-100 text-red-800 border-red-200';
      case 'Dibayar': return 'bg-green-100 text-green-800 border-green-200';
      case 'Dibayar (Retensi Belum Dibayarkan)': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case BILLING_STATUS.BELUM_DIBAYAR: return 'fas fa-clock';
      case BILLING_STATUS.DIBAYAR: return 'fas fa-check-circle';
      case BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN: return 'fas fa-exclamation-triangle';
      default: return 'fas fa-circle';
    }
  };

  const getDaysDifference = (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (billing) => {
    if (billing.status !== BILLING_STATUS.BELUM_DIBAYAR) return '';
    
    const days = getDaysDifference(billing.tanggalJatuhTempo);
    if (days < 0) return 'bg-red-50 border-l-4 border-red-500'; // Overdue
    if (days <= 7) return 'bg-orange-50 border-l-4 border-orange-500'; // Due soon
    if (days <= 14) return 'bg-yellow-50 border-l-4 border-yellow-500'; // Due in 2 weeks
    return '';
  };

  const canChangeToRetensiDibayar = (billing) => {
    // Check if all other billings in the same project are paid
    const projectBillings = billings[billing.projectId] || [];
    const allOtherBillingsArePaid = projectBillings
      .filter(b => b.id !== billing.id)
      .every(b => b.status === BILLING_STATUS.DIBAYAR || b.status === BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN);
    
    return billing.status === 'Dibayar (Retensi Belum Dibayarkan)' && allOtherBillingsArePaid;
  };

  const handleOpenStatusModal = (billing) => {
    setStatusModal({
      isOpen: true,
      billing
    });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({
      isOpen: false,
      billing: null
    });
  };

  const handleUpdateStatus = async (billingId, newStatus) => {
    await onUpdateBillingStatus(billingId, newStatus);
  };

  // Calculate statistics
  const stats = {
    total: allBillings.length,
    belumDibayar: allBillings.filter(b => b.status === 'Belum Dibayar').length,
    dibayar: allBillings.filter(b => b.status === BILLING_STATUS.DIBAYAR).length,
    retensiPending: allBillings.filter(b => b.status === BILLING_STATUS.DIBAYAR_RETENSI_BELUM_DIBAYARKAN).length,
    totalNilai: allBillings.reduce((sum, b) => sum + b.nilaiTagihan, 0),
    totalDibayar: allBillings.filter(b => b.status !== 'Belum Dibayar').reduce((sum, b) => sum + b.nilaiMasukRekening, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Semua Tagihan Proyek</h2>
          <p className="text-gray-600">Monitoring tagihan dari seluruh proyek</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-3">
              <i className="fas fa-file-invoice text-blue-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Tagihan</p>
              <p className="text-lg font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.totalNilai)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-3">
              <i className="fas fa-clock text-red-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Belum Dibayar</p>
              <p className="text-lg font-bold text-red-600">{stats.belumDibayar}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-3">
              <i className="fas fa-exclamation-triangle text-yellow-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Retensi Pending</p>
              <p className="text-lg font-bold text-yellow-600">{stats.retensiPending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-3">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Sudah Dibayar</p>
              <p className="text-lg font-bold text-green-600">{stats.dibayar}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.totalDibayar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Cari tagihan, proyek, atau nomor faktur..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            icon={<i className="fas fa-search"></i>}
          />
          
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            options={BILLING_STATUS_OPTIONS}
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
              { value: 'tanggalJatuhTempo', label: 'Jatuh Tempo Terdekat' },
              { value: 'nilaiTagihan', label: 'Nilai Terbesar' },
              { value: 'projectName', label: 'Nama Proyek' },
              { value: 'tanggalMasukBerkas', label: 'Terbaru' }
            ]}
          />
        </div>
      </div>

      {/* Billings Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Tagihan ({sortedBillings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyek</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uraian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nilai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBillings.map((billing) => {
                const daysDiff = getDaysDifference(billing.tanggalJatuhTempo);
                const urgencyColor = getUrgencyColor(billing);
                
                return (
                  <tr key={billing.id} className={`hover:bg-gray-50 ${urgencyColor}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{billing.projectName}</div>
                      <div className="text-xs text-gray-500">{billing.nomorFaktur}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{billing.uraian}</div>
                      <div className="text-xs text-gray-500">
                        Masuk: {formatDateShort(billing.tanggalMasukBerkas)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDateShort(billing.tanggalJatuhTempo)}</div>
                      {billing.status === BILLING_STATUS.BELUM_DIBAYAR && (
                        <div className={`text-xs font-medium ${
                          daysDiff < 0 ? 'text-red-600' : 
                          daysDiff <= 7 ? 'text-orange-600' : 
                          daysDiff <= 14 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {daysDiff < 0 ? `Terlambat ${Math.abs(daysDiff)} hari` :
                           daysDiff === 0 ? 'Jatuh tempo hari ini' :
                           `${daysDiff} hari lagi`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(billing.nilaiTagihan)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Diterima: {formatCurrency(billing.nilaiMasukRekening)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenStatusModal(billing)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border hover:opacity-80 transition-opacity cursor-pointer ${getStatusColor(billing.status)}`}
                      >
                        <i className={`${getStatusIcon(billing.status)} mr-1`}></i>
                        {billing.status}
                      </button>
                      {billing.status === 'Dibayar (Retensi Belum Dibayarkan)' && (
                        <div className="text-xs text-gray-600 mt-1">
                          Retensi: {formatCurrency(billing.retensi5Persen)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => onSelectProject(projects.find(p => p.id === billing.projectId), 'monitoring')}
                          icon={<i className="fas fa-external-link-alt"></i>}
                        >
                          Detail
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => handleOpenStatusModal(billing)}
                          icon={<i className="fas fa-edit"></i>}
                        >
                          Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedBillings.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Tidak ada tagihan ditemukan
            </h3>
            <p className="text-gray-500">
              Coba ubah filter pencarian Anda
            </p>
          </div>
        )}
      </div>

      {/* Billing Status Modal */}
      <BillingStatusModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        billing={statusModal.billing}
        onUpdateStatus={handleUpdateStatus}
        canChangeToRetensiDibayar={statusModal.billing ? canChangeToRetensiDibayar(statusModal.billing) : false}
      />
    </div>
  );
};

export default AllBillingsView;