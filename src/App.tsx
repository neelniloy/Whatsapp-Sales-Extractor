import React, { useState } from 'react';
import { extractTransactions } from './services/gemini';
import { Transaction } from './types';
import { TransactionList } from './components/TransactionList';
import { Sparkles, Loader2, Copy, Trash2, Download, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
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
  };

  const handleClear = () => {
    setInput('');
    setTransactions(null);
    setError(null);
  };

  const handleDelete = (index: number) => {
    if (!transactions) return;
    const newTransactions = [...transactions];
    newTransactions.splice(index, 1);
    setTransactions(newTransactions);
  };

  const loadExample = () => {
    setInput(`[07/02/2025, 9:00 PM] Arif: 1kg beef lagbe
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

  const downloadCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = ['Customer', 'Description', 'Total Amount', 'Partial Paid', 'Currency', 'Date', 'Status', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.customer_name || ''}"`,
        `"${t.order_description || ''}"`,
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
  };

  const getTotals = () => {
    if (!transactions) return null;
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount && t.currency) {
        totals[t.currency] = (totals[t.currency] || 0) + t.amount;
      }
    });
    return totals;
  };

  const totals = getTotals();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">WhatsApp Extractor</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadExample}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Load Example
            </button>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="text-xs font-mono text-slate-400">v2.0.0</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid lg:grid-cols-2 gap-8">
        
        {/* Left Pane: Input */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h2>Chat Log</h2>
            </div>
            {input && (
              <button 
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 relative group min-h-[400px] lg:min-h-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your WhatsApp conversation here..."
              className="w-full h-full p-5 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-mono text-sm leading-relaxed shadow-sm text-slate-700"
            />
            
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleExtract}
                disabled={loading || !input.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Extract Data
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Results */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2>Results</h2>
            </div>
            {transactions && transactions.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl border border-rose-200 text-sm flex items-start gap-3 shadow-sm">
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
            </div>
          )}

          <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-200/50 p-1 overflow-y-auto">
            {transactions ? (
              <div className="space-y-6 p-1">
                {/* Analytics Summary */}
                {transactions.length > 0 && totals && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Orders</div>
                      <div className="text-2xl font-semibold text-slate-900">{transactions.length}</div>
                    </div>
                    {Object.entries(totals).map(([currency, amount]) => (
                      <div key={currency} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Revenue ({currency})</div>
                        <div className="text-2xl font-semibold text-slate-900">{amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <TransactionList transactions={transactions} onDelete={handleDelete} />

                {/* JSON View Toggle */}
                <div className="pt-4 border-t border-slate-200">
                  <details className="group">
                    <summary className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 list-none select-none">
                      <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center text-[10px] group-open:bg-slate-100 transition-colors">
                        {'{ }'}
                      </div>
                      View Raw JSON
                    </summary>
                    <div className="mt-3 relative">
                      <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto text-xs font-mono shadow-inner">
                        {JSON.stringify(transactions, null, 2)}
                      </pre>
                      <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(transactions, null, 2))}
                        className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Copy JSON"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Sparkles className="w-12 h-12 mb-4 text-slate-200" />
                <p className="text-sm">Results will appear here after extraction</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
