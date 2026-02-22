import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { extractTransactions } from './services/gemini';
import { Transaction } from './types';
import { TransactionList } from './components/TransactionList';
import { Sparkles, Loader2, Copy, Trash2, Download, AlertCircle, MessageSquare, ArrowRight, Moon, Sun, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const handleExtract = useCallback(async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setTransactions(null);

    try {
      const result = await extractTransactions(input);
      setTransactions(result);
    } catch (err: any) {
      setError(err.message || 'Failed to extract data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput('');
    setTransactions(null);
    setError(null);
  }, []);

  const handleDelete = useCallback((index: number) => {
    setTransactions(prev => {
      if (!prev) return null;
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const loadExample = () => {
    setInput(`[07/02/2025, 9:00 PM] Arif: 1kg mutton lagbe
[07/02/2025, 9:01 PM] Seller: 900
[07/02/2025, 9:02 PM] Arif: ok

[09/02/2025, 6:30 PM] Arif: ajke 2kg den
[09/02/2025, 6:31 PM] Seller: 1800
[09/02/2025, 6:32 PM] Arif: payment done

[10/02/2025, 10:00 AM] Kamal: 3 shirts order korbo
[10/02/2025, 10:05 AM] Seller: 1500 BDT total
[10/02/2025, 10:10 AM] Kamal: ok confirm. 500 advance dilam baki delivery r por
[10/02/2025, 10:12 AM] Seller: ok received`);
  };

  const copyCSV = useCallback(() => {
    if (!transactions || transactions.length === 0) return;

    const headers = ['Customer', 'Description', 'Unit', 'Total Amount', 'Partial Paid', 'Currency', 'Date', 'Status', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.customer_name || ''}"`,
        `"${t.order_description || ''}"`,
        t.unit || '',
        t.amount || '',
        t.partial_amount || '',
        t.currency,
        t.transaction_date || '',
        t.payment_status,
        t.confidence_score
      ].join(','))
    ].join('\n');

    navigator.clipboard.writeText(csvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [transactions]);

  const downloadCSV = useCallback(() => {
    if (!transactions || transactions.length === 0) return;

    const headers = ['Customer', 'Description', 'Unit', 'Total Amount', 'Partial Paid', 'Currency', 'Date', 'Status', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.customer_name || ''}"`,
        `"${t.order_description || ''}"`,
        t.unit || '',
        t.amount || '',
        t.partial_amount || '',
        t.currency,
        t.transaction_date || '',
        t.payment_status,
        t.confidence_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [transactions]);

  const totals = useMemo(() => {
    if (!transactions) return null;
    const result: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount && t.currency) {
        result[t.currency] = (result[t.currency] || 0) + t.amount;
      }
    });
    return result;
  }, [transactions]);

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background blobs for premium feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-emerald-500' : 'bg-emerald-300'}`}></div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-md transition-colors duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Chat2Sale Report</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Automated Transaction Insight</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`h-6 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <button 
              onClick={loadExample}
              className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Pane: Input */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <h2>Chat Log</h2>
            </div>
            {input && (
              <button 
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-rose-500/10 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 relative group min-h-[400px] lg:min-h-0 flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your WhatsApp conversation here..."
              className={`flex-1 w-full p-6 rounded-3xl border transition-all resize-none font-mono text-sm leading-relaxed shadow-xl focus:ring-4 focus:ring-indigo-500/10 outline-none ${
                darkMode 
                  ? 'bg-slate-900/50 border-slate-800 text-slate-300 focus:border-indigo-500/50 placeholder:text-slate-700' 
                  : 'bg-white/50 border-white text-slate-700 focus:border-indigo-500/50 placeholder:text-slate-400'
              }`}
            />
            
            <div className="absolute bottom-6 right-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExtract}
                disabled={loading || !input.trim()}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-2xl shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Extract Data
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Pane: Results */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2>Extracted Data</h2>
            </div>
            <div className="flex items-center gap-2">
              {transactions && transactions.length > 0 && (
                <>
                  <button
                    onClick={copyCSV}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95 ${
                      darkMode 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy CSV'}
                  </button>
                  <button
                    onClick={downloadCSV}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95 ${
                      darkMode 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl border border-rose-200 text-sm flex items-start gap-3 shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-rose-800">Extraction Failed</p>
                <p className="text-rose-600 mt-0.5">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-600 transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          <div className={`flex-1 rounded-3xl border transition-all p-2 overflow-y-auto min-h-[400px] lg:min-h-0 ${
            darkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100/50 border-white shadow-inner'
          }`}>
            <AnimatePresence mode="wait">
              {transactions ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 p-2"
                >
                  {/* Analytics Summary */}
                  {transactions.length > 0 && totals && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all shadow-xl ${
                        darkMode ? 'bg-slate-800/50 border-slate-700 shadow-indigo-500/5' : 'bg-white border-white'
                      }`}>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Orders</div>
                        <div className="text-3xl font-black">{transactions.length}</div>
                      </div>
                      {Object.entries(totals).map(([currency, amount]) => (
                        <div key={currency} className={`p-5 rounded-2xl border backdrop-blur-sm transition-all shadow-xl ${
                          darkMode ? 'bg-slate-800/50 border-slate-700 shadow-emerald-500/5' : 'bg-white border-white'
                        }`}>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Revenue ({currency})</div>
                          <div className="text-3xl font-black">{amount.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <TransactionList transactions={transactions} onDelete={handleDelete} darkMode={darkMode} />

                  {/* JSON View Toggle */}
                  <div className={`pt-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <details className="group">
                      <summary className="flex items-center gap-3 text-xs font-bold text-slate-500 cursor-pointer hover:text-indigo-500 list-none select-none transition-colors">
                        <div className={`w-6 h-6 border rounded-lg flex items-center justify-center text-[10px] transition-all group-open:rotate-90 ${
                          darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white shadow-sm'
                        }`}>
                          {'{ }'}
                        </div>
                        Developer Raw JSON
                      </summary>
                      <div className="mt-4 relative group/code focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl transition-all">
                        <pre className={`p-6 rounded-2xl overflow-x-auto text-[11px] font-mono shadow-2xl transition-colors ${
                          darkMode ? 'bg-slate-930 text-indigo-300' : 'bg-slate-900 text-slate-100'
                        }`}>
                          {JSON.stringify(transactions, null, 2)}
                        </pre>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(transactions, null, 2));
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all opacity-0 group-hover/code:opacity-100 ${
                            darkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                          }`}
                          title="Copy JSON"
                        >
                          {copied ? <ClipboardCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </details>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                    darkMode ? 'bg-slate-800/50' : 'bg-white shadow-xl shadow-indigo-500/5'
                  }`}>
                    <Sparkles className={`w-10 h-10 ${darkMode ? 'text-slate-700' : 'text-slate-200'}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Ready to Extract</h3>
                  <p className={`text-sm max-w-[240px] leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Paste your chat logs on the left and watch the AI extract your sales automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}
