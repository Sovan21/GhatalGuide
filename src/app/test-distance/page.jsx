"use client";

import { useState, useEffect } from "react";

export default function TestDistancePage() {
  const [userLoc, setUserLoc] = useState(null);
  const [error, setError] = useState(null);
  
  // Destination states
  const [destCoords, setDestCoords] = useState("23.6844929, 86.9620772");
  const [mapLink, setMapLink] = useState("");
  
  const [straight, setStraight] = useState(null);
  const [road, setRoad] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
  }, []);

  const calculateDistance = () => {
    if (!userLoc) {
      alert("Please wait for your GPS location to be fetched.");
      return;
    }
    const parts = destCoords.split(",");
    const dLatNum = parseFloat(parts[0]);
    const dLngNum = parseFloat(parts[1]);
    
    if (isNaN(dLatNum) || isNaN(dLngNum)) {
      alert("Please enter valid numbers for latitude and longitude.");
      return;
    }

    const dest = { lat: dLatNum, lng: dLngNum };
    setLoading(true);
    setStraight(null);
    setRoad(null);

    // 1. Calculate Straight Line (Haversine)
    const R = 6371;
    const dLatRad = ((dest.lat - userLoc.lat) * Math.PI) / 180;
    const dLonRad = ((dest.lng - userLoc.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
      Math.cos((userLoc.lat * Math.PI) / 180) *
        Math.cos((dest.lat * Math.PI) / 180) *
        Math.sin(dLonRad / 2) *
        Math.sin(dLonRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setStraight((R * c).toFixed(2));

    // 2. Fetch Road Distance from Ola Maps
    const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
    fetch(`https://api.olamaps.io/routing/v1/directions?origin=${userLoc.lat},${userLoc.lng}&destination=${dest.lat},${dest.lng}&api_key=${apiKey}`, { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
          setRoad((data.routes[0].legs[0].distance / 1000).toFixed(2));
        } else {
          setRoad("Error (No Route Found)");
        }
      })
      .catch(e => {
        console.error(e);
        setRoad("Fetch failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen p-10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="max-w-xl mx-auto space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Distance Debugger</h1>
        
        <div className="space-y-4">
          <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-300">Enter Destination:</h3>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Paste Google Maps Link</label>
              <input 
                type="text" 
                value={mapLink}
                onChange={e => {
                  const link = e.target.value;
                  setMapLink(link);
                  const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                  if (match) {
                    setDestCoords(`${match[1]}, ${match[2]}`);
                    setMapLink(""); // clear after extraction
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="https://www.google.com/maps/@..."
              />
            </div>
            
            <div className="text-center text-xs text-slate-500 font-bold">OR</div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Latitude, Longitude</label>
              <input 
                type="text" 
                value={destCoords} 
                onChange={e => setDestCoords(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                placeholder="e.g. 23.6844929, 86.9620772"
              />
            </div>
            <button 
              onClick={calculateDistance}
              disabled={!userLoc || loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
            >
              {loading ? "Calculating..." : "Calculate Distance"}
            </button>
          </div>

          <p>
            <strong>Your GPS Location:</strong>{" "}
            {userLoc ? (
              <span className="text-emerald-500 font-bold">{userLoc.lat}, {userLoc.lng}</span>
            ) : (
              <span className="text-amber-500">{error || "Fetching location from device..."}</span>
            )}
          </p>
        </div>
        
        <div className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-xl space-y-4 border border-slate-200 dark:border-slate-700">
          <h2 className="font-black text-lg">Results:</h2>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <span>📏 Straight Line (Math):</span>
            <strong className="text-lg text-indigo-600 dark:text-indigo-400">
              {straight ? `${straight} km` : (loading ? "Calculating..." : "-")}
            </strong>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <span>🚗 Road Route (Ola Maps):</span>
            <strong className="text-lg text-emerald-600 dark:text-emerald-400">
              {road ? `${road} km` : (loading ? "Calculating..." : "-")}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
