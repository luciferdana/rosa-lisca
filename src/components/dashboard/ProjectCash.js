import React, { useState } from 'react';
import CashDashboard from '../cash/CashDashboard';
import CashTransactionsTable from '../cash/CashTransactionsTable';
import CashInputForm from '../cash/CashInputForm';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { 
  calculateCashSummary 
} from '../../utils/calculations';

const ProjectCash = ({
  project,
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await onUpdateTransaction(editingTransaction.id, transactionData);
      } else {
        await onAddTransaction(transactionData);
      }
      setShowTransactionForm(false);
      setEditingTransaction(null);
      setActiveTab('transactions'); // Switch to transactions tab to see the new data
    } catch (error) {
      // Error is already handled in parent component
      console.error('Error saving transaction:', error);
    }
  };

  const handleCloseTransactionForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      onDeleteTransaction(transactionId);
    }
  };

  // Calculate cash summary
  const cashSummary = calculateCashSummary(transactions);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
    { id: 'transactions', label: 'Transaksi', icon: 'fas fa-list' },
    { id: 'form', label: 'Tambah Transaksi', icon: 'fas fa-plus-circle' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <CashDashboard
            project={project}
            transactions={transactions}
            cashSummary={cashSummary}
          />
        );
      
      case 'transactions':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Daftar Transaksi
                </h2>
                <p className="text-gray-600">
                  Kelola transaksi kas untuk proyek {project.name}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setActiveTab('form')}
                icon={<i className="fas fa-plus"></i>}
              >
                Tambah Transaksi
              </Button>
            </div>

            <CashTransactionsTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        );
      
      case 'form':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h2>
            <CashInputForm
              transaction={editingTransaction}
              onSave={handleSaveTransaction}
              onCancel={() => setActiveTab('transactions')}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Kas Proyek
          </h1>
          <p className="text-gray-600">
            Kelola kas dan transaksi untuk proyek {project.name}
          </p>
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

        {/* Transaction Form Modal */}
        <Modal
          isOpen={showTransactionForm}
          onClose={handleCloseTransactionForm}
          title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          size="lg"
        >
          <CashInputForm
            transaction={editingTransaction}
            onSave={handleSaveTransaction}
            onCancel={handleCloseTransactionForm}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProjectCash;
