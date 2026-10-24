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

  await ensureVercelBootstrapped();
  return (app as any)(req, res);
}

