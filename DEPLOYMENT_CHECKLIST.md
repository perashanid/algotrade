# Vercel Deployment Checklist

## Pre-Deployment Setup

### ✅ Code Preparation
- [ ] All code committed and pushed to Git repository
- [ ] Environment variables documented in `.env.example`
- [ ] Build scripts tested locally
- [ ] Database migrations ready

### ✅ External Services
- [ ] PostgreSQL database set up (Supabase/PlanetScale/Neon)
- [ ] Database connection string obtained
- [ ] API keys obtained (Finnhub, Alpha Vantage - optional)
- [ ] Database schema created (run migrations)

## Vercel Configuration

### ✅ Project Setup
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Project imported successfully

### ✅ Environment Variables (in Vercel Dashboard)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Strong secret key for JWT tokens
- [ ] `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- [ ] `NODE_ENV` - Set to "production"
- [ ] `FINNHUB_API_KEY` - (Optional) For real market data
- [ ] `ALPHA_VANTAGE_API_KEY` - (Optional) For additional data

### ✅ Build Configuration
- [ ] `vercel.json` configured correctly
- [ ] Frontend build outputs to `dist` directory
- [ ] Backend API routes configured for `/api/*`

## Post-Deployment

### ✅ Database Setup
- [ ] Run database migrations
- [ ] Seed initial data (optional)
- [ ] Test database connectivity

### ✅ Testing
- [ ] Health check endpoint working (`/api/health`)
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database operations working

### ✅ Monitoring
- [ ] Check Vercel function logs
- [ ] Monitor database connections
- [ ] Test error handling
- [ ] Verify CORS configuration

## Quick Commands

### Local Testing with Vercel
```bash
npm install -g vercel
vercel dev
```

### Deploy to Vercel
```bash
vercel --prod
```

### Check Environment Variables
```bash
vercel env ls
```

### View Function Logs
```bash
vercel logs
```

## Common Issues & Solutions

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly formatted
- Check database allows connections from Vercel IPs
- Verify SSL settings if required

### Build Failures
- Check all dependencies are in `package.json`
- Verify build scripts work locally
- Check Vercel build logs for specific errors

### API Route Issues
- Verify `vercel.json` routing configuration
- Check function logs in Vercel dashboard
- Ensure API endpoints are properly exported

### CORS Issues
- Backend automatically uses `VERCEL_URL` for CORS
- Check if custom domains need additional CORS configuration

## Success Indicators

✅ **Frontend**: Loads at `https://your-project.vercel.app`
✅ **API Health**: `https://your-project.vercel.app/api/health` returns 200
✅ **Authentication**: Login/register functionality works
✅ **Database**: Data persists and loads correctly
✅ **Real-time Features**: All trading features functional

## Next Steps After Deployment

1. **Custom Domain**: Add custom domain in Vercel settings
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **Performance**: Monitor and optimize based on usage
5. **Scaling**: Monitor database performance and scale as needed

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Database Provider Documentation](https://supabase.com/docs) (or your chosen provider)