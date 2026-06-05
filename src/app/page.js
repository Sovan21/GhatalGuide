"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import FeaturedListingCard from "@/components/cards/FeaturedListingCard";
import { categories } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { CategoryIcon } from "@/lib/categoryIcons";
import { Search, Mic, MicOff, ArrowRight, Star, Calendar, Bus, MapPin, Clock, Store, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("bn-IN");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load voice language preference from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("voiceLang");
      if (savedLang) {
        setVoiceLang(savedLang);
      }
    }
  }, []);

  // Decoupled logic to load autocomplete suggestions in the background
  const loadSuggestions = useCallback(async () => {
    if (suggestionsLoaded || loadingSuggestions) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        if (data?.listings) {
          setAllListings(data.listings);
          setSuggestionsLoaded(true);
        }
      }
    } catch (err) {
      console.warn("Error loading autocomplete suggestions", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [suggestionsLoaded, loadingSuggestions]);

  // Fetch only featured listings and bookmarks on load (Fast Path)
  useEffect(() => {
    async function loadData() {
      setIsLoadingFeatured(true);
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
      } finally {
        setIsLoadingFeatured(false);
      }

      // Request geolocation (non-blocking)
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

  // Pre-fetch suggestions in background after 1.2s to not block initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuggestions();
    }, 1200);
    return () => clearTimeout(timer);
  }, [loadSuggestions]);

  // Compute search suggestions in memory for the homepage
  const suggestions = React.useMemo(() => {
    if (!searchFocused || !searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    const matches = [];

    // Match categories
    Object.keys(categories).forEach(key => {
      const cat = categories[key];
      if (cat.name.toLowerCase().includes(q)) {
        matches.push({ type: "category", id: key, text: cat.name, subtext: "Category" });
      }
    });

    // Match listings (limit to 6 matches)
    let listingCount = 0;
    for (const item of allListings) {
      if (listingCount >= 6) break;
      if (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q))
      ) {
        matches.push({
          type: "business",
          id: item.id,
          text: item.name,
          subtext: item.subcategory || item.category
        });
        listingCount++;
      }
    }

    return matches;
  }, [allListings, searchQuery, searchFocused]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    document.activeElement?.blur();
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

  // Helper to switch voice search language and abort current listening session if active
  const handleToggleVoiceLang = useCallback((lang) => {
    setVoiceLang(lang);
    localStorage.setItem("voiceLang", lang);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }
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
    recognition.lang = voiceLang; // Dynamic language based on user selection
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
      if (event.error === "aborted") {
        // Silently ignore aborted errors (triggered when stop/abort is called programmatically)
        return;
      }
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
  }, [isListening, router, voiceLang]);

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative overflow-hidden">
      
      {/* Ambient glowing bubbles in the background */}
      <div className="blur-bubble bg-indigo-500/10 dark:bg-indigo-500/20 top-20 left-10" />
      <div className="blur-bubble bg-rose-500/10 dark:bg-rose-500/20 top-60 right-10" />
      <div className="mesh-bg" />

      <Navbar />

      <main className="flex-grow relative z-10 pt-20 sm:pt-24">
        
        {/* Hero Section */}
        <section className="relative py-12 lg:py-16 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto px-4">
            
            {/* Location Tag */}
            <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/40 border border-primary-100/50 dark:border-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-sm mb-8 select-none">
              <MapPin className="w-3.5 h-3.5" />
              <span>Ghatal, West Bengal</span>
            </div>
            
            {/* Title Header */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] mb-6 tracking-tight">
              Your Digital Companion
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-700 drop-shadow-sm font-extrabold dark:from-primary-400 dark:to-indigo-400">
                for Ghatal Town
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-800 dark:text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
              Discover verified local services, emergency helplines, transit tables, jobs, and top-rated businesses. Everything you need, in one place.
            </p>

            {/* Premium Search Container */}
            <form onSubmit={handleSearchSubmit} className="relative z-40 max-w-2xl mx-auto mb-10 animate-slide-up flex flex-col items-center w-full">
              
              <div className="w-full flex items-center bg-white dark:bg-dark-card rounded-2xl md:rounded-3xl shadow-xl shadow-primary-500/5 border border-slate-200 dark:border-dark-border p-2 pl-12 pr-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary-500/40 focus-within:border-primary-500 focus-within:scale-[1.01] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="search"
                  placeholder={
                    isListening 
                      ? (voiceLang === "bn-IN" ? "বাংলায় বলুন..." : "Speak now in English...") 
                      : "Search doctors, stores, restaurants, services..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    loadSuggestions();
                  }}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="flex-grow bg-transparent border-none outline-none text-slate-900 dark:text-white text-base md:text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 py-3 min-w-0"
                  disabled={isListening}
                />
                
                <div className="flex items-center space-x-1.5 sm:space-x-2 pr-1 shrink-0">
                  {/* Language switch button inside search bar */}
                  <button
                    type="button"
                    onClick={() => handleToggleVoiceLang(voiceLang === "bn-IN" ? "en-US" : "bn-IN")}
                    className="text-[9px] sm:text-[10px] font-black uppercase bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-dark-card-hover px-2.5 py-1.5 rounded-lg text-slate-650 dark:text-slate-300 transition-colors shrink-0 select-none border border-slate-200/40 dark:border-dark-border/40"
                    title="Switch voice search language"
                  >
                    {voiceLang === "bn-IN" ? "বাংলা" : "ENG"}
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`relative p-3 rounded-xl transition-all cursor-pointer shrink-0 ${
                      isListening 
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                        : "text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30"
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
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {searchFocused && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[102%] bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl z-50 py-2.5 overflow-hidden max-h-72 overflow-y-auto animate-fade-in text-slate-900 dark:text-white text-left">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={`sug-${idx}`}
                        type="button"
                        onMouseDown={() => {
                          if (suggestion.type === "category") {
                            router.push(`/directory?category=${suggestion.id}`);
                          } else {
                            setSearchQuery(suggestion.text);
                            router.push(`/directory?search=${encodeURIComponent(suggestion.text)}`);
                          }
                          setSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-left hover:bg-slate-50 dark:hover:bg-dark-card-hover transition-colors text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {suggestion.type === "category" ? (
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-lg">
                              <Store className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-slate-100 dark:bg-dark-border text-slate-400 rounded-lg">
                              <Search className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-900 dark:text-white">{suggestion.text}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate">{suggestion.subtext}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 animate-slide-up relative z-10">
              <Link
                href="/directory?filter=open-now"
                className="px-5 py-2.5 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-emerald-500" /> Open Now
              </Link>
              <Link
                href="/directory?filter=top-rated"
                className="px-5 py-2.5 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <Star className="w-4 h-4 text-amber-500" /> Top Rated
              </Link>
              <Link
                href="/directory?filter=near-me"
                className="px-5 py-2.5 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-dark-border hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-indigo-500" /> Near Me
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-slate-50/50 dark:bg-dark-bg/10 border-y border-slate-200/40 dark:border-dark-border/40 relative">
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
                const themeClass = themes[key] || "border-slate-200 dark:border-dark-border hover:border-indigo-500 text-slate-800";
                
                return (
                  <Link
                    key={key}
                    href={`/directory?category=${key}`}
                    className={`category-card bg-white dark:bg-dark-card border ${themeClass} p-8 rounded-3xl text-center flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-lg`}
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
        <section className="py-20 bg-white dark:bg-dark-bg relative overflow-hidden border-t border-slate-100/40 dark:border-dark-border/20">
          
          {/* Subtle neon mesh backdrops */}
          <div className="blur-bubble bg-indigo-500/5 dark:bg-indigo-500/10 top-1/4 left-1/3 w-[500px] h-[500px] pointer-events-none" />
          <div className="blur-bubble bg-emerald-500/5 dark:bg-emerald-500/10 bottom-1/4 right-1/3 w-[500px] h-[500px] pointer-events-none" />

          <div className="container-perfect relative z-10">
            
            {/* Redesigned Premium Title Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6 relative z-10 border-b border-slate-100 dark:border-dark-border/40 pb-6">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 dark:bg-indigo-400/15 border border-indigo-200/40 dark:border-indigo-800/30 text-indigo-650 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider select-none">
                  <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400/20 animate-pulse" />
                  <span>Featured Partners</span>
                </div>
                <h2 className="text-3xl sm:text-4.5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Discover Top Businesses
                </h2>
                <p className="text-xs sm:text-sm text-slate-550 dark:text-slate-400 font-bold max-w-xl leading-relaxed">
                  Handpicked premier options and trusted services highly rated by the community in Ghatal Town.
                </p>
              </div>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-655 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all group shrink-0 bg-slate-50 dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-card-hover border border-slate-200/60 dark:border-dark-border/80 px-5 py-3.5 rounded-2xl shadow-sm"
              >
                <span>View Full Directory</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Premium Grid layout for Featured Cards & Skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {isLoadingFeatured ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <FeaturedListingCardSkeleton key={`skeleton-${idx}`} />
                ))
              ) : featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <FeaturedListingCard
                    key={listing.id}
                    listing={listing}
                    userLocation={userLocation}
                    isBookmarked={isBookmarked(listing.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))
              ) : (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-dark-border rounded-3xl bg-slate-50/50 dark:bg-dark-card/20">
                  <div className="p-3 bg-slate-100 dark:bg-dark-border text-slate-400 rounded-2xl inline-block mb-3">
                    <Store className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                    No featured listings active
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Services & Modules Section */}
        <section className="py-16 bg-slate-50/50 dark:bg-dark-bg/10 border-t border-slate-200/40 dark:border-dark-border/40 relative">
          <div className="container-perfect">
            
            <div className="text-center mb-12 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 select-none">
                More Modules
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Additional Services
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Transportation card */}
              <Link
                href="/transportation"
                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group"
              >
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-xl shrink-0">
                  <Bus className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    Transit Schedules
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-3">
                    Check train, bus, and toto timings connecting Ghatal to major platforms.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">
                    Schedules <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>

              {/* Events card */}
              <Link
                href="/events"
                className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border/80 hover:border-rose-500/50 dark:hover:border-rose-500/50 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-5 group"
              >
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-450 rounded-xl shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    Local Events & News
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-3">
                    Stay up-to-date with book fairs, cultural programs, and community updates.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-500 dark:text-rose-450 uppercase tracking-wider">
                    Events <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
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

// Premium Skeleton Loader mimicking the custom FeaturedListingCard spacing & content density
function FeaturedListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-slate-200/60 dark:border-dark-border/70 bg-white dark:bg-dark-card h-full shadow-sm animate-pulse select-none">
      {/* Image Banner Shimmer */}
      <div className="h-56 w-full bg-slate-200 dark:bg-dark-border/50 relative" />
      
      {/* Content Shimmer */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory & Rating Shimmer */}
          <div className="flex justify-between items-center gap-4 mb-4">
            <div className="h-5 w-20 bg-slate-100 dark:bg-dark-border/40 rounded-md" />
            <div className="h-5 w-16 bg-slate-100 dark:bg-dark-border/40 rounded-md" />
          </div>
          
          {/* Title Shimmer */}
          <div className="h-7 w-3/4 bg-slate-200 dark:bg-dark-border/50 rounded-lg mb-3.5" />
          
          {/* Address Shimmer */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-slate-200/60 dark:bg-dark-border/40 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200/60 dark:bg-dark-border/40 rounded-md" />
          </div>
          
          {/* Distance Shimmer */}
          <div className="h-6 w-32 bg-slate-100 dark:bg-dark-border/40 rounded-lg mb-2" />
        </div>
        
        {/* Footer Shimmer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border/50 flex justify-between items-center">
          <div className="h-4 w-20 bg-slate-200 dark:bg-dark-border/40 rounded-md" />
          <div className="h-9 w-24 bg-slate-200 dark:bg-dark-border/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}
