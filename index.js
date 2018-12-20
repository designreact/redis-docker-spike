const Redis = require('ioredis');

const {
  NODE_ENV,
  PORT,
  REDIS_HOSTS,
  USE_CACHE,
} = process.env;

const LOCAL_HOSTS = [{ host: '127.0.0.1', port: PORT || 7000 }];
const CACHE_TTL = 1000 * 15;
const TEST_KEY = 'key';
const VALUE = 'value';
const STAMP = 'timestamp';

const isDev = NODE_ENV === 'development';

const clusterHosts = REDIS_HOSTS ? JSON.parse(REDIS_HOSTS) : LOCAL_HOSTS;
const clusterOptions = {
  scaleReads: 'slave'
};

const redis = new Redis.Cluster(clusterHosts, clusterOptions);

function shouldUseCache() {
  return USE_CACHE || ['production', 'staging'].includes(NODE_ENV);
}

function dataHandler() {
  return JSON.stringify({ hello: 'world', date: Date() });
}

async function cacheHandler() {
  const keyValue = `${TEST_KEY}:${VALUE}`;
  const keyStamp = `${TEST_KEY}:${STAMP}`;
  
  const now = Date.now();
  const ttl = await redis.get(keyStamp) || 0;
  
  if (now < ttl) {
    if (isDev) console.log('use cache', (ttl - now));
    return await redis.get(keyValue);
  }
  
  if (isDev) console.log('--- REFRESH CACHE ---');

  const newValue = dataHandler();
  await redis.set(keyValue, newValue)
  await redis.set(keyStamp, now + CACHE_TTL)
  
  return newValue;
}

exports.handler = async () => {
  const value = shouldUseCache() ? await cacheHandler() : dataHandler();
  
  if (isDev) console.log('value', value);

  return {
    statusCode: 200,
    body: JSON.parse(value),
  };
};
