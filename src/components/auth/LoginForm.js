'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        setErrors({ general: 'Email atau password salah' });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan sistem' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@rosalisca.com',
      password: 'admin123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-3">
              <i className="fas fa-building text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Admin</h2>
          <p className="text-gray-600 mb-1">Sistem Kas & Monitoring Proyek</p>
          <p className="text-blue-600 font-semibold">PT Rosa Lisca</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@rosalisca.com"
            error={errors.email}
            required
            icon={<i className="fas fa-envelope"></i>}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            error={errors.password}
            required
            icon={<i className="fas fa-lock"></i>}
          />

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Demo Credentials:</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-700"><strong>Email:</strong> admin@rosalisca.com</p>
              <p className="text-gray-700"><strong>Password:</strong> admin123</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fillDemoCredentials}
              className="mt-3"
            >
              <i className="fas fa-magic mr-2"></i>
              Isi Otomatis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;