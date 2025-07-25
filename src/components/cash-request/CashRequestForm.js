'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Input, { Textarea } from '../common/Input';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import { formatCurrency, parseNumber } from '../../utils/formatters';

const CashRequestForm = ({ cashRequest, onSave, onCancel }) => {  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestedBy: 'Admin Rosa Lisca',
    bankAccount: '900000708490 - Bank Mandiri',
    attachmentUrl: '',
    attachmentFileId: null,
    ...cashRequest,
    // Ensure requestedBy is always a string
    requestedBy: cashRequest?.requestedBy ? 
      (typeof cashRequest.requestedBy === 'string' ? cashRequest.requestedBy : cashRequest.requestedBy?.name || 'Admin Rosa Lisca') 
      : 'Admin Rosa Lisca'
  });
    const [items, setItems] = useState(
    cashRequest?.items ? 
      cashRequest.items.map(item => ({
        id: item.id || Date.now() + Math.random(),
        qty: item.quantity || item.qty || 1,
        unit: item.unit || 'bh',
        description: item.itemName || item.description || '',
        unitPrice: item.unitPrice || 0,
        total: item.totalPrice || item.total || 0
      })) :
      [{ id: Date.now(), qty: 1, unit: 'bh', description: '', unitPrice: 0, total: 0 }]
  );
    const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-calculate total when qty or unitPrice changes
        if (field === 'qty' || field === 'unitPrice') {
          const qty = parseNumber(field === 'qty' ? value : updatedItem.qty);
          const unitPrice = parseNumber(field === 'unitPrice' ? value : updatedItem.unitPrice);
          updatedItem.total = qty * unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      qty: 1,
      unit: 'bh',
      description: '',
      unitPrice: 0,
      total: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (itemId) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Judul pengajuan harus diisi';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    }
    
    if (!formData.requestedBy.trim()) {
      newErrors.requestedBy = 'Nama pengaju harus diisi';
    }
    
    // Validate items
    const invalidItems = items.filter(item => 
      !item.description.trim() || item.unitPrice <= 0 || item.qty <= 0
    );
    
    if (invalidItems.length > 0) {
      newErrors.items = 'Semua item harus memiliki deskripsi, qty, dan harga yang valid';
    }
    
    if (calculateTotalAmount() <= 0) {
      newErrors.total = 'Total pengajuan harus lebih dari 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const requestData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          qty: parseNumber(item.qty),
          unitPrice: parseNumber(item.unitPrice),
          total: parseNumber(item.total)
        })),
        totalAmount: calculateTotalAmount(),
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      };
      
      onSave(requestData);
    } catch (error) {
      console.error('Error saving cash request:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
    } finally {
      setLoading(false);    }
  };

  const totalAmount = calculateTotalAmount();

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Judul Pengajuan"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: PMD 2018 PEMASANGAN PIPA AIR LIMBAH"
            error={errors.title}
            required
          />
        </div>

        <Input
          label="Nama Pengaju"
          name="requestedBy"
          value={formData.requestedBy}
          onChange={handleChange}
          placeholder="Nama lengkap pengaju"
          error={errors.requestedBy}
          required
        />

        <Input
          label="Rekening Tujuan"
          name="bankAccount"
          value={formData.bankAccount}
          onChange={handleChange}
          placeholder="Nomor rekening - Bank"
          error={errors.bankAccount}
          required
        />

        <div className="md:col-span-2">
          <Textarea
            label="Deskripsi Pengajuan"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan detail pengajuan dan tujuan penggunaan dana..."
            rows={3}
            error={errors.description}
            required
          />
        </div>
      </div>      {/* Items Section */}
      <div className="border-t pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-medium text-gray-700">
            Detail Item Pengajuan
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            icon={<i className="fas fa-plus"></i>}
            className="w-full sm:w-auto"
          >
            Tambah Item
          </Button>
        </div>

        {errors.items && (
          <div className="mb-4 text-red-600 text-sm">{errors.items}</div>
        )}

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          {/* Mobile Table Header - Hidden on desktop */}
          <div className="sm:hidden mb-3">
            <div className="text-sm font-medium text-gray-700 bg-white p-3 rounded">
              Item Details
            </div>
          </div>

          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-700 bg-white p-3 rounded">
            <div className="col-span-1">Qty</div>
            <div className="col-span-1">Unit</div>
            <div className="col-span-4">Deskripsi/Uraian</div>
            <div className="col-span-2">Harga Satuan</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Aksi</div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 bg-white p-3 rounded border">
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    min="1"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                    required
                  >
                    <option value="bh">bh</option>
                    <option value="pcs">pcs</option>
                    <option value="unit">unit</option>
                    <option value="set">set</option>
                    <option value="kg">kg</option>
                    <option value="meter">meter</option>
                    <option value="m2">m2</option>
                    <option value="m3">m3</option>
                    <option value="liter">liter</option>
                    <option value="kaleng">kaleng</option>
                    <option value="zak">zak</option>
                    <option value="dus">dus</option>
                    <option value="roll">roll</option>
                    <option value="ls">ls</option>
                    <option value="lot">lot</option>
                  </select>
                </div>
                
                <div className="col-span-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Deskripsi item..."
                    className="w-full px-2 py-1 border rounded text-sm"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-2 py-1 border rounded text-sm"
                    min="0"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <div className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                    {formatCurrency(item.total)}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="danger"
                    size="xs"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    icon={<i className="fas fa-trash"></i>}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex justify-end">
            <div className="bg-blue-100 px-4 py-3 rounded-lg">
              <div className="text-sm text-blue-700">Total Pengajuan:</div>
              <div className="text-xl font-bold text-blue-800">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>      {/* File Upload */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lampiran Dokumen
          <span className="text-gray-500 font-normal ml-1">(Maksimal 5MB)</span>
        </label>
        
        <ImageUpload
          onUpload={(url, fileId) => {
            setFormData(prev => ({
              ...prev,
              attachmentUrl: url,
              attachmentFileId: fileId
            }));
            // Clear error
            setErrors(prev => ({
              ...prev,
              attachmentFile: ''
            }));
          }}
          currentImage={formData.attachmentUrl}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="w-full"
        />
        
        {errors.attachmentFile && (
          <p className="mt-1 text-sm text-red-600">{errors.attachmentFile}</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">Ringkasan Pengajuan</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Jumlah Item:</span>
            <div className="font-medium text-gray-800">{items.length} item</div>
          </div>
          
          <div>
            <span className="text-gray-600">Total Pengajuan:</span>
            <div className="font-bold text-lg text-blue-600">
              {formatCurrency(totalAmount)}
            </div>
          </div>
            <div>
            <span className="text-gray-600">Pengaju:</span>
            <div className="font-medium text-gray-800">
              {typeof formData.requestedBy === 'string' ? formData.requestedBy : formData.requestedBy?.name || 'Unknown'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Status:</span>
            <div className="font-medium text-yellow-600">Pending Review</div>
          </div>
        </div>
      </div>

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
          icon={<i className="fas fa-paper-plane"></i>}
        >
          {loading ? 'Mengirim...' : (cashRequest ? 'Update Pengajuan' : 'Kirim Pengajuan')}
        </Button>
      </div>
    </form>
  );
};

export default CashRequestForm;