import React from 'react';
import { Transaction } from '../types';
import { CheckCircle, AlertCircle, Clock, HelpCircle, DollarSign, Calendar, Trash2, User, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (index: number) => void;
  darkMode?: boolean;
}

const StatusBadge = ({ status, darkMode }: { status: string; darkMode?: boolean }) => {
  const styles = {
    PAID: darkMode 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/10' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    DUE: darkMode
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 ring-rose-500/10'
      : 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    PARTIAL: darkMode
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 ring-amber-500/10'
      : 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    UNKNOWN: darkMode
      ? 'bg-slate-500/10 text-slate-400 border-slate-500/20 ring-slate-500/10'
      : 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20',
  };

  const icons = {
    PAID: <CheckCircle className="w-3.5 h-3.5 mr-1.5" />,
    DUE: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
    PARTIAL: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    UNKNOWN: <HelpCircle className="w-3.5 h-3.5 mr-1.5" />,
  };

  const key = status as keyof typeof styles;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ring-1 ring-inset uppercase tracking-wide transition-colors ${styles[key] || styles.UNKNOWN}`}>
      {icons[key] || icons.UNKNOWN}
      {status}
    </span>
  );
};

export function TransactionList({ transactions, onDelete, darkMode }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className={`text-center py-16 rounded-3xl border border-dashed transition-colors ${
        darkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-white border-slate-300'
      }`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
          darkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-50 text-slate-300'
        }`}>
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className={`font-bold text-xl ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>No transactions found</h3>
        <p className={`mt-2 max-w-sm mx-auto text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, height: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className={`group rounded-2xl border transition-all overflow-hidden shadow-lg hover:shadow-2xl ${
            darkMode 
              ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30' 
              : 'bg-white border-white hover:border-indigo-100'
          }`}
        >
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Left: Customer & Date */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {t.customer_name || 'Unknown Customer'}
                </h3>
              </div>
              <div className={`flex items-center text-[10px] font-bold uppercase tracking-wider ml-12 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {t.transaction_date || 'N/A'}
              </div>
            </div>

            {/* Middle: Description */}
            <div className={`flex-[2] min-w-0 sm:border-l pl-0 sm:pl-6 transition-colors ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {t.unit && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.unit} {t.unit > 1 ? 'Units' : 'Unit'}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.order_description || <span className="italic opacity-50">No description available</span>}
              </p>
            </div>

            {/* Right: Amount & Status */}
            <div className={`flex items-center justify-between sm:justify-end gap-6 min-w-[160px] sm:border-l pl-0 sm:pl-6 transition-colors ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="text-right">
                <div className="text-xl font-black tabular-nums tracking-tight">
                  {t.amount?.toLocaleString() ?? '--'} <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.currency}</span>
                </div>
                <div className="mt-2 flex flex-col items-end gap-1.5">
                  <StatusBadge status={t.payment_status} darkMode={darkMode} />
                  {t.payment_status === 'PARTIAL' && t.partial_amount && (
                    <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      Paid: {t.partial_amount.toLocaleString()} {t.currency}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onDelete(i)}
                className={`p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-90 ${
                  darkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Delete transaction"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Confidence Bar (Bottom) */}
          <div className={`h-1.5 w-full transition-colors ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${t.confidence_score * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full transition-all duration-500 ${
                t.confidence_score > 0.8 ? 'bg-emerald-500' : 
                t.confidence_score > 0.5 ? 'bg-amber-500' : 'bg-rose-500'
              }`} 
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
