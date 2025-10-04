import React, { useState, useMemo } from 'react';
import { 
  FiSearch, 
  FiCalendar, 
  FiEye, 
  FiDownload,
  FiFilter,
  FiX
} from 'react-icons/fi';
import { useTransactionStore } from '@/stores';
import { Button, Input, Card, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils';
import type { Transaction } from '@/types';

export const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { transactions } = useTransactionStore();

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by payment method
    if (selectedPaymentMethod) {
      filtered = filtered.filter(transaction => 
        transaction.paymentMethod === selectedPaymentMethod
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transactions, searchTerm, dateRange, selectedPaymentMethod]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageOrder = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalTax = filteredTransactions.reduce((sum, t) => sum + t.tax, 0);

    const paymentMethodBreakdown = filteredTransactions.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      totalTransactions,
      averageOrder,
      totalTax,
      paymentMethodBreakdown,
    };
  }, [filteredTransactions]);

  const openTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSelectedPaymentMethod('');
  };

  const exportTransactions = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvData = filteredTransactions.map(t => ({
      'Receipt Number': t.receiptNumber,
      'Date': formatDate(t.timestamp),
      'Cashier': t.cashierName,
      'Items': t.items.length,
      'Subtotal': t.subtotal,
      'Tax': t.tax,
      'Total': t.total,
      'Payment Method': t.paymentMethod.replace('_', ' '),
      'Amount Paid': t.amountPaid,
      'Change': t.change,
    }));
    
    console.log('Exporting transactions:', csvData);
    alert('Export functionality would download CSV file in production');
  };

  const getPaymentMethodLabel = (method: string) => {
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage transaction records
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportTransactions}
            startIcon={<FiDownload />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(summaryStats.totalRevenue)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {summaryStats.totalTransactions}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Order</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(summaryStats.averageOrder)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tax</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(summaryStats.totalTax)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by receipt number, cashier, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<FiSearch className="w-5 h-5" />}
            />
          </div>
          <div className="lg:w-48">
            <Input
              type="date"
              placeholder="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              startIcon={<FiCalendar className="w-5 h-5" />}
            />
          </div>
          <div className="lg:w-48">
            <Input
              type="date"
              placeholder="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              startIcon={<FiCalendar className="w-5 h-5" />}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="digital_wallet">Digital Wallet</option>
            </select>
          </div>
          {(searchTerm || dateRange.start || dateRange.end || selectedPaymentMethod) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              startIcon={<FiX />}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.receiptNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(transaction.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {transaction.cashierName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {transaction.items.length} items
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.items.slice(0, 2).map(item => item.name).join(', ')}
                      {transaction.items.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                      {getPaymentMethodLabel(transaction.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(transaction.total)}
                    </div>
                    {transaction.paymentMethod === 'cash' && transaction.change > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Change: {formatCurrency(transaction.change)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openTransactionDetail(transaction)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FiFilter className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No transactions found matching your criteria
            </p>
          </div>
        )}
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Receipt Number
                </label>
                <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                  {selectedTransaction.receiptNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date & Time
                </label>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {formatDate(selectedTransaction.timestamp)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cashier
                </label>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {selectedTransaction.cashierName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>
                <p className="text-lg text-gray-900 dark:text-gray-100">
                  {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Items Purchased
              </label>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  {selectedTransaction.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(selectedTransaction.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(selectedTransaction.tax)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatCurrency(selectedTransaction.total)}
                </span>
              </div>
              {selectedTransaction.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedTransaction.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Change:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedTransaction.change)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedTransaction(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};