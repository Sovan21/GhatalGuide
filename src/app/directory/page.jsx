"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ListingCard from "@/components/cards/ListingCard";
import { categories } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { CategoryIcon } from "@/lib/categoryIcons";
import { useInView } from 'react-intersection-observer';
import { 
  Search, SlidersHorizontal, Grid, List, X, Clock, Star, MapPin, Globe, Store, Loader2,
  ChevronDown, Check, Mic, MicOff
} from "lucide-react";

// Extracted FiltersSidebarContent component to prevent input focus loss and re-mounting on state updates
function FiltersSidebarContent({
  searchQuery,
  clearFilter,
  sortBy,
  setSortBy,
  openNow,
  setOpenNow,
  topRated,
  setTopRated,
  nearMe,
  setNearMe,
  userLocation,
  selectedCategory,
  setSelectedCategory
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { value: "name", label: "Name A-Z", icon: null },
    { value: "rating", label: "Top Rated", icon: Star },
    { value: "newest", label: "Newest", icon: Clock },
    ...(userLocation ? [{ value: "distance", label: "Nearest", icon: MapPin }] : [])
  ];

  const currentSortOption = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0];
  const CurrentSortIcon = currentSortOption.icon;

  return (
    <div className="space-y-4">
      {/* Search query tag helper */}
      {searchQuery && (
        <div className="bg-slate-50 dark:bg-dark-card/50 border border-slate-200/60 dark:border-dark-border p-2.5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Searching for</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">"{searchQuery}"</p>
          </div>
          <button 
            type="button"
            onClick={() => clearFilter("search")}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sorting options - Custom Dropdown */}
      <div className="space-y-1.5 relative">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          Sort By
        </h3>
        
        <div>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-dark-card/60 border border-slate-200 dark:border-dark-border/80 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <div className="flex items-center gap-2">
              {CurrentSortIcon ? (
                <CurrentSortIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              ) : (
                <SlidersHorizontal className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              )}
              <span>{currentSortOption.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
          </button>

          {isSortOpen && (
            <>
              {/* Overlay to close dropdown */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsSortOpen(false)}
              />
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden animate-fade-in">
                {sortOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {Icon ? (
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-500" : "text-slate-400"}`} />
                        ) : (
                          <SlidersHorizontal className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-500" : "text-slate-400"}`} />
                        )}
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-dark-card-hover/60 w-full" />

      {/* Quick Status Filter - Toggle Switches */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Filters
        </h3>
        <div className="space-y-2">
          {/* Open Now Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-dark-card/40 border border-slate-200/50 dark:border-dark-border/50 rounded-2xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/80 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Open Now</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">Currently open places</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setOpenNow(!openNow)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                openNow ? "bg-emerald-500" : "bg-slate-200 dark:bg-dark-card-hover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  openNow ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Highly Rated Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-dark-card/40 border border-slate-200/50 dark:border-dark-border/50 rounded-2xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/80 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-500 dark:text-amber-400">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Highly Rated</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">4.0+ Star ratings</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setTopRated(!topRated)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                topRated ? "bg-amber-500" : "bg-slate-200 dark:bg-dark-card-hover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  topRated ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Near Me Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-dark-card/40 border border-slate-200/50 dark:border-dark-border/50 rounded-2xl transition-all hover:bg-slate-100/50 dark:hover:bg-slate-900/80 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-500 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">Within 20 km</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">Nearby listings</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                if (!userLocation) {
                  alert("Please enable location services to use Near Me filter.");
                  return;
                }
                setNearMe(!nearMe);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                nearMe ? "bg-blue-500" : "bg-slate-200 dark:bg-dark-card-hover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  nearMe ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-dark-card-hover/60 w-full" />

      {/* Categories Selection List - Sleek modern menu */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            Categories
          </h3>
          {selectedCategory !== "all" && (
            <button 
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 max-h-[210px] lg:max-h-[210px] xl:max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer group ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className={`w-4 h-4 ${selectedCategory === "all" ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`} />
              <span>All Categories</span>
            </div>
            {selectedCategory === "all" && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
          </button>

          {Object.keys(categories).map((key) => {
            const cat = categories[key];
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon category={key} className={`w-4 h-4 ${isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Skeleton Card Loader for directory listings
const ListingCardSkeleton = ({ viewMode }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-[#0d1527] border border-slate-100 dark:border-dark-border/80 rounded-[24px] p-5 flex flex-col sm:flex-row gap-5 items-center justify-between overflow-hidden animate-pulse w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 w-full">
          <div className="h-32 w-44 bg-slate-200 dark:bg-dark-card-hover rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1 w-full">
            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
            <div className="w-2/3 h-5 rounded bg-slate-200 dark:bg-dark-card-hover" />
            <div className="w-1/2 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
            <div className="w-3/4 h-3.5 rounded bg-slate-200 dark:bg-dark-card-hover" />
          </div>
        </div>
        <div className="w-24 h-9 rounded-full bg-slate-200 dark:bg-dark-card-hover shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d1527] border border-slate-100 dark:border-dark-border/80 rounded-[24px] p-5 flex flex-col justify-between overflow-hidden animate-pulse h-[380px] w-full">
      <div>
        {/* Top Category Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-dark-card-hover" />
            <div className="w-20 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-card-hover" />
        </div>
        {/* Image skeleton */}
        <div className="h-44 w-full bg-slate-200 dark:bg-dark-card-hover rounded-2xl mb-4" />
        {/* Rating row skeleton */}
        <div className="w-28 h-4 rounded bg-slate-200 dark:bg-dark-card-hover mb-3" />
        {/* Title skeleton */}
        <div className="w-48 h-5 rounded bg-slate-200 dark:bg-dark-card-hover mb-3" />
        {/* Address skeleton */}
        <div className="space-y-2 mb-4">
          <div className="w-full h-3 rounded bg-slate-200 dark:bg-dark-card-hover" />
          <div className="w-3/4 h-3 rounded bg-slate-200 dark:bg-dark-card-hover" />
        </div>
      </div>
      {/* Footer actions skeleton */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-dark-border/80 flex justify-between items-center gap-4">
        <div className="w-20 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
        <div className="w-24 h-8 rounded-full bg-slate-200 dark:bg-dark-card-hover" />
      </div>
    </div>
  );
};

// Wrap Content in Suspense to safely use useSearchParams in static builds
function DirectoryContent() {
  const searchParams = useSearchParams();
  const directorySectionRef = React.useRef(null);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  
  // Voice search and suggestions states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("bn-IN");
  const [searchFocused, setSearchFocused] = useState(false);
  const recognitionRef = React.useRef(null);
  
  // Backward compatibility check for "?filter=..."
  const initialFilter = searchParams.get("filter") || "";
  const [openNow, setOpenNow] = useState(initialFilter === "open-now" || searchParams.get("openNow") === "true");
  const [topRated, setTopRated] = useState(initialFilter === "top-rated" || searchParams.get("topRated") === "true");
  const [nearMe, setNearMe] = useState(initialFilter === "near-me" || searchParams.get("nearMe") === "true");
  
  const [sortBy, setSortBy] = useState("name"); // 'name', 'rating', 'distance', 'newest'
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  const [allListings, setAllListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const ITEMS_PER_PAGE = 9;
  const [page, setPage] = useState(1);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Load user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        }
      );
    }
  }, []);

  // Load voice language preference from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("voiceLang");
      if (savedLang) {
        setVoiceLang(savedLang);
      }
    }
  }, []);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleToggleVoiceLang = (lang) => {
    setVoiceLang(lang);
    localStorage.setItem("voiceLang", lang);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleVoiceSearch = () => {
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
    recognition.lang = voiceLang;
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
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        alert("Microphone access was denied. Please allow microphone permission in your browser settings.");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  // Compute search suggestions in memory
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

  // Helper: calculate air distance (Haversine) for sorting
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

  // Load listings and bookmarks on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [listingsRes, sessionRes] = await Promise.all([
          fetch("/api/listings").then((res) => {
            if (!res.ok) throw new Error("API request failed");
            return res.json();
          }),
          supabase.auth.getSession().catch(() => ({ data: { session: null } }))
        ]);

        if (listingsRes.listings) {
          setAllListings(listingsRes.listings);
        }

        const session = sessionRes?.data?.session;
        if (session?.user) {
          const { data: bData, error: bError } = await supabase
            .from("bookmarks")
            .select("listing_id")
            .eq("user_id", session.user.id);
          if (bData && !bError) {
            setBookmarkedIds(bData.map((b) => b.listing_id));
          }
        } else {
          const local = localStorage.getItem("bookmarks");
          if (local) {
            setBookmarkedIds(JSON.parse(local));
          }
        }
      } catch (err) {
        console.warn("Error loading directory data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute filtered listings instantly in memory
  const filteredListings = React.useMemo(() => {
    // Helper to check if business is open right now
    const isBusinessOpen = (openingHours) => {
      // Helper to convert "HH:MM" string to minutes from midnight
      const timeToMinutes = (timeStr) => {
          if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
      };

      // Handle explicit status types from the DB
      if (openingHours?.status === 'open_24_7') return true;
      if (openingHours?.status === 'temporarily_closed') return false;
      if (openingHours?.status === 'custom' && !openingHours.hours) return false;

      // Use the nested 'hours' object if it exists, otherwise use the openingHours object itself
      const hoursData = openingHours?.hours || openingHours;

      const now = new Date();
      const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

      // Default behavior if no hours data is provided at all
      if (!hoursData) {
          // Default to open 9-5 on weekdays if no hours are provided
          const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          if (day === 0 || day === 6) return false; // Closed on weekends
          return currentTimeInMinutes >= 540 /* 9:00 AM */ && currentTimeInMinutes < 1020 /* 5:00 PM */;
      }

      const hoursForToday = hoursData[currentDayName];

      if (!hoursForToday || !hoursForToday.open || !hoursForToday.close) {
          return false; // Closed if no hours are set for today
      }

      const openTimeInMinutes = timeToMinutes(hoursForToday.open);
      const closeTimeInMinutes = timeToMinutes(hoursForToday.close);

      if (openTimeInMinutes === null || closeTimeInMinutes === null) return false;

      // Standard case: opens and closes on the same day (e.g., 09:00 - 17:00)
      if (openTimeInMinutes <= closeTimeInMinutes) {
          return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
      }
      // Overnight case: opens one day and closes the next (e.g., 22:00 - 04:00)
      return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
    };

    let result = allListings.map(item => ({
      ...item,
      isOpen: item.isOpen !== undefined ? item.isOpen : isBusinessOpen(item.opening_hours)
    }));

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q)) ||
          (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 3. Quick Status Filters
    if (openNow) {
      result = result.filter((item) => item.isOpen === true);
    }
    if (topRated) {
      result = result.filter((item) => item.rating >= 4.0);
    }

    // Calculate distance and filter for Near Me
    if (userLocation) {
      result = result.map((item) => ({
        ...item,
        distance: calculateDistance(userLocation.lat, userLocation.lng, item.lat, item.lng)
      }));

      if (nearMe) {
        result = result.filter((item) => item.distance !== null && item.distance <= 20);
      }
    }

    // 4. Sorting
    if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        // stable fallback: sort by reviewCount desc, then name A-Z
        const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return (a.name || "").localeCompare(b.name || "");
      });
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === "distance" && userLocation) {
      result.sort((a, b) => {
        const distA = a.distance === null || a.distance === undefined ? Infinity : a.distance;
        const distB = b.distance === null || b.distance === undefined ? Infinity : b.distance;
        return distA - distB;
      });
    }

    return result;
  }, [allListings, searchQuery, selectedCategory, openNow, topRated, nearMe, sortBy, userLocation]);


  // Paginated chunk to display
  const displayedListings = React.useMemo(() => {
    return filteredListings.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredListings, page]);

  const hasMore = displayedListings.length < filteredListings.length;

  // Reset pagination page when filters or sorting change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, openNow, topRated, nearMe, sortBy]);

  // Scroll smoothly to the top of the listings/filter container when filters, category, or sorting changes
  useEffect(() => {
    if (directorySectionRef.current && typeof window !== "undefined") {
      // Get the vertical offset of the container relative to the document top
      const elementPosition = directorySectionRef.current.getBoundingClientRect().top + window.scrollY;
      // Subtract 100px to account for the sticky navbar height so it doesn't overlap the title/filters
      const offsetPosition = elementPosition - 100;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, [selectedCategory, openNow, topRated, nearMe, sortBy]);

  // Infinite Scroll Trigger (Local Pagination)
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const handleBookmarkToggle = async (id) => {
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn("Failed to get auth session on bookmark toggle:", e);
    }

    const isAlready = bookmarkedIds.includes(id);
    let updated;
    if (isAlready) {
      updated = bookmarkedIds.filter((bId) => bId !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);

    if (session?.user) {
      try {
        if (isAlready) {
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
      } catch (e) {}
    } else {
      localStorage.setItem("bookmarks", JSON.stringify(updated));
    }
  };

  // Helper to clear specific filter
  const clearFilter = (type) => {
    if (type === "category") setSelectedCategory("all");
    if (type === "openNow") setOpenNow(false);
    if (type === "topRated") setTopRated(false);
    if (type === "nearMe") setNearMe(false);
    if (type === "search") setSearchQuery("");
  };

  const activeFiltersCount = 
    (selectedCategory !== "all" ? 1 : 0) + 
    (openNow ? 1 : 0) + 
    (topRated ? 1 : 0) + 
    (nearMe ? 1 : 0) + 
    (searchQuery !== "" ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect">
          
          {/* Header */}
          <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Business Directory
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold leading-relaxed">
              Explore local shops, emergency services, doctor clinics, and public resources in Ghatal.
            </p>
          </div>

          <div ref={directorySectionRef} className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Desktop Sidebar (visible on lg and above) */}
            <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border/80 p-6 shadow-sm sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
              <FiltersSidebarContent 
                searchQuery={searchQuery}
                clearFilter={clearFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                openNow={openNow}
                setOpenNow={setOpenNow}
                topRated={topRated}
                setTopRated={setTopRated}
                nearMe={nearMe}
                setNearMe={setNearMe}
                userLocation={userLocation}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </aside>

            {/* Main Area */}
            <div className="flex-grow w-full space-y-6">
              
              {/* Directory Filter Bar Panel */}
              <div className="bg-white dark:bg-dark-card rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-dark-border p-4 sm:p-5 shadow-sm">
                <div className="flex gap-3 items-center">
                  
                  {/* Search Bar Input */}
                  <form onSubmit={(e) => { e.preventDefault(); document.activeElement?.blur(); }} className="relative flex-grow">
                    <input
                      type="search"
                      placeholder={isListening ? (voiceLang === "bn-IN" ? "বলুন..." : "Speak now...") : "Search by name, address, or service..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      className="w-full pl-11 pr-28 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                    
                    {/* Voice Search Pill inside input */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
                      <button
                        type="button"
                        onClick={() => handleToggleVoiceLang(voiceLang === "bn-IN" ? "en-US" : "bn-IN")}
                        className="text-[9px] font-black uppercase bg-slate-200/80 dark:bg-dark-card hover:bg-slate-300/80 dark:hover:bg-dark-card-hover px-2 py-1 rounded-md text-slate-650 dark:text-slate-300 transition-colors"
                        title="Switch voice search language"
                      >
                        {voiceLang === "bn-IN" ? "বাংলা" : "ENG"}
                      </button>
                      <button
                        type="button"
                        onClick={handleVoiceSearch}
                        className={`p-2 rounded-xl transition-all cursor-pointer relative shrink-0 ${
                           isListening 
                             ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                             : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-dark-card-hover"
                        }`}
                        title={isListening ? "Stop listening" : "Voice Search"}
                      >
                        {isListening && (
                          <span className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping opacity-40" />
                        )}
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {searchFocused && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl z-50 py-2.5 overflow-hidden max-h-72 overflow-y-auto animate-fade-in text-slate-900 dark:text-white">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={`sug-${idx}`}
                            type="button"
                            onMouseDown={() => {
                              if (suggestion.type === "category") {
                                setSelectedCategory(suggestion.id);
                                setSearchQuery("");
                              } else {
                                setSearchQuery(suggestion.text);
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
                                <p className="truncate font-black">{suggestion.text}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium truncate">{suggestion.subtext}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
 
                  {/* Mobile Filters Toggle Button (hidden on desktop) */}
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="lg:hidden p-3.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl text-slate-650 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    title="Filters"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
 
                  {/* View Mode Toggle Switch */}
                  <div className="hidden sm:flex bg-slate-100 dark:bg-dark-card p-1 rounded-2xl items-center shrink-0 border border-slate-200 dark:border-dark-border">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        viewMode === "grid" 
                          ? "bg-white dark:bg-dark-card-hover text-indigo-500 dark:text-white shadow-sm" 
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        viewMode === "list" 
                          ? "bg-white dark:bg-dark-card-hover text-indigo-500 dark:text-white shadow-sm" 
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                      title="List View"
                    >
                      <List className="w-4.5 h-4.5" />
                    </button>
                  </div>

                </div>

                {/* Active Filter Badges */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border flex flex-wrap items-center gap-2 text-xs font-black">
                    <span className="text-slate-400 uppercase select-none text-[10px] tracking-wide">Active Filters:</span>
                    
                    {selectedCategory !== "all" && (
                      <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3.5 py-1 rounded-full border border-indigo-200/20 shadow-sm">
                        <span>Category: {categories[selectedCategory]?.name}</span>
                        <button onClick={() => clearFilter("category")} className="hover:text-indigo-900 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    )}

                    {openNow && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3.5 py-1 rounded-full border border-emerald-200/20 shadow-sm">
                        <span>Status: Open Now</span>
                        <button onClick={() => clearFilter("openNow")} className="hover:text-emerald-900 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    )}

                    {topRated && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-3.5 py-1 rounded-full border border-amber-200/20 shadow-sm">
                        <span>Rating: 4.0+ Stars</span>
                        <button onClick={() => clearFilter("topRated")} className="hover:text-amber-900 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    )}

                    {nearMe && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3.5 py-1 rounded-full border border-blue-200/20 shadow-sm">
                        <span>Distance: &lt; 20 km</span>
                        <button onClick={() => clearFilter("nearMe")} className="hover:text-blue-900 cursor-pointer"><X className="w-3 h-3" /></button>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setOpenNow(false);
                        setTopRated(false);
                        setNearMe(false);
                        setSearchQuery("");
                      }}
                      className="text-red-500 hover:text-red-600 hover:underline font-black ml-auto cursor-pointer text-xs"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Listings Render Grid */}
              {loading && allListings.length === 0 ? (
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
                    : "flex flex-col gap-6"
                }>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className={viewMode === "list" ? "w-full" : ""}>
                      <ListingCardSkeleton viewMode={viewMode} />
                    </div>
                  ))}
                </div>
              ) : !loading && filteredListings.length === 0 ? (
                <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border py-20 px-6 text-center max-w-xl mx-auto shadow-sm">
                  <div className="mb-5">
                    <Store className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    No Listings Found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto font-medium">
                    We couldn't find any business matching your search filters. Try clearing some active filters or modifying search keywords.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div 
                    key={`${selectedCategory}-${sortBy}-${openNow}-${topRated}-${nearMe}-${searchQuery}`}
                    className={`${
                      viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
                        : "flex flex-col gap-6"
                    } animate-fade-in`}
                  >
                    {displayedListings.map((listing, index) => (
                      <div key={`listing-${listing.id || index}-${index}`} className={viewMode === "list" ? "w-full" : ""}>
                        <ListingCard
                          listing={listing}
                          userLocation={userLocation}
                          isBookmarked={bookmarkedIds.includes(listing.id)}
                          onBookmarkToggle={handleBookmarkToggle}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Infinite Scroll trigger and loader */}
                  {hasMore && (
                    <div 
                      ref={loadMoreRef} 
                      className="py-10 flex flex-col items-center justify-center space-y-3"
                    >
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse">Loading more listings...</p>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      {/* Mobile Drawer (visible on mobile viewport when toggled) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
          />
          
          {/* Drawer container panel */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-dark-card shadow-2xl p-6 overflow-y-auto flex flex-col transition-transform duration-300">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-dark-border mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                <span>Filters & Sort</span>
              </h2>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow">
              <FiltersSidebarContent 
                searchQuery={searchQuery}
                clearFilter={clearFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                openNow={openNow}
                setOpenNow={setOpenNow}
                topRated={topRated}
                setTopRated={setTopRated}
                nearMe={nearMe}
                setNearMe={setNearMe}
                userLocation={userLocation}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3.5 rounded-xl shadow-md text-sm transition-all cursor-pointer"
              >
                Apply Filters ({filteredListings.length} results)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Directory() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-white dark:bg-dark-bg z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <DirectoryContent />
    </Suspense>
  );
}
