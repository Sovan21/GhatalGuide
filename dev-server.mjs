import { networkInterfaces } from 'os';
import { spawn } from 'child_process';
import path from 'path';

const getLocalIPs = () => {
  const nets = networkInterfaces();
  const ips = [];
  
  // 1. Prefer Wi-Fi or Ethernet interfaces
  for (const name of Object.keys(nets)) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wi-fi') || lowerName.includes('ethernet') || lowerName.includes('wlan') || lowerName.includes('wi fi')) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
          ips.push(net.address);
        }
      }
    }
  }
  
  // 2. Fallback to other active non-internal IPv4
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        if (!ips.includes(net.address)) {
          ips.push(net.address);
        }
      }
    }
  }
  
  return ips;
};

const ips = getLocalIPs();
const mainIP = ips[0] || '127.0.0.1';

// Get next CLI path directly
const nextCli = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');

// Prepare node spawn arguments
const args = [
  '--dns-result-order=ipv4first', // Optimize DNS resolution on Windows to avoid ipv6 timeouts
  nextCli,
  'dev',
  '--hostname',
  '0.0.0.0',
  ...process.argv.slice(2) // Forward any arguments (e.g. --turbo, --port, etc.)
];

// Spawn next dev. We pipe stdout to dynamically map 0.0.0.0 to the actual local IP,
// while inheriting stdin and stderr to preserve colors, keyboard controls and error stack traces.
const nextDev = spawn('node', args, {
  stdio: ['inherit', 'pipe', 'inherit'],
  env: {
    ...process.env,
    FORCE_COLOR: '3' // Forces chalk/supports-color to output 256 colors even when stdout is piped
  }
});

nextDev.stdout.on('data', (data) => {
  let str = data.toString();
  
  if (mainIP !== '127.0.0.1' && str.includes('0.0.0.0')) {
    // Replace wildcard host 0.0.0.0 with actual local IP in next.js logs
    str = str.replace(/0\.0\.0\.0/g, mainIP);
    
    // Inject the helpful firewall note right under the network URL line
    const networkUrlRegex = new RegExp(`- Network:\\s+http://${mainIP.replace(/\./g, '\\.')}:\\d+`);
    str = str.replace(networkUrlRegex, (match) => {
      return `${match}\n\x1b[90m- Firewall:      Ensure Windows Firewall allows Node.js on Private networks for lag-free testing\x1b[0m`;
    });
  }
  
  process.stdout.write(str);
});

nextDev.on('close', (code) => {
  process.exit(code);
});


