import type { IncomingMessage, ServerResponse } from 'http';
import app, { syncAllSqlDataToAcademicDb } from '../server';
import { p2mDatabaseService } from '../src/server/p2mDatabaseService';

let initPromise: Promise<boolean> | null = null;

function ensureVercelBootstrapped(): void {
  if (!initPromise) {
    // Non-blocking background task: ensures serverless response starts in milliseconds
    initPromise = (async () => {
      try {
        const ok = await p2mDatabaseService.initMySqlConnection();
        if (ok) {
          syncAllSqlDataToAcademicDb();
        }
        return true;
      } catch (err) {
        console.warn('[Vercel Serverless Boot Warning]:', err);
        return false;
      }
    })();
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
    const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || '';

    if (matchedPath && matchedPath.startsWith('/api/')) {
      rawUrl = matchedPath;
    } else if (rawUrl.includes('__route__=')) {
      const parsed = new URL(rawUrl, 'http://localhost');
      const r = parsed.searchParams.get('__route__');
      if (r) {
        parsed.searchParams.delete('__route__');
        const rem = parsed.searchParams.toString();
        rawUrl = rem ? `${r}?${rem}` : r;
      }
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

  // Trigger non-blocking database sync in background
  ensureVercelBootstrapped();

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
