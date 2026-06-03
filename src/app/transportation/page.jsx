"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { supabase } from "@/lib/supabaseClient";
import { sampleTransportation } from "@/lib/sampleData";
import { Train, Bus, Compass, Route, Clock, CalendarDays, Navigation2, Loader2 } from "lucide-react";

export default function Transportation() {
  const [activeTab, setActiveTab] = useState("trains"); // 'trains', 'buses', 'totos'
  const [transportData, setTransportData] = useState({ trains: [], buses: [], totos: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransportData() {
      setLoading(true);
      try {
        const [trainsRes, busesRes, totosRes] = await Promise.all([
          supabase.from("trains").select("*").order("time", { ascending: true }),
          supabase.from("buses").select("*").order("route", { ascending: true }),
          supabase.from("toto_routes").select("*").order("route", { ascending: true })
        ]);

        setTransportData({
          trains: trainsRes.data || [],
          buses: busesRes.data || [],
          totos: totosRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching transport data:", error);
        setTransportData({
          trains: [],
          buses: [],
          totos: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTransportData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative">
      <div className="mesh-bg absolute inset-0 opacity-40 pointer-events-none" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect max-w-5xl">
          
          {/* Header */}
          <div className="mb-14 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 mb-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl shadow-inner border border-indigo-200/50 dark:border-indigo-800/50">
              <Navigation2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Transit Timetables
            </h1>
            <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
              Live updates on daily routes, fares, and timings connecting Ghatal with other district hubs.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-dark-border/60 p-1.5 mb-10 select-none max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab("trains")}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeTab === "trains"
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 translate-y-[1px]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <Train className="w-5 h-5" />
              <span className="text-sm md:text-base tracking-wide">Trains</span>
            </button>
            <button
              onClick={() => setActiveTab("buses")}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeTab === "buses"
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 translate-y-[1px]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <Bus className="w-5 h-5" />
              <span className="text-sm md:text-base tracking-wide">Buses</span>
            </button>
            <button
              onClick={() => setActiveTab("totos")}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeTab === "totos"
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 translate-y-[1px]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-sm md:text-base tracking-wide">Totos</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-dark-border/50 min-h-[300px]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading schedules...</p>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-200/80 dark:border-dark-border/80 p-6 md:p-10 overflow-hidden">
                
                {/* Decorative gradients inside the content card */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  {activeTab === "trains" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                          <Train className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Connecting Trains <span className="text-slate-400 dark:text-slate-500 font-medium text-lg ml-1 hidden sm:inline-block">/ Nearest Stations</span>
                        </h3>
                      </div>

                      {transportData.trains.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-dark-card/50 rounded-2xl border border-slate-200 dark:border-dark-border p-10 text-center flex flex-col items-center justify-center">
                          <Train className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Train Schedules Available</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">There are currently no train schedules in the database. Please check back later.</p>
                        </div>
                      ) : (
                        <>
                          {/* Mobile view cards */}
                          <div className="space-y-4 md:hidden">
                            {transportData.trains.map((train, index) => (
                              <div key={`train-mob-${train.id || index}`} className="group bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                                <div className="flex justify-between items-start">
                                  <h4 className="font-black text-slate-900 dark:text-white text-lg leading-snug">{train.name}</h4>
                                  <span className="bg-indigo-50 dark:bg-indigo-950 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 tracking-wider shadow-sm border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                                    Plat {train.platform}
                                  </span>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-dark-card/50 rounded-xl p-3 grid grid-cols-2 gap-3 border border-slate-100 dark:border-dark-border/50">
                                  <div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold flex items-center gap-1 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> From</div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{train.from_station}</p>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold flex items-center gap-1 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"></span> To</div>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{train.to_station}</p>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-sm pt-2">
                                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black">
                                    <Clock className="w-4 h-4" />
                                    <span>{train.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-dark-border px-3 py-1 rounded-lg text-xs">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>{train.days}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
 
                          {/* Modern Desktop view table */}
                          <div className="hidden md:block bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse min-w-max">
                                <thead>
                                  <tr className="bg-slate-50/80 dark:bg-dark-card/80 border-b border-slate-200 dark:border-dark-border">
                                    <th className="px-6 py-5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Train Name</th>
                                    <th className="px-6 py-5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Route</th>
                                    <th className="px-6 py-5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Platform</th>
                                    <th className="px-6 py-5 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest text-right">Running Days</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                  {transportData.trains.map((train, index) => (
                                    <tr key={`train-desk-${train.id || index}`} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors duration-200">
                                      <td className="px-6 py-5">
                                        <div className="font-bold text-slate-900 dark:text-white text-[15px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                          {train.name}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">{train.from_station}</span>
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-card-hover text-slate-400">
                                            <Navigation2 className="w-3 h-3 rotate-90" />
                                          </div>
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">{train.to_station}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <div className="inline-flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                          <Clock className="w-4 h-4" />
                                          {train.time}
                                        </div>
                                      </td>
                                      <td className="px-6 py-5">
                                        <span className="inline-flex items-center justify-center min-w-[3rem] bg-slate-100 dark:bg-dark-card-hover text-xs px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-dark-border shadow-sm">
                                          {train.platform}
                                        </span>
                                      </td>
                                      <td className="px-6 py-5 text-right">
                                        <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-dark-card/50 text-xs px-3 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border">
                                          <CalendarDays className="w-3.5 h-3.5 opacity-70" />
                                          {train.days}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "buses" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                          <Bus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Bus Schedules <span className="text-slate-400 dark:text-slate-500 font-medium text-lg ml-1 hidden sm:inline-block">/ Ghatal Stand</span>
                        </h3>
                      </div>
                      
                      {transportData.buses.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-dark-card/50 rounded-2xl border border-slate-200 dark:border-dark-border p-10 text-center flex flex-col items-center justify-center">
                          <Bus className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Bus Schedules Available</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">There are currently no bus schedules in the database. Please check back later.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {transportData.buses.map((bus, index) => (
                            <div
                              key={`bus-${bus.id || index}`}
                              className="group relative border border-slate-200 dark:border-dark-border rounded-3xl p-6 bg-white dark:bg-dark-card flex flex-col gap-5 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent dark:from-emerald-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-[100px]"></div>
                              
                              <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/50 shrink-0 shadow-sm">
                                  <Route className="w-6 h-6" />
                                </div>
                                <div className="min-w-0 flex-grow pt-1">
                                  <h4 className="font-black text-slate-900 dark:text-white text-xl truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {bus.route}
                                  </h4>
                                  <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-2.5 font-bold bg-slate-100 dark:bg-dark-card px-2.5 py-1 rounded-md">
                                    <Clock className="w-3.5 h-3.5" />
                                    Frequency: <span className="text-slate-700 dark:text-slate-300">{bus.frequency}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-50 dark:bg-dark-card/50 rounded-2xl p-4 flex justify-between items-center text-sm font-semibold border border-slate-100 dark:border-dark-border/50 relative z-10">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">First Bus</span>
                                  <span className="text-slate-800 dark:text-slate-200 text-base">{bus.first_bus}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-dark-border"></div>
                                <div className="flex flex-col gap-1 text-right">
                                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Last Bus</span>
                                  <span className="text-slate-800 dark:text-slate-200 text-base">{bus.last_bus}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "totos" && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                          <Compass className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Local Toto Routes <span className="text-slate-400 dark:text-slate-500 font-medium text-lg ml-1 hidden sm:inline-block">& Standard Fares</span>
                        </h3>
                      </div>
                      
                      {transportData.totos.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-dark-card/50 rounded-2xl border border-slate-200 dark:border-dark-border p-10 text-center flex flex-col items-center justify-center">
                          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Toto Routes Available</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">There are currently no toto routes in the database. Please check back later.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {transportData.totos.map((toto, index) => (
                            <div
                              key={`toto-${toto.id || index}`}
                              className="group border border-slate-200 dark:border-dark-border rounded-3xl p-6 text-center flex flex-col justify-between bg-white dark:bg-dark-card hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 relative overflow-hidden h-full min-h-[200px]"
                            >
                              <div className="absolute -inset-2 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                              
                              <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-6 flex-grow flex items-center justify-center">
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {toto.route}
                                  </h4>
                                </div>
                                
                                <div className="pt-5 border-t border-slate-100 dark:border-dark-border/80">
                                  <span className="text-4xl font-black text-amber-500 dark:text-amber-400 tracking-tight drop-shadow-sm">
                                    {toto.fare}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-black uppercase tracking-widest bg-slate-50 dark:bg-dark-card py-1 px-3 rounded-full mx-auto w-fit">
                                    Standard Seat Fare
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
