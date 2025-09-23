# 🚀 Simple Vercel Deployment

## Quick Deploy (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel auto-detects everything ✅

### 3. Add Environment Variables
In Vercel dashboard, add these variables:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key  
FINNHUB_API_KEY=your_finnhub_api_key
NODE_ENV=production
```

### 4. Deploy
Click "Deploy" - that's it! 🎉

## ✅ What's Automatic

- **Build detection**: Vercel auto-detects Vite/React
- **CORS handling**: API automatically allows your Vercel domain
- **Routing**: `/api/*` routes to serverless functions
- **Static files**: Frontend served from `/`
- **SSL**: HTTPS enabled automatically
- **CDN**: Global edge network included

## 🧪 Test Your Deployment

Visit: `https://your-app.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## 🔄 Auto-Deployments

Every push to `main` automatically deploys. No manual steps needed!

## 📞 Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [GitHub Issues](https://github.com/your-repo/issues)