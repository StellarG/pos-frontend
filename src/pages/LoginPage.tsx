import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '@/stores';
import { Button, Input, Card } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(formData.username, formData.password);
      if (!success) {
        setErrors({
          general: 'Invalid username or password. Try admin/admin or cashier/cashier',
        });
      }
    } catch {
      setErrors({
        general: 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            POS System
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-200">
                {errors.general}
              </div>
            )}

            <Input
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              startIcon={<FiUser className="w-5 h-5" />}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              startIcon={<FiLock className="w-5 h-5" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Demo Accounts:
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-500">
              <div>Admin: admin / admin</div>
              <div>Cashier: cashier / cashier</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};