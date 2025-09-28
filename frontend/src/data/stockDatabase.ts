// Comprehensive stock database with company names for search functionality
export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  marketCap?: string;
}

export const stockDatabase: StockInfo[] = [
  // Technology
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', marketCap: 'Large' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services', marketCap: 'Large' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class A', sector: 'Technology', industry: 'Internet Services', marketCap: 'Large' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', marketCap: 'Large' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology', industry: 'E-commerce', marketCap: 'Large' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Technology', industry: 'Electric Vehicles', marketCap: 'Large' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Social Media', marketCap: 'Large' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Technology', industry: 'Streaming', marketCap: 'Large' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', industry: 'Software', marketCap: 'Large' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'Cloud Software', marketCap: 'Large' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Database Software', marketCap: 'Large' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology', industry: 'Semiconductors', marketCap: 'Large' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology', industry: 'Networking', marketCap: 'Large' },
  { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology', industry: 'IT Services', marketCap: 'Large' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology', industry: 'Ride Sharing', marketCap: 'Large' },
  { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology', industry: 'Ride Sharing', marketCap: 'Mid' },
  { symbol: 'SNAP', name: 'Snap Inc.', sector: 'Technology', industry: 'Social Media', marketCap: 'Mid' },
  { symbol: 'PINS', name: 'Pinterest Inc.', sector: 'Technology', industry: 'Social Media', marketCap: 'Mid' },
  { symbol: 'SQ', name: 'Block Inc.', sector: 'Technology', industry: 'Fintech', marketCap: 'Mid' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Technology', industry: 'Fintech', marketCap: 'Large' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', industry: 'E-commerce', marketCap: 'Mid' },
  { symbol: 'ROKU', name: 'Roku Inc.', sector: 'Technology', industry: 'Streaming', marketCap: 'Small' },
  { symbol: 'ZM', name: 'Zoom Video Communications', sector: 'Technology', industry: 'Video Conferencing', marketCap: 'Mid' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology', industry: 'Software', marketCap: 'Mid' },
  { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: 'Mid' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', industry: 'Cybersecurity', marketCap: 'Large' },
  { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: 'Mid' },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology', industry: 'Software', marketCap: 'Mid' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Software', marketCap: 'Large' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Data Analytics', marketCap: 'Mid' },
  { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Technology', industry: 'Gaming', marketCap: 'Mid' },

  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Banking', marketCap: 'Large' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financials', industry: 'Banking', marketCap: 'Large' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financials', industry: 'Banking', marketCap: 'Large' },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials', industry: 'Investment Banking', marketCap: 'Large' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials', industry: 'Investment Banking', marketCap: 'Large' },
  { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financials', industry: 'Banking', marketCap: 'Large' },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financials', industry: 'Credit Services', marketCap: 'Large' },
  { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financials', industry: 'Asset Management', marketCap: 'Large' },
  { symbol: 'SCHW', name: 'Charles Schwab Corporation', sector: 'Financials', industry: 'Brokerage', marketCap: 'Large' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financials', industry: 'Payment Processing', marketCap: 'Large' },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financials', industry: 'Payment Processing', marketCap: 'Large' },
  { symbol: 'SPGI', name: 'S&P Global Inc.', sector: 'Financials', industry: 'Financial Data', marketCap: 'Large' },
  { symbol: 'MCO', name: 'Moody\'s Corporation', sector: 'Financials', industry: 'Credit Rating', marketCap: 'Large' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 'Large' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 'Large' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', industry: 'Health Insurance', marketCap: 'Large' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 'Large' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 'Large' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', industry: 'Life Sciences', marketCap: 'Large' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices', marketCap: 'Large' },
  { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare', industry: 'Pharmacy', marketCap: 'Large' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', industry: 'Life Sciences', marketCap: 'Large' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 'Large' },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: 'Large' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: 'Large' },
  { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: 'Mid' },

  // Consumer Discretionary
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement', marketCap: 'Large' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', marketCap: 'Large' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Discretionary', industry: 'Apparel', marketCap: 'Large' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', marketCap: 'Large' },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement', marketCap: 'Large' },
  { symbol: 'TJX', name: 'TJX Companies Inc.', sector: 'Consumer Discretionary', industry: 'Retail', marketCap: 'Large' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', sector: 'Consumer Discretionary', industry: 'Travel', marketCap: 'Large' },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Consumer Discretionary', industry: 'Entertainment', marketCap: 'Large' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Consumer Discretionary', industry: 'Automotive', marketCap: 'Large' },
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Consumer Discretionary', industry: 'Automotive', marketCap: 'Large' },

  // Consumer Staples
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Retail', marketCap: 'Large' },
  { symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Staples', industry: 'Consumer Goods', marketCap: 'Large' },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples', industry: 'Beverages', marketCap: 'Large' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', industry: 'Beverages', marketCap: 'Large' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples', industry: 'Retail', marketCap: 'Large' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Oil & Gas', marketCap: 'Large' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas', marketCap: 'Large' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas', marketCap: 'Large' },

  // Industrials
  { symbol: 'BA', name: 'Boeing Company', sector: 'Industrials', industry: 'Aerospace', marketCap: 'Large' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Heavy Machinery', marketCap: 'Large' },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials', industry: 'Conglomerate', marketCap: 'Large' },
  { symbol: 'MMM', name: '3M Company', sector: 'Industrials', industry: 'Conglomerate', marketCap: 'Large' },
  { symbol: 'HON', name: 'Honeywell International', sector: 'Industrials', industry: 'Conglomerate', marketCap: 'Large' },
  { symbol: 'UPS', name: 'United Parcel Service', sector: 'Industrials', industry: 'Logistics', marketCap: 'Large' },
  { symbol: 'FDX', name: 'FedEx Corporation', sector: 'Industrials', industry: 'Logistics', marketCap: 'Large' },

  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', industry: 'Electric Utility', marketCap: 'Large' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities', industry: 'Electric Utility', marketCap: 'Large' },
  { symbol: 'SO', name: 'Southern Company', sector: 'Utilities', industry: 'Electric Utility', marketCap: 'Large' },
  { symbol: 'D', name: 'Dominion Energy Inc.', sector: 'Utilities', industry: 'Electric Utility', marketCap: 'Large' },

  // Communication Services
  { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', industry: 'Telecom', marketCap: 'Large' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom', marketCap: 'Large' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services', industry: 'Media', marketCap: 'Large' },
  { symbol: 'CHTR', name: 'Charter Communications', sector: 'Communication Services', industry: 'Cable', marketCap: 'Large' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication Services', industry: 'Telecom', marketCap: 'Large' },

  // Real Estate
  { symbol: 'AMT', name: 'American Tower Corporation', sector: 'Real Estate', industry: 'REITs', marketCap: 'Large' },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate', industry: 'REITs', marketCap: 'Large' },
  { symbol: 'CCI', name: 'Crown Castle International', sector: 'Real Estate', industry: 'REITs', marketCap: 'Large' },

  // Materials
  { symbol: 'LIN', name: 'Linde plc', sector: 'Materials', industry: 'Chemicals', marketCap: 'Large' },
  { symbol: 'APD', name: 'Air Products and Chemicals', sector: 'Materials', industry: 'Chemicals', marketCap: 'Large' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', sector: 'Materials', industry: 'Mining', marketCap: 'Large' },
  { symbol: 'NEM', name: 'Newmont Corporation', sector: 'Materials', industry: 'Mining', marketCap: 'Large' }
];

// Search function for stocks by symbol or company name
export const searchStocks = (query: string, limit: number = 10): StockInfo[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  // First, find exact symbol matches
  const exactSymbolMatches = stockDatabase.filter(stock => 
    stock.symbol.toLowerCase() === searchTerm
  );
  
  // Then, find symbol starts with matches
  const symbolStartsWithMatches = stockDatabase.filter(stock => 
    stock.symbol.toLowerCase().startsWith(searchTerm) && 
    !exactSymbolMatches.includes(stock)
  );
  
  // Then, find company name starts with matches
  const nameStartsWithMatches = stockDatabase.filter(stock => 
    stock.name.toLowerCase().startsWith(searchTerm) && 
    !exactSymbolMatches.includes(stock) && 
    !symbolStartsWithMatches.includes(stock)
  );
  
  // Finally, find partial matches in symbol or name
  const partialMatches = stockDatabase.filter(stock => 
    (stock.symbol.toLowerCase().includes(searchTerm) || 
     stock.name.toLowerCase().includes(searchTerm)) &&
    !exactSymbolMatches.includes(stock) &&
    !symbolStartsWithMatches.includes(stock) &&
    !nameStartsWithMatches.includes(stock)
  );
  
  // Combine results in order of relevance
  const results = [
    ...exactSymbolMatches,
    ...symbolStartsWithMatches,
    ...nameStartsWithMatches,
    ...partialMatches
  ];
  
  return results.slice(0, limit);
};

// Get stock info by symbol
export const getStockInfo = (symbol: string): StockInfo | undefined => {
  return stockDatabase.find(stock => stock.symbol.toLowerCase() === symbol.toLowerCase());
};

// Get all unique sectors
export const getAllSectors = (): string[] => {
  const sectors = [...new Set(stockDatabase.map(stock => stock.sector))];
  return sectors.sort();
};

// Get stocks by sector
export const getStocksBySector = (sector: string): StockInfo[] => {
  return stockDatabase.filter(stock => stock.sector === sector);
};