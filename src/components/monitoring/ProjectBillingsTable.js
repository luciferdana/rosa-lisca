import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

const ProjectBillingsTable = ({ billings, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('tanggalMasukBerkas');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter and sort billings
  const filteredBillings = billings.filter(billing =>
    billing.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    billing.nomorFaktur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedBillings = [...filteredBillings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  const calculateTotals = () => {
    return sortedBillings.reduce((totals, billing) => ({
      nilaiTagihan: totals.nilaiTagihan + (billing.nilaiTagihan || 0),
      nilaiKwintansi: totals.nilaiKwintansi + (billing.nilaiKwintansi || 0),
      dpp: totals.dpp + (billing.dpp || 0),
      ppn: totals.ppn + (billing.ppn11Persen || 0),
      pph: totals.pph + (billing.pph265Persen || 0),
      nilaiMasukRekening: totals.nilaiMasukRekening + (billing.nilaiMasukRekening || 0)
    }), {
      nilaiTagihan: 0,
      nilaiKwintansi: 0,
      dpp: 0,
      ppn: 0,
      pph: 0,
      nilaiMasukRekening: 0
    });
  };

  const totals = calculateTotals();

  if (billings.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <i className="fas fa-receipt text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Belum ada tagihan
        </h3>        <p className="text-gray-500">
          Klik tombol &quot;Tambah Tagihan&quot; untuk menambahkan tagihan pertama
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari berdasarkan uraian atau nomor faktur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<i className="fas fa-search"></i>}
          />
        </div>
        <div className="text-sm text-gray-600">
          {sortedBillings.length} dari {billings.length} tagihan
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto table-container">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('uraian')}
              >
                <div className="flex items-center gap-1">
                  Uraian
                  <i className={getSortIcon('uraian')}></i>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tanggalMasukBerkas')}
              >
                <div className="flex items-center gap-1">
                  Tanggal Masuk
                  <i className={getSortIcon('tanggalMasukBerkas')}></i>
                </div>
              </th>
              <th 
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nilaiTagihan')}
              >
                <div className="flex items-center justify-end gap-1">
                  Nilai Tagihan
                  <i className={getSortIcon('nilaiTagihan')}></i>
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pot. Uang Muka
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retensi 5%
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nilai Kwintansi
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPP
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                PPN 11%
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                PPH 2.65%
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nilai Masuk Rekening
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No. Faktur
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBillings.map((billing, index) => (
              <tr key={billing.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="font-medium">{billing.uraian}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateShort(billing.tanggalMasukBerkas)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(billing.nilaiTagihan)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(billing.potonganUangMuka)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(billing.retensi5Persen)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(billing.nilaiKwintansi)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(billing.dpp)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                  {formatCurrency(billing.ppn11Persen)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                  {formatCurrency(billing.pph265Persen)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 text-right font-bold">
                  {formatCurrency(billing.nilaiMasukRekening)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {billing.nomorFaktur}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onEdit(billing)}
                      icon={<i className="fas fa-edit"></i>}
                    >
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      onClick={() => onDelete(billing.id)}
                      icon={<i className="fas fa-trash"></i>}
                    >
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Totals Row */}
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td colSpan="3" className="px-4 py-4 text-sm text-gray-700">
                <strong>TOTAL ({sortedBillings.length} tagihan)</strong>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 text-right font-bold">
                {formatCurrency(totals.nilaiTagihan)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 text-right">
                -
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 text-right">
                -
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 text-right font-bold">
                {formatCurrency(totals.nilaiKwintansi)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900 text-right font-bold">
                {formatCurrency(totals.dpp)}
              </td>
              <td className="px-4 py-4 text-sm text-green-600 text-right font-bold">
                {formatCurrency(totals.ppn)}
              </td>
              <td className="px-4 py-4 text-sm text-red-600 text-right font-bold">
                {formatCurrency(totals.pph)}
              </td>
              <td className="px-4 py-4 text-sm text-blue-600 text-right font-bold">
                {formatCurrency(totals.nilaiMasukRekening)}
              </td>
              <td colSpan="2" className="px-4 py-4">
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProjectBillingsTable;