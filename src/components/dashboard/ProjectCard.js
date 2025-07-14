import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { calculateProjectProgress } from '../../utils/calculations';
import Button from '../common/Button';

const ProjectCard = ({ project, onSelect }) => {
  const { progressPercent, remainingAmount } = calculateProjectProgress(project);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Berjalan': return 'bg-green-100 text-green-800 border-green-200';
      case 'Selesai': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Mendatang': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Berjalan': return 'fas fa-play-circle';
      case 'Selesai': return 'fas fa-check-circle';
      case 'Mendatang': return 'fas fa-clock';
      default: return 'fas fa-circle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {project.name}
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            <i className={`${getStatusIcon(project.status)} mr-1`}></i>
            {project.status}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Total Tagihan:</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(project.totalTagihan)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Total Lunas:</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(project.totalLunas)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Sisa Tagihan:</span>
          <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(remainingAmount)}
          </span>
        </div>

        {/* Progress Bar */}
        {project.totalTagihan > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress Pembayaran</span>
              <span className="text-xs font-medium text-gray-700">
                {progressPercent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(project, 'monitoring')}
          className="w-full justify-center"
          icon={<i className="fas fa-chart-line"></i>}
        >
          Monitoring Proyek
        </Button>
        
        <Button
          variant="success"
          size="sm"
          onClick={() => onSelect(project, 'cash')}
          className="w-full justify-center"
          icon={<i className="fas fa-money-bill-wave"></i>}
        >
          Kas Proyek
        </Button>
        
        <Button
          variant="info"
          size="sm"
          onClick={() => onSelect(project, 'cash-request')}
          className="w-full justify-center"
          icon={<i className="fas fa-file-invoice-dollar"></i>}
        >
          Pengajuan Kas
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;