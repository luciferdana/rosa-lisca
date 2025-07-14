import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { 
  generateCashFlowByMonth, 
  generateTransactionsByType 
} from '../../utils/calculations';

const CashDashboard = ({ project, transactions, cashSummary }) => {
  const monthlyData = generateCashFlowByMonth(transactions);
  const transactionsByType = generateTransactionsByType(transactions);

  // Get colors for pie chart
  const pieColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  // Calculate percentages for transaction types
  const totalTransactionValue = transactionsByType.reduce((sum, type) => sum + type.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <i className="fas fa-arrow-up text-green-600 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pemasukan</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(cashSummary.totalPemasukan)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <i className="fas fa-arrow-down text-red-600 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(cashSummary.totalPengeluaran)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`${cashSummary.saldo >= 0 ? 'bg-blue-100' : 'bg-yellow-100'} rounded-full p-3 mr-4`}>
              <i className={`fas fa-wallet ${cashSummary.saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'} text-xl`}></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Saldo Kas</p>
              <p className={`text-2xl font-bold ${cashSummary.saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                {formatCurrency(cashSummary.saldo)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <i className="fas fa-list text-purple-600 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Transaksi</p>
              <p className="text-2xl font-bold text-purple-600">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow by Month Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Arus Kas Bulanan
          </h3>
          
          {monthlyData.length > 0 ? (
            <div className="space-y-4">
              {monthlyData.slice(-6).map((month, index) => {
                const maxValue = Math.max(
                  ...monthlyData.map(m => Math.max(m.pemasukan, m.pengeluaran))
                );
                const pemasukanWidth = maxValue > 0 ? (month.pemasukan / maxValue) * 100 : 0;
                const pengeluaranWidth = maxValue > 0 ? (month.pengeluaran / maxValue) * 100 : 0;

                return (
                  <div key={month.month}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(month.month + '-01').toLocaleDateString('id-ID', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        Net: {formatCurrency(month.pemasukan - month.pengeluaran)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {/* Pemasukan Bar */}
                      <div className="flex items-center">
                        <span className="text-xs text-green-600 w-20">Masuk</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2">
                          <div 
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${pemasukanWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-24 text-right">
                          {formatCurrency(month.pemasukan)}
                        </span>
                      </div>
                      
                      {/* Pengeluaran Bar */}
                      <div className="flex items-center">
                        <span className="text-xs text-red-600 w-20">Keluar</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 mx-2">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${pengeluaranWidth}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-24 text-right">
                          {formatCurrency(month.pengeluaran)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-line text-3xl mb-3"></i>
              <p>Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Transaction Types Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribusi Jenis Transaksi
          </h3>
          
          {transactionsByType.length > 0 ? (
            <div className="space-y-3">
              {transactionsByType.slice(0, 8).map((type, index) => {
                const percentage = totalTransactionValue > 0 
                  ? (type.value / totalTransactionValue * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {type.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {type.count} transaksi
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: pieColors[index % pieColors.length]
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-16 text-right">
                            {percentage}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatCurrency(type.value)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {transactionsByType.length > 8 && (
                <div className="text-center pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    dan {transactionsByType.length - 8} jenis lainnya
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-chart-pie text-3xl mb-3"></i>
              <p>Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Transaksi Terbaru
          </h3>
          <span className="text-sm text-gray-600">
            5 transaksi terakhir
          </span>
        </div>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
              .slice(0, 5)
              .map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mr-3
                      ${transaction.jenis === 'Pemasukan' ? 'bg-green-100' : 'bg-red-100'}
                    `}>
                      <i className={`
                        fas ${transaction.jenis === 'Pemasukan' ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}
                      `}></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {transaction.deskripsi}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.perusahaan} • {transaction.jenisDetail}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`
                    font-semibold text-right
                    ${transaction.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {transaction.jenis === 'Pemasukan' ? '+' : '-'}
                    {formatCurrency(transaction.jumlah)}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-receipt text-3xl mb-3"></i>
            <p>Belum ada transaksi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashDashboard;