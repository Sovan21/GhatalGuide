"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleEvents } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, MapPin, Clock } from "lucide-react";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      let dbEvents = [];
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });
        if (data && !error) {
          dbEvents = data;
        }
      } catch (e) {
        console.warn("Supabase events fetch failed", e);
      }

      if (dbEvents.length === 0) {
        dbEvents = sampleEvents;
      }
      setEvents(dbEvents);
      setLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-12 lg:py-20 relative z-10">
        <div className="container-perfect max-w-4xl">
          
          {/* Header */}
          <div className="mb-14 text-center space-y-3">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight animate-fade-in">
              Local Events & News
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold leading-relaxed max-w-md mx-auto">
              Stay updated with cultural festivals, medical camps, and municipal activities in Ghatal.
            </p>
          </div>

          {/* Events list */}
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start animate-pulse w-full">
                  <div className="w-full md:w-28 h-24 rounded-2xl bg-slate-100 dark:bg-slate-850 shrink-0 shadow-sm" />
                  <div className="flex-grow space-y-3.5 w-full">
                    <div className="w-2/3 h-7 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="flex gap-4">
                      <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2" />
                    <div className="space-y-2">
                      <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="w-5/6 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 py-16 px-4 text-center max-w-xl mx-auto shadow-sm animate-fade-in">
              <div className="mb-4">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Events Scheduled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                There are no upcoming events listed at this time. Check back later or browse our directory!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition-all duration-350 animate-fade-in"
                >
                  {/* Premium Styled Date Calendar Tile Badge */}
                  <div className="w-full md:w-28 overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center flex flex-row md:flex-col items-center justify-center md:justify-start shrink-0 select-none shadow-sm pb-0 md:pb-3 gap-4 md:gap-0">
                    <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-black uppercase tracking-wider text-white py-2 px-4 md:px-0">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 md:mt-2 px-2">
                      {new Date(event.date).toLocaleDateString("en-US", { day: "2-digit" })}
                    </span>
                    <span className="hidden md:inline text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-wider mt-0.5">
                      {new Date(event.date).toLocaleDateString("en-US", { year: "numeric" })}
                    </span>
                  </div>

                  {/* Details Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                      {event.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 font-bold">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
