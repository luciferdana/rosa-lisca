import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency, parseNumber } from '../../utils/formatters';

const ProjectDetailHeader = ({ project, onUpdateProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name || '',
    status: project.status || 'Berjalan',
    nilaiKontrak: project.contract?.nilaiKontrak || 0,
    uangMuka: project.contract?.uangMuka || 0,
    potonganReferensi: project.contract?.potonganReferensi || 0,
    nilaiAddI: project.contract?.nilaiAddI || 0,
    tambahanPotonganRetensi: project.contract?.tambahanPotonganRetensi || 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('nilai') || name.includes('uang') || name.includes('potongan') 
        ? parseNumber(value) 
        : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProject = {
        ...project,
        name: formData.name,
        status: formData.status,
        contract: {
          nilaiKontrak: formData.nilaiKontrak,
          uangMuka: formData.uangMuka,
          potonganReferensi: formData.potonganReferensi,
          nilaiAddI: formData.nilaiAddI,
          tambahanPotonganRetensi: formData.tambahanPotonganRetensi
        }
      };
      
      onUpdateProject(updatedProject);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: project.name || '',
      status: project.status || 'Berjalan',
      nilaiKontrak: project.contract?.nilaiKontrak || 0,
      uangMuka: project.contract?.uangMuka || 0,
      potonganReferensi: project.contract?.potonganReferensi || 0,
      nilaiAddI: project.contract?.nilaiAddI || 0,
      tambahanPotonganRetensi: project.contract?.tambahanPotonganRetensi || 0
    });
    setIsEditing(false);
  };

  // Calculate percentages
  const uangMukaPercent = formData.nilaiKontrak > 0 
    ? (formData.uangMuka / formData.nilaiKontrak * 100).toFixed(2)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Detail Kontrak Proyek
        </h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            icon={<i className="fas fa-edit"></i>}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={loading}
              icon={<i className="fas fa-save"></i>}
            >
              Simpan
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
            Informasi Dasar
          </h3>
          
          <Input
            label="Nama Proyek"
            value={formData.name}
            onChange={handleChange}
            name="name"
            disabled={!isEditing}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Proyek
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isEditing}
              className={`
                w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}
              `}
            >
              <option value="Mendatang">Mendatang</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Contract Values */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
            Nilai Kontrak
          </h3>
          
          <div>
            <Input
              label="Nilai Kontrak"
              type="number"
              value={formData.nilaiKontrak}
              onChange={handleChange}
              name="nilaiKontrak"
              disabled={!isEditing}
              required
            />
            {!isEditing && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.nilaiKontrak)}
              </p>
            )}
          </div>

          <div>
            <Input
              label={`Uang Muka (${uangMukaPercent}%)`}
              type="number"
              value={formData.uangMuka}
              onChange={handleChange}
              name="uangMuka"
              disabled={!isEditing}
            />
            {!isEditing && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.uangMuka)}
              </p>
            )}
          </div>
        </div>

        {/* Additional Deductions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
            Potongan Tambahan
          </h3>
          
          <div>
            <Input
              label="Potongan Referensi"
              type="number"
              value={formData.potonganReferensi}
              onChange={handleChange}
              name="potonganReferensi"
              disabled={!isEditing}
            />
            {!isEditing && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.potonganReferensi)}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Tambahan Potongan Retensi"
              type="number"
              value={formData.tambahanPotonganRetensi}
              onChange={handleChange}
              name="tambahanPotonganRetensi"
              disabled={!isEditing}
            />
            {!isEditing && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.tambahanPotonganRetensi)}
              </p>
            )}
          </div>
        </div>

        {/* Additional Values */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
            Nilai Tambahan
          </h3>
          
          <div>
            <Input
              label="Nilai Add I"
              type="number"
              value={formData.nilaiAddI}
              onChange={handleChange}
              name="nilaiAddI"
              disabled={!isEditing}
            />
            {!isEditing && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.nilaiAddI)}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Ringkasan</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Nilai Kontrak:</span>
                <span className="font-medium">{formatCurrency(formData.nilaiKontrak)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Potongan:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(formData.potonganReferensi + formData.tambahanPotonganRetensi)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-medium">Nilai Bersih:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(formData.nilaiKontrak + formData.nilaiAddI - formData.potonganReferensi - formData.tambahanPotonganRetensi)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;