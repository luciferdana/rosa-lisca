'use client';

import { useState } from 'react';
import Image from 'next/image';
import Input, { Select, Textarea } from '../common/Input';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { formatCurrency, parseNumber, formatNumberInput } from '../../utils/formatters';
import { validateTransactionInput } from '../../utils/calculations';
import { dummyData } from '../../data/dummyData';
import { googleAPI } from '../../lib/googleAppsScript';

const CashInputForm = ({ transaction, onSave, onCancel }) => {  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jenis: '',
    jumlah: '',
    deskripsi: '',
    perusahaan: '',
    jenisDetail: '',
    buktiUrl: '',
    buktiFileId: null,
    ...transaction
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'jumlah') {
      // Remove leading zeros and keep only valid number format
      processedValue = formatNumberInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateTransactionInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type: formData.jenis === 'Pemasukan' ? 'PEMASUKAN' : 'PENGELUARAN',
        amount: parseNumber(formData.jumlah) || 0,
        description: formData.deskripsi,
        companyName: formData.perusahaan,
        category: formData.jenisDetail,
        transactionDate: formData.tanggal || new Date().toISOString().split('T')[0],
        receiptUrl: formData.buktiUrl || '',
        fileId: formData.buktiFileId || ''
      };
      
      // Call onSave dengan Google Apps Script integration
      await onSave(transactionData);
      
      // Reset form after successful save
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        jenis: '',
        jumlah: '',
        deskripsi: '',
        perusahaan: '',
        jenisDetail: '',
        buktiUrl: '',
        buktiFileId: null
      });
      
      setErrors({});
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Tanggal Transaksi"
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          error={errors.tanggal}
          required
        />        <Select
          label="Jenis Transaksi"
          name="jenis"
          value={formData.jenis}
          onChange={handleChange}
          options={dummyData.jenisTransaksi.map(jenis => ({ value: jenis, label: jenis }))}
          error={errors.jenis}
          required
        />

        <div>
          <Input
            label="Jumlah"
            type="number"
            name="jumlah"
            value={formData.jumlah}
            onChange={handleChange}
            placeholder="0"
            error={errors.jumlah}
            required
          />          <p className="text-sm text-gray-600 mt-1">
            {formatCurrency(parseNumber(formData.jumlah) || 0)}
          </p>
        </div>
      </div>

      {/* Description and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Perusahaan/Pihak Terkait"
          name="perusahaan"
          value={formData.perusahaan}
          onChange={handleChange}
          placeholder="Nama perusahaan atau pihak terkait"
          error={errors.perusahaan}
          required
        />        <Select
          label="Jenis Transaksi Detail"
          name="jenisDetail"
          value={formData.jenisDetail}
          onChange={handleChange}
          options={dummyData.jenisTransaksiDetail.map(jenis => ({ value: jenis, label: jenis }))}
          error={errors.jenisDetail}
          required
        />
      </div>      {/* Description */}
      <Textarea
        label="Deskripsi Transaksi"
        name="deskripsi"
        value={formData.deskripsi}
        onChange={handleChange}
        placeholder="Jelaskan detail transaksi..."
        rows={3}
        error={errors.deskripsi}
        required
      />

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bukti Transaksi
          <span className="text-gray-500 font-normal ml-1">(Maksimal 5MB)</span>
        </label>
          <ImageUpload
          onUpload={(url, fileId) => {
            setFormData(prev => ({
              ...prev,
              buktiUrl: url,
              buktiFileId: fileId
            }));
            // Clear error
            setErrors(prev => ({
              ...prev,
              buktiFile: ''
            }));
          }}
          currentImage={formData.buktiUrl}
          accept="image/*"
          uploadType="transaction"
          className="w-full"
        />
          {errors.buktiFile && (
          <p className="mt-1 text-sm text-red-600">{errors.buktiFile}</p>
        )}
      </div>

      {/* Summary Preview */}
      {formData.jenis && parseNumber(formData.jumlah) > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Ringkasan Transaksi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Jenis:</span>
              <div className={`font-semibold ${formData.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fas ${formData.jenis === 'Pemasukan' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                {formData.jenis}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Jumlah:</span>              <div className={`font-bold text-lg ${formData.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                {formData.jenis === 'Pemasukan' ? '+' : '-'}{formatCurrency(parseNumber(formData.jumlah) || 0)}
              </div>
            </div>
            
            {formData.perusahaan && (
              <div>
                <span className="text-gray-600">Perusahaan:</span>
                <div className="font-medium text-gray-800">{formData.perusahaan}</div>
              </div>
            )}
            
            {formData.jenisDetail && (
              <div>
                <span className="text-gray-600">Kategori:</span>
                <div className="font-medium text-gray-800">{formData.jenisDetail}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={<i className="fas fa-save"></i>}
        >
          {loading ? 'Menyimpan...' : (transaction ? 'Update Transaksi' : 'Simpan Transaksi')}
        </Button>
      </div>
    </form>
  );
};

export default CashInputForm;