"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ListingCard from "@/components/cards/ListingCard";
import { sampleListings } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { Heart } from "lucide-react";

export default function Favorites() {
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

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

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);
      let sessionUser = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sessionUser = session?.user || null;
      } catch (e) {}

      let bookmarkedIds = [];
      if (sessionUser) {
        try {
          const { data, error } = await supabase
            .from("bookmarks")
            .select("listing_id")
            .eq("user_id", sessionUser.id);
          if (data && !error) {
            bookmarkedIds = data.map((b) => b.listing_id);
          }
        } catch (e) {
          console.warn("Supabase bookmarks load failed", e);
        }
      } else {
        const local = localStorage.getItem("bookmarks");
        if (local) {
          bookmarkedIds = JSON.parse(local);
        }
      }

      // Fetch all approved listings (includes review counts from API)
      let allListings = [];
      try {
        const res = await fetch("/api/listings");
        if (res.ok) {
          const data = await res.json();
          allListings = data?.listings || [];
        }
      } catch (e) {}

      if (allListings.length === 0) {
        allListings = sampleListings;
      }

      // Filter listings by bookmarkedIds
      const filtered = allListings.filter((l) => bookmarkedIds.includes(l.id));
      setFavoriteListings(filtered);
      setLoading(false);
    }
    loadFavorites();
  }, []);

  const handleBookmarkToggle = async (id) => {
    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data?.session;
    } catch (e) {
      console.warn("Failed to get auth session on bookmark toggle:", e);
    }
    const updated = favoriteListings.filter((l) => l.id !== id);
    setFavoriteListings(updated);

    if (session?.user) {
      try {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", session.user.id)
          .eq("listing_id", id);
      } catch (e) {}
    } else {
      const local = localStorage.getItem("bookmarks");
      if (local) {
        const parsed = JSON.parse(local).filter((bId) => bId !== id);
        localStorage.setItem("bookmarks", JSON.stringify(parsed));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect">
          
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight animate-fade-in">
              My Favorites
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-bold">
              Your saved places and businesses for quick access.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : favoriteListings.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border py-16 px-4 text-center max-w-xl mx-auto shadow-sm animate-fade-in">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/10">
                <Heart className="w-8 h-8 fill-red-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Favorites Saved
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-bold leading-relaxed">
                You haven't bookmarked any listings yet. Click the heart icon on any business card to save it.
              </p>
              <Link
                href="/directory"
                className="bg-primary-500 hover:bg-primary-655 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md text-sm inline-block cursor-pointer"
              >
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {favoriteListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  userLocation={userLocation}
                  isBookmarked={true}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
