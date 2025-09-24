# Deployment Guide - Render

This guide explains how to deploy the Algorithmic Trading Platform to Render.

## Prerequisites

1. GitHub repository with your code
2. Render account (free tier available)
3. PostgreSQL database (can be created on Render)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   The render.yaml file will automatically set up most variables, but you may need to add:
   - `JWT_SECRET` (will be auto-generated)
   - `DATABASE_URL` (will be auto-configured)

### Option 2: Manual Setup

#### Deploy Backend (Web Service)

1. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `algotrade-backend`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install && npm run build`
     - **Start Command**: `cd backend && npm start`
     - **Health Check Path**: `/api/health`

2. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgres-connection-string>
   JWT_SECRET=<generate-a-secure-secret>
   JWT_EXPIRES_IN=7d
   ```

#### Deploy Frontend (Static Site)

1. **Create Static Site**
   - Click "New" → "Static Site"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `algotrade-frontend`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

#### Create Database

1. **Create PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Configure:
     - **Name**: `algotrade-db`
     - **Database Name**: `algotrade`
     - **User**: `algotrade_user`

2. **Run Database Migrations**
   - Connect to your database
   - Run the SQL from `database/schema.sql`

## Post-Deployment

1. **Update API URL**
   - Copy your backend service URL from Render
   - Update the frontend environment variable `VITE_API_URL`

2. **Test the Application**
   - Visit your frontend URL
   - Test login/registration
   - Verify API connectivity

## Environment Variables Reference

### Backend
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render default)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string
- `JWT_EXPIRES_IN`: `7d`
- `FRONTEND_URL`: Your frontend URL (for CORS)

### Frontend
- `VITE_API_URL`: Your backend API URL

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set in backend
   - Check CORS configuration in `backend/src/server.ts`

2. **Database Connection**
   - Verify `DATABASE_URL` is correct
   - Ensure database schema is created

3. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json

4. **API Not Found (404)**
   - Ensure backend is deployed and running
   - Check `VITE_API_URL` in frontend

### Logs

- Backend logs: Render dashboard → Backend service → Logs
- Frontend build logs: Render dashboard → Frontend service → Logs

## Scaling

Render automatically handles:
- SSL certificates
- CDN for static assets
- Auto-scaling (paid plans)
- Health checks and restarts

For production use, consider upgrading to paid plans for:
- Better performance
- Custom domains
- Advanced monitoring