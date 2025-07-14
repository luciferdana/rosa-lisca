'use client';

import React, { useState, useEffect } from 'react';
import Input, { Select } from '../common/Input';
import Button from '../common/Button';
import { formatCurrency, parseNumber } from '../../utils/formatters';
import { calculateBillingDetails, validateBillingInput } from '../../utils/calculations';
import { dummyData } from '../../data/dummyData';

const BillingForm = ({ billing, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    uraian: '',
    tanggalMasukBerkas: '',
    tanggalJatuhTempo: '',
    nilaiTagihan: 0,
    potonganUangMuka: 0,
    nilaiKwintansi: 0,
    nomorFaktur: '',
    status: 'Belum Dibayar',
    ...billing
  });
  const [errors, setErrors] = useState({});
  const [calculatedValues, setCalculatedValues] = useState({});
  const [loading, setLoading] = useState(false);
  // Calculate billing details whenever relevant fields change
  useEffect(() => {
    const calculated = calculateBillingDetails(formData);
    setCalculatedValues(calculated);
  }, [formData.nilaiKwintansi, formData.potonganUangMuka, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name.includes('nilai') || name.includes('potongan')
      ? parseNumber(value)
      : value;

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
  };

  const handleAutoFillKwintansi = () => {
    if (formData.nilaiTagihan > 0) {
      setFormData(prev => ({
        ...prev,
        nilaiKwintansi: prev.nilaiTagihan
      }));
    }
  };

  const handleAutoFillJatuhTempo = () => {
    if (formData.tanggalMasukBerkas) {
      // Auto-fill with 30 days after tanggal masuk berkas
      const masukDate = new Date(formData.tanggalMasukBerkas);
      masukDate.setDate(masukDate.getDate() + 30);
      const jatuhTempo = masukDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        tanggalJatuhTempo: jatuhTempo
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateBillingInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const billingData = {
        ...formData,
        ...calculatedValues,
        tanggalMasukBerkas: formData.tanggalMasukBerkas || new Date().toISOString().split('T')[0],
        tanggalJatuhTempo: formData.tanggalJatuhTempo || formData.tanggalMasukBerkas,
        tanggalPembayaran: formData.status !== 'Belum Dibayar' ? 
          (formData.tanggalPembayaran || new Date().toISOString().split('T')[0]) : null,
        retensiDibayar: formData.status === 'Dibayar'
      };
      
      onSave(billingData);
    } catch (error) {
      console.error('Error saving billing:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Uraian Tagihan"
            name="uraian"
            value={formData.uraian}
            onChange={handleChange}
            placeholder="Contoh: Tagihan Termin 1 - Pekerjaan Pondasi"
            error={errors.uraian}
            required
          />
        </div>

        <div>
          <Input
            label="Tanggal Masuk Berkas"
            type="date"
            name="tanggalMasukBerkas"
            value={formData.tanggalMasukBerkas}
            onChange={handleChange}
            error={errors.tanggalMasukBerkas}
            required
          />
        </div>

        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="Tanggal Jatuh Tempo"
                type="date"
                name="tanggalJatuhTempo"
                value={formData.tanggalJatuhTempo}
                onChange={handleChange}
                error={errors.tanggalJatuhTempo}
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillJatuhTempo}
              title="Isi otomatis +30 hari dari tanggal masuk"
              icon={<i className="fas fa-calendar-plus"></i>}
            >
            </Button>
          </div>
        </div>

        <Input
          label="Nomor Faktur"
          name="nomorFaktur"
          value={formData.nomorFaktur}
          onChange={handleChange}
          placeholder="Contoh: FK001/2024"
          error={errors.nomorFaktur}
        />

        <Select
          label="Status Pembayaran"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={dummyData.statusTagihan}
          error={errors.status}
          required
        />
      </div>

      {/* Financial Values */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Nilai Finansial
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Nilai Tagihan"
              type="number"
              name="nilaiTagihan"
              value={formData.nilaiTagihan}
              onChange={handleChange}
              placeholder="0"
              error={errors.nilaiTagihan}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(formData.nilaiTagihan)}
            </p>
          </div>

          <div>
            <Input
              label="Potongan Uang Muka"
              type="number"
              name="potonganUangMuka"
              value={formData.potonganUangMuka}
              onChange={handleChange}
              placeholder="0"
              error={errors.potonganUangMuka}
            />
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(formData.potonganUangMuka)}
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Nilai Kwintansi"
                  type="number"
                  name="nilaiKwintansi"
                  value={formData.nilaiKwintansi}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.nilaiKwintansi}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillKwintansi}
                title="Isi otomatis dengan nilai tagihan"
                icon={<i className="fas fa-magic"></i>}
              >
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(formData.nilaiKwintansi)}
            </p>
          </div>
        </div>
      </div>

      {/* Calculated Values Preview */}
      {(formData.nilaiKwintansi > 0 || formData.potonganUangMuka > 0) && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Perhitungan Otomatis
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Retensi 5%:</span>
                <div className="font-semibold text-gray-800">
                  {formatCurrency(calculatedValues.retensi5Persen || 0)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">DPP:</span>
                <div className="font-semibold text-gray-800">
                  {formatCurrency(calculatedValues.dpp || 0)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">PPN 11%:</span>
                <div className="font-semibold text-green-600">
                  {formatCurrency(calculatedValues.ppn11Persen || 0)}
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">PPH 2.65%:</span>
                <div className="font-semibold text-red-600">
                  {formatCurrency(calculatedValues.pph265Persen || 0)}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <span className="text-gray-600">Nilai Masuk Rekening:</span>
                <div className="font-bold text-blue-600 text-lg">
                  {formatCurrency(calculatedValues.nilaiMasukRekening || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Formula Info */}
          <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-blue-700 mb-2">Formula Perhitungan:</h4>
            <ul className="space-y-1">
              <li>• Retensi 5% = 5% × Nilai Kwintansi</li>
              <li>• DPP = Nilai Kwintansi - Potongan Uang Muka - Retensi 5%</li>
              <li>• PPN 11% = 11% × DPP</li>
              <li>• PPH 2.65% = 2.65% × DPP</li>
              <li>• <strong>Nilai Masuk Rekening = DPP + PPN - PPH</strong></li>
            </ul>
          </div>
        </div>
      )}

      {/* Status Information */}
      {formData.status !== 'Belum Dibayar' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Informasi Status
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
              <div className="text-sm">
                <div className="font-medium text-blue-800">Status: {formData.status}</div>
                <div className="text-blue-700 mt-1">
                  {formData.status === 'Dibayar (Retensi Belum Dibayarkan)' && 
                    `Retensi ${formatCurrency(calculatedValues.retensi5Persen || 0)} masih ditahan dan akan dibayarkan setelah semua tagihan proyek lain lunas.`
                  }
                  {formData.status === 'Dibayar' && 
                    'Tagihan sudah dilunasi sepenuhnya termasuk retensi.'
                  }
                </div>
              </div>
            </div>
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
          {billing ? 'Update Tagihan' : 'Simpan Tagihan'}
        </Button>
      </div>
    </form>
  );
};

export default BillingForm;