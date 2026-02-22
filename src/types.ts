export interface Transaction {
  customer_name: string | null;
  order_description: string | null;
  amount: number | null;
  currency: 'BDT' | 'USD' | 'GBP' | 'UNKNOWN';
  transaction_date: string | null;
  payment_status: 'PAID' | 'DUE' | 'PARTIAL' | 'UNKNOWN';
  partial_amount: number | null;
  unit: number | null;
  confidence_score: number;
}

export interface ExtractionResult {
  transactions: Transaction[];
}
