import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { formatCurrency, parseNumber, formatNumberInput } from '../../utils/formatters';

const EditProjectModal = ({ isOpen, onClose, project, onSave }) => {  const [formData, setFormData] = useState({
    name: '',
    status: 'MENDATANG',
    contractValue: '',
    downPayment: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        status: project.status || 'MENDATANG',
        contractValue: project.contractValue ? project.contractValue.toString() : '',
        downPayment: project.downPayment ? project.downPayment.toString() : ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Format financial fields
    if (name === 'contractValue' || name === 'downPayment') {
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nama proyek harus diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status proyek harus dipilih';
    }

    const contractValue = parseNumber(formData.contractValue);
    const downPayment = parseNumber(formData.downPayment) || 0;

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
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert string values to numbers before submitting
      const submitData = {
        name: formData.name.trim(),
        status: formData.status,
        contractValue: parseNumber(formData.contractValue) || 0,
        downPayment: parseNumber(formData.downPayment) || 0
      };
      
      await onSave(project.id, submitData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages
  const contractValue = parseNumber(formData.contractValue) || 0;
  const downPayment = parseNumber(formData.downPayment) || 0;
  const downPaymentPercent = contractValue > 0 
    ? ((downPayment / contractValue) * 100).toFixed(1)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Edit Proyek</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Nama Proyek */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Proyek *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama proyek..."
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Proyek *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="MENDATANG">Mendatang</option>
              <option value="BERJALAN">Berjalan</option>
              <option value="SELESAI">Selesai</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai Kontrak *
              </label>
              <input
                type="number"
                name="contractValue"
                value={formData.contractValue}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contractValue ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.contractValue)}
              </p>
              {errors.contractValue && (
                <p className="mt-1 text-sm text-red-600">{errors.contractValue}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uang Muka (Opsional)
              </label>
              <input
                type="number"
                name="downPayment"
                value={formData.downPayment}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.downPayment ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
              />
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.downPayment)}
                {downPaymentPercent > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({downPaymentPercent}% dari nilai kontrak)
                  </span>
                )}
              </p>
              {errors.downPayment && (
                <p className="mt-1 text-sm text-red-600">{errors.downPayment}</p>
              )}
            </div>
          </div>

          {/* Summary Preview */}
          {formData.name && formData.contractValue > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
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
                    {formData.status === 'MENDATANG' ? 'Mendatang' :
                     formData.status === 'BERJALAN' ? 'Berjalan' :
                     'Selesai'}
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
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}              disabled={loading}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
