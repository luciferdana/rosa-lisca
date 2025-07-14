import { useState } from 'react';
import Button from '../common/Button';
import Input, { Select } from '../common/Input';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { dummyData } from '../../data/dummyData';

const CashTransactionsTable = ({ transactions, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    search: '',
    jenis: '',
    jenisDetail: '',
    bulan: '',
    perusahaan: ''
  });
  const [sortField, setSortField] = useState('tanggal');
  const [sortDirection, setSortDirection] = useState('desc');

  // Get unique values for filter options
  const uniqueMonths = [...new Set(transactions.map(t => {
    const date = new Date(t.tanggal);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !filters.search || 
      transaction.deskripsi.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.perusahaan.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesJenis = !filters.jenis || transaction.jenis === filters.jenis;
    const matchesJenisDetail = !filters.jenisDetail || transaction.jenisDetail === filters.jenisDetail;
    const matchesPerusahaan = !filters.perusahaan || transaction.perusahaan === filters.perusahaan;
    
    const matchesBulan = !filters.bulan || (() => {
      const date = new Date(transaction.tanggal);
      const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === filters.bulan;
    })();

    return matchesSearch && matchesJenis && matchesJenisDetail && matchesPerusahaan && matchesBulan;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'fas fa-sort text-gray-400';
    return sortDirection === 'asc' 
      ? 'fas fa-sort-up text-blue-600' 
      : 'fas fa-sort-down text-blue-600';
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      jenis: '',
      jenisDetail: '',
      bulan: '',
      perusahaan: ''
    });
  };

  // Calculate totals for filtered transactions
  const totals = sortedTransactions.reduce((sum, transaction) => {
    if (transaction.jenis === 'Pemasukan') {
      sum.pemasukan += transaction.jumlah || 0;
    } else {
      sum.pengeluaran += transaction.jumlah || 0;
    }
    return sum;
  }, { pemasukan: 0, pengeluaran: 0 });

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-receipt text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Belum ada transaksi
        </h3>
        <p className="text-gray-500">
          Tambahkan transaksi pertama untuk mulai mengelola kas proyek
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Cari deskripsi atau perusahaan..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
          
          <Select
            value={filters.jenis}
            onChange={(e) => handleFilterChange('jenis', e.target.value)}
            options={[
              { value: '', label: 'Semua Jenis' },
              ...dummyData.jenisTransaksi.map(jenis => ({ value: jenis, label: jenis }))
            ]}
          />
          
          <Select
            value={filters.jenisDetail}
            onChange={(e) => handleFilterChange('jenisDetail', e.target.value)}
            options={[
              { value: '', label: 'Semua Kategori' },
              ...dummyData.jenisTransaksiDetail.map(jenis => ({ value: jenis, label: jenis }))
            ]}
          />
          
          <Select
            value={filters.bulan}
            onChange={(e) => handleFilterChange('bulan', e.target.value)}
            options={[
              { value: '', label: 'Semua Bulan' },
              ...uniqueMonths.map(month => ({
                value: month,
                label: new Date(month + '-01').toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long' 
                })
              }))
            ]}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                icon={<i className="fas fa-times"></i>}
              >
                Hapus Filter
              </Button>
            )}
            <span className="text-sm text-gray-600">
              {sortedTransactions.length} dari {transactions.length} transaksi
            </span>
          </div>
          
          {/* Summary for filtered results */}
          {sortedTransactions.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">
                Pemasukan: {formatCurrency(totals.pemasukan)}
              </span>
              <span className="text-red-600 font-medium">
                Pengeluaran: {formatCurrency(totals.pengeluaran)}
              </span>
              <span className={`font-bold ${totals.pemasukan - totals.pengeluaran >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                Net: {formatCurrency(totals.pemasukan - totals.pengeluaran)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {sortedTransactions.length > 0 ? (
        <div className="overflow-x-auto table-container">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tanggal')}
                >
                  <div className="flex items-center gap-1">
                    Tanggal
                    <i className={getSortIcon('tanggal')}></i>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jenis')}
                >
                  <div className="flex items-center gap-1">
                    Jenis
                    <i className={getSortIcon('jenis')}></i>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('deskripsi')}
                >
                  <div className="flex items-center gap-1">
                    Deskripsi
                    <i className={getSortIcon('deskripsi')}></i>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('perusahaan')}
                >
                  <div className="flex items-center gap-1">
                    Perusahaan
                    <i className={getSortIcon('perusahaan')}></i>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('jumlah')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Jumlah
                    <i className={getSortIcon('jumlah')}></i>
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bukti
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map((transaction, index) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateShort(transaction.tanggal)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${transaction.jenis === 'Pemasukan' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      <i className={`
                        fas ${transaction.jenis === 'Pemasukan' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1
                      `}></i>
                      {transaction.jenis}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="font-medium">{transaction.deskripsi}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {transaction.perusahaan}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {transaction.jenisDetail}
                    </span>
                  </td>
                  <td className={`
                    px-4 py-4 whitespace-nowrap text-sm text-right font-bold
                    ${transaction.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {transaction.jenis === 'Pemasukan' ? '+' : '-'}
                    {formatCurrency(transaction.jumlah)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {transaction.buktiUrl && transaction.buktiUrl !== '#' ? (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => window.open(transaction.buktiUrl, '_blank')}
                        icon={<i className="fas fa-image"></i>}
                      >
                        Lihat
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-xs">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onEdit(transaction)}
                        icon={<i className="fas fa-edit"></i>}
                      >
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => onDelete(transaction.id)}
                        icon={<i className="fas fa-trash"></i>}
                      >
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-search text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Tidak ada transaksi ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            Coba ubah filter atau kata kunci pencarian Anda
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
  );
};

export default CashTransactionsTable;