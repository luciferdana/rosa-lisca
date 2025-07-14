import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Textarea } from '../common/Input';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

const CashRequestDetailModal = ({ 
  isOpen, 
  onClose, 
  cashRequest, 
  onUpdateStatus 
}) => {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: '',
    comments: ''
  });

  if (!cashRequest) return null;

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

  const handleApprovalSubmit = async () => {
    if (!approvalData.status || !approvalData.comments.trim()) {
      alert('Silakan pilih status dan berikan komentar');
      return;
    }

    await onUpdateStatus(cashRequest.id, approvalData.status, approvalData.comments);
    setShowApprovalForm(false);
    setApprovalData({ status: '', comments: '' });
    onClose();
  };

  const handleStartApproval = (status) => {
    setApprovalData({ status, comments: '' });
    setShowApprovalForm(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengajuan Kas"
      size="xl"
      footer={
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {cashRequest.status === 'Pending' && !showApprovalForm && (
              <>
                <Button
                  variant="success"
                  onClick={() => handleStartApproval('Approved')}
                  icon={<i className="fas fa-check"></i>}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStartApproval('Rejected')}
                  icon={<i className="fas fa-times"></i>}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {cashRequest.title}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Pengajuan:</span>
                <span className="font-medium">{formatDateShort(cashRequest.requestDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pengaju:</span>
                <span className="font-medium">{cashRequest.requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pengajuan:</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(cashRequest.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rekening Tujuan:</span>
                <span className="font-medium">{cashRequest.bankAccount}</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(cashRequest.status)}`}>
                <i className={`${getStatusIcon(cashRequest.status)} mr-2`}></i>
                {cashRequest.status}
              </span>
            </div>
            
            {cashRequest.approvedBy && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {cashRequest.status === 'Approved' ? 'Disetujui oleh:' : 'Ditolak oleh:'}
                  </span>
                  <span className="font-medium">{cashRequest.approvedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium">{formatDateShort(cashRequest.approvedDate)}</span>
                </div>
              </div>
            )}
            
            {cashRequest.attachmentUrl && cashRequest.attachmentUrl !== '#' && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(cashRequest.attachmentUrl, '_blank')}
                  icon={<i className="fas fa-paperclip"></i>}
                >
                  Lihat Lampiran
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Deskripsi:</h4>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {cashRequest.description}
          </p>
        </div>

        {/* Items Table */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4">Detail Item ({cashRequest.items?.length || 0} item):</h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cashRequest.items?.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.qty}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                    TOTAL:
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                    {formatCurrency(cashRequest.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Approval Form */}
        {showApprovalForm && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-700 mb-4">
              {approvalData.status === 'Approved' ? 'Approve Pengajuan' : 'Reject Pengajuan'}
            </h4>
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${
                approvalData.status === 'Approved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  <i className={`${
                    approvalData.status === 'Approved' ? 'fas fa-check-circle text-green-600' : 'fas fa-times-circle text-red-600'
                  } mr-2`}></i>
                  <span className={`font-medium ${
                    approvalData.status === 'Approved' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Anda akan {approvalData.status === 'Approved' ? 'menyetujui' : 'menolak'} pengajuan ini
                  </span>
                </div>
              </div>
              
              <Textarea
                label="Komentar/Alasan"
                value={approvalData.comments}
                onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder={`Berikan alasan ${approvalData.status === 'Approved' ? 'persetujuan' : 'penolakan'}...`}
                rows={3}
                required
              />
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalForm(false)}
                >
                  Batal
                </Button>
                <Button
                  variant={approvalData.status === 'Approved' ? 'success' : 'danger'}
                  onClick={handleApprovalSubmit}
                  icon={<i className={`fas ${approvalData.status === 'Approved' ? 'fa-check' : 'fa-times'}`}></i>}
                >
                  {approvalData.status === 'Approved' ? 'Setujui' : 'Tolak'} Pengajuan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-4">
            History Pengajuan ({cashRequest.history?.length || 0} aktivitas)
          </h4>
          <div className="space-y-3">
            {cashRequest.history?.map((historyItem) => (
              <div key={historyItem.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${historyItem.action === 'Submitted' ? 'bg-blue-100 text-blue-600' :
                    historyItem.action === 'Approved' ? 'bg-green-100 text-green-600' :
                    historyItem.action === 'Rejected' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'}
                `}>
                  <i className={`fas ${
                    historyItem.action === 'Submitted' ? 'fa-paper-plane' :
                    historyItem.action === 'Approved' ? 'fa-check' :
                    historyItem.action === 'Rejected' ? 'fa-times' :
                    'fa-circle'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      {historyItem.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(historyItem.actionDate).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    oleh: <span className="font-medium">{historyItem.actionBy}</span>
                  </div>
                  {historyItem.comments && (
                    <div className="text-sm text-gray-700 bg-white p-2 rounded border-l-4 border-gray-200">
                      {historyItem.comments}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CashRequestDetailModal;