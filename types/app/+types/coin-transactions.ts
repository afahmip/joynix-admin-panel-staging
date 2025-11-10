export interface CoinTransaction {
  id: number;
  user_id: number;
  username: string;
  transaction_type: string;
  coin_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reserved_balance_before: number;
  reserved_balance_after: number;
  reference_id: string;
  reference_type: string;
  description: string;
  status: string;
  created_at: string;
}

export interface CoinTransactionResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    transactions: CoinTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  metadata: any;
}

export interface CoinTransactionDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: CoinTransaction;
  metadata: any;
}

