# 🚀 MotionFalcon Production Deployment Checklist

## 📋 Pre-Deployment Requirements

### ✅ System Requirements
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] At least 4GB RAM available
- [ ] At least 10GB disk space
- [ ] Ports 80, 3000, 8000, 5432, 6379 available

### ✅ Environment Configuration
- [ ] Copy `env.production.template` to `.env.production`
- [ ] Update all environment variables in `.env.production`
- [ ] Set secure passwords for database and secret keys
- [ ] Configure Razorpay API keys (if using payments)
- [ ] Configure email settings (if using email features)

### ✅ Security Checklist
- [ ] Change default database passwords
- [ ] Generate strong SECRET_KEY
- [ ] Update API keys and secrets
- [ ] Configure firewall rules
- [ ] Set up SSL certificates (recommended)

## 🔧 Deployment Steps

### 1. Environment Setup
```bash
# Copy environment template
cp env.production.template .env.production

# Edit environment variables
nano .env.production
```

### 2. Database Preparation
```bash
# Ensure PostgreSQL is ready
# Ensure Redis is ready
# Update connection strings in .env.production
```

### 3. Build and Deploy
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 4. Manual Deployment (Alternative)
```bash
# Create directories
mkdir -p logs/nginx ssl

# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

# Check service health
docker-compose -f docker-compose.prod.yml ps
```

## 🏥 Health Checks

### Backend Health
```bash
curl http://localhost:8000/health
# Expected: "healthy" response
```

### Frontend Health
```bash
curl http://localhost:3000/health
# Expected: "healthy" response
```

### Database Health
```bash
docker exec motionfalcon-postgres-prod pg_isready -U motionfalcon
# Expected: "accepting connections" response
```

### Redis Health
```bash
docker exec motionfalcon-redis-prod redis-cli ping
# Expected: "PONG" response
```

## 📊 Monitoring and Logs

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

### Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Resource Usage
```bash
docker stats
```

## 🔒 Security Hardening

### SSL/HTTPS Setup
1. Obtain SSL certificates
2. Place in `./ssl/` directory
3. Update nginx configuration
4. Restart nginx service

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

### Database Security
- [ ] Change default PostgreSQL port
- [ ] Restrict database access to application only
- [ ] Enable SSL connections
- [ ] Regular backup schedule

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :8000

# Stop conflicting service
sudo systemctl stop conflicting-service
```

#### Database Connection Issues
```bash
# Check database container
docker exec motionfalcon-postgres-prod psql -U motionfalcon -d crypto_db

# Check environment variables
docker-compose -f docker-compose.prod.yml config
```

#### Frontend Build Issues
```bash
# Clear node modules and rebuild
cd crypto-frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Memory Issues
```bash
# Check container memory usage
docker stats

# Increase Docker memory limit in Docker Desktop
# Or add memory limits to docker-compose
```

## 📈 Performance Optimization

### Backend Optimization
- [ ] Enable database connection pooling
- [ ] Configure Redis caching
- [ ] Enable response compression
- [ ] Set up CDN for static assets

### Frontend Optimization
- [ ] Enable gzip compression
- [ ] Configure browser caching
- [ ] Optimize bundle size
- [ ] Enable service worker (PWA)

### Database Optimization
- [ ] Create database indexes
- [ ] Optimize queries
- [ ] Regular maintenance
- [ ] Monitor slow queries

## 🔄 Maintenance

### Regular Tasks
- [ ] Database backups (daily)
- [ ] Log rotation (weekly)
- [ ] Security updates (monthly)
- [ ] Performance monitoring (ongoing)

### Update Process
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📞 Support

### Log Locations
- Nginx logs: `./logs/nginx/`
- Application logs: `docker-compose -f docker-compose.prod.yml logs`
- Database logs: `docker logs motionfalcon-postgres-prod`

### Emergency Commands
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🎯 Quick Start Commands

```bash
# 1. Setup environment
cp env.production.template .env.production
nano .env.production

# 2. Deploy
./deploy.sh

# 3. Check status
docker-compose -f docker-compose.prod.yml ps

# 4. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Happy Deploying! 🚀**
