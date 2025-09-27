# Algorithmic Trading Platform

A full-stack trading platform with custom constraints and portfolio tracking.

## Features

- Portfolio tracking and management
- Custom trading constraints
- Real-time price monitoring
- Backtesting capabilities
- Performance analytics
- User authentication and authorization

## Tech Stack

- Backend: Node.js, Express, TypeScript, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Deployment: Render
- Database: PostgreSQL

## Installation

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:
- `FINNHUB_API_KEY` - Your Finnhub API key
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens

## Usage

```bash
npm run dev
```

## Project Structure

```
├── backend/          # Node.js/Express API
├── frontend/         # React/Vite frontend
├── database/         # Database schema
└── render.yaml       # Render deployment config
```
