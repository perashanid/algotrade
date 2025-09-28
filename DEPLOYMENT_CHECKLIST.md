# Deployment Checklist for Render

## ✅ Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] Environment variables configured locally and tested
- [ ] Database schema is up to date
- [ ] Build process works locally (`npm run build`)
- [ ] Health check endpoint is working (`/api/health`)

## ✅ Render Configuration

- [ ] `render.yaml` file is present and configured
- [ ] Repository connected to Render
- [ ] Environment variables set in Render dashboard:
  - [ ] `FINNHUB_API_KEY`
  - [ ] `JWT_SECRET` (auto-generated)
  - [ ] `DATABASE_URL` (auto-generated)

## ✅ Post-Deployment

- [ ] Backend service is running (check logs)
- [ ] Frontend is accessible
- [ ] Database connection is working
- [ ] API endpoints are responding
- [ ] Health check returns 200 OK
- [ ] Authentication is working
- [ ] Real-time features are functional

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check TypeScript compilation errors
   - Verify all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Database Connection Issues**:
   - Verify DATABASE_URL is set correctly
   - Check database service is running
   - Review connection pool settings

3. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify sensitive values are not logged

4. **CORS Issues**:
   - Check frontend URL is allowed in CORS config
   - Verify API URL is correct in frontend

### Useful Commands:

```bash
# Test build locally
npm run build

# Check TypeScript compilation
cd backend && npx tsc --noEmit

# Test health endpoint
curl https://your-app.onrender.com/api/health
```