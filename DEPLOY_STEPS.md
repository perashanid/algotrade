# 🚀 Simple Vercel Deployment Steps

## Step 1: Prepare Code
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Step 2: Deploy to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Click "Deploy"

## Step 3: Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
DATABASE_URL = postgresql://test_ndo2_user:vAOUnFxDqVJxnNQLVuXGMaQhdABHqQqV@dpg-d358vt33fgac73b8tv5g-a.singapore-postgres.render.com/test_ndo2

JWT_SECRET = your-super-secret-jwt-key-here

NODE_ENV = production
```

**Optional:**
```
JWT_EXPIRES_IN = 7d
FINNHUB_API_KEY = your-api-key
ALPHA_VANTAGE_API_KEY = your-api-key
```

## Step 4: Test
1. Visit your Vercel URL
2. Test `/api/health` endpoint
3. Register and login
4. Create constraints

## ✅ Done!
Your trading platform is live! 🎉

**Note**: Your PostgreSQL database is already set up and contains all the necessary tables and data.