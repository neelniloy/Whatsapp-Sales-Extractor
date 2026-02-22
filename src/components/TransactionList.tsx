import React from 'react';
import { Transaction } from '../types';
import { CheckCircle, AlertCircle, Clock, HelpCircle, DollarSign, Calendar, Trash2, User, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (index: number) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    DUE: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    UNKNOWN: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
  };

  const icons = {
    PAID: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
    DUE: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
    PARTIAL: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    UNKNOWN: <HelpCircle className="w-3.5 h-3.5 mr-1.5" />,
  };

  const key = status as keyof typeof styles;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ring-1 ring-inset ${styles[key] || styles.UNKNOWN}`}>
      {icons[key] || icons.UNKNOWN}
      {status}
    </span>
  );
};

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 font-medium text-lg">No transactions found</h3>
        <p className="text-slate-500 mt-1 max-w-sm mx-auto">
          Paste your chat logs on the left to extract transaction data automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
        >
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Left: Customer & Date */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-50 p-1.5 rounded-md text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 truncate">
                  {t.customer_name || 'Unknown Customer'}
                </h3>
              </div>
              <div className="flex items-center text-xs text-slate-500 ml-9">
                <Calendar className="w-3 h-3 mr-1" />
                {t.transaction_date || 'No date'}
              </div>
            </div>

            {/* Middle: Description */}
            <div className="flex-[2] min-w-0 border-l border-slate-100 pl-0 sm:pl-4">
              <div className="flex items-center gap-2 mb-1">
                {t.unit && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {t.unit} UNIT{t.unit > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">
                {t.order_description || <span className="italic text-slate-400">No description available</span>}
              </p>
            </div>

            {/* Right: Amount & Status */}
            <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px] border-l border-slate-100 pl-0 sm:pl-4">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 tabular-nums">
                  {t.amount?.toLocaleString() ?? '--'} <span className="text-xs font-normal text-slate-500">{t.currency}</span>
                </div>
                <div className="mt-1 flex flex-col items-end gap-1">
                  <StatusBadge status={t.payment_status} />
                  {t.payment_status === 'PARTIAL' && t.partial_amount && (
                    <div className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                      Paid: {t.partial_amount.toLocaleString()} {t.currency}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onDelete(i)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Confidence Bar (Bottom) */}
          <div className="h-1 w-full bg-slate-50">
            <div 
              className={`h-full transition-all duration-500 ${
                t.confidence_score > 0.8 ? 'bg-emerald-500' : 
                t.confidence_score > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
              }`} 
              style={{ width: `${t.confidence_score * 100}%` }} 
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
