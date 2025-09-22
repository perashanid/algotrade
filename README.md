# Algorithmic Trading Platform

A web-based algorithmic trading platform that allows users to create custom trading constraints, monitor portfolio performance, and compare results against market benchmarks using real-time stock market data from Finnhub API.

## Features

- **Custom Trading Constraints**: Create percentage-based buy/sell triggers
- **Real-time Portfolio Monitoring**: Track portfolio performance with live data
- **Market Comparison**: Compare portfolio performance against S&P 500
- **Backtesting**: Test trading strategies against historical data
- **Trading History**: Analyze past trades and constraint performance
- **Real-time Data**: Integration with Finnhub API for live stock prices

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Redis caching
- **External API**: Finnhub for stock market data
- **Deployment**: Docker containers

## Quick Start

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd algorithmic-trading-platform
   ```

2. **Run setup script** (recommended):
   ```bash
   # On Unix/Linux/macOS
   chmod +x scripts/dev-setup.sh
   ./scripts/dev-setup.sh
   
   # On Windows - run commands manually from scripts/dev-setup.sh
   ```

3. **Or manual setup**:
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Install dependencies
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   
   # Start databases
   docker-compose up -d postgres redis
   
   # Run migrations
   cd backend && npm run migrate && cd ..
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

## Demo Account

The platform includes a pre-configured demo account with sample data:

**Demo Credentials:**
- **Email**: `demo@algotrader.com`
- **Password**: `demo123`

**Demo Features:**
- Pre-loaded portfolio with 5 stock positions (AAPL, GOOGL, MSFT, JPM, JNJ)
- Sample trading constraints (risk management, stop loss, sector limits)
- Historical trade data for testing
- Total portfolio value: ~$37,000 with realistic P&L

**Setting up Demo Data:**
```bash
# Run database setup with demo data
npm run setup

# Or run individually
npm run migrate    # Create tables
npm run seed:demo  # Add demo user and data
```

The demo account is automatically created when you run the setup script. You can click "Try Demo Account" on the login page to auto-fill the credentials.

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

**Quick production deployment with Docker:**
```bash
# Configure environment
cp .env.example .env
# Edit .env with production values

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Constraints
- `GET /api/constraints` - Get user constraints
- `POST /api/constraints` - Create new constraint
- `PUT /api/constraints/:id` - Update constraint
- `DELETE /api/constraints/:id` - Delete constraint

### Portfolio
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/portfolio/positions` - Get all positions
- `GET /api/portfolio/performance` - Get performance metrics

### Market Data
- `GET /api/market/quote/:symbol` - Get current stock price
- `GET /api/market/history/:symbol` - Get historical data

### Backtesting
- `POST /api/backtest` - Run backtest simulation

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `FINNHUB_API_KEY`: Your Finnhub API key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token signing

## Development

### Project Structure
```
├── backend/          # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── types/
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── types/
└── docker-compose.yml
```

### Running Tests
```bash
npm test                # Run all tests
npm run test:backend    # Backend tests only
npm run test:frontend   # Frontend tests only
```

### Building for Production
```bash
npm run build
```

## License

MIT License