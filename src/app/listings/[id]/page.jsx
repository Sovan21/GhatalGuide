"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleListings } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { 
  ArrowLeft, Star, MapPin, Phone, Heart, MessageSquare, Car, Share2, Store 
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
        // Fetch listing, reviews, and auth session in parallel
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

  // Road distance OSRM calculation
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!userLocation || !listing?.lat || !listing?.lng) {
        if (active) setRoadDistance(null);
        return;
      }
      try {
        const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
        const url = `https://api.olamaps.io/routing/v1/directions?origin=${userLocation.lat},${userLocation.lng}&destination=${listing.lat},${listing.lng}&api_key=${apiKey}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();
        if (active && data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
          const km = (data.routes[0].legs[0].distance / 1000).toFixed(1);
          setRoadDistance(km);
        }
      } catch (e) {}
    };

    const timer = setTimeout(run, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
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

    // Save bookmarks
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
        user_id: session.user.id,
        user_name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
        rating: newRating,
        comment: newComment,
        status: "approved", // auto approved for simplicity
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert(reviewObj)
        .select()
        .single();
      if (data && !error) {
        setReviews([data, ...reviews]);
        setNewComment("");
        setNewRating(5);
        alert("Thank you! Your review has been added.");
      } else {
        throw error;
      }
    } catch (err) {
      console.warn("Failed to submit review", err);
      alert("Error adding review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-grow py-20 text-center px-4">
          <div className="mb-4">
            <Store className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Listing Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The shop or business is no longer listed in our directory.</p>
          <Link href="/directory" className="text-primary-500 font-bold hover:underline">&larr; Back to Directory</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 pb-24 md:pb-16 relative z-10">
        <div className="container-perfect">
          
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Directory</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Details & Reviews */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Business Banner & Core Info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <img
                    src={listing.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fit=crop&q=80"}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  <span className="absolute top-6 left-6 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-lg border border-white/10 tracking-wider">
                    {listing.subcategory || listing.category}
                  </span>
                </div>

                <div className="p-6 sm:p-10">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="space-y-3.5">
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        {listing.name}
                      </h1>
                      
                      <div className="flex items-center gap-2.5 text-sm font-semibold">
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4.5 h-4.5 ${
                                i < Math.floor(listing.rating || 0) 
                                  ? "fill-amber-500 text-amber-500" 
                                  : "text-slate-200 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">
                          {(listing.rating || 0).toFixed(1)}
                        </span>
                        <span className="text-slate-200 dark:text-slate-700 font-normal">|</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">
                          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                    </div>

                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isBookmarked
                          ? "bg-red-500 border-red-500 text-white shadow-lg scale-105"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-200"
                      }`}
                      aria-label="Bookmark listing"
                    >
                      <Heart className={`w-5 h-5 ${isBookmarked ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-black text-lg text-slate-950 dark:text-white mb-3">About the Business</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-bold">
                      {listing.description || `Welcome to ${listing.name}. We provide high quality ${listing.subcategory || listing.category} services in Ghatal. Visit us or contact us to know more details!`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <MessageSquare className="w-6 h-6 text-primary-500" />
                  <span>Reviews & Ratings ({reviews.length})</span>
                </h3>

                {/* Add Review Form */}
                <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 dark:bg-slate-950/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">Write a Review</h4>
                  
                  {/* Stars Input */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Your Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-500 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? "fill-amber-500 text-amber-500" : "text-slate-300 dark:text-slate-700"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <textarea
                    rows="3"
                    placeholder="Tell others about your experience with this business..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-950 dark:text-white transition-all placeholder-slate-400"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 cursor-pointer animate-fade-in btn-premium-glow"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-500 italic text-sm font-bold">No reviews written yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-sm select-none shadow-sm">
                              {(rev.user_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-black text-slate-800 dark:text-slate-200 text-sm">
                              {rev.user_name || "Ghatal Guide User"}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-800"}`}
                            />
                          ))}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-bold">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Contact & Location widgets */}
            <div className="space-y-6 lg:sticky lg:top-24 w-full">
              
              {/* Contact info widget */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Contact Info</h3>
                
                <div className="space-y-5 text-sm">
                  {/* Address */}
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-400 dark:text-slate-500 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">Address</h4>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 font-bold leading-relaxed">{listing.address}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  {listing.phone && (
                    <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                      <div className="p-2.5 bg-primary-50 dark:bg-primary-950/40 text-primary-500 shrink-0 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">Phone</h4>
                        <a href={`tel:${listing.phone}`} className="text-primary-605 dark:text-primary-400 font-black hover:underline block mt-1">
                          {listing.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Driving Distance */}
                  {roadDistance && (
                    <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 shrink-0 rounded-xl">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">Road Distance</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-black mt-1">
                          {roadDistance} km away
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Map Link Button */}
                {listing.googleMapLink && (
                  <a
                    href={listing.googleMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 text-sm mt-8 cursor-pointer btn-premium-glow"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Sticky Bottom Actions for Mobile viewports */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 flex gap-4 md:hidden shadow-lg">
        {listing.phone && (
          <a
            href={`tel:${listing.phone}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-md hover:shadow-lg hover:shadow-primary-500/20 flex items-center justify-center gap-2 text-sm transition-all btn-premium-glow"
          >
            <Phone className="w-4.5 h-4.5" />
            <span>Call Now</span>
          </a>
        )}
        {listing.googleMapLink && (
          <a
            href={listing.googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Share2 className="w-4.5 h-4.5" />
            <span>Directions</span>
          </a>
        )}
      </div>

      <Footer />
    </div>
  );
}
