"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { computeAverageRating } from "@/lib/enrichListingsWithReviewStats";
import { sampleListings } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { 
  ArrowLeft, Star, MapPin, Phone, Heart, MessageSquare, Car, Share2, Store,
  Clock, Calendar, Copy, Check, ExternalLink, Sparkles, User, ShieldCheck, Info,
  ChevronDown, ChevronUp
} from "lucide-react";

export default function ListingDetails({ params }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [roadDistance, setRoadDistance] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);
  
  // Clipboard copy states
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Computed opening hours status
  const openingHoursStatus = React.useMemo(() => {
    if (!listing?.opening_hours) return "open_24_7";
    if (listing.opening_hours.status) return listing.opening_hours.status;
    // Fallback if structure is just days
    const hoursData = listing.opening_hours.hours || listing.opening_hours;
    if (hoursData && Object.keys(hoursData).some(key => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(key))) {
      return "custom";
    }
    return "open_24_7";
  }, [listing]);

  // Compute rating breakdown distribution
  const ratingDistribution = React.useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!reviews || reviews.length === 0) return counts;
    reviews.forEach(r => {
      const ratingVal = Math.round(r.rating || 5);
      if (counts[ratingVal] !== undefined) {
        counts[ratingVal]++;
      }
    });
    return counts;
  }, [reviews]);

  const averageRating = React.useMemo(() => {
    if (reviews.length > 0) return computeAverageRating(reviews);
    return Number(listing?.rating) || 0;
  }, [reviews, listing?.rating]);

  // Review form states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      });
    }
  }, []);

  // Fetch listing details and reviews
  useEffect(() => {
    async function loadListingData() {
      setLoading(true);
      try {
        const [listingRes, reviewsRes, sessionRes] = await Promise.all([
          supabase.from("listings").select("*").eq("id", listingId).maybeSingle(),
          supabase.from("reviews").select("*").eq("listing_id", listingId).eq("status", "approved").order("created_at", { ascending: false }),
          supabase.auth.getSession().catch(e => {
            console.warn("Failed to get auth session:", e);
            return { data: { session: null } };
          })
        ]);

        let dbListing = listingRes?.data;
        if (!dbListing) {
          dbListing = sampleListings.find(l => String(l.id) === String(listingId));
        }
        setListing(dbListing);
        setReviews(reviewsRes?.data || []);

        const session = sessionRes?.data?.session;
        if (session?.user) {
          const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("listing_id", listingId)
            .maybeSingle()
            .catch(() => ({ data: null }));
          setIsBookmarked(!!data && !error);
        } else {
          const local = localStorage.getItem("bookmarks");
          if (local) {
            setIsBookmarked(JSON.parse(local).includes(Number(listingId)));
          }
        }
      } catch (err) {
        console.warn("Failed loading listing data", err);
      } finally {
        setLoading(false);
      }
    }
    loadListingData();
  }, [listingId]);

  // Road distance calculation (via server-side proxy)
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!userLocation || !listing?.lat || !listing?.lng) {
        if (active) setRoadDistance(null);
        return;
      }
      if (active) setLoadingDistance(true);
      try {
        const url = `/api/distance?origin=${userLocation.lat},${userLocation.lng}&destination=${listing.lat},${listing.lng}`;
        const res = await fetch(url);
        const data = await res.json();
        if (active && data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
          const km = (data.routes[0].legs[0].distance / 1000).toFixed(1);
          setRoadDistance(km);
        }
      } catch (e) {
        console.warn("Road distance calculation failed", e);
      } finally {
        if (active) setLoadingDistance(false);
      }
    };

    const timer = setTimeout(run, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [userLocation, listing]);

  // Calculate straight-line air distance
  const airDistance = React.useMemo(() => {
    if (!userLocation || !listing?.lat || !listing?.lng) return null;
    const l1 = parseFloat(userLocation.lat);
    const ln1 = parseFloat(userLocation.lng);
    const l2 = parseFloat(listing.lat);
    const ln2 = parseFloat(listing.lng);
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
    return (R * c).toFixed(1);
  }, [userLocation, listing]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn("Failed to get auth session on bookmark toggle:", e);
    }

    const targetState = !isBookmarked;
    setIsBookmarked(targetState);

    if (session?.user) {
      try {
        if (!targetState) {
          await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", session.user.id)
            .eq("listing_id", listingId);
        } else {
          await supabase
            .from("bookmarks")
            .insert({ user_id: session.user.id, listing_id: listingId });
        }
      } catch (e) {}
    } else {
      let local = localStorage.getItem("bookmarks");
      let list = local ? JSON.parse(local) : [];
      if (!targetState) {
        list = list.filter(id => String(id) !== String(listingId));
      } else {
        list = [...list, Number(listingId)];
      }
      localStorage.setItem("bookmarks", JSON.stringify(list));
    }
  };

  // Submit review handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn("Failed to get auth session on review submit:", e);
    }

    if (!session?.user) {
      alert("Please log in to submit a review!");
      return;
    }
    if (!newComment.trim()) {
      alert("Please type a comment first!");
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewObj = {
        listing_id: Number(listingId),
        user_name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
        user_email: session.user.email,
        rating: newRating,
        review_text: newComment,
        status: "pending", 
      };

      const { error } = await supabase
        .from("reviews")
        .insert(reviewObj);
      if (!error) {
        alert("Review submitted successfully! It will appear after admin approval.");
        setNewComment("");
        setNewRating(5);
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      const errMsg = err?.message || err?.details || (typeof err === 'string' ? err : JSON.stringify(err)) || "Please try again.";
      alert(`Error adding review: ${errMsg}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCopyAddress = () => {
    if (!listing?.address) return;
    navigator.clipboard.writeText(listing.address).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    });
  };

  const handleShareClick = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: listing?.name,
        text: listing?.address,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopiedShare(true);
          setTimeout(() => setCopiedShare(false), 2000);
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      });
    }
  };

  // Helper to check if business is open right now
  const isBusinessOpen = (openingHours) => {
    if (listing?.isOpen !== undefined) return listing.isOpen;
    
    const timeToMinutes = (timeStr) => {
        if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    if (openingHours?.status === 'open_24_7') return true;
    if (openingHours?.status === 'temporarily_closed') return false;
    if (openingHours?.status === 'custom' && !openingHours.hours) return false;

    const hoursData = openingHours?.hours || openingHours;
    const now = new Date();
    const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    if (!hoursData) {
        const day = now.getDay();
        if (day === 0 || day === 6) return false;
        return currentTimeInMinutes >= 540 && currentTimeInMinutes < 1020;
    }

    const hoursForToday = hoursData[currentDayName];
    if (!hoursForToday || !hoursForToday.open || !hoursForToday.close) return false;

    const openTimeInMinutes = timeToMinutes(hoursForToday.open);
    const closeTimeInMinutes = timeToMinutes(hoursForToday.close);
    if (openTimeInMinutes === null || closeTimeInMinutes === null) return false;

    if (openTimeInMinutes <= closeTimeInMinutes) {
        return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    }
    return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
  };

  const isOpen = listing ? isBusinessOpen(listing.opening_hours) : false;

  // Format opening hours helper
  const formatTime12h = (timeStr) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return "Closed";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 relative overflow-hidden">
        <Navbar />
        
        {/* Background glow animations */}
        <div className="blur-bubble bg-primary-500/5 dark:bg-primary-500/10 top-20 left-10 animate-pulse" />
        <div className="blur-bubble bg-indigo-500/5 dark:bg-indigo-500/10 top-[400px] right-10 animate-pulse" />
        <div className="mesh-bg" />

        <main className="flex-grow pt-24 pb-28 md:pb-16 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Navigation row skeleton */}
          <div className="mb-6 flex justify-between items-center select-none animate-pulse">
            <div className="h-5 w-36 bg-slate-200 dark:bg-dark-border rounded-xl"></div>
            <div className="h-5 w-28 bg-slate-200 dark:bg-dark-border rounded-xl"></div>
          </div>

          {/* Premium Business Header Card Skeleton */}
          <div className="hidden md:flex mb-8 bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-dark-border shadow-sm items-center justify-between gap-6 animate-pulse">
            <div className="space-y-2.5">
              <div className="h-10 w-72 bg-slate-200 dark:bg-dark-border rounded-2xl" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-dark-border rounded-lg" />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-4">
                <div className="h-12 w-28 bg-slate-200 dark:bg-dark-border rounded-2xl" />
                <div className="h-12 w-28 bg-slate-200 dark:bg-dark-border rounded-2xl" />
              </div>
              <div className="h-12 w-12 bg-slate-200 dark:bg-dark-border rounded-2xl" />
            </div>
          </div>

          {/* 50/50 Split Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
            
            {/* LEFT COLUMN SKELETON (Cover Image, About, Contact, Hours, Verification) */}
            <div className="lg:col-span-6 space-y-6 w-full">
              {/* Cover Image Placeholder */}
              <div className="bg-white dark:bg-dark-card rounded-[32px] overflow-hidden border border-slate-150 dark:border-dark-border/80 shadow-sm flex flex-col">
                
                {/* Mobile-only header skeleton */}
                <div className="md:hidden p-5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-dark-border/40 bg-white dark:bg-dark-card">
                  <div className="space-y-2 flex-grow">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-dark-border rounded-lg" />
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-dark-border rounded-md" />
                  </div>
                  <div className="h-10 w-10 bg-slate-200 dark:bg-dark-border rounded-xl shrink-0" />
                </div>

                <div className="h-64 sm:h-[380px] md:h-[480px] lg:h-[500px] w-full bg-slate-200 dark:bg-dark-border" />
                {/* Rating Bar attached at bottom */}
                <div className="p-5 border-t border-slate-100 dark:border-dark-border/40 flex items-center justify-between gap-4">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-dark-border rounded-lg" />
                  <div className="h-5 w-40 bg-slate-200 dark:bg-dark-border rounded-lg" />
                </div>
              </div>

              {/* About Card Skeleton */}
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-sm h-32" />

              {/* Contact & Location widget skeleton */}
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border space-y-6">
                <div className="h-6 w-36 bg-slate-200 dark:bg-dark-border rounded-lg mb-2" />
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-dark-border rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-dark-border rounded" />
                      <div className="h-4 w-5/6 bg-slate-200 dark:bg-dark-border rounded" />
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-slate-100 dark:border-dark-border/40 pt-4">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-dark-border rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-dark-border rounded" />
                      <div className="h-4 w-1/2 bg-slate-200 dark:bg-dark-border rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours Card Skeleton */}
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-sm h-48" />
              
              {/* Verification Tag banner */}
              <div className="bg-white dark:bg-dark-card rounded-3xl p-5 border border-slate-150 dark:border-dark-border/80 shadow-sm h-20" />
            </div>

            {/* RIGHT COLUMN SKELETON (Reviews Only) */}
            <div className="lg:col-span-6 space-y-6 text-left w-full">
              {/* Reviews Card Skeleton */}
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-sm h-[500px]" />
            </div>

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <main className="flex-grow py-24 text-center px-4 relative z-10 max-w-xl mx-auto flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-100 dark:bg-dark-border/40 text-slate-400 rounded-3xl mb-4">
            <Store className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Listing Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">The shop or business is no longer listed in our directory or has been removed.</p>
          <Link href="/directory" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-md transition-all uppercase text-xs tracking-wider">
            Back to Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ];
  const currentDayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 relative overflow-hidden">
      
      {/* Background glow animations */}
      <div className="blur-bubble bg-primary-500/10 dark:bg-primary-500/20 top-20 left-10" />
      <div className="blur-bubble bg-indigo-500/10 dark:bg-indigo-500/20 top-[400px] right-10" />
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-28 md:pb-16 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 animate-fade-in">
        
        {/* Navigation row at the top */}
        <div className="mb-6 flex justify-between items-center select-none">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
          >
            <ArrowLeft className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Directory</span>
          </Link>

          {/* Copy page link helper */}
          <button
            onClick={handleShareClick}
            className="relative inline-flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer select-none"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Business</span>
            {copiedShare && (
              <div className="absolute -top-10 right-0 bg-slate-950 border border-slate-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-md z-20">
                Link Copied!
              </div>
            )}
          </button>
        </div>

        {/* Premium Business Header Card */}
        <div className="hidden md:flex mb-8 bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-dark-border shadow-sm items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {listing.name}
            </h1>
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {listing.subcategory || listing.category}
            </p>
          </div>
          
          <div className="flex items-center gap-4 select-none self-start md:self-center">
            {/* Desktop Action Buttons Row */}
            <div className="hidden md:flex items-center gap-4">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="flex-grow flex items-center justify-center gap-2.5 bg-slate-50/50 dark:bg-dark-bg/45 backdrop-blur-md border border-slate-200/60 dark:border-dark-border/70 text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-dark-bg/70 font-black py-4 px-6 rounded-2xl transition-all text-xs tracking-wider uppercase cursor-pointer shadow-sm hover:shadow-md select-none"
                >
                  <Phone className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-450 fill-emerald-500/10 shrink-0" />
                  <span>Call Now</span>
                </a>
              )}
              
              {listing.googleMapLink && (
                <a
                  href={listing.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow flex items-center justify-center gap-2.5 bg-slate-50/50 dark:bg-dark-bg/45 backdrop-blur-md border border-slate-200/60 dark:border-dark-border/70 text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-dark-bg/70 font-black py-4 px-6 rounded-2xl transition-all text-xs tracking-wider uppercase cursor-pointer shadow-sm hover:shadow-md select-none"
                >
                  <ExternalLink className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>Directions</span>
                </a>
              )}
            </div>

            {/* Bookmark Toggle Button */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer shrink-0 ${
                isBookmarked
                  ? "bg-rose-500 border-rose-500 text-white shadow-md scale-105"
                  : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-400 hover:text-rose-500 hover:border-rose-200"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            >
              <Heart className={`w-5 h-5 ${isBookmarked ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Dynamic 50/50 Split Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE COLUMN (Cover Image, About, Contact, Hours, Verification) */}
          <div className="lg:col-span-6 space-y-6 w-full">
            
            {/* Business Cover Image Card (Taller on Desktop, attached rating block at the bottom) */}
            <div className="bg-white dark:bg-dark-card rounded-3xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-md relative group select-none flex flex-col">
              
              {/* Mobile-only Attached Header Section (Business Name & Bookmark) */}
              <div className="md:hidden p-5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-dark-border/40 bg-white dark:bg-dark-card">
                <div className="min-w-0 flex-grow text-left">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                    {listing.name}
                  </h1>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                    {listing.subcategory || listing.category}
                  </p>
                </div>
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer shrink-0 ${
                    isBookmarked
                      ? "bg-rose-500 border-rose-500 text-white shadow-md scale-105"
                      : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-400 hover:text-rose-500 hover:border-rose-200"
                  }`}
                  title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                >
                  <Heart className={`w-4.5 h-4.5 ${isBookmarked ? "fill-white" : ""}`} />
                </button>
              </div>

              <div className="h-64 sm:h-[380px] md:h-[480px] lg:h-[500px] w-full relative overflow-hidden flex items-center justify-center bg-slate-900">
                <img
                  src={listing.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fit=crop&q=80&w=800"}
                  alt={listing.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Embedded Badges on top of Image */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="bg-indigo-600 border border-indigo-500 text-white text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl tracking-wider shadow-sm select-none">
                    {listing.subcategory || listing.category}
                  </span>
                  
                  {isOpen !== undefined && (
                    <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${
                      isOpen 
                        ? "bg-emerald-500/90 text-white border-emerald-500/20" 
                        : "bg-rose-500/90 text-white border-rose-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
                      <span>{isOpen ? "Open" : "Closed"}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Rating block attached directly under the image container */}
              <div className="p-4 bg-slate-50 dark:bg-dark-bg/65 border-t border-slate-100 dark:border-dark-border/60 flex items-center gap-3 text-sm font-semibold select-none shrink-0">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-white font-bold ${averageRating >= 4 ? 'bg-[#388e3c]' : averageRating >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}>
                  <span className="text-sm leading-none pt-[1px]">{averageRating.toFixed(1)}</span>
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>

            </div>

            {/* About Card */}
            <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border space-y-4 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>About the Business</span>
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-bold">
                {listing.description || `Welcome to ${listing.name}. We provide high quality ${listing.subcategory || listing.category} services in Ghatal. Visit us or contact us to know more details!`}
              </p>
            </div>

            {/* Contact & Location widget */}
            <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 dark:border-dark-border space-y-5 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                Contact & Location
              </h3>
              
              <div className="space-y-4 text-sm">
                
                {/* Address info item */}
                <div className="flex gap-3.5 items-start p-4 bg-slate-50 dark:bg-dark-bg/40 border border-slate-150 dark:border-dark-border/60 rounded-2xl">
                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/30 dark:border-indigo-500/20 text-indigo-500 shrink-0 rounded-2xl shadow-sm select-none">
                    <MapPin className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0 flex-grow text-left">
                    <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest mb-1 select-none">Address</h4>
                    <p className="text-slate-800 dark:text-slate-100 font-bold leading-relaxed text-sm sm:text-base">{listing.address}</p>
                    
                    <button 
                      onClick={handleCopyAddress}
                      className="mt-2 text-xs font-black text-indigo-500 dark:text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-300 cursor-pointer flex items-center gap-1.5 transition-colors select-none"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? "Copied address!" : "Copy Address"}</span>
                    </button>
                  </div>
                </div>

                {/* Phone contact item */}
                {listing.phone && (
                  <div className="flex gap-3.5 items-start p-4 bg-slate-50 dark:bg-dark-bg/40 border border-slate-150 dark:border-dark-border/60 rounded-2xl">
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/30 dark:border-emerald-500/20 text-emerald-500 shrink-0 rounded-2xl shadow-sm select-none">
                      <Phone className="w-5.5 h-5.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest mb-1 select-none">Phone Line</h4>
                      <a 
                        href={`tel:${listing.phone}`} 
                        className="text-slate-800 dark:text-slate-100 font-black text-base sm:text-lg hover:text-primary-500 dark:hover:text-primary-400 transition-colors block"
                      >
                        {listing.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Comparative Distance indicators */}
                {airDistance && (
                  <div className="p-4 bg-slate-50 dark:bg-dark-bg/40 border border-slate-150 dark:border-dark-border/60 rounded-2xl">
                    <div className="flex gap-3.5 items-start">
                      <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/30 dark:border-blue-500/20 text-blue-500 shrink-0 rounded-2xl shadow-sm select-none">
                        <Car className="w-5.5 h-5.5" />
                      </div>
                      <div className="flex-grow min-w-0 text-left">
                        <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest mb-1.5 select-none">Travel Distance</h4>
                        
                        <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                          <div className="p-2.5 bg-white dark:bg-dark-card border border-slate-200/40 dark:border-dark-border/60 rounded-xl">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 select-none">Straight line</span>
                            <span className="text-slate-800 dark:text-slate-200 font-black">{airDistance} km</span>
                          </div>
                          
                          <div className="p-2.5 bg-white dark:bg-dark-card border border-slate-200/40 dark:border-dark-border/60 rounded-xl">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 select-none">By Road</span>
                            {loadingDistance ? (
                              <span className="text-[10px] text-slate-400 font-bold animate-pulse">Checking...</span>
                            ) : roadDistance ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-black">{roadDistance} km</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Weekly Business Hours Grid */}
            {openingHoursStatus === "open_24_7" && (
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Business Hours</span>
                </h2>
                <div className="mt-4 flex items-center gap-4 p-5 bg-emerald-50/45 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/20 shrink-0 animate-pulse">
                    <Clock className="w-6 h-6 animate-spin [animation-duration:15s]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400">Open 24 Hours</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">This business operates 24/7, all day, every day.</p>
                  </div>
                </div>
              </div>
            )}

            {openingHoursStatus === "temporarily_closed" && (
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Business Hours</span>
                </h2>
                <div className="mt-4 flex items-center gap-4 p-5 bg-rose-50/45 dark:bg-rose-950/15 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl">
                  <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-600 dark:text-rose-400">Temporarily Closed</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">This business is currently closed and not accepting visitors.</p>
                  </div>
                </div>
              </div>
            )}

            {openingHoursStatus === "custom" && (
              <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border space-y-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                  <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Business Hours</span>
                  </h2>
                </div>

                {/* Single Premium Dropdown Trigger Button */}
                <button
                  onClick={() => setShowHoursDropdown(!showHoursDropdown)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-bg/40 border border-slate-150 dark:border-dark-border/60 rounded-2xl cursor-pointer hover:bg-slate-100/50 dark:hover:bg-dark-bg/65 transition-all duration-305 select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">Weekly Schedule</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Click to view open/close timings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {showHoursDropdown ? "Hide Hours" : "Show Hours"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform duration-300 ${showHoursDropdown ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Collapsible content with smooth CSS Grid transition */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    showHoursDropdown 
                      ? "grid-rows-[1fr] opacity-100 mt-4" 
                      : "grid-rows-[0fr] opacity-0 pointer-events-none mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {daysOfWeek.map((day) => {
                        const isToday = day.key === currentDayKey;
                        const hoursData = listing.opening_hours?.hours || listing.opening_hours;
                        const hoursForDay = hoursData?.[day.key];
                        const isOpenToday = hoursForDay && hoursForDay.open && hoursForDay.close;

                        return (
                          <div 
                            key={day.key}
                            className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all ${
                              isToday 
                                ? "bg-primary-50/50 dark:bg-primary-950/15 border-primary-200/50 dark:border-primary-900/40" 
                                : "bg-slate-50/50 dark:bg-dark-bg/20 border-slate-100 dark:border-dark-border/60"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0 select-none">
                              <span className={`text-xs font-black truncate ${isToday ? "text-primary-600 dark:text-primary-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {day.label}
                              </span>
                              {isToday && (
                                <span className="px-1 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-[8px] font-black uppercase text-primary-700 dark:text-primary-300 rounded shrink-0">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${isOpenToday ? "text-slate-605 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
                              {isOpenToday 
                                ? `${formatTime12h(hoursForDay.open)} - ${formatTime12h(hoursForDay.close)}` 
                                : "Closed"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Tag banner */}
            <div className="bg-gradient-to-br from-indigo-500/5 to-primary-500/5 dark:from-indigo-950/10 dark:to-primary-950/10 rounded-3xl p-5 border border-indigo-100/50 dark:border-indigo-900/30 flex gap-4 items-start text-left select-none shadow-sm">
              <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/15 rounded-xl text-indigo-500 dark:text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs text-indigo-700 dark:text-indigo-400 mb-0.5">Verified Local Companion</h4>
                <p className="text-[11px] text-slate-550 dark:text-slate-450 leading-relaxed font-bold">
                  Audited directly by administrative representatives in Ghatal Town.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE COLUMN (Reviews Only - lg:col-span-6 50/50 split) */}
          <div className="lg:col-span-6 space-y-6 text-left w-full">
            
            {/* Reviews Card Section */}
            <div className="bg-white dark:bg-dark-card rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-dark-border space-y-7">
              
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-dark-border/40 pb-3 select-none">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Reviews & Ratings ({reviews.length})</span>
              </h2>

              {/* Rating distribution bar metrics */}
              <div className="flex flex-col sm:flex-row gap-6 items-center p-5 bg-slate-50/50 dark:bg-dark-bg/20 rounded-2xl border border-slate-200/60 dark:border-dark-border/80">
                <div className="text-center sm:border-r border-slate-200 dark:border-dark-border sm:pr-8 shrink-0 select-none">
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none mb-1.5">
                    {averageRating.toFixed(1)}
                  </h3>
                  
                  <div className="flex items-center justify-center text-amber-500 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(averageRating) 
                            ? "fill-amber-500 text-amber-500" 
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">
                    Average Rating
                  </span>
                </div>

                <div className="flex-grow w-full space-y-1.5 max-w-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingDistribution[stars] || 0;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-[10px] font-bold text-slate-650 dark:text-slate-400">
                        <span className="w-2 select-none">{stars}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 select-none" />
                        <div className="flex-grow h-2 bg-slate-200 dark:bg-dark-border/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-450 to-amber-500 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-6 text-right select-none">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review submit form */}
              <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 dark:bg-dark-bg/20 p-5 rounded-2xl border border-slate-200/80 dark:border-dark-border space-y-4">
                <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Write a Review</span>
                </h4>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider select-none">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-slate-300 hover:scale-115 transition-transform duration-250 cursor-pointer"
                      >
                        <Star className={`w-4.5 h-4.5 ${star <= newRating ? "fill-amber-500 text-amber-500" : "text-slate-350 dark:text-slate-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows="3"
                  placeholder="Share details of your experience with this business to help other citizens..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all placeholder-slate-450 dark:placeholder-slate-500 shadow-sm"
                ></textarea>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 cursor-pointer btn-premium-glow select-none"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                </button>
              </form>

              {/* Feed items list */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/50 dark:bg-dark-bg/10 rounded-2xl border border-slate-200 dark:border-dark-border/80 border-dashed">
                    <p className="text-slate-400 dark:text-slate-500 italic text-sm font-semibold">No reviews written yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="bg-slate-50/30 dark:bg-dark-bg/10 p-5 rounded-2xl border border-slate-150 dark:border-dark-border/70 space-y-3"
                    >
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-black text-sm select-none shadow-sm">
                            {(rev.user_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm block">
                              {rev.user_name || "Ghatal Guide User"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5 select-none">
                              Verified Citizen
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border px-2 py-0.5 rounded-md shadow-sm select-none">
                          {new Date(rev.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-white font-bold select-none w-fit ${rev.rating >= 4 ? 'bg-[#388e3c]' : rev.rating >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}>
                        <span className="text-[11px] leading-none pt-[1px]">{rev.rating}</span>
                        <Star className="w-[10px] h-[10px] fill-white text-white" />
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-bold pl-0.5">
                        {rev.review_text}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Sticky Bottom glassmorphic CTA Action Bar for mobile viewports */}
      {listing.phone && (
        <div className="fixed bottom-3.5 left-3.5 right-3.5 z-40 bg-white/85 dark:bg-dark-card/85 backdrop-blur-xl border border-slate-200/50 dark:border-dark-border/60 p-3 flex gap-3 md:hidden shadow-xl rounded-2xl select-none animate-slide-up">
          <a
            href={`tel:${listing.phone}`}
            className="flex-1 bg-slate-50/60 dark:bg-dark-bg/50 border border-slate-200/60 dark:border-dark-border/80 text-slate-800 dark:text-slate-200 font-black py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all uppercase tracking-wider select-none cursor-pointer"
          >
            <Phone className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-450 fill-emerald-500/10 shrink-0" />
            <span>Call Now</span>
          </a>
          
          {listing.googleMapLink && (
            <a
              href={listing.googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-50/60 dark:bg-dark-bg/50 border border-slate-200/60 dark:border-dark-border/80 text-slate-800 dark:text-slate-200 font-black py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all uppercase tracking-wider select-none cursor-pointer"
            >
              <ExternalLink className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>Directions</span>
            </a>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
