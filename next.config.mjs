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

