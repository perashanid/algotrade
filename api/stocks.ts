import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors } from './utils/cors';
import { requireAuth } from './lib/auth';
import { executeQuery } from './lib/database';

async function stocksHandler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = requireAuth(req);

    if (req.method === 'GET') {
      const { search } = req.query;
      
      console.log('Stock search request:', { search, userId: user.id });
      
      // If no search term, return popular stocks
      if (!search || typeof search !== 'string' || search.trim().length === 0) {
        const popularStocks = [
          { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
          { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology' },
          { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Technology' },
          { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
          { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Technology' },
          { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
          { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' }
        ];
        
        res.status(200).json({
          success: true,
          data: popularStocks
        });
        return;
      }
      
      // Search for stocks (simulate database search with hardcoded data for now)
      const searchTerm = search.toLowerCase();
      const allStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class A', sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Technology' },
        { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
        { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Technology' },
        { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
        { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
        { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
        { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
        { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
        { symbol: 'QCOM', name: 'Qualcomm Incorporated', sector: 'Technology' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials' },
        { symbol: 'BAC', name: 'Bank of America Corp', sector: 'Financials' },
        { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financials' },
        { symbol: 'GS', name: 'Goldman Sachs Group Inc', sector: 'Financials' },
        { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials' },
        { symbol: 'V', name: 'Visa Inc.', sector: 'Financials' },
        { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financials' },
        { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financials' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
        { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
        { symbol: 'UNH', name: 'UnitedHealth Group Inc', sector: 'Healthcare' },
        { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
        { symbol: 'MRK', name: 'Merck & Co Inc', sector: 'Healthcare' }
      ];
      
      const filteredStocks = allStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm) ||
        stock.name.toLowerCase().includes(searchTerm) ||
        stock.sector.toLowerCase().includes(searchTerm)
      ).slice(0, 15); // Limit to 15 results
      
      console.log('Stock search results:', { searchTerm, count: filteredStocks.length });
      
      res.status(200).json({
        success: true,
        data: filteredStocks
      });
      return;
    }

    res.status(405).json({ 
      success: false,
      error: { message: 'Method not allowed' }
    });
  } catch (error) {
    console.error('Stocks API error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
}

export default withCors(stocksHandler);