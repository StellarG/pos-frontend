export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  barcode?: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierId: string;
  cashierName: string;
  timestamp: Date;
  receiptNumber: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  isActive: boolean;
  createdAt: Date;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;
  currency: string;
  receiptFooter: string;
}

export type PaymentMethod = 'cash' | 'card' | 'digital_wallet';

export type Theme = 'light' | 'dark';

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: (taxRate: number) => number;
  getTotal: (taxRate: number) => number;
}

export interface ProductState {
  products: Product[];
  searchTerm: string;
  selectedCategory: string;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredProducts: () => Product[];
}

export interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'receiptNumber'>) => void;
  getTransactionsByDate: (startDate: Date, endDate: Date) => Transaction[];
  getTransaction: (id: string) => Transaction | undefined;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface SettingsState {
  settings: StoreSettings;
  updateSettings: (settings: Partial<StoreSettings>) => void;
}