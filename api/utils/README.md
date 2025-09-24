# Smart CORS Configuration

This utility automatically manages CORS headers for your Vercel deployment.

## Features

✅ **Auto-detects deployment URL** - No manual configuration needed
✅ **Environment-aware** - Different settings for dev vs production
✅ **Security-focused** - Restrictive in production, permissive in development
✅ **Vercel-optimized** - Works with Vercel's deployment system

## How it works

1. **Development**: Allows localhost origins (3000, 3001)
2. **Production**: Auto-detects Vercel URLs from environment variables
3. **Fallback**: Uses request headers to determine allowed origins

## Usage

```typescript
import { withCors } from './utils/cors';

async function myApiHandler(req: VercelRequest, res: VercelResponse) {
  // Your API logic here
}

export default withCors(myApiHandler);
```

## Environment Variables (Optional)

- `FRONTEND_URL` - Custom frontend URL (optional)
- `VERCEL_URL` - Automatically set by Vercel
- `VERCEL_BRANCH_URL` - Automatically set by Vercel

## No Configuration Required

The CORS utility automatically:
- Detects your Vercel deployment URL
- Handles preflight requests
- Sets appropriate security headers
- Manages credentials and caching