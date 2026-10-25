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

  // Normalize URL from Vercel rewrites, catch-all parameters, or proxy headers
  try {
    let effectiveUrl = '';

    // 1. Check __route__ parameter explicitly injected by vercel.json rewrites
    let u = req.url || '';
    if (u.includes('__route__=')) {
      try {
        const parsed = new URL(u, 'http://localhost');
        const r = parsed.searchParams.get('__route__');
        if (r) {
          parsed.searchParams.delete('__route__');
          const rem = parsed.searchParams.toString();
          let cleanR = r.startsWith('/') ? r : `/${r}`;
          if (!cleanR.startsWith('/api')) {
            cleanR = cleanR === '/' ? '/api' : `/api${cleanR}`;
          }
          effectiveUrl = rem ? `${cleanR}?${rem}` : cleanR;
        }
      } catch {}
    }

    // 2. Authoritative client requested path from reverse proxy headers
    if (!effectiveUrl) {
      const forwardedUri = (req.headers['x-forwarded-uri'] as string) ||
                           (req.headers['x-original-url'] as string) ||
                           (req.headers['x-rewrite-url'] as string) || '';
      if (forwardedUri && forwardedUri.startsWith('/api')) {
        effectiveUrl = forwardedUri;
      }
    }

    // 3. Safe check on x-matched-path (ignore internal placeholders like [...all] or index)
    if (!effectiveUrl) {
      const matchedPath = (req.headers['x-matched-path'] as string) || '';
      if (
        matchedPath &&
        matchedPath.startsWith('/api/') &&
        !matchedPath.includes('[') &&
        !matchedPath.includes('index')
      ) {
        effectiveUrl = matchedPath;
      }
    }

    // 4. Inspect remaining query parameters and path patterns
    if (!effectiveUrl) {
      if (u.includes('match=') || u.includes('all=') || u.includes('1=')) {
        try {
          const parsed = new URL(u, 'http://localhost');
          const matchVal =
            parsed.searchParams.getAll('match').join('/') ||
            parsed.searchParams.getAll('all').join('/') ||
            parsed.searchParams.get('1') ||
            '';
          if (matchVal) {
            parsed.searchParams.delete('match');
            parsed.searchParams.delete('all');
            parsed.searchParams.delete('1');
            const rem = parsed.searchParams.toString();
            const cleanSub = matchVal.replace(/^\/+/, '');
            effectiveUrl = `/api/${cleanSub}${rem ? '?' + rem : ''}`;
          }
        } catch {}
      }

      if (!effectiveUrl) {
        // Strip /api/index prefix if present
        if (u.startsWith('/api/index.ts') || u.startsWith('/api/index')) {
          u = u.replace(/^\/api\/index(\.ts)?/, '');
          if (!u.startsWith('/')) u = `/${u}`;
          u = `/api${u}`;
        }

        if (!u.startsWith('/api')) {
          u = u.startsWith('/') ? `/api${u}` : `/api/${u}`;
        }
        effectiveUrl = u;
      }
    }

    if (!effectiveUrl || effectiveUrl === '/api' || effectiveUrl === '/api/' || effectiveUrl === '/api/index') {
      effectiveUrl = '/api/health';
    }

    req.url = effectiveUrl;
  } catch {}

  // Ensure database bootstrap runs (and for API data queries, wait on it gracefully)
  ensureVercelBootstrapped();
  try {
    await p2mDatabaseService.ensureConnection();
  } catch {}

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
