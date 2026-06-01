"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ListingCard from "@/components/cards/ListingCard";
import { categories, sampleListings } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { CategoryIcon } from "@/lib/categoryIcons";
import { Search, Mic, MicOff, ArrowRight, Star, Calendar, Bus, MapPin, Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Fetch listings and bookmarks on load in parallel
  useEffect(() => {
    async function loadData() {
      try {
        const [listingsRes, sessionRes] = await Promise.all([
          supabase.from("listings").select("*").eq("status", "approved").eq("is_featured", true).limit(3),
          supabase.auth.getSession().catch(e => {
            console.warn("Failed to get auth session:", e);
            return { data: { session: null } };
          })
        ]);

        let dbListings = listingsRes?.data || [];
        setFeaturedListings(dbListings);

        const session = sessionRes?.data?.session;
        if (session?.user) {
          const { data, error } = await supabase
            .from("bookmarks")
            .select("listing_id")
            .eq("user_id", session.user.id);
          if (data && !error) {
            setBookmarkedIds(data.map(b => b.listing_id));
          }
        } else {
          // Read local bookmarks
          const local = localStorage.getItem("bookmarks");
          if (local) {
            setBookmarkedIds(JSON.parse(local));
          }
        }
      } catch (err) {
        console.warn("Error loading homepage data", err);
      }

      // 3. Request geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => console.log("Geolocation permission denied")
        );
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/directory");
    }
  };

  // Voice recognition ref and handler
  const recognitionRef = useRef(null);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleVoiceSearch = useCallback(() => {
    // If already listening, stop
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Abort any existing recognition first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-IN"; // Bengali language for better local recognition, falls back to en-US
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      // Small delay to let state update render
      setTimeout(() => {
        router.push(`/directory?search=${encodeURIComponent(speechToText)}`);
      }, 300);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        alert("Microphone access was denied. Please allow microphone permission in your browser settings.");
      } else if (event.error === "no-speech") {
        // Silently handle no-speech - user didn't say anything
      } else if (event.error === "network") {
        alert("Network error. Please check your internet connection and try again.");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      recognitionRef.current = null;
      alert("Could not start voice search. Please try again.");
    }
  }, [isListening, router]);

  // Bookmark toggle handler
  const handleBookmarkToggle = async (id) => {
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn("Failed to get auth session on bookmark toggle:", e);
    }

    let updated;
    if (isBookmarked(id)) {
      updated = bookmarkedIds.filter(bId => bId !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);

    if (session?.user) {
      try {
        if (isBookmarked(id)) {
          await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", session.user.id)
            .eq("listing_id", id);
        } else {
          await supabase
            .from("bookmarks")
            .insert({ user_id: session.user.id, listing_id: id });
        }
      } catch (e) {
        console.warn("Failed to update bookmark in Supabase", e);
      }
    } else {
      localStorage.setItem("bookmarks", JSON.stringify(updated));
    }
  };

  const isBookmarked = (id) => bookmarkedIds.includes(id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient glowing bubbles in the background */}
      <div className="blur-bubble bg-indigo-500/10 dark:bg-indigo-500/20 top-20 left-10" />
      <div className="blur-bubble bg-rose-500/10 dark:bg-rose-500/20 top-60 right-10" />
      <div className="mesh-bg" />

      <Navbar />

      <main className="flex-grow relative z-10 pt-20 sm:pt-24">
        
        {/* Hero Section */}
        <section className="relative py-12 lg:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            
            {/* Location Tag */}
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-sm mb-8 animate-fade-in select-none">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ghatal, West Bengal</span>
            </div>
            
            {/* Title Header */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] mb-6 animate-fade-in tracking-tight">
              Your Digital Companion
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 drop-shadow-sm font-extrabold dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                for Ghatal Town
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
              Discover verified local services, emergency helplines, transit tables, jobs, and top-rated businesses. Everything you need, in one place.
            </p>

            {/* Premium Search Container */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-10 animate-slide-up">
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800 p-2 pl-4 md:pl-6 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 focus-within:scale-[1.01]">
                <input
                  type="text"
                  placeholder={isListening ? "Listening to voice..." : "Search doctors, stores, restaurants, services..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-transparent border-none outline-none text-slate-900 dark:text-white text-base md:text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 py-3"
                  disabled={isListening}
                />
                
                <div className="flex items-center space-x-2 pr-1">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`relative p-3 rounded-xl transition-all cursor-pointer ${
                      isListening 
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                        : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    }`}
                    title={isListening ? "Click to stop listening" : "Voice Search"}
                    aria-label={isListening ? "Stop voice search" : "Start voice search"}
                  >
                    {/* Pulse ring when listening */}
                    {isListening && (
                      <span className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping opacity-40" />
                    )}
                    {isListening ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 md:px-7 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black transition-all shadow-md flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <Search className="w-4.5 h-4.5" />
                    <span className="hidden sm:inline text-sm">Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 animate-slide-up">
              <Link
                href="/directory?filter=open-now"
                className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-emerald-500" /> Open Now
              </Link>
              <Link
                href="/directory?filter=top-rated"
                className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-amber-500" /> Top Rated
              </Link>
              <Link
                href="/directory?filter=near-me"
                className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-indigo-500" /> Near Me
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-slate-50/50 dark:bg-slate-900/10 border-y border-slate-200/40 dark:border-slate-800/40 relative">
          <div className="container-perfect">
            
            <div className="text-center mb-10 space-y-2.5">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Explore Categories
              </h2>
              <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-bold text-sm">
                Easily filter what you need across our tailored category systems
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.keys(categories).map((key) => {
                const cat = categories[key];
                
                // Color mapping for premium category cards
                const themes = {
                  health: "border-emerald-500/10 dark:border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400",
                  food: "border-orange-500/10 dark:border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 text-orange-600 dark:text-orange-400",
                  shopping: "border-purple-500/10 dark:border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-50/20 dark:hover:bg-purple-950/10 text-purple-600 dark:text-purple-400",
                  services: "border-indigo-500/10 dark:border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400",
                  education: "border-blue-500/10 dark:border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 text-blue-600 dark:text-blue-400",
                  emergency: "border-red-500/10 dark:border-red-500/20 hover:border-red-500/40 hover:bg-red-50/20 dark:hover:bg-red-950/10 text-red-600 dark:text-red-400"
                };
                const themeClass = themes[key] || "border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-800";
                
                return (
                  <Link
                    key={key}
                    href={`/directory?category=${key}`}
                    className={`category-card bg-white dark:bg-slate-900 border ${themeClass} p-8 rounded-3xl text-center flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-lg`}
                  >
                    <div className="mb-4 select-none drop-shadow-sm transform transition-transform group-hover:scale-110">
                      <CategoryIcon category={key} className="w-9 h-9" />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight leading-snug">
                      {cat.name}
                    </h3>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>

        {/* Featured Section */}
        <section className="py-12 bg-white dark:bg-slate-950">
          <div className="container-perfect">
            
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Featured Businesses
                </h2>
                <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                  Recommended local places in Ghatal
                </p>
              </div>
              <Link
                href="/directory"
                className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group shrink-0 text-sm"
              >
                <span>View Full Directory</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  userLocation={userLocation}
                  isBookmarked={isBookmarked(listing.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>

          </div>
        </section>

        {/* Services & Modules Section */}
        <section className="py-12 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/40 dark:border-slate-800/40 relative">
          <div className="container-perfect">
            
            <div className="text-center mb-10 space-y-2.5">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Additional Services
              </h2>
              <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-bold text-sm">
                Explore transportation timetables, local jobs, and news.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Transportation card */}
              <Link
                href="/transportation"
                className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start gap-6 hover:shadow-xl transition-all duration-350 group"
              >
                <div className="p-4.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0 border border-indigo-100/10">
                  <Bus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2">
                    Transit Schedules
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5 font-bold">
                    Timings and connecting routes for trains, buses, and local totos across Ghatal and nearby platforms.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Check Schedules <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

              {/* Events card */}
              <Link
                href="/events"
                className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start gap-6 hover:shadow-xl transition-all duration-350 group"
              >
                <div className="p-4.5 bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-450 rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0 border border-rose-100/10">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-2">
                    Local Events & News
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5 font-bold">
                    Stay up-to-date with book fairs, cultural programs, local health drives, and community news.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-450 group-hover:underline">
                    Discover Events <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
