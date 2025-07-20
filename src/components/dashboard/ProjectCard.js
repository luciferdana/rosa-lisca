import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { calculateProjectProgress } from '../../utils/calculations';
import Button from '../common/Button';

const ProjectCard = ({ project, onSelect, onEditProject, onDeleteProject }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { progressPercent, remainingAmount } = calculateProjectProgress(project);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleEdit = () => {
    setShowDropdown(false);
    if (onEditProject) {
      onEditProject(project);
    }
  };

  const handleDelete = () => {
    setShowDropdown(false);
    if (onDeleteProject) {
      if (window.confirm(`Apakah Anda yakin ingin menghapus proyek "${project.name}"?`)) {
        onDeleteProject(project.id);
      }
    }
  };
  
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 border border-gray-100 hover:border-blue-200">      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {project.name}
          </h3>
          <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            <i className={`${getStatusIcon(project.status)} mr-1`}></i>
            <span className="truncate">{project.status}</span>
          </div>
        </div>
        
        {/* Three-dot dropdown menu */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Menu opsi proyek"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <i className="fas fa-edit mr-2 text-blue-500"></i>
                <span className="hidden sm:inline">Edit Proyek</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <i className="fas fa-trash mr-2 text-red-500"></i>
                <span className="hidden sm:inline">Hapus Proyek</span>
                <span className="sm:hidden">Hapus</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs sm:text-sm">Total Tagihan:</span>
          <span className="font-semibold text-gray-800 text-xs sm:text-sm">
            {formatCurrency(project.totalTagihan)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs sm:text-sm">Total Lunas:</span>
          <span className="font-semibold text-green-600 text-xs sm:text-sm">
            {formatCurrency(project.totalLunas)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs sm:text-sm">Sisa Tagihan:</span>
          <span className={`font-semibold text-xs sm:text-sm ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
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
      </div>      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSelect(project, 'monitoring')}
          className="w-full justify-center text-xs sm:text-sm"
          icon={<i className="fas fa-chart-line"></i>}
        >
          <span className="hidden sm:inline">Monitoring Proyek</span>
          <span className="sm:hidden">Monitoring</span>
        </Button>
        
        <Button
          variant="success"
          size="sm"
          onClick={() => onSelect(project, 'cash')}
          className="w-full justify-center text-xs sm:text-sm"
          icon={<i className="fas fa-money-bill-wave"></i>}
        >
          <span className="hidden sm:inline">Kas Proyek</span>
          <span className="sm:hidden">Kas</span>
        </Button>
        
        <Button
          variant="info"
          size="sm"
          onClick={() => onSelect(project, 'cash-request')}
          className="w-full justify-center text-xs sm:text-sm"
          icon={<i className="fas fa-file-invoice-dollar"></i>}
        >
          <span className="hidden sm:inline">Pengajuan Kas</span>
          <span className="sm:hidden">Pengajuan</span>
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;