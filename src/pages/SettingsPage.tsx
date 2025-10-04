import React, { useState } from 'react';
import { FiSave, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { useSettingsStore } from '@/stores';
import { Button, Input, Card } from '@/components/ui';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof settings, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSaveSuccess(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!formData.storeAddress.trim()) {
      newErrors.storeAddress = 'Store address is required';
    }

    if (!formData.storePhone.trim()) {
      newErrors.storePhone = 'Store phone is required';
    }

    if (formData.taxRate < 0 || formData.taxRate > 1) {
      newErrors.taxRate = 'Tax rate must be between 0 and 1 (0% to 100%)';
    }

    if (!formData.currency.trim()) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(settings);
    setErrors({});
    setSaveSuccess(false);
  };

  const isChanged = JSON.stringify(formData) !== JSON.stringify(settings);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your store settings and preferences
          </p>
        </div>
        
        {saveSuccess && (
          <div className="flex items-center space-x-2 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg px-3 py-2">
            <FiInfo className="w-4 h-4 text-success-600 dark:text-success-400" />
            <span className="text-sm text-success-800 dark:text-success-200">
              Settings saved successfully!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Store Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Store Name *"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                error={errors.storeName}
                placeholder="My Store"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Store Address *
                </label>
                <textarea
                  value={formData.storeAddress}
                  onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                {errors.storeAddress && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {errors.storeAddress}
                  </p>
                )}
              </div>

              <Input
                label="Store Phone *"
                value={formData.storePhone}
                onChange={(e) => handleInputChange('storePhone', e.target.value)}
                error={errors.storePhone}
                placeholder="(555) 123-4567"
              />
            </div>
          </Card>

          {/* Financial Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Financial Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax Rate * (Decimal format)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  placeholder="0.08"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter as decimal (e.g., 0.08 for 8%)
                </p>
                {errors.taxRate && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {errors.taxRate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {errors.currency}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Receipt Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Receipt Settings
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Receipt Footer
              </label>
              <textarea
                value={formData.receiptFooter}
                onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                placeholder="Thank you for your business!"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This message will appear at the bottom of customer receipts
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={!isChanged || isSaving}
              loading={isSaving}
              startIcon={<FiSave />}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!isChanged || isSaving}
              startIcon={<FiRefreshCw />}
              className="flex-1 sm:flex-none"
            >
              Reset Changes
            </Button>
          </div>
        </div>

        {/* Settings Preview */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Preview
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Store Name
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formData.storeName || 'Not set'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tax Rate
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {(formData.taxRate * 100).toFixed(2)}%
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Currency
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formData.currency}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sample Price
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: formData.currency,
                  }).format(29.99)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Receipt Preview
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-4 font-mono text-xs">
              <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                <div className="font-bold">{formData.storeName || 'Store Name'}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {formData.storeAddress || 'Store Address'}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {formData.storePhone || 'Store Phone'}
                </div>
              </div>
              
              <div className="space-y-1 border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Sample Item</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Another Item</span>
                  <span>$15.00</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>$25.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({(formData.taxRate * 100).toFixed(1)}%):</span>
                  <span>${(25 * formData.taxRate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-1">
                  <span>Total:</span>
                  <span>${(25 + (25 * formData.taxRate)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-center border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 text-gray-600 dark:text-gray-400">
                {formData.receiptFooter || 'Thank you for your business!'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};