import { networkInterfaces } from 'os';

const getAllLocalIPs = () => {
  const nets = networkInterfaces();
  const ips = ['localhost', '127.0.0.1'];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Allow all valid active IPv4 addresses on the local machine
      if (net.family === 'IPv4' && !net.address.startsWith('169.254')) {
        ips.push(net.address);
      }
    }
  }
  return [...new Set(ips)];
};

const localIPs = getAllLocalIPs();
const devOrigins = [];
for (const ip of localIPs) {
  devOrigins.push(ip);
  for (let port = 3000; port <= 3010; port++) {
    devOrigins.push(`${ip}:${port}`);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing attacks
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Block clickjacking — prevent site from being embedded in iframes
          { key: 'X-Frame-Options', value: 'DENY' },
          // Legacy XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Control referrer information sent to other sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features (camera, mic, etc.)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          // Content Security Policy — control which resources can be loaded
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co https://api.olamaps.io wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; ')
          },
          // Enforce HTTPS with HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // Dynamic allowed origins for safe dev server action triggers from any local network IP
      allowedOrigins: devOrigins,
    },
  },
  // Fallback for older next version dev origins checking if applicable
  allowedDevOrigins: devOrigins,
};

export default nextConfig;

