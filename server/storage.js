// Key-value storage for the Fleet Council server.
// Upstash Redis (free tier, plain HTTPS, no packages) when its two environment variables are set,
// otherwise JSON files in DATA_DIR. Values are any JSON-serialisable data.
'use strict';

const fs = require('fs');
const path = require('path');

function fileStorage(dir) {
  const fileFor = key => path.join(dir, key.replace(/[^a-z0-9_-]/gi, '_') + '.json');
  return {
    kind: 'file',
    async get(key) {
      try {
        return JSON.parse(await fs.promises.readFile(fileFor(key), 'utf8'));
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },
    async set(key, value) {
      await fs.promises.mkdir(dir, { recursive: true });
      const file = fileFor(key);
      await fs.promises.writeFile(file + '.tmp', JSON.stringify(value));
      await fs.promises.rename(file + '.tmp', file);
    },
    async del(key) {
      try {
        await fs.promises.unlink(fileFor(key));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  };
}

// Upstash REST API: POST a Redis command as a JSON array, e.g. ["SET", "key", "value"].
function upstashStorage(url, token, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const prefix = 'fc:';
  async function call(command) {
    const response = await doFetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command)
    });
    let data = {};
    try { data = await response.json(); } catch (error) { /* empty body */ }
    if (!response.ok || data.error) throw new Error(`Upstash ${command[0]} failed: ${data.error || response.status}`);
    return data.result;
  }
  return {
    kind: 'upstash',
    async get(key) {
      const raw = await call(['GET', prefix + key]);
      return raw == null ? null : JSON.parse(raw);
    },
    async set(key, value) {
      await call(['SET', prefix + key, JSON.stringify(value)]);
    },
    async del(key) {
      await call(['DEL', prefix + key]);
    }
  };
}

function createStorage(env, defaultDir, fetchImpl) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return upstashStorage(env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, ''), env.UPSTASH_REDIS_REST_TOKEN, fetchImpl);
  }
  return fileStorage(env.DATA_DIR || defaultDir);
}

module.exports = { createStorage, fileStorage, upstashStorage };
