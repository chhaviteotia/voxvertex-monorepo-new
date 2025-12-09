import Redis from 'ioredis';

let redis = null;
let redisAvailable = false;
let redisConnecting = false;
let redisFailedPermanently = false;

// Check if Redis should be used (can be disabled via env)
const USE_REDIS = process.env.USE_REDIS !== 'false';

/**
 * Check if Redis is actually connected and ready
 */
const isRedisReady = async () => {
  if (!redis || !USE_REDIS) {
    return false;
  }
  
  try {
    // Check connection status
    if (redis.status !== 'ready') {
      return false;
    }
    
    // Test with a PING command
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    return false;
  }
};

/**
 * Initialize Redis connection
 */
const initializeRedis = async () => {
  if (!USE_REDIS) {
    console.log('ℹ️ Redis disabled via USE_REDIS=false - using MongoDB');
    return;
  }

  try {
    // Parse host and port - handle case where port is included in host
    let redisHost = process.env.REDIS_HOST || 'localhost';
    let redisPort = process.env.REDIS_PORT;
    const originalHost = redisHost;
    
    // ALWAYS check if port is included in host FIRST (priority over REDIS_PORT)
    // This prevents duplication when both are set
    if (redisHost.includes(':')) {
      const parts = redisHost.split(':');
      redisHost = parts[0];
      const portFromHost = parts[1];
      
      // Use port from host if available, otherwise use REDIS_PORT
      if (portFromHost) {
        redisPort = portFromHost;
        if (process.env.REDIS_PORT && process.env.REDIS_PORT !== portFromHost) {
          console.warn('⚠️ Port detected in REDIS_HOST conflicts with REDIS_PORT. Using port from REDIS_HOST:', portFromHost);
          console.warn('   💡 Recommended: Remove port from REDIS_HOST and use REDIS_PORT instead');
        }
      }
    }
    
    redisPort = parseInt(redisPort || '6379');
    
    // Validate port
    if (isNaN(redisPort) || redisPort < 1 || redisPort > 65535) {
      console.error('❌ Invalid REDIS_PORT:', process.env.REDIS_PORT);
      redisFailedPermanently = true;
      return;
    }
    
    // Auto-detect if TLS is needed (Redis Cloud, AWS ElastiCache, etc.)
    const isRedisCloud = redisHost.includes('redis') && (
      redisHost.includes('cloud') || 
      redisHost.includes('redislabs') ||
      redisHost.includes('cache.amazonaws.com') ||
      redisHost.includes('cache.windows.net')
    );
    
    // Determine if TLS should be used
    // CRITICAL FIX: Redis Cloud port 12953 is NON-TLS by default
    // The "wrong version number" error means TLS is enabled but port doesn't support it
    let useTLS = false; // Default to false
    
    // Only enable TLS if explicitly set
    if (process.env.REDIS_TLS === 'true') {
      useTLS = true;
    }
    
    if (isRedisCloud && process.env.REDIS_TLS === undefined) {
      // For Redis Cloud without explicit TLS setting, default to NO TLS
      // Port 12953 is typically NON-TLS
      useTLS = false;
    }
    
    // Debug output - only show once
    if (!process.env._REDIS_DEBUG_SHOWN) {
      console.log('\n🔍 Redis Connection Debug:');
      console.log('─'.repeat(60));
      console.log(`Original REDIS_HOST: ${originalHost}`);
      console.log(`Parsed Host: ${redisHost}`);
      console.log(`Parsed Port: ${redisPort}`);
      console.log(`Password: ${process.env.REDIS_PASSWORD ? '***' + process.env.REDIS_PASSWORD.slice(-4) : 'Not set'}`);
      console.log(`TLS: ${useTLS ? 'Enabled' : 'Disabled'}`);
      console.log(`Redis Cloud Detected: ${isRedisCloud ? 'Yes' : 'No'}`);
      
      // Credential validation warnings
      if (isRedisCloud) {
        if (!process.env.REDIS_PASSWORD) {
          console.warn('⚠️  WARNING: Redis Cloud requires password but REDIS_PASSWORD is not set!');
        }
        if (!useTLS) {
          console.log('ℹ️  Redis Cloud: Using NON-TLS connection (default)');
          console.log('   💡 If this fails with SSL error, try: REDIS_TLS=true');
          console.log('   💡 Or check Redis Cloud dashboard for TLS-specific port');
        }
      }
      
      console.log('─'.repeat(60));
      console.log('💡 Run "npm run test:redis" for detailed connection testing');
      console.log('─'.repeat(60) + '\n');
      process.env._REDIS_DEBUG_SHOWN = 'true';
    }
    
    // Try connection without TLS first for Redis Cloud (more common)
    // If that fails with SSL error, we'll try with TLS
    redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: process.env.REDIS_PASSWORD || undefined,
      // For Redis Cloud, start without TLS, then retry with TLS if SSL error
      tls: useTLS ? {
        // TLS options - reject unauthorized for production, allow for development
        rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
      } : undefined,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts to avoid spam
        if (times > 3 || redisFailedPermanently) {
          redisFailedPermanently = true;
          redis.disconnect(); // Disconnect to stop reconnection attempts
          return null; // Stop retrying
        }
        const maxRetryDelay = 2000;
        return Math.min(times * 100, maxRetryDelay);
      },
      // Enable offline queue for better error handling
      enableOfflineQueue: false,
      // Connection timeout
      connectTimeout: 5000, // Reduced to 5 seconds
      // Lazy connect - don't connect immediately
      lazyConnect: true,
      // Auto reconnect - limited
      maxRetriesPerRequest: null, // Disable per-request retries
      enableReadyCheck: true,
    });

    redis.on('connect', () => {
      console.log('🔄 Redis connecting...');
      redisConnecting = true;
    });

    redis.on('ready', () => {
      redisAvailable = true;
      redisConnecting = false;
      console.log('✅ Redis connected and ready');
      console.log(`   Host: ${redisHost}:${redisPort}`);
    });

    redis.on('error', (err) => {
      redisAvailable = false;
      redisConnecting = false;
      
      // Only log first error to avoid spam
      if (!redis._errorLogged) {
        console.warn('⚠️ Redis connection error:', err.message);
        
        // Detect SSL/TLS errors - these mean we tried TLS but server doesn't support it on this port
        // OR we didn't try TLS but server requires it
        if (err.message && (
          err.message.includes('SSL') || 
          err.message.includes('TLS') ||
          err.message.includes('wrong version number') ||
          err.message.includes('ssl3_get_record')
        )) {
          // If we tried WITHOUT TLS and got SSL error, server might require TLS
          // Try with TLS as fallback
          if (!useTLS && !redis._triedWithTLS) {
            redis._triedWithTLS = true;
            console.warn('   🔒 SSL/TLS Error detected - retrying with TLS enabled...');
            console.warn('   💡 This usually means the port requires TLS encryption');
            
            setTimeout(async () => {
              try {
                const tlsRedis = new Redis({
                  host: redisHost,
                  port: redisPort,
                  password: process.env.REDIS_PASSWORD || undefined,
                  tls: {
                    rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
                  },
                  connectTimeout: 5000,
                  lazyConnect: false,
                  enableOfflineQueue: false,
                  maxRetriesPerRequest: 1,
                  retryStrategy: () => null, // Don't retry
                });
                
                const pingResult = await Promise.race([
                  tlsRedis.ping(),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('TLS ping timeout')), 5000))
                ]);
                
                if (pingResult === 'PONG') {
                  console.log('   ✅ SUCCESS: Connected with TLS enabled!');
                  console.log('   💡 Add to your .env: REDIS_TLS=true');
                  
                  // Replace the original redis instance
                  redis = tlsRedis;
                  redisAvailable = true;
                  redisConnecting = false;
                  redisFailedPermanently = false;
                  
                  tlsRedis.on('ready', () => {
                    redisAvailable = true;
                    console.log('✅ Redis connected and ready (with TLS)');
                    console.log(`   Host: ${redisHost}:${redisPort}`);
                  });
                  
                  tlsRedis.on('error', (tlsErr) => {
                    redisAvailable = false;
                  });
                  
                  return;
                }
              } catch (tlsError) {
                // TLS also failed, continue to show error
              }
              
              // If TLS also failed, show comprehensive error
              console.warn('   ❌ TLS connection also failed');
              console.warn('   💡 Both non-TLS and TLS connections failed');
              console.warn('   📋 Possible solutions:');
              console.warn('      1. Check if password is correct in Redis Cloud dashboard');
              console.warn('      2. Verify instance is active in Redis Cloud');
              console.warn('      3. Check if port is correct (non-TLS vs TLS port)');
              console.warn('      4. Try explicitly: REDIS_TLS=false (or REDIS_TLS=true)');
              console.warn('      5. Check network/VPC settings allow your IP');
              console.warn('   ℹ️  System will use MongoDB only. Redis reconnection attempts stopped.');
            }, 500);
            
            return; // Don't mark as permanent failure yet - let TLS attempt complete
          } else {
            console.warn('   🔒 SSL/TLS Error detected');
            console.warn('   💡 Possible issues:');
            if (useTLS) {
              console.warn('      - TLS is enabled but port might be for non-TLS connection');
              console.warn('      - Try setting REDIS_TLS=false in .env');
              console.warn('      - Or check Redis Cloud for TLS-specific port');
            } else {
              console.warn('      - Server requires TLS but REDIS_TLS is not enabled');
              console.warn('      - Try setting REDIS_TLS=true in .env');
            }
            console.warn('   ℹ️  System will use MongoDB only. Redis reconnection attempts stopped.');
          }
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          console.warn('   💡 Redis server is not accessible at the configured host/port');
          console.warn(`   💡 Attempted: ${redisHost}:${redisPort}`);
          
          // Show original configuration for debugging
          const originalHost = process.env.REDIS_HOST || 'localhost';
          const originalPort = process.env.REDIS_PORT;
          if (originalHost.includes(':') || originalPort) {
            console.warn('   📋 Original configuration:');
            console.warn(`      REDIS_HOST=${originalHost}`);
            if (originalPort) {
              console.warn(`      REDIS_PORT=${originalPort}`);
            }
            console.warn('   💡 Recommended: Use separate REDIS_HOST and REDIS_PORT (without port in host)');
            console.warn(`      REDIS_HOST=${redisHost}`);
            console.warn(`      REDIS_PORT=${redisPort}`);
          }
          
          // Check if it's a Redis Cloud/Redis Labs URL
          if (redisHost.includes('redis') && (redisHost.includes('cloud') || redisHost.includes('redislabs'))) {
            console.warn('   💡 Redis Cloud detected - verify:');
            console.warn('      - Instance is active and accessible');
            console.warn('      - Correct hostname and port');
            console.warn('      - Network/VPC settings allow your IP');
            console.warn('      - TLS is enabled (set REDIS_TLS=true)');
          }
          
          console.warn('   💡 For local development: Use localhost:6379 or install Redis');
          console.warn('   💡 To disable Redis: Set USE_REDIS=false in .env');
          console.warn('   ℹ️  System will use MongoDB only. Redis reconnection attempts stopped.');
        } else if (err.code === 'ETIMEDOUT') {
          console.warn('   💡 Redis connection timed out - check host and port');
          console.warn('   ℹ️  System will use MongoDB only. Redis reconnection attempts stopped.');
        } else {
          // Generic error - check if it's an SSL/TLS related error
          if (err.message && (err.message.includes('SSL') || err.message.includes('TLS'))) {
            console.warn('   🔒 SSL/TLS configuration issue detected');
            console.warn('   💡 Try setting REDIS_TLS=true in .env');
          }
        }
        redis._errorLogged = true;
        redisFailedPermanently = true;
        
        // Stop reconnection attempts
        setTimeout(() => {
          if (redis && redis.status !== 'ready') {
            redis.disconnect();
          }
        }, 100);
      }
    });

    redis.on('close', () => {
      redisAvailable = false;
      redisConnecting = false;
      // Don't log close events after permanent failure to avoid spam
      // "Connection is closed" errors are normal after failed connections
      if (!redisFailedPermanently && !redis._closeLogged) {
        // Only log first close event
        redis._closeLogged = true;
      }
    });

    redis.on('reconnecting', (delay) => {
      // Don't log reconnection attempts after permanent failure
      if (!redisFailedPermanently) {
        console.log(`🔄 Redis reconnecting in ${delay}ms...`);
        redisConnecting = true;
      } else {
        // Stop reconnection if permanently failed
        redis.disconnect();
      }
    });

    // Try to connect with timeout
    try {
      await Promise.race([
        redis.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);
    } catch (error) {
      redisAvailable = false;
      redisConnecting = false;
      redisFailedPermanently = true;
      
      // Disconnect to prevent further reconnection attempts
      if (redis && redis.status !== 'end') {
        try {
          redis.disconnect();
        } catch (disconnectError) {
          // Ignore disconnect errors
        }
      }
      
      if (error.message.includes('timeout')) {
        console.warn('⚠️ Redis connection timeout - check if Redis server is running');
        console.warn('   💡 To install Redis: https://redis.io/docs/getting-started/installation/');
        console.warn('   💡 Or set USE_REDIS=false to use MongoDB only');
      } else if (error.message.includes('closed')) {
        // Ignore "Connection is closed" errors - they're expected after failures
      } else {
        // Only log if it's not a "closed" error
        if (!error.message.includes('closed')) {
          console.warn('⚠️ Redis connection failed:', error.message);
        }
      }
    }
  } catch (error) {
    redisAvailable = false;
    redisConnecting = false;
    console.warn('⚠️ Redis initialization failed:', error.message);
  }
};

// Initialize Redis connection
initializeRedis();

// Export redis instance and availability flag
export { redisAvailable, isRedisReady };
export default redis;

