const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('./.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const l1 = parseFloat(lat1);
  const ln1 = parseFloat(lon1);
  const l2 = parseFloat(lat2);
  const ln2 = parseFloat(lon2);
  if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) return null;
  const R = 6371; // Earth Radius in km
  const dLat = ((l2 - l1) * Math.PI) / 180;
  const dLon = ((ln2 - ln1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((l1 * Math.PI) / 180) *
      Math.cos((l2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

async function test() {
  const { data, error } = await supabase.from('listings').select('lat, lng, name');
  if (error) {
    console.error(error);
  } else {
    // Let's assume user is at Ghatal (22.6725, 87.7225)
    const userLocation = { lat: 22.6725, lng: 87.7225 };
    
    let result = data.map(item => ({
      ...item,
      distance: calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
    }));

    // Sort by distance
    result.sort((a, b) => {
      const distA = a.distance === null || a.distance === undefined ? Infinity : a.distance;
      const distB = b.distance === null || b.distance === undefined ? Infinity : b.distance;
      return distA - distB;
    });

    console.log("Sorted by distance (first 10):");
    result.slice(0, 15).forEach(item => {
      console.log(`${item.name} - ${item.distance ? item.distance.toFixed(3) + ' km' : 'No coords'}`);
    });
  }
}
test();
