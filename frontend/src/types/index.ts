// Frontend types for the trading platform

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TradingConstraint {
  id: string;
  userId: string;
  stockSymbol: string;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  userId: string;
  stockSymbol: string;
  quantity: number;
  averageCost: number;
  currentPrice?: number;
  lastUpdated: string;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positions: Position[];
  lastUpdated: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: string;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dayReturn: number;
  dayReturnPercent: number;
  weekReturn: number;
  weekReturnPercent: number;
  monthReturn: number;
  monthReturnPercent: number;
  yearReturn: number;
  yearReturnPercent: number;
  benchmarkComparison: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
}

export interface TradeHistory {
  id: string;
  userId: string;
  constraintId?: string;
  stockSymbol: string;
  tradeType: 'BUY' | 'SELL';
  triggerType: 'PRICE_DROP' | 'PRICE_RISE' | 'PROFIT_TARGET';
  quantity: number;
  price: number;
  triggerPrice: number;
  executedAt: string;
}

export interface BacktestResult {
  constraintId: string;
  startDate: string;
  endDate: string;
  totalTrades: number;
  successfulTrades: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  date: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  triggerType: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface CreateConstraintRequest {
  stockSymbol: string;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}