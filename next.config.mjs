import { networkInterfaces } from 'os';

const getLocalIP = () => {
  const nets = networkInterfaces();
  
  // 1. Prefer Wi-Fi or Ethernet interfaces
  for (const name of Object.keys(nets)) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wi-fi') || lowerName.includes('ethernet') || lowerName.includes('wlan') || lowerName.includes('wi fi')) {
      for (const net of nets[name]) {
        // Skip link-local IPs starting with 169.254
        if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
          return net.address;
        }
      }
    }
  }
  
  // 2. Fallback to any active non-internal IPv4
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }
  
  return '0.0.0.0';
};

const ip = getLocalIP();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ip !== '0.0.0.0' ? [
    ip,
    `${ip}:3000`,
    `${ip}:3001`,
    `${ip}:3002`,
    `${ip}:3003`,
    `${ip}:3004`,
    `${ip}:3005`
  ] : [],
};

export default nextConfig;
