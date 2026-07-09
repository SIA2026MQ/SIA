// src/utils/geo.ts
import geoip from 'geoip-lite';

export function getCountryFromIP(req: Request): string {
  const trustedProxies = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'];

  let clientIP = '';
  for (const header of trustedProxies) {
    const value = req.headers[header] as string;
    if (value) {
      clientIP = value.split(',')[0].trim();
      break;
    }
  }
  if (!clientIP) {
    clientIP = req.socket.remoteAddress || req.ip || '';
  }

  // 🧪 Development override – only used when explicitly configured
  if (process.env.NODE_ENV !== 'production' && process.env.TEST_GEO_IP) {
    return process.env.TEST_GEO_IP; // e.g. "US"
  }

  // Ignore loopback addresses
  if (['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(clientIP)) {
    return 'IN'; // safe default for your primary market
  }

  const geo = geoip.lookup(clientIP);
  return geo?.country ?? 'IN';
}