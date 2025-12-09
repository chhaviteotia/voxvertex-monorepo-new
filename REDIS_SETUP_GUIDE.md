# Redis Setup Guide for OTP Storage

## Why Redis for OTPs?

✅ **Redis is the traditional and correct approach** for OTP storage because:
- **Fast**: In-memory database, microseconds latency
- **TTL Support**: Built-in expiration (perfect for temporary OTPs)
- **Designed for ephemeral data**: Sessions, cache, temporary tokens
- **Industry standard**: Used by major platforms (AWS, Auth0, etc.)

## Installation

### Windows

#### Option 1: WSL (Recommended)
```bash
# Install Redis in WSL Ubuntu
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping  # Should return PONG
```

#### Option 2: Memurai (Windows Native)
1. Download: https://www.memurai.com/get-memurai
2. Install and start the service
3. Redis runs on `localhost:6379` by default

#### Option 3: Docker (Recommended for Development)
```bash
docker run -d -p 6379:6379 --name redis redis:latest
docker ps  # Verify it's running
```

### macOS
```bash
brew install redis
brew services start redis
redis-cli ping  # Should return PONG
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping  # Should return PONG
```

## Configuration

### 1. Backend Environment Variables

Create or update `apps/backend/.env`:

```env
# Redis Configuration (REQUIRED for optimal OTP performance)
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: If Redis requires password
# REDIS_PASSWORD=your_redis_password

# Optional: For AWS ElastiCache or TLS-enabled Redis
# REDIS_TLS=true

# MongoDB (still required as fallback)
MONGODB_URI=your_mongodb_uri
```

### 2. Verify Redis Connection

Start your backend server and look for:
```
✅ Redis connected and ready
   Host: localhost:6379
```

If you see:
```
⚠️ Redis connection error: connect ECONNREFUSED
```
→ Redis is not running. Start Redis server.

## Testing Redis

### 1. Test Redis Connection
```bash
# In terminal
redis-cli ping
# Should return: PONG
```

### 2. Test from Backend
```javascript
// In backend console or test script
const redis = require('./src/configs/redis.config.js').default;
redis.ping().then(result => console.log(result)); // Should log "PONG"
```

### 3. Test OTP Storage
Send an OTP and check logs:
```
✅ OTP stored in Redis (PRIMARY) for email@example.com (email): 123456
```

Check Redis directly:
```bash
redis-cli
KEYS expert:otp:*
GET expert:otp:email:email@example.com
```

## Current Implementation

### Storage Strategy
1. **Redis (PRIMARY)**: Fast, TTL-enabled, traditional approach
2. **MongoDB (BACKUP)**: Optional audit log, fallback if Redis fails

### Verification Strategy
1. Check Redis first (fast lookup)
2. Fallback to MongoDB if Redis unavailable
3. Both systems work independently

## Troubleshooting

### Issue: Redis not connecting

**Check 1: Is Redis running?**
```bash
# Windows (Memurai/Docker)
tasklist | findstr redis

# macOS/Linux
ps aux | grep redis

# Docker
docker ps | grep redis
```

**Check 2: Is Redis on correct port?**
```bash
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

**Check 3: Firewall blocking?**
- Windows: Check Windows Firewall
- Linux: `sudo ufw allow 6379`

### Issue: Connection timeout

**Solution 1: Increase timeout**
```env
# In redis.config.js - already set to 10 seconds
connectTimeout: 10000
```

**Solution 2: Check Redis logs**
```bash
# Find Redis log location
redis-cli CONFIG GET logfile

# Or check system logs
# macOS: /usr/local/var/log/redis.log
# Linux: /var/log/redis/redis-server.log
```

### Issue: Use MongoDB only (disable Redis)

Set in `.env`:
```env
USE_REDIS=false
```

System will automatically use MongoDB only.

## Production Considerations

### Redis Hosting Options

1. **AWS ElastiCache**: Managed Redis service
2. **Redis Cloud**: Hosted Redis (free tier available)
3. **DigitalOcean**: Managed Redis
4. **Self-hosted**: Your own Redis server

### Production Configuration

```env
# Production example
USE_REDIS=true
REDIS_HOST=your-redis-host.redis.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
REDIS_TLS=true  # If using TLS
```

## Performance Comparison

| Storage | Read Speed | Write Speed | TTL Support | Persistence |
|---------|-----------|-------------|-------------|-------------|
| **Redis** | ~100μs | ~100μs | ✅ Built-in | Optional |
| **MongoDB** | ~1-10ms | ~1-10ms | ❌ Manual | Always |

**Redis is 10-100x faster for OTP operations!**

## Summary

✅ **Redis is the correct choice** for OTP storage
✅ **System works with or without Redis** (MongoDB fallback)
✅ **Redis significantly improves performance** (10-100x faster)
✅ **Setup is simple** - just install and configure

**Recommendation**: Install Redis for optimal OTP performance. The system will work with MongoDB only, but Redis provides much better performance for this use case.


