import type { IncomingMessage, ServerResponse } from 'http';
import app, { syncAllSqlDataToAcademicDb } from '../server';
import { p2mDatabaseService } from '../src/server/p2mDatabaseService';

let initPromise: Promise<boolean> | null = null;

async function ensureVercelBootstrapped(): Promise<boolean> {
  if (!initPromise) {
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
  return initPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // Extract true original path from Vercel headers if rewritten
    const matchedPath = (req.headers['x-matched-path'] as string) || 
                        (req.headers['x-forwarded-uri'] as string) ||
                        (req.headers['x-original-url'] as string);

    if (matchedPath && matchedPath.startsWith('/api')) {
      req.url = matchedPath;
    } else if (req.url) {
      // If Vercel rewrote /api/(.*) -> /api and placed the capture in query params
      const [pathPart, queryPart] = req.url.split('?');
      if (pathPart === '/api' || pathPart === '/api/') {
        const qParams = new URLSearchParams(queryPart || '');
        const sub = qParams.get('0') || qParams.get('1') || qParams.get('path');
        if (sub) {
          qParams.delete('0');
          qParams.delete('1');
          qParams.delete('path');
          const remainingQuery = qParams.toString();
          req.url = `/api/${sub}${remainingQuery ? '?' + remainingQuery : ''}`;
        }
      } else if (!req.url.startsWith('/api') && !req.url.startsWith('/index.html')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
    }

    await ensureVercelBootstrapped();
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: err?.message || 'Internal Server Error in Vercel Gateway'
      }));
    }
  }
}

