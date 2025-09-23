# Vercel Deployment Guide

This guide will help you deploy your Algorithmic Trading Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: Supabase, PlanetScale, or Neon)
3. **API Keys**: Obtain API keys for external services (Finnhub, Alpha Vantage)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Vercel will automatically detect the configuration

### 3. Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

#### Required Variables:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

#### Optional API Keys:
```
FINNHUB_API_KEY=your-finnhub-api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

#### Automatic Variables (set by Vercel):
- `VERCEL_URL` - Your deployment URL
- `VERCEL_ENV` - Environment (production/preview/development)

### 4. Database Setup

#### Option A: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string and set as `DATABASE_URL`

#### Option B: PlanetScale
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Create branch and get connection string
4. Set as `DATABASE_URL`

#### Option C: Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create database
3. Copy connection string and set as `DATABASE_URL`

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be available at `https://your-project.vercel.app`

### 6. Run Database Migrations

After deployment, you'll need to run migrations. You can do this by:

1. **Using Vercel CLI** (recommended):
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   cd backend && npm run migrate
   ```

2. **Using your database provider's console** (run the SQL files manually)

3. **Using a one-time serverless function** (create a temporary API endpoint)

## Project Structure

```
/
├── frontend/           # React frontend (deployed to Vercel)
├── backend/           # Node.js backend (deployed as Vercel Functions)
├── vercel.json        # Vercel configuration
└── package.json       # Root package.json
```

## Build Configuration

The project is configured with:
- **Frontend**: Vite build system, outputs to `frontend/dist`
- **Backend**: TypeScript compilation, deployed as serverless functions
- **Routing**: API routes go to `/api/*`, everything else to frontend

## Environment-Specific Configurations

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Database: Local PostgreSQL

### Production (Vercel)
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.vercel.app/api`
- Database: Cloud PostgreSQL (Supabase/PlanetScale/Neon)

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Ensure `DATABASE_URL` is correctly set
   - Check if your database allows connections from Vercel IPs

2. **API Routes Not Working**
   - Verify `vercel.json` routing configuration
   - Check function logs in Vercel dashboard

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

4. **CORS Issues**
   - Backend automatically uses `VERCEL_URL` for CORS
   - Check if `FRONTEND_URL` is set correctly

### Debugging:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard > Functions tab
   - Click on any function to see logs

2. **Local Testing**:
   ```bash
   vercel dev  # Test locally with Vercel environment
   ```

3. **Environment Variables**:
   ```bash
   vercel env ls  # List all environment variables
   ```

## Performance Optimization

1. **Database Connection Pooling**: Use connection pooling for better performance
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Vercel automatically provides CDN for static assets

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secrets**: Use strong, unique JWT secrets
3. **Database Security**: Use SSL connections and proper authentication
4. **API Rate Limiting**: Implement rate limiting for API endpoints

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Consider integrating Sentry or similar
3. **Database Monitoring**: Use your database provider's monitoring tools

## Scaling

Vercel automatically scales your application based on traffic. For database scaling:
- **Supabase**: Automatic scaling available
- **PlanetScale**: Built-in scaling features
- **Neon**: Automatic scaling with usage-based pricing

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)