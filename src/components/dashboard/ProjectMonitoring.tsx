'use client';

import React, { useState } from 'react';
import BillingTable from '../monitoring/ProjectBillingsTable';
import BillingForm from '../monitoring/BillingForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

interface ProjectMonitoringProps {
  project: any;
  billings: any[];
  onAddBilling: (billing: any) => void;
  onUpdateBilling: (id: any, billing: any) => void;
  onDeleteBilling: (id: any) => void;
  onUpdateProject: (project: any) => void;
  onUpdateBillingStatus: (id: any, status: any) => void;
}

const ProjectMonitoring: React.FC<ProjectMonitoringProps> = ({
  project,
  billings,
  onAddBilling,
  onUpdateBilling,
  onDeleteBilling,
  onUpdateProject,
  onUpdateBillingStatus
}) => {
  const [showBillingForm, setShowBillingForm] = useState(false);
  const [editingBilling, setEditingBilling] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddBilling = () => {
    setEditingBilling(null);
    setShowBillingForm(true);
  };

  const handleEditBilling = (billing: any) => {
    setEditingBilling(billing);
    setShowBillingForm(true);
  };

  const handleSaveBilling = (billingData: any) => {
    if (editingBilling) {
      onUpdateBilling(editingBilling.id, billingData);
    } else {
      onAddBilling(billingData);
    }
    setShowBillingForm(false);
    setEditingBilling(null);
  };

  const handleCloseBillingForm = () => {
    setShowBillingForm(false);
    setEditingBilling(null);
  };

  // Calculate project summary
  const totalBillings = billings.reduce((sum, billing) => sum + (billing.jumlah || 0), 0);
  const paidBillings = billings
    .filter(billing => billing.status === 'Dibayar')
    .reduce((sum, billing) => sum + (billing.jumlah || 0), 0);
  const pendingBillings = billings
    .filter(billing => billing.status === 'Belum Dibayar')
    .reduce((sum, billing) => sum + (billing.jumlah || 0), 0);

  const progress = project.contractValue ? ((totalBillings / project.contractValue) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Monitoring Proyek
          </h1>
          <p className="text-gray-600">
            Monitor progress dan tagihan untuk {project.name}
          </p>
        </div>

        {/* Project Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <i className="fas fa-project-diagram text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Nilai Kontrak</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(project.contractValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <i className="fas fa-file-invoice-dollar text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Tagihan</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBillings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Belum Dibayar</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(pendingBillings)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <i className="fas fa-percentage text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {progress.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Proyek</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0%</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line' },
                { id: 'billings', label: 'Tagihan', icon: 'fas fa-file-invoice' }
              ].map((tab) => (
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Proyek</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Proyek
                    </label>
                    <p className="text-gray-900">{project.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      project.status === 'Berjalan' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nilai Kontrak
                    </label>
                    <p className="text-gray-900">{formatCurrency(project.contractValue)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uang Muka
                    </label>
                    <p className="text-gray-900">{formatCurrency(project.downPayment)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Tagihan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Tagihan</p>
                    <p className="text-xl font-bold text-blue-600">{billings.length}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Sudah Dibayar</p>
                    <p className="text-xl font-bold text-green-600">
                      {billings.filter((b: any) => b.status === 'Dibayar').length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Belum Dibayar</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {billings.filter((b: any) => b.status === 'Belum Dibayar').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Daftar Tagihan
                  </h2>
                  <p className="text-gray-600">
                    Kelola tagihan untuk proyek {project.name}
                  </p>
                </div>                <Button
                  variant="primary"
                  onClick={handleAddBilling}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tambah Tagihan
                </Button>
              </div>              <BillingTable
                billings={billings}
                onEdit={handleEditBilling}
                onDelete={onDeleteBilling}
              />
            </div>
          )}
        </div>

        {/* Billing Form Modal */}
        <Modal
          isOpen={showBillingForm}
          onClose={handleCloseBillingForm}
          title={editingBilling ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
          size="lg"
        >
          <BillingForm
            billing={editingBilling}
            onSave={handleSaveBilling}
            onCancel={handleCloseBillingForm}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProjectMonitoring;