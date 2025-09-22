# Deployment Guide

This guide covers how to deploy the Algorithmic Trading Platform in different environments.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/trading_platform
POSTGRES_USER=trading_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=trading_platform

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Finnhub API Configuration
FINNHUB_API_KEY=your_finnhub_api_key
FINNHUB_BASE_URL=https://finnhub.io/api/v1

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Development Setup

### Quick Start

1. **Run the setup script:**
   ```bash
   # On Unix/Linux/macOS
   chmod +x scripts/dev-setup.sh
   ./scripts/dev-setup.sh
   
   # On Windows
   # Run the commands manually from scripts/dev-setup.sh
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

2. **Start databases:**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Prepare environment:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy:**
   ```bash
   # On Unix/Linux/macOS
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   
   # On Windows - run commands manually:
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d postgres redis
   # Wait 10 seconds
   docker-compose -f docker-compose.prod.yml run --rm backend npm run migrate
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify deployment:**
   ```bash
   curl http://localhost:3001/api/health
   ```

### Manual Production Setup

1. **Build backend:**
   ```bash
   cd backend
   npm ci --only=production
   npm run build
   ```

2. **Build frontend:**
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

3. **Setup databases:**
   - Install PostgreSQL 15+
   - Install Redis 7+
   - Run database migrations

4. **Start services:**
   ```bash
   # Start backend
   cd backend
   npm start
   
   # Serve frontend (use nginx or similar)
   # Point web server to frontend/build directory
   ```

## SSL/HTTPS Setup

For production with HTTPS:

1. **Generate SSL certificates:**
   ```bash
   mkdir -p nginx/ssl
   # Add your SSL certificate files:
   # nginx/ssl/cert.pem
   # nginx/ssl/key.pem
   ```

2. **Update nginx configuration:**
   - Edit `nginx/nginx.conf` with your domain
   - Update SSL certificate paths

3. **Deploy with HTTPS:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d nginx
   ```

## Health Checks

The application provides several health check endpoints:

- **API Health:** `GET /api/health`
- **System Status:** `GET /api/system/status` (requires auth)

## Monitoring

### Logs

- **Backend logs:** `backend/logs/`
- **Docker logs:** `docker-compose logs [service]`

### Metrics

Monitor these key metrics:

- API response times
- Database connection pool usage
- Redis memory usage
- Background job execution
- Constraint evaluation frequency

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec trading_postgres_prod pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restore
docker exec -i trading_postgres_prod psql -U $POSTGRES_USER $POSTGRES_DB < backup.sql
```

### Redis Backup

```bash
# Backup
docker exec trading_redis_prod redis-cli BGSAVE
docker cp trading_redis_prod:/data/dump.rdb ./redis-backup.rdb

# Restore
docker cp ./redis-backup.rdb trading_redis_prod:/data/dump.rdb
docker restart trading_redis_prod
```

## Scaling

### Horizontal Scaling

1. **Load Balancer:** Add nginx/HAProxy in front of multiple backend instances
2. **Database:** Use read replicas for read-heavy operations
3. **Redis:** Use Redis Cluster for high availability

### Vertical Scaling

1. **Increase container resources:**
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Redis connection failed:**
   - Verify Redis is running
   - Check REDIS_URL format

3. **API rate limiting:**
   - Adjust rate limit settings in environment variables
   - Check nginx rate limiting configuration

4. **Background jobs not running:**
   - Check market hours (jobs only run during market hours)
   - Verify constraint evaluation logs
   - Check Redis connectivity

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug
NODE_ENV=development
```

### Performance Issues

1. **Database performance:**
   - Check query execution plans
   - Add database indexes if needed
   - Monitor connection pool usage

2. **API performance:**
   - Check response times in logs
   - Monitor external API rate limits (Finnhub)
   - Optimize constraint evaluation frequency

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access

3. **API Security:**
   - Enable rate limiting
   - Use HTTPS in production
   - Validate all inputs

4. **Container Security:**
   - Run containers as non-root users
   - Keep base images updated
   - Scan for vulnerabilities

## Support

For deployment issues:

1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Check external API status (Finnhub)
5. Review Docker container status