# POS Frontend - API Documentation

## Overview
This document outlines the data structures, API patterns, and business logic for the POS Frontend application. This serves as a reference for GitHub Copilot to understand the domain and generate contextually appropriate code.

## Core Data Models

### Product Entity
```typescript
interface Product {
  id: string;              // Unique identifier
  name: string;            // Product name (required)
  price: number;           // Product price in currency units
  category: string;        // Product category (required)
  image?: string;          // Optional product image URL
  description?: string;    // Optional product description
  barcode?: string;        // Optional barcode for scanning
  stock: number;           // Current stock quantity
  isActive: boolean;       // Whether product is available for sale
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Last update timestamp
}
```

**Business Rules:**
- Price must be positive
- Stock cannot be negative
- Inactive products don't appear in sales interface
- Categories are user-defined strings

### Cart & Transaction Models
```typescript
interface CartItem {
  id: string;              // Unique cart item identifier
  productId: string;       // Reference to Product.id
  name: string;            // Product name (cached for performance)
  price: number;           // Product price (cached at time of adding)
  quantity: number;        // Quantity in cart (min: 1)
  image?: string;          // Product image (cached)
}

interface Transaction {
  id: string;              // Unique transaction identifier
  items: CartItem[];       // Items purchased
  subtotal: number;        // Sum of item prices
  tax: number;             // Calculated tax amount
  total: number;           // Subtotal + tax
  paymentMethod: PaymentMethod; // How customer paid
  amountPaid: number;      // Amount received from customer
  change: number;          // Change given to customer
  cashierId: string;       // Who processed the sale
  cashierName: string;     // Cashier display name
  timestamp: Date;         // When transaction completed
  receiptNumber: string;   // Unique receipt identifier
}
```

**Business Rules:**
- Cart quantities must be positive integers
- Transactions are immutable once created
- Receipt numbers must be unique
- Tax is calculated as: subtotal × taxRate
- Change = amountPaid - total (only for cash payments)

## State Management Patterns

### Zustand Store Structure
All stores follow this pattern:
```typescript
interface StoreState {
  // Data
  data: DataType[];
  loading: boolean;
  error: string | null;
  
  // Computed state (via getters)
  getFilteredData: () => DataType[];
  getById: (id: string) => DataType | undefined;
  
  // Actions
  setData: (data: DataType[]) => void;
  addItem: (item: CreateDataType) => void;
  updateItem: (id: string, updates: Partial<DataType>) => void;
  removeItem: (id: string) => void;
}
```

### Store Usage Patterns
```typescript
// Reading state
const { data, loading, error } = useStore();

// Using actions
const { addItem, updateItem } = useStore();

// Using computed values
const filteredData = useStore(state => state.getFilteredData());
```

## UI Component API

### Input Components
```typescript
interface InputProps {
  label?: string;           // Field label
  value: string;           // Current value
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;          // Error message to display
  helpText?: string;       // Help text below input
  startIcon?: ReactNode;   // Icon before input
  endIcon?: ReactNode;     // Icon after input
  placeholder?: string;    // Placeholder text
  required?: boolean;      // Whether field is required
  disabled?: boolean;      // Whether field is disabled
}
```

### Button Components
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;       // Shows spinner, disables button
  startIcon?: ReactNode;   // Icon before text
  endIcon?: ReactNode;     // Icon after text
  disabled?: boolean;      // Disabled state
  onClick?: () => void;    // Click handler
}
```

### Modal Components
```typescript
interface ModalProps {
  isOpen: boolean;         // Whether modal is visible
  onClose: () => void;     // Close handler
  title?: string;          // Modal title
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Modal size
  children: ReactNode;     // Modal content
}
```

## Business Logic Patterns

### Price Calculations
```typescript
// Always round to 2 decimal places for currency
const calculateTax = (subtotal: number, taxRate: number): number => {
  return Math.round((subtotal * taxRate) * 100) / 100;
};

const calculateTotal = (subtotal: number, tax: number): number => {
  return Math.round((subtotal + tax) * 100) / 100;
};

// Format currency for display
const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};
```

### Inventory Management
```typescript
// Check if product can be added to cart
const canAddToCart = (product: Product, requestedQuantity = 1): boolean => {
  return product.isActive && product.stock >= requestedQuantity;
};

// Update stock after sale
const updateStockAfterSale = (productId: string, quantitySold: number) => {
  updateProduct(productId, { 
    stock: currentStock - quantitySold 
  });
};
```

### ID Generation
```typescript
// Generate unique IDs for new records
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Generate receipt numbers
const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `RCP-${timestamp}-${random}`;
};
```

## Form Validation Patterns

### Common Validations
```typescript
const validateRequired = (value: string, fieldName: string): string | null => {
  return value.trim() ? null : `${fieldName} is required`;
};

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Invalid email format';
};

const validatePrice = (price: string): string | null => {
  const num = parseFloat(price);
  if (isNaN(num)) return 'Price must be a number';
  if (num <= 0) return 'Price must be positive';
  return null;
};

const validateStock = (stock: string): string | null => {
  const num = parseInt(stock);
  if (isNaN(num)) return 'Stock must be a number';
  if (num < 0) return 'Stock cannot be negative';
  return null;
};
```

### Form State Management
```typescript
// Generic form handler
const useFormValidation = <T extends Record<string, string>>(
  initialData: T,
  validators: Partial<Record<keyof T, (value: string) => string | null>>
) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Partial<T>>({});

  const updateField = (field: keyof T, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<T> = {};
    
    Object.keys(validators).forEach(key => {
      const validator = validators[key as keyof T];
      if (validator) {
        const error = validator(data[key as keyof T]);
        if (error) {
          newErrors[key as keyof T] = error as T[keyof T];
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { data, errors, updateField, validate };
};
```

## Error Handling Patterns

### Error Boundaries
```typescript
interface ErrorInfo {
  componentStack: string;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
const useAsyncOperation = <T>(
  operation: () => Promise<T>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
```

## Performance Optimization Patterns

### Memoization Guidelines
```typescript
// Memoize expensive computations
const expensiveCalculation = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// Memoize callback functions
const handleClick = useCallback((id: string) => {
  onItemSelect(id);
}, [onItemSelect]);

// Memoize components
const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
  // Component implementation
});
```

### Virtual Scrolling (for large lists)
```typescript
const VirtualList: React.FC<{
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
}> = ({ items, height, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(height / itemHeight),
    items.length - 1
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleStart + index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

This documentation provides GitHub Copilot with comprehensive context about the POS system's architecture, patterns, and business logic to generate more accurate and contextually appropriate code suggestions.