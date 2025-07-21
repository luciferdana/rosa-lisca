import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { formatCurrency } from '../../utils/formatters';
import { BILLING_STATUS_OPTIONS } from '../../constants/billingStatus';
import { frontendToBackendStatus } from '../../lib/statusMapping';

const BillingStatusModal = ({ 
  isOpen, 
  onClose, 
  billing, 
  onUpdateStatus,
  canChangeToRetensiDibayar = false 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(billing?.status || '');
  const [loading, setLoading] = useState(false);

  // Filter available status options based on current status and business rules
  const getAvailableStatuses = () => {
    if (!billing) return [];

    const allStatuses = BILLING_STATUS_OPTIONS.map(option => option.label);

    // Business rules for status transitions
    switch (billing.status) {
      case 'Belum Dibayar':
        // Can change to any paid status
        return allStatuses;
      
      case 'Dibayar (Retensi Belum Dibayarkan)':
        // Can change back to unpaid or to fully paid (if conditions met)
        if (canChangeToRetensiDibayar) {
          return allStatuses;
        } else {
          return allStatuses.filter(status => status !== 'Dibayar');
        }
      
      case 'Dibayar':
        // Can change back to any status (admin override)
        return allStatuses;
      
      default:
        return allStatuses;
    }
  };

  const availableStatuses = getAvailableStatuses();
  const handleSave = async () => {
    if (!selectedStatus || selectedStatus === billing.status) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert frontend status to backend format before sending to API
      const backendStatus = frontendToBackendStatus(selectedStatus);
      console.log('🔄 Converting status:', selectedStatus, '->', backendStatus);
      
      await onUpdateStatus(billing.id, backendStatus);
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Belum Dibayar':
        return 'Tagihan belum dilunasi sama sekali';
      case 'Dibayar (Retensi Belum Dibayarkan)':
        return `Tagihan sudah dibayar, namun retensi ${formatCurrency(billing?.retensi5Persen || 0)} masih ditahan`;
      case 'Dibayar':
        return 'Tagihan sudah dilunasi sepenuhnya termasuk retensi';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Belum Dibayar': return 'text-red-600 bg-red-50 border-red-200';
      case 'Dibayar': return 'text-green-600 bg-green-50 border-green-200';
      case 'Dibayar (Retensi Belum Dibayarkan)': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Belum Dibayar': return 'fas fa-clock';
      case 'Dibayar': return 'fas fa-check-circle';
      case 'Dibayar (Retensi Belum Dibayarkan)': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-circle';
    }
  };

  if (!billing) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Status Pembayaran"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            loading={loading}
            disabled={!selectedStatus || selectedStatus === billing.status}
          >
            Simpan Status
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Billing Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">{billing.uraian}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Proyek: <span className="font-medium">{billing.projectName}</span></div>
            <div>Nilai Tagihan: <span className="font-medium">{formatCurrency(billing.nilaiTagihan)}</span></div>
            <div>Nilai Masuk Rekening: <span className="font-medium">{formatCurrency(billing.nilaiMasukRekening)}</span></div>
            <div>Retensi 5%: <span className="font-medium">{formatCurrency(billing.retensi5Persen)}</span></div>
            <div>No. Faktur: <span className="font-medium">{billing.nomorFaktur}</span></div>
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Saat Ini
          </label>
          <div className={`
            flex items-center p-3 rounded-lg border
            ${getStatusColor(billing.status)}
          `}>
            <i className={`${getStatusIcon(billing.status)} mr-3`}></i>
            <div>
              <div className="font-medium">{billing.status}</div>
              <div className="text-xs">{getStatusDescription(billing.status)}</div>
            </div>
          </div>
        </div>

        {/* New Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubah ke Status Baru
          </label>
          <div className="space-y-3">
            {availableStatuses.map((status) => (
              <div
                key={status}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedStatus === status
                    ? `${getStatusColor(status)} border-2`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                  ${status === billing.status ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => {
                  if (status !== billing.status) {
                    setSelectedStatus(status);
                  }
                }}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    disabled={status === billing.status}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-1">
                    <i className={`${getStatusIcon(status)} mr-3 ${
                      selectedStatus === status ? '' : 'text-gray-400'
                    }`}></i>
                    <div className="flex-1">
                      <div className="font-medium">{status}</div>
                      <div className="text-xs text-gray-600">{getStatusDescription(status)}</div>
                    </div>
                  </div>
                  {status === billing.status && (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Rules Warning */}
        {billing.status === 'Dibayar (Retensi Belum Dibayarkan)' && !canChangeToRetensiDibayar && selectedStatus === 'Dibayar' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-0.5"></i>
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Peringatan</div>
                <div className="text-yellow-700 mt-1">
                  Retensi biasanya baru bisa dibayarkan setelah semua tagihan proyek lain sudah lunas. 
                  Dengan mengubah status ini, Anda mengabaikan aturan bisnis tersebut.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Impact */}
        {selectedStatus && selectedStatus !== billing.status && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
              <div className="text-sm">
                <div className="font-medium text-blue-800">Perubahan Status</div>                <div className="text-blue-700 mt-1">
                  Status akan berubah dari <strong>&quot;{billing.status}&quot;</strong> menjadi <strong>&quot;{selectedStatus}&quot;</strong>.
                  {selectedStatus !== 'Belum Dibayar' && !billing.tanggalPembayaran && (
                    <span> Tanggal pembayaran akan diset ke hari ini.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BillingStatusModal;