/**
 * Test Component untuk verifikasi Google Apps Script integration
 */

'use client';

import { useState } from 'react';
import { googleAPI } from '../lib/googleAppsScript';
import Button from '../components/common/Button';

export default function TestGoogleAppsScript() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    setTestResults(prev => ({
      ...prev,
      [testName]: { status: 'running', message: 'Testing...' }
    }));

    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', message: 'Success', data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'error', message: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'connection',
      label: 'Test Connection',
      test: () => googleAPI.testConnection()
    },
    {
      name: 'getProjects',
      label: 'Get Projects',
      test: () => googleAPI.getProjects()
    },
    {
      name: 'createProject',
      label: 'Create Test Project',
      test: () => googleAPI.createProject({
        name: `Test Project ${Date.now()}`,
        status: 'MENDATANG',
        contractValue: 1000000,
        downPayment: 100000
      })
    },
    {
      name: 'uploadTest',
      label: 'Test Upload (Small Image)',
      test: async () => {
        // Create a small test image (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        const blob = new Blob([Uint8Array.from(atob(testImageBase64), c => c.charCodeAt(0))], { type: 'image/png' });
        const file = new File([blob], 'test.png', { type: 'image/png' });
        
        return googleAPI.uploadImage(file, 'transaction');
      }
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <i className="fas fa-spinner fa-spin text-blue-500"></i>;
      case 'success':
        return <i className="fas fa-check-circle text-green-500"></i>;
      case 'error':
        return <i className="fas fa-times-circle text-red-500"></i>;
      default:
        return <i className="fas fa-clock text-gray-400"></i>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🧪 Google Apps Script Integration Test
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Test koneksi dan fungsi-fungsi Google Apps Script untuk Rosa Lisca
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                <span className="font-medium text-blue-800">Apps Script URL:</span>
              </div>              <code className="text-xs text-blue-700 break-all">
                https://script.google.com/macros/s/AKfycbwCebLF0mXQ7pnBnAfXe-OGZIYv1zEyHe5C6_KYdKds_WIiAWseYnGebYvPJuJZXcBS/exec
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {tests.map((test) => (
              <div key={test.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">{test.label}</h3>
                  {testResults[test.name] && getStatusIcon(testResults[test.name].status)}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(test.name, test.test)}
                  disabled={loading}
                  className="w-full"
                >
                  Run Test
                </Button>
                
                {testResults[test.name] && (
                  <div className="mt-3">
                    <div className={`text-sm p-2 rounded ${
                      testResults[test.name].status === 'success' ? 'bg-green-50 text-green-700' :
                      testResults[test.name].status === 'error' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <div className="font-medium mb-1">
                        {testResults[test.name].status === 'success' ? '✅ Success' :
                         testResults[test.name].status === 'error' ? '❌ Error' :
                         '⏳ Running...'}
                      </div>
                      <div className="text-xs">
                        {testResults[test.name].message}
                      </div>
                      {testResults[test.name].data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">Show Data</summary>
                          <pre className="text-xs mt-1 bg-white p-2 rounded border overflow-auto max-h-32">
                            {JSON.stringify(testResults[test.name].data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <Button
              variant="primary"
              onClick={() => {
                tests.forEach(test => {
                  runTest(test.name, test.test);
                });
              }}
              disabled={loading}
              icon={<i className="fas fa-play"></i>}
            >
              Run All Tests
            </Button>
          </div>

          {/* Overall Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Test Summary:</h3>
            <div className="text-sm text-gray-600">
              {Object.keys(testResults).length === 0 ? (
                'No tests run yet'
              ) : (
                <>
                  <span className="text-green-600">
                    ✅ {Object.values(testResults).filter(r => r.status === 'success').length} passed
                  </span>
                  {' • '}
                  <span className="text-red-600">
                    ❌ {Object.values(testResults).filter(r => r.status === 'error').length} failed
                  </span>
                  {' • '}
                  <span className="text-blue-600">
                    ⏳ {Object.values(testResults).filter(r => r.status === 'running').length} running
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
