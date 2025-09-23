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

export interface ConstraintPosition {
  stockSymbol: string;
  constraintId?: string;
  constraintName?: string;
  constraintType: 'individual' | 'group';
  isActive: boolean;
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
  currentPrice?: number;
  quantity: number;
  averageCost?: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  status: 'watching' | 'position' | 'triggered';
}

export interface ClosedPosition {
  id: string;
  stockSymbol: string;
  constraintId?: string;
  constraintName?: string;
  constraintType: 'individual' | 'group';
  quantity: number;
  averageCost: number;
  exitPrice: number;
  realizedPnl: number;
  realizedPnlPercent: number;
  holdingDays: number;
  openedAt: string;
  closedAt: string;
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

export interface UpdateConstraintRequest {
  buyTriggerPercent?: number;
  sellTriggerPercent?: number;
  profitTriggerPercent?: number;
  buyAmount?: number;
  sellAmount?: number;
  isActive?: boolean;
}

export interface StockGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  stocks: string[];
  createdAt: string;
  updatedAt: string;
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
  stockGroups: StockGroup[];
  stockOverrides?: { [stockSymbol: string]: StockConstraintOverride };
  createdAt: string;
  updatedAt: string;
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
  stockGroups: string[]; // IDs when creating, but full objects when returned
}

export interface CreateStockGroupRequest {
  name: string;
  description?: string;
  color?: string;
  stocks: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Enhanced interfaces for group stock display and management

export interface StockTriggers {
  buyTriggerPercent: number;
  sellTriggerPercent: number;
  profitTriggerPercent?: number;
  buyAmount: number;
  sellAmount: number;
}

export interface StockDisplayData {
  symbol: string;
  position?: Position;
  currentPrice: number;
  triggers: StockTriggers;
  isCustomTriggers: boolean; // true if different from group defaults
  status: 'watching' | 'position' | 'triggered';
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface GroupDisplayData {
  group: ConstraintGroup;
  stocks: StockDisplayData[];
  isExpanded: boolean;
  totalValue: number;
  activePositions: number;
}

export interface StockEditState {
  groupId: string;
  stockSymbol: string;
  isEditing: boolean;
  editValues: StockTriggers;
  isCustom: boolean; // whether this stock has custom triggers
}

export interface GroupUIState {
  expandedGroups: Set<string>;
  editingGroup: string | null;
  editingStock: string | null; // format: "groupId-stockSymbol"
  addingStockToGroup: string | null;
  editValues: StockTriggers;
}