import { networkInterfaces } from 'os';
import { spawn } from 'child_process';
import path from 'path';

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

// Get next CLI path directly
const nextCli = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

// Spawn "next dev --hostname 0.0.0.0" safely using node
const nextDev = spawn('node', [nextCli, 'dev', '--hostname', '0.0.0.0'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Intercept stdout to replace the wildcard IP 0.0.0.0 with the actual local network IP
nextDev.stdout.on('data', (data) => {
  let str = data.toString();
  if (ip !== '0.0.0.0' && /0\.0\.0\.0:\d+/.test(str)) {
    str = str.replace(/0\.0\.0\.0:(\d+)/g, `${ip}:$1`);
  }
  process.stdout.write(str);
});

// Pass stderr through directly
nextDev.stderr.on('data', (data) => {
  process.stderr.write(data);
});

nextDev.on('close', (code) => {
  process.exit(code);
});
