import { Button, Input, Modal } from '@/components/ui';
import { useAuthStore, useTransactionStore } from '@/stores';
import type { CartItem, PaymentMethod } from '@/types';
import { formatCurrency } from '@/utils';
import React, { useState } from 'react';
import { FiCreditCard, FiDollarSign, FiPrinter, FiSmartphone } from 'react-icons/fi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  cartItems,
  subtotal,
  tax,
  total,
  taxRate,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    amountPaid: number;
    change: number;
  } | null>(null);

  const { addTransaction } = useTransactionStore();
  const { user } = useAuthStore();

  const change = parseFloat(amountPaid) - total;
  const canProcessPayment = paymentMethod === 'cash'
    ? parseFloat(amountPaid) >= total
    : true; // For card/digital payments, assume they're always valid

  const handleKeypadInput = (value: string) => {
    if (value === 'clear') {
      setAmountPaid('');
    } else if (value === 'backspace') {
      setAmountPaid(prev => prev.slice(0, -1));
    } else {
      setAmountPaid(prev => {
        const newAmount = prev + value;
        // Prevent more than 2 decimal places
        if (newAmount.includes('.') && newAmount.split('.')[1]?.length > 2) {
          return prev;
        }
        return newAmount;
      });
    }
  };

  const handlePayment = async () => {
    if (!canProcessPayment || !user) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const transaction = {
        items: cartItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
        change: paymentMethod === 'cash' ? change : 0,
        cashierId: user.id,
        cashierName: user.name,
      };

      addTransaction(transaction);

      // Set receipt data with the transaction info
      setReceiptData({
        receiptNumber: `RCP-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        amountPaid: transaction.amountPaid,
        change: transaction.change,
      });
      setShowReceipt(true);
    } catch (error) {
      console.error('Payment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmountPaid('');
      setShowReceipt(false);
      setReceiptData(null);
      onClose();
    }
  };

  const handleCompleteTransaction = () => {
    onPaymentComplete();
    handleClose();
  };

  const keypadButtons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    'clear', '0', '.',
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showReceipt ? 'Transaction Complete' : 'Process Payment'}
      size="lg"
    >
      {!showReceipt ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Payment Method Selection */}
          <div className="animate-in slide-in-from-top duration-300 delay-75">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-300 delay-100 ${paymentMethod === 'cash'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-primary-200 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
              >
                <FiDollarSign className="w-6 h-6 mx-auto mb-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-md animate-in slide-in-from-top duration-300 delay-150 ${paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-primary-200 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
              >
                <FiCreditCard className="w-6 h-6 mx-auto mb-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('digital_wallet')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-md animate-in slide-in-from-right duration-300 delay-200 ${paymentMethod === 'digital_wallet'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-primary-200 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
              >
                <FiSmartphone className="w-6 h-6 mx-auto mb-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Digital</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-in slide-in-from-bottom duration-300 delay-200 transition-all hover:shadow-md">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between animate-in fade-in duration-200 delay-300">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between animate-in fade-in duration-200 delay-350">
                <span className="text-gray-600 dark:text-gray-400">Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-2 animate-in fade-in duration-200 delay-400">
                <span>Total:</span>
                <span className="text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Cash Payment Section */}
          {paymentMethod === 'cash' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-300 delay-300">
              <div className="animate-in fade-in duration-300 delay-400">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount Received
                </label>
                <Input
                  type="text"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-mono transition-all duration-200 focus:ring-2 focus:ring-primary-500"
                />
                {amountPaid && (
                  <div className="mt-2 text-sm animate-in fade-in duration-200">
                    <div className={`font-medium transition-colors duration-200 ${change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      Change: {formatCurrency(Math.max(0, change))}
                    </div>
                    {change < 0 && (
                      <div className="text-danger-600 animate-in shake duration-300">
                        Insufficient amount: {formatCurrency(Math.abs(change))} more needed
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="animate-in fade-in duration-300 delay-450">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[total, 50, 100].map((amount, index) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmountPaid(amount.toString())}
                      className="text-xs transition-all duration-200 hover:scale-105 animate-in slide-in-from-top"
                      style={{ animationDelay: `${500 + index * 50}ms` }}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {keypadButtons.map((button, index) => (
                    <Button
                      key={button}
                      variant="outline"
                      size="sm"
                      onClick={() => handleKeypadInput(button)}
                      className={`h-10 transition-all duration-150 hover:scale-105 active:scale-95 animate-in zoom-in ${button === 'clear' ? 'text-danger-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      style={{ animationDelay: `${600 + index * 30}ms` }}
                    >
                      {button === 'clear' ? 'Clear' :
                        button === 'backspace' ? '⌫' : button}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Non-cash payment message */}
          {paymentMethod !== 'cash' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-in slide-in-from-bottom duration-300 delay-300 transition-all hover:shadow-md">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                {paymentMethod === 'card'
                  ? 'Please process the card payment on your card terminal.'
                  : 'Please process the digital wallet payment.'
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 animate-in slide-in-from-bottom duration-300 delay-500">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!canProcessPayment || isProcessing}
              loading={isProcessing}
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      ) : (
        // Receipt View
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4 animate-in slide-in-from-top duration-300">
            <div className="text-success-600 dark:text-success-400 text-lg font-semibold">
              Payment Successful!
            </div>
            <div className="text-success-600 dark:text-success-400 text-sm">
              Transaction completed successfully
            </div>
          </div>

          {/* Receipt */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6 font-mono text-sm animate-in slide-in-from-bottom duration-300 delay-150">
            <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-4 mb-4">
              <div className="font-bold text-lg">Store Receipt</div>
              <div className="text-gray-600 dark:text-gray-400">
                {new Date().toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Receipt: {receiptData?.receiptNumber}
              </div>
            </div>

            <div className="space-y-1 border-b border-gray-200 dark:border-gray-600 pb-4 mb-4 animate-in fade-in duration-300 delay-300">
              {cartItems.map((item, index) => (
                <div key={item.id} className="flex justify-between animate-in slide-in-from-left duration-200" style={{ animationDelay: `${350 + index * 50}ms` }}>
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 animate-in fade-in duration-300 delay-500">
              <div className="flex justify-between animate-in slide-in-from-right duration-200 delay-550">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between animate-in slide-in-from-right duration-200 delay-600">
                <span>Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-600 pt-2 animate-in slide-in-from-right duration-200 delay-650">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between animate-in slide-in-from-right duration-200 delay-700">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(receiptData?.amountPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between animate-in slide-in-from-right duration-200 delay-750">
                    <span>Change:</span>
                    <span>{formatCurrency(receiptData?.change || 0)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center border-t border-gray-200 dark:border-gray-600 pt-4 mt-4 text-gray-600 dark:text-gray-400 animate-in fade-in duration-300 delay-800">
              <div>Thank you for your business!</div>
              <div>Cashier: {user?.name}</div>
            </div>
          </div>

          <div className="flex gap-3 animate-in slide-in-from-bottom duration-300 delay-850">
            <Button
              variant="outline"
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
              startIcon={<FiPrinter />}
            >
              Print Receipt
            </Button>
            <Button
              onClick={handleCompleteTransaction}
              className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Complete Transaction
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};