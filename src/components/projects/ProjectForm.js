'use client';

import { useState } from 'react';
import Input, { Select } from '../common/Input';
import Button from '../common/Button';
import { formatCurrency, parseNumber, formatNumberInput } from '../../utils/formatters';

const ProjectForm = ({ project, onSubmit, onSave, onCancel, loading }) => {  const [formData, setFormData] = useState({
    name: '',
    status: 'MENDATANG',
    contractValue: '',
    downPayment: '',
    ...project
  });const [errors, setErrors] = useState({});
  const [internalLoading, setInternalLoading] = useState(false);
  
  // Use external loading if provided, otherwise use internal
  const isLoading = loading !== undefined ? loading : internalLoading;
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'contractValue' || name === 'downPayment') {
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
  };  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nama proyek harus diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status proyek harus dipilih';
    }

    const contractValue = parseNumber(formData.contractValue);
    const downPayment = parseNumber(formData.downPayment) || 0; // Default to 0 if empty

    if (!contractValue || contractValue <= 0) {
      newErrors.contractValue = 'Nilai kontrak harus lebih dari 0';
    }

    if (downPayment < 0) {
      newErrors.downPayment = 'Uang muka tidak boleh negatif';
    }

    if (downPayment > contractValue) {
      newErrors.downPayment = 'Uang muka tidak boleh lebih besar dari nilai kontrak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Use external loading if provided, otherwise use internal
    if (loading === undefined) {
      setInternalLoading(true);
    }
      try {
      // Support both onSubmit (for new projects) and onSave (for editing)
      const submitHandler = onSubmit || onSave;
      
      // Convert string values to numbers before submitting
      const submitData = {
        ...formData,
        contractValue: parseNumber(formData.contractValue) || 0,
        downPayment: parseNumber(formData.downPayment) || 0
      };
      
      await submitHandler(submitData);
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
    } finally {
      if (loading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  const statusOptions = [
    { value: 'MENDATANG', label: 'Mendatang' },
    { value: 'BERJALAN', label: 'Berjalan' },
    { value: 'SELESAI', label: 'Selesai' }
  ];
  // Calculate down payment percentage
  const contractValue = parseNumber(formData.contractValue) || 0;
  const downPayment = parseNumber(formData.downPayment) || 0;
  const downPaymentPercent = contractValue > 0 
    ? ((downPayment / contractValue) * 100).toFixed(1)
    : 0;

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
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">
          Informasi Dasar Proyek
        </h3>
        
        <Input
          label="Nama Proyek"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama proyek..."
          error={errors.name}
          required
        />

        <Select
          label="Status Proyek"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          error={errors.status}
          required
        />
      </div>

      {/* Financial Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Informasi Finansial
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Nilai Kontrak"
              type="number"
              name="contractValue"
              value={formData.contractValue}
              onChange={handleChange}
              placeholder="0"
              error={errors.contractValue}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(formData.contractValue)}
            </p>
          </div>          <div>
            <Input
              label="Uang Muka (Opsional)"
              type="number"
              name="downPayment"
              value={formData.downPayment}
              onChange={handleChange}
              placeholder="0"
              error={errors.downPayment}
            />
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(formData.downPayment)}
              {downPaymentPercent > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  ({downPaymentPercent}% dari nilai kontrak)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Preview */}
      {formData.name && formData.contractValue > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border-t">
          <h4 className="font-medium text-gray-700 mb-3">Ringkasan Proyek</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nama Proyek:</span>
              <div className="font-medium text-gray-800">{formData.name}</div>
            </div>
            
            <div>
              <span className="text-gray-600">Status:</span>
              <div className={`font-medium ${
                formData.status === 'SELESAI' ? 'text-green-600' :
                formData.status === 'BERJALAN' ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {statusOptions.find(opt => opt.value === formData.status)?.label}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Nilai Kontrak:</span>
              <div className="font-bold text-blue-600">
                {formatCurrency(formData.contractValue)}
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Uang Muka:</span>
              <div className="font-medium text-gray-800">
                {formatCurrency(formData.downPayment)}
                {downPaymentPercent > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({downPaymentPercent}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          icon={<i className="fas fa-save"></i>}
        >
          {isLoading ? 'Menyimpan...' : (project ? 'Update Proyek' : 'Simpan Proyek')}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
