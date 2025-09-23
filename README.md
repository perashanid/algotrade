# Algorithmic Trading Platform

A full-stack algorithmic trading platform with custom constraints and portfolio tracking.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Deploy to Vercel
1. Fork this repository
2. Connect to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

**Note**: CORS is handled automatically - no additional configuration needed!

## Environment Variables

Set these in your Vercel dashboard:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
FINNHUB_API_KEY=your_finnhub_api_key
```

## Project Structure

```
├── api/           # Vercel serverless functions
├── backend/       # Local development backend
├── frontend/      # React frontend
└── database/      # Database schema
```

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Deployment**: Vercel

## License

MIT