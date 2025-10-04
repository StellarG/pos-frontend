# POS Frontend - Code Patterns & Examples

## Component Patterns

### Page Component Template
```typescript
import React, { useState, useMemo } from 'react';
import { FiIcon1, FiIcon2 } from 'react-icons/fi';
import { useStore1, useStore2 } from '@/stores';
import { Button, Input, Card, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils';
import type { DataType } from '@/types';

export const PageName: React.FC = () => {
  // Local state
  const [localState, setLocalState] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store hooks
  const { data, actions } = useStore1();
  const { settings } = useStore2();

  // Computed values
  const computedValue = useMemo(() => {
    return data.filter(item => item.isActive);
  }, [data]);

  // Event handlers
  const handleAction = (param: string) => {
    // Business logic
    actions.performAction(param);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Page Title
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Page description
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} startIcon={<FiIcon1 />}>
          Action
        </Button>
      </div>

      {/* Content */}
      <Card className="p-6">
        {/* Card content */}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Title"
      >
        {/* Modal content */}
      </Modal>
    </div>
  );
};
```

### UI Component Template
```typescript
import React from 'react';
import { cn } from '@/utils';

interface ComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  onClick
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-900',
    primary: 'bg-primary-600 text-white',
    secondary: 'bg-secondary-600 text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

## Store Patterns

### Basic Store
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemType } from '@/types';

interface StoreState {
  items: ItemType[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: ItemType[]) => void;
  addItem: (item: Omit<ItemType, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<ItemType>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useItemStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      setItems: (items) => set({ items }),
      
      addItem: (itemData) => {
        const newItem: ItemType = {
          ...itemData,
          id: generateId(),
          createdAt: new Date(),
        };
        set(state => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) => set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),

      removeItem: (id) => set(state => ({
        items: state.items.filter(item => item.id !== id)
      })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'item-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);
```

## Form Patterns

### Form with Validation
```typescript
interface FormData {
  name: string;
  email: string;
  phone: string;
}

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Submit logic
      await submitForm(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={errors.name}
        required
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={errors.email}
        required
      />

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-full"
      >
        Submit
      </Button>
    </form>
  );
};
```

## Table/List Patterns

### Data Table with Actions
```typescript
const DataTable: React.FC<{ data: ItemType[] }> = ({ data }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof ItemType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field: keyof ItemType) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left">
                <button onClick={() => handleSort('name')}>
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
```

## Modal Patterns

### Confirmation Modal
```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

## Utility Patterns

### API Service Pattern
```typescript
class APIService {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new APIService();
```

## Custom Hook Patterns

### Data Fetching Hook
```typescript
import { useState, useEffect } from 'react';

interface UseDataFetchOptions<T> {
  initialData?: T;
  enabled?: boolean;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseDataFetchOptions<T> = {}
) {
  const { initialData, enabled = true } = options;
  
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch };
}
```

These patterns should be followed consistently throughout the codebase to maintain clean, predictable, and maintainable code.