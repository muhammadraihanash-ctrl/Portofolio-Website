import type { IncomingMessage, ServerResponse } from 'http';
import mysql from 'mysql2/promise';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Global CORS and JSON headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Enforce admin authentication
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.end(JSON.stringify({
      success: false,
      statusCode: 401,
      error: 'Access denied: Admin authentication token required.',
      message: 'Akses ditolak: Token autentikasi administrator diperlukan untuk diagnostik SQL.'
    }));
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!token || !token.startsWith('adm_')) {
    res.statusCode = 403;
    res.end(JSON.stringify({
      success: false,
      statusCode: 403,
      error: 'Invalid admin session token.',
      message: 'Sesi administrator tidak valid.'
    }));
    return;
  }

  const timestamp = new Date().toISOString();

  // Helper to safely extract POST body
  const getBody = async (): Promise<any> => {
    if (req.method !== 'POST') return {};
    if ((req as any).body && typeof (req as any).body === 'object') {
      return (req as any).body;
    }
    if (typeof (req as any).body === 'string' && (req as any).body.trim().length > 0) {
      try {
        return JSON.parse((req as any).body);
      } catch {
        return {};
      }
    }
    return new Promise((resolve) => {
      let raw = '';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });
  };

  const isPlaceholder = (val?: string | null): boolean => {
    if (!val) return true;
    const s = String(val).trim().toLowerCase();
    return (
      s === '' ||
      s === 'my_mysql_user' ||
      s === 'my_mysql_password' ||
      s === 'my_mysql_host' ||
      s === 'undefined' ||
      s === 'null'
    );
  };

  try {
    const body = await getBody();

    let hostCandidate = body.host || process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DATABASE_HOST;
    const host = !isPlaceholder(hostCandidate) ? String(hostCandidate).trim() : 'projekportofolio1-muhammadraihanash-569a.a.aivencloud.com';

    let userCandidate = body.user || process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DATABASE_USER;
    const user = !isPlaceholder(userCandidate) ? String(userCandidate).trim() : 'avnadmin';

    let passCandidate = body.password !== undefined ? body.password : (process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DATABASE_PASSWORD);
    const password = !isPlaceholder(passCandidate) ? String(passCandidate).trim() : '';

    let dbCandidate = body.database || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DATABASE_NAME;
    const database = !isPlaceholder(dbCandidate) ? String(dbCandidate).trim() : 'defaultdb';

    const port = Number(body.port || process.env.MYSQL_PORT || process.env.MYSQLPORT || 23220);

    const sslParam = String(body.ssl || process.env.MYSQL_SSL || 'REQUIRED');
    const isSslRequired =
      sslParam === 'REQUIRED' ||
      sslParam === 'true' ||
      sslParam === '1' ||
      host.includes('aivencloud.com') ||
      host.includes('rds.amazonaws.com') ||
      host.includes('railway.app');

    const start = Date.now();

    // Establish direct TLS connection to Aiven MySQL
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 4500
    });

    const [rows]: any = await conn.query('SELECT 1 AS ok, DATABASE() AS db, VERSION() AS ver');
    let cipher = isSslRequired ? 'TLS_AES_256_GCM_SHA384' : 'NONE';
    try {
      const [sslRows]: any = await conn.query("SHOW STATUS LIKE 'Ssl_cipher'");
      if (sslRows?.[0]?.Value) {
        cipher = sslRows[0].Value;
      }
    } catch {}

    const latencyMs = Date.now() - start;
    const connectedDb = rows?.[0]?.db || database;
    const serverVersion = rows?.[0]?.ver || 'MySQL 8.4+';
    const threadId = (conn as any).connection?.threadId || (conn as any).threadId;

    await conn.end();

    const responsePayload = {
      success: true,
      statusCode: 200,
      statusText: 'OK',
      message: `Koneksi dan handshake SSL ke Aiven MySQL berhasil (${user}@${host}:${port}/${connectedDb}) dalam ${latencyMs}ms.`,
      details: {
        host,
        port,
        user,
        database: connectedDb,
        sslRequired: isSslRequired,
        sslMode: isSslRequired ? 'REQUIRED' : 'OFF',
        latencyMs,
        protocol: 'TCP/TLS',
        serverVersion,
        cipher,
        threadId
      },
      timestamp
    };

    res.statusCode = 200;
    res.end(JSON.stringify(responsePayload));
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    const rawCode = err?.code || err?.errno || '';

    let statusCode = 500;
    let errorCode = 'CONNECTION_HANDSHAKE_FAILED';
    let statusText = 'INTERNAL_SERVER_ERROR';
    let message = `Gagal melakukan koneksi handshake ke Aiven MySQL: ${rawMsg}`;

    if (
      rawCode === 'HANDSHAKE_ERROR' ||
      rawCode === 'CERT_HAS_EXPIRED' ||
      rawCode === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      rawCode === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      rawCode === 'EPROTO' ||
      rawCode === 'PROTOCOL_CONNECTION_LOST' ||
      rawMsg.toLowerCase().includes('handshake') ||
      rawMsg.toLowerCase().includes('ssl') ||
      rawMsg.toLowerCase().includes('tls')
    ) {
      statusCode = 525;
      errorCode = 'SSL_HANDSHAKE_FAILED';
      statusText = 'SSL_HANDSHAKE_FAILED';
      message = `SSL / TLS Handshake gagal saat menghubungi Aiven MySQL: ${rawMsg}. Pastikan parameter SSL diaktifkan (rejectUnauthorized: false).`;
    } else if (rawCode === 'ER_ACCESS_DENIED_ERROR' || rawCode === 1045 || rawMsg.toLowerCase().includes('access denied')) {
      statusCode = 401;
      errorCode = 'AUTH_FAILED';
      statusText = 'UNAUTHORIZED';
      message = 'Autentikasi gagal untuk user MySQL. Mohon periksa kembali MYSQL_USER dan MYSQL_PASSWORD.';
    } else if (rawCode === 'ETIMEDOUT' || rawMsg.toLowerCase().includes('timeout')) {
      statusCode = 504;
      errorCode = 'HANDSHAKE_TIMEOUT';
      statusText = 'GATEWAY_TIMEOUT';
      message = 'Batas waktu handshake koneksi ke Aiven MySQL terlampaui. Host mungkin sedang tidak menerima koneksi jaringan.';
    } else if (rawCode === 'ENOTFOUND' || rawCode === 'ECONNREFUSED' || rawCode === 'EHOSTUNREACH') {
      statusCode = 503;
      errorCode = 'HOST_UNREACHABLE';
      statusText = 'SERVICE_UNAVAILABLE';
      message = `Host Aiven MySQL tidak dapat dijangkau (${rawCode}).`;
    }

    res.statusCode = statusCode;
    res.end(JSON.stringify({
      success: false,
      statusCode,
      errorCode,
      statusText,
      message,
      details: {
        rawError: rawMsg,
        rawCode
      },
      timestamp
    }));
  }
}
