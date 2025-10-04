# POS Frontend - Quick Reference

## Project Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Git workflow
git add .
git commit -m "feat: add new feature"
git push origin main
```

## Common Imports
```typescript
// React & Hooks
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Icons (Feather Icons via react-icons)
import { 
  FiSearch, FiPlus, FiEdit3, FiTrash2, FiEye, FiSave,
  FiRefreshCw, FiDownload, FiFilter, FiCalendar,
  FiShoppingCart, FiDollarSign, FiPackage, FiUsers,
  FiSettings, FiLogOut, FiSun, FiMoon, FiMenu, FiX
} from 'react-icons/fi';

// Stores
import { 
  useProductStore, 
  useCartStore, 
  useTransactionStore,
  useAuthStore,
  useThemeStore,
  useSettingsStore 
} from '@/stores';

// Components
import { Button, Input, Card, Modal } from '@/components/ui';
import { Layout, Header, Navigation } from '@/components/layout';

// Utils
import { formatCurrency, formatDate, generateId, cn } from '@/utils';

// Types
import type { 
  Product, 
  CartItem, 
  Transaction, 
  User, 
  StoreSettings,
  PaymentMethod 
} from '@/types';
```

## Tailwind CSS Classes

### Layout
```css
/* Containers */
.container { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }
.space-y-4 { @apply > * + * { margin-top: 1rem; } }
.space-x-4 { @apply > * + * { margin-left: 1rem; } }

/* Grid */
.grid-cols-auto { @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4; }
.grid-responsive { @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5; }

/* Flex */
.flex-between { @apply flex items-center justify-between; }
.flex-center { @apply flex items-center justify-center; }
```

### Typography
```css
.text-heading { @apply text-2xl font-bold text-gray-900 dark:text-gray-100; }
.text-subheading { @apply text-lg font-semibold text-gray-900 dark:text-gray-100; }
.text-body { @apply text-gray-600 dark:text-gray-400; }
.text-caption { @apply text-sm text-gray-500 dark:text-gray-400; }
```

### Components
```css
.btn-base { @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50; }
.input-base { @apply w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100; }
.card-base { @apply bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700; }
```

## Code Snippets

### New Page Template
```typescript
import React, { useState, useMemo } from 'react';
import { FiIcon } from 'react-icons/fi';
import { useStore } from '@/stores';
import { Button, Card } from '@/components/ui';

export const NewPage: React.FC = () => {
  const [localState, setLocalState] = useState('');
  const { data, actions } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex-between">
        <div>
          <h1 className="text-heading">Page Title</h1>
          <p className="text-body">Page description</p>
        </div>
        <Button startIcon={<FiIcon />}>Action</Button>
      </div>
      
      <Card className="p-6">
        {/* Content */}
      </Card>
    </div>
  );
};
```

### Form with Validation
```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};

const validate = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.field1) newErrors.field1 = 'Field 1 is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Table Component
```typescript
<Card>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            Header
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map(item => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="px-6 py-4 whitespace-nowrap">
              {item.name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

## Business Logic Patterns

### POS Calculations
```typescript
// Calculate cart totals
const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const tax = Math.round((subtotal * taxRate) * 100) / 100;
const total = subtotal + tax;

// Format currency
const formatted = formatCurrency(amount, currency);

// Generate IDs
const id = generateId();
const receiptNumber = generateReceiptNumber();
```

### State Updates
```typescript
// Add item to store
const addItem = (itemData) => {
  const newItem = {
    ...itemData,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  set(state => ({ items: [...state.items, newItem] }));
};

// Update item
const updateItem = (id, updates) => {
  set(state => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
    )
  }));
};
```

## File Structure Guide

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx        # Reusable button component
│   │   ├── Input.tsx         # Input with validation
│   │   ├── Card.tsx          # Container component
│   │   ├── Modal.tsx         # Modal overlay
│   │   └── index.ts          # Export all UI components
│   ├── layout/
│   │   ├── Header.tsx        # App header with navigation
│   │   ├── Navigation.tsx    # Sidebar navigation
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   └── index.ts          # Export layout components
│   └── PaymentModal.tsx      # POS-specific payment modal
├── pages/
│   ├── LoginPage.tsx         # Authentication page
│   ├── DashboardPage.tsx     # Analytics dashboard
│   ├── SalesPage.tsx         # Main POS interface
│   ├── ProductsManagementPage.tsx  # Product CRUD
│   ├── TransactionsPage.tsx  # Transaction history
│   └── SettingsPage.tsx      # App configuration
├── stores/
│   ├── auth.ts              # Authentication state
│   ├── cart.ts              # Shopping cart state
│   ├── product.ts           # Product inventory state
│   ├── transaction.ts       # Transaction history state
│   ├── theme.ts             # Theme preferences
│   ├── settings.ts          # App settings
│   └── index.ts             # Export all stores
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   └── index.ts             # Utility functions
└── hooks/                   # Custom React hooks (if needed)
```

## Naming Conventions

### Files & Components
- **Pages**: `PageName.tsx` (PascalCase)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Stores**: `storeName.ts` (camelCase)
- **Types**: `interface TypeName` (PascalCase)
- **Functions**: `functionName` (camelCase)
- **Constants**: `CONSTANT_NAME` (SCREAMING_SNAKE_CASE)

### CSS Classes
- Use Tailwind utility classes
- Custom classes in kebab-case
- Component-specific classes prefixed with component name

### Git Commits
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `style:` UI/styling changes
- `docs:` Documentation
- `test:` Testing
- `chore:` Maintenance

This quick reference should help GitHub Copilot understand the project structure and generate appropriate code suggestions.