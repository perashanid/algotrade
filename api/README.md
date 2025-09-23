# API Endpoints

This directory contains Vercel serverless functions for the trading platform API.

## Available Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/portfolio` - Portfolio data
- `GET /api/constraints` - Trading constraints

## File Structure

```
api/
├── health.ts           # GET /api/health
├── portfolio.ts        # GET /api/portfolio  
├── constraints.ts      # GET /api/constraints
└── auth/
    ├── login.ts        # POST /api/auth/login
    └── register.ts     # POST /api/auth/register
```

## Testing

Use the `test-api.html` file in the root directory to test all endpoints after deployment.

## Notes

- All endpoints return placeholder data
- CORS is enabled for all origins (`*`)
- Connect to a database for full functionality