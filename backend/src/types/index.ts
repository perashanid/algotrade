// Core data types for the trading platform

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface StockGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  stocks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StockConstraintOverride {
  buyTriggerPercent?: number;
  sellTriggerPercent?: number;
  profitTriggerPercent?: number;
  buyAmount?: number;
  sellAmount?: number;
}

export interface ConstraintGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
  isActive: boolean;
  stocks: string[];
  stockGroups: string[];
  stockOverrides?: { [stockSymbol: string]: StockConstraintOverride };
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  userId: string;
  stockSymbol: string;
  quantity: number;
  averageCost: number;
  currentPrice?: number;
  lastUpdated: Date;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positions: Position[];
  lastUpdated: Date;
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
  executedAt: Date;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export interface BenchmarkData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
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

export interface BacktestResult {
  constraintId: string;
  startDate: Date;
  endDate: Date;
  totalTrades: number;
  successfulTrades: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  date: Date;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  triggerType: string;
}

export interface TriggerEvent {
  constraintId: string;
  stockSymbol: string;
  triggerType: 'BUY' | 'SELL' | 'PROFIT';
  currentPrice: number;
  triggerPrice: number;
  amount: number;
  timestamp: Date;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: Date;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Finnhub API types
export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCandle {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  s: string; // Status
  t: number[]; // Timestamps
  v: number[]; // Volumes
}

// Request/Response types for API endpoints
export interface CreateConstraintRequest {
  stockSymbol: string;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}

export interface CreateConstraintGroupRequest {
  name: string;
  description?: string;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
  stocks: string[];
  stockGroups: string[];
}

export interface CreateStockGroupRequest {
  name: string;
  description?: string;
  color?: string;
  stocks: string[];
}

export interface UpdateConstraintRequest {
  buyTriggerPercent?: number;
  sellTriggerPercent?: number;
  profitTriggerPercent?: number;
  buyAmount?: number;
  sellAmount?: number;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface BacktestRequest {
  constraintId: string;
  startDate: string;
  endDate: string;
}