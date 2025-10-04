import React, { useMemo } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiCalendar, FiClock } from 'react-icons/fi';
import { useTransactionStore, useProductStore } from '@/stores';
import { Card } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils';

export const DashboardPage: React.FC = () => {
  const { transactions } = useTransactionStore();
  const { products } = useProductStore();

  // Calculate metrics for today
  const todayMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    });

    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const todayOrders = todayTransactions.length;
    const averageOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

    return {
      revenue: todayRevenue,
      orders: todayOrders,
      averageOrderValue,
      transactions: todayTransactions,
    };
  }, [transactions]);

  // Calculate weekly metrics
  const weeklyMetrics = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyTransactions = transactions.filter(t => 
      new Date(t.timestamp) >= oneWeekAgo
    );

    const weeklyRevenue = weeklyTransactions.reduce((sum, t) => sum + t.total, 0);
    
    return {
      revenue: weeklyRevenue,
      orders: weeklyTransactions.length,
    };
  }, [transactions]);

  // Get low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= 10 && p.isActive).slice(0, 5);
  }, [products]);

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Get top products by sales
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = productSales.get(item.productId) || { name: item.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.productId, existing);
      });
    });

    return Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [transactions]);

  const statCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(todayMetrics.revenue),
      icon: FiDollarSign,
      change: '+12.5%',
      changeType: 'positive' as const,
      subtitle: `${todayMetrics.orders} orders today`,
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(todayMetrics.averageOrderValue),
      icon: FiTrendingUp,
      change: '+8.2%',
      changeType: 'positive' as const,
      subtitle: 'Compared to last week',
    },
    {
      title: 'Total Products',
      value: products.filter(p => p.isActive).length.toString(),
      icon: FiShoppingBag,
      change: `${lowStockProducts.length} low stock`,
      changeType: lowStockProducts.length > 0 ? 'warning' : 'neutral',
      subtitle: 'Active products',
    },
    {
      title: 'Weekly Revenue',
      value: formatCurrency(weeklyMetrics.revenue),
      icon: FiUsers,
      change: `${weeklyMetrics.orders} orders`,
      changeType: 'neutral' as const,
      subtitle: 'Last 7 days',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening in your store today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <FiClock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-success-600' :
                  stat.changeType === 'warning' ? 'text-warning-600' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {stat.subtitle}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Transactions
            </h2>
            <FiCalendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.receiptNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.timestamp)} • {transaction.items.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(transaction.total)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Products
            </h2>
            <FiTrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales data yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="p-6 border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-warning-800 dark:text-warning-200">
              Low Stock Alert
            </h2>
            <FiShoppingBag className="w-5 h-5 text-warning-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-warning-200 dark:border-warning-800"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </p>
                <p className="text-sm text-warning-600 dark:text-warning-400">
                  Only {product.stock} left in stock
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};