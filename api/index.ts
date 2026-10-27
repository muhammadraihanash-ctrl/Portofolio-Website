import type { IncomingMessage, ServerResponse } from 'http';
import app, { syncAllSqlDataToAcademicDb } from '../server.js';
import { p2mDatabaseService } from '../src/server/p2mDatabaseService.js';

let lastGetSyncTimestamp = 0;

async function refreshFromMySql(isNonGet: boolean): Promise<void> {
  try {
    await p2mDatabaseService.ensureConnection();
    const now = Date.now();
    if (isNonGet || now - lastGetSyncTimestamp > 10000) {
      lastGetSyncTimestamp = now;
      const synced = await p2mDatabaseService.syncLiveFromMySql();
      if (synced) {
        syncAllSqlDataToAcademicDb();
      }
    }
  } catch (err) {
    console.warn('[Vercel Serverless Sync Warning]:', err);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Global CORS headers for Vercel Serverless
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Normalize URL from Vercel rewrites or proxy headers
  try {
    let rawUrl = req.url || '';
    const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || (req.headers['x-original-url'] as string) || '';

    if (rawUrl.includes('__route__=')) {
      const parsed = new URL(rawUrl, 'http://localhost');
      const r = parsed.searchParams.get('__route__');
      if (r) {
        parsed.searchParams.delete('__route__');
        const rem = parsed.searchParams.toString();
        rawUrl = rem ? `${r}?${rem}` : r;
      }
    } else if (matchedPath && matchedPath.startsWith('/api/') && !matchedPath.includes('[...all]') && !matchedPath.endsWith('/index')) {
      rawUrl = matchedPath;
    } else if ((req as any).query && (req as any).query.all) {
      const allParam = (req as any).query.all;
      const sub = Array.isArray(allParam) ? allParam.join('/') : String(allParam);
      rawUrl = `/api/${sub}`;
    }

    // Ensure path starts with /api for Express router matching
    if (!rawUrl.startsWith('/api')) {
      rawUrl = rawUrl.startsWith('/') ? `/api${rawUrl}` : `/api/${rawUrl}`;
    }

    if (rawUrl === '/api' || rawUrl === '/api/' || rawUrl === '/api/index') {
      rawUrl = '/api/health';
    }

    req.url = rawUrl;
  } catch {}

  // Refresh data from live MySQL
  const isNonGet = req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS';
  await refreshFromMySql(isNonGet);

  // Wrap Express dispatch in a Promise so Vercel Serverless does not prematurely freeze/kill execution
  return new Promise<void>((resolve) => {
    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        resolve();
      }
    };

    res.on('finish', done);
    res.on('close', done);

    try {
      (app as any)(req, res, (err: any) => {
        if (err && !res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: err?.message || 'Terjadi kesalahan pada pemrosesan server backend.',
            statusCode: 500,
            success: false
          }));
        }
        done();
      });
    } catch (err: any) {
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: err?.message || 'Server error occurred.',
          statusCode: 500,
          success: false
        }));
      }
      done();
    }
  });
}
