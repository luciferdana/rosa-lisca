import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { calculateProjectProgress } from '../../utils/calculations';
import { normalizeStatusToDisplay, getStatusColorSimple, getStatusIcon } from '../../utils/statusUtils';
import Button from '../common/Button';

const ProjectListView = ({ projects, onSelectProject, onEditProject, onDeleteProject }) => {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [showActions, setShowActions] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Berjalan': return 'text-green-600';
      case 'Selesai': return 'text-blue-600';
      case 'Mendatang': return 'text-yellow-600';
      default: return 'text-gray-600';
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
    <div className="bg-white rounded-lg shadow-md">
      <div className="divide-y divide-gray-200">
        {projects.map((project) => {
          const { progressPercent, remainingAmount } = calculateProjectProgress(project);
          const isHovered = hoveredProject === project.id;
          
          return (
            <div
              key={project.id}
              className="relative p-6 hover:bg-gray-50 transition-colors duration-200"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="flex items-center justify-between">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {project.name}
                    </h3>                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorSimple(project.status)}`}>
                      <i className={`${getStatusIcon(project.status)} mr-1`}></i>
                      {normalizeStatusToDisplay(project.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Tagihan:</span>
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(project.totalTagihan)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Total Lunas:</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(project.totalLunas)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Sisa Tagihan:</span>
                      <div className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(remainingAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {project.totalTagihan > 0 && (
                    <div className="mt-3">
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
                </div>                {/* Hover Menu */}
                {isHovered && (
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project, 'monitoring');
                        }}
                        className="w-full justify-start"
                        icon={<i className="fas fa-chart-line"></i>}
                      >
                        Monitoring Proyek
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project, 'cash');
                        }}
                        className="w-full justify-start"
                        icon={<i className="fas fa-money-bill-wave"></i>}
                      >
                        Kas Proyek
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project, 'cash-request');
                        }}
                        className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                        icon={<i className="fas fa-file-invoice-dollar"></i>}
                      >
                        Pengajuan Kas
                      </Button>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      {/* Edit & Delete */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProject(project);
                        }}
                        className="w-full justify-start border-orange-300 text-orange-600 hover:bg-orange-50"
                        icon={<i className="fas fa-edit"></i>}
                      >
                        Edit Proyek
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                        icon={<i className="fas fa-trash"></i>}
                      >
                        Hapus Proyek
                      </Button>
                    </div>
                  </div>
                )}

                {/* Arrow indicator when not hovered */}
                {!isHovered && (
                  <div className="text-gray-400">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectListView;