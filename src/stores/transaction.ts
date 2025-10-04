import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransactionState, Transaction } from '@/types';
import { generateId, generateReceiptNumber } from '@/utils';

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
          const transactionDate = transaction.timestamp;
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      },
      
      getTransaction: (id: string) => {
        return get().transactions.find(transaction => transaction.id === id);
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);