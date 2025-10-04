import type { Transaction, TransactionState } from '@/types';
import { generateId, generateReceiptNumber } from '@/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transactionData) => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: generateId(),
          timestamp: new Date(),
          receiptNumber: generateReceiptNumber(),
        };

        set({
          transactions: [newTransaction, ...get().transactions]
        });
      },

      getTransactionsByDate: (startDate: Date, endDate: Date) => {
        return get().transactions.filter(transaction => {
          const transactionDate = new Date(transaction.timestamp);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },

      getTransaction: (id: string) => {
        return get().transactions.find(transaction => transaction.id === id);
      },
    }),
    {
      name: 'transaction-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.transactions) {
          // Convert timestamp strings back to Date objects after rehydration
          state.transactions = state.transactions.map(transaction => ({
            ...transaction,
            timestamp: new Date(transaction.timestamp),
          }));
        }
      },
    }
  )
);