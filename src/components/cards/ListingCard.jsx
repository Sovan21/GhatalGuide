"use client";
import React, { useState, useEffect } from "react";
import { 
  Star, MapPin, Phone, Heart, Share2, Car,
  Stethoscope, PillBottle, Utensils, ShoppingBag, Wrench, GraduationCap, ShieldAlert, Store, Hospital
} from "lucide-react";
import { useRouter } from "next/navigation";

const MedicalCross = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
  </svg>
);

export default function ListingCard({ listing, userLocation, isBookmarked, onBookmarkToggle }) {
  const router = useRouter();
  const [roadDistance, setRoadDistance] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate straight-line air distance
  const airDistance = React.useMemo(() => {
    if (listing.distance !== undefined && listing.distance !== null) {
      return parseFloat(listing.distance).toFixed(1);
    }
    if (!userLocation || !listing.lat || !listing.lng) return null;
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
  }, [userLocation, listing.distance, listing.lat, listing.lng]);

  // Fallback image helper
  const getImageUrl = (img) => {
    const defaultUrl = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fit=crop&q=80&w=400&h=300";
    if (img && img.includes("images.unsplash.com")) {
      try {
        const urlObj = new URL(img);
        urlObj.searchParams.delete("w");
        urlObj.searchParams.delete("h");
        return urlObj.toString();
      } catch (e) {
        return img;
      }
    }
    return img || defaultUrl;
  };

  // Dynamic Category theme helper
  const getCategoryTheme = (cat, subcat) => {
    const normCat = cat?.toLowerCase() || "";
    const normSub = subcat?.toLowerCase() || "";
    
    let icon = Store;
    let label = "BUSINESS";
    let viewText = "VIEW DETAILS";
    let colorClass = "blue";
    
    // Check for Nursing Home / Hospital first
    if (normSub.includes("hospital") || normSub.includes("nursing home") || normSub.includes("nursinghome") || normCat.includes("hospital") || normCat.includes("nursing home") || normCat.includes("nursinghome")) {
      icon = Hospital;
      label = "HOSPITALS";
      viewText = "VIEW DETAILS";
      colorClass = "blue";
    } 
    // Check for Doctors / Clinic
    else if (normSub.includes("doctor") || normSub.includes("clinic") || normCat.includes("doctor") || normCat.includes("clinic")) {
      icon = Stethoscope;
      label = normSub.includes("clinic") || normCat.includes("clinic") ? "DOCTORSClinic" : "DOCTORS";
      viewText = "VIEW PROFILE";
      colorClass = "blue";
    } 
    // Check for Pharmacy
    else if (normSub.includes("pharmacy") || normCat.includes("pharmacy")) {
      icon = MedicalCross;
      label = "PHARMACY";
      viewText = "VIEW DETAILS";
      colorClass = "emerald";
    } 
    // Food & Dining / Restaurants
    else if (normSub.includes("food") || normSub.includes("restaurant") || normSub.includes("dining") || normCat.includes("food") || normCat.includes("restaurant") || normCat.includes("dining")) {
      icon = Utensils;
      label = "RESTAURANTS";
      viewText = "VIEW MENU";
      colorClass = "indigo";
    } 
    // Shopping
    else if (normSub.includes("shopping") || normCat.includes("shopping") || normSub.includes("store") || normSub.includes("apparel") || normSub.includes("electronics")) {
      icon = ShoppingBag;
      label = "SHOPPING";
      viewText = "VIEW STORE";
      colorClass = "purple";
    } 
    // Services
    else if (normSub.includes("service") || normSub.includes("repair") || normSub.includes("electrician") || normCat.includes("service")) {
      icon = Wrench;
      label = "SERVICES";
      viewText = "VIEW SERVICES";
      colorClass = "amber";
    } 
    // Education
    else if (normSub.includes("education") || normSub.includes("school") || normSub.includes("college") || normCat.includes("education")) {
      icon = GraduationCap;
      label = "EDUCATION";
      viewText = "VIEW DETAILS";
      colorClass = "cyan";
    } 
    // Emergency
    else if (normSub.includes("emergency") || normSub.includes("blood bank") || normSub.includes("police") || normSub.includes("ambulance") || normCat.includes("emergency")) {
      icon = ShieldAlert;
      label = "EMERGENCY";
      viewText = "VIEW DETAILS";
      colorClass = "rose";
    }

    const configs = {
      blue: {
        iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        borderClass: "border-blue-100 hover:border-blue-300 dark:border-blue-900/40 dark:hover:border-blue-800",
      },
      emerald: {
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/40 dark:hover:border-emerald-800",
      },
      indigo: {
        iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        borderClass: "border-indigo-100 hover:border-indigo-300 dark:border-indigo-900/40 dark:hover:border-indigo-800",
      },
      purple: {
        iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
        iconColor: "text-purple-600 dark:text-purple-400",
        borderClass: "border-purple-100 hover:border-purple-300 dark:border-purple-900/40 dark:hover:border-purple-800",
      },
      amber: {
        iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        borderClass: "border-amber-100 hover:border-amber-300 dark:border-amber-900/40 dark:hover:border-amber-800",
      },
      cyan: {
        iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        borderClass: "border-cyan-100 hover:border-cyan-300 dark:border-cyan-900/40 dark:hover:border-cyan-800",
      },
      rose: {
        iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
        iconColor: "text-rose-600 dark:text-rose-400",
        borderClass: "border-rose-100 hover:border-rose-300 dark:border-rose-900/40 dark:hover:border-rose-800",
      }
    };

    return {
      ...(configs[colorClass] || configs.blue),
      icon,
      label,
      viewText
    };
  };

  const theme = getCategoryTheme(listing.category, listing.subcategory);
  const CategoryIcon = theme.icon;

  const isBusinessOpen = (openingHours) => {
    if (listing.isOpen !== undefined) return listing.isOpen;
    
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

  const isOpen = isBusinessOpen(listing.opening_hours);

  // Star renderer helper (Single star line matches screenshot)
  const renderStarsLine = (rating) => {
    const hasRating = rating !== undefined && rating !== null && rating > 0;

    if (!hasRating) {
      return (
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 dark:text-slate-500 select-none">
          No reviews yet
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 dark:text-slate-400 select-none">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`w-3.5 h-3.5 ${
                i < Math.floor(rating) 
                  ? "text-amber-500 fill-amber-500" 
                  : "text-slate-300 dark:text-slate-700"
              }`} 
            />
          ))}
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-bold">
          ({listing.reviewCount || 0} {listing.reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  };

  // Road distance checker (OSRM Driving distance)
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!userLocation || !listing.lat || !listing.lng) {
        if (active) setRoadDistance(null);
        return;
      }
      if (active) setLoadingDistance(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
        const url = `https://api.olamaps.io/routing/v1/directions?origin=${userLocation.lat},${userLocation.lng}&destination=${listing.lat},${listing.lng}&api_key=${apiKey}`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();
        if (active && data.routes && data.routes.length > 0 && data.routes[0].legs && data.routes[0].legs.length > 0) {
          const km = (data.routes[0].legs[0].distance / 1000).toFixed(1);
          setRoadDistance(km);
        }
      } catch (e) {
        console.warn("Road distance check failed", e);
      } finally {
        if (active) setLoadingDistance(false);
      }
    };
    const timer = setTimeout(run, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [userLocation, listing.lat, listing.lng]);

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy text", err);
    });
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/listings/${listing.id}`;
    if (navigator.share) {
      navigator.share({
        title: listing.name,
        text: listing.address,
        url: shareUrl,
      }).catch((err) => {
        console.warn("Share failed, copying link instead", err);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`listing-card bg-white dark:bg-dark-card border ${theme.borderClass} rounded-[20px] flex flex-col overflow-hidden relative group transition-all duration-400 cursor-pointer h-full`}
    >
      {/* Top Category Header (with padding) */}
      <div className="px-4.5 pt-4 pb-3 flex items-center justify-between z-10 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.iconBg}`}>
            <CategoryIcon className={`w-4.5 h-4.5 ${theme.iconColor}`} />
          </div>
          <span className="text-slate-900 dark:text-white font-black text-[12px] tracking-wider uppercase">
            {theme.label}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(listing.id);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
          title="Bookmark"
        >
          <Heart className={`w-4.5 h-4.5 ${isBookmarked ? "text-rose-500 fill-rose-500" : ""}`} />
        </button>
      </div>

      {/* Cover Image Area (full width, touches edges) */}
      <div className="h-48 w-full relative bg-slate-900 dark:bg-dark-bg overflow-hidden shrink-0 border-y border-slate-100 dark:border-dark-border flex items-center justify-center">
        {listing.image ? (
          <img
            src={getImageUrl(listing.image)}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center p-6 text-center select-none group-hover:from-indigo-550/15 group-hover:to-purple-550/15 transition-all duration-500 relative">
            {/* Soft background category watermark icon */}
            <CategoryIcon className={`absolute w-28 h-28 opacity-[0.04] dark:opacity-[0.03] pointer-events-none rotate-12 ${theme.iconColor}`} />
            <span className="text-slate-900 dark:text-slate-100 font-black uppercase text-base sm:text-lg tracking-tight line-clamp-2 leading-snug px-4.5 relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
              {listing.name}
            </span>
          </div>
        )}

        {/* Open/Closed Badge on top-right of image */}
        {isOpen !== undefined && (
          <div className="absolute top-3 right-3 z-10 select-none">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md border backdrop-blur-md flex items-center gap-1.5 ${
              isOpen 
                ? "bg-emerald-500/90 text-white border-emerald-500/20" 
                : "bg-rose-500/90 text-white border-rose-500/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-rose-400 animate-pulse"}`} />
              <span>{isOpen ? "Open" : "Closed"}</span>
            </span>
          </div>
        )}

        {/* Floating Category Icon Badge (bottom-right of image) */}
        <div className="absolute bottom-3.5 right-3.5 z-10 w-9 h-9 rounded-xl flex items-center justify-center bg-white/95 dark:bg-dark-card/95 border border-slate-200/50 dark:border-dark-border shadow-lg backdrop-blur-sm">
          <CategoryIcon className={`w-4.5 h-4.5 ${theme.iconColor}`} />
        </div>
      </div>

      {/* Card Info Body (with padding) */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300 line-clamp-1 mb-2.5" title={listing.name}>
            {listing.name}
          </h3>

          {/* Rating stars & reviews count */}
          <div className="mb-2.5 shrink-0">
            {renderStarsLine(listing.rating)}
          </div>

          {/* Tag Line: Subcategory | Price: ₹ | Open Now */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3.5 flex-wrap">
            <span>{listing.subcategory || listing.category}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Price: ₹</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            {isOpen !== undefined && (
              <span className={isOpen ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                {isOpen ? "Open Now" : "Closed"}
              </span>
            )}
          </div>

          {/* Address with MapPin */}
          <div className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed" title={listing.address}>
            <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="text-[12px] font-semibold line-clamp-2 min-h-[36px]">{listing.address}</span>
          </div>

          {/* Distance Indicator (Dual Air & Road Distance) */}
          {airDistance && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-card w-fit px-2 py-0.5 rounded border border-slate-100 dark:border-dark-border select-none">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>{airDistance} km (straight)</span>
              </span>
              {roadDistance && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>{roadDistance} km (road)</span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4.5 pt-3.5 border-t border-slate-100 dark:border-dark-border flex justify-between items-center gap-4 shrink-0 relative">
          {/* Left: View Menu/View Details */}
          <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline tracking-wider uppercase cursor-pointer select-none">
            {theme.viewText}
          </span>

          {/* Right: CALL NOW Button */}
          <div>
            {listing.phone ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${listing.phone}`, "_self");
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md hover:shadow-primary-500/20 btn-premium-glow"
              >
                <Phone className="w-3 h-3 fill-current" />
                <span>CALL NOW</span>
              </button>
            ) : (
              <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">No contact</div>
            )}
          </div>

          {/* Self-contained Copied Toast indicator */}
          {copied && (
            <div className="absolute -top-10 right-0 bg-slate-950 border border-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md z-20 transition-all duration-300 animate-fade-in">
              Copied link!
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
