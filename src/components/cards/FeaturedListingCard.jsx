"use client";
import React, { useState, useEffect } from "react";
import { 
  Star, MapPin, Phone, Heart, Car, Sparkles,
  Stethoscope, Utensils, ShoppingBag, Wrench, GraduationCap, ShieldAlert, Store, Hospital
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

export default function FeaturedListingCard({ listing, userLocation, isBookmarked, onBookmarkToggle }) {
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
      label = normSub.includes("clinic") || normCat.includes("clinic") ? "DOCTORS & CLINICS" : "DOCTORS";
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
        borderClass: "border-blue-200/50 hover:border-blue-400 dark:border-blue-900/30 dark:hover:border-blue-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)]",
        badgeBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
      },
      emerald: {
        iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-emerald-200/50 hover:border-emerald-400 dark:border-emerald-900/30 dark:hover:border-emerald-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]",
        badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
      },
      indigo: {
        iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        borderClass: "border-indigo-200/50 hover:border-indigo-400 dark:border-indigo-900/30 dark:hover:border-indigo-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)]",
        badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400",
      },
      purple: {
        iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
        iconColor: "text-purple-600 dark:text-purple-400",
        borderClass: "border-purple-200/50 hover:border-purple-400 dark:border-purple-900/30 dark:hover:border-purple-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]",
        badgeBg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400",
      },
      amber: {
        iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        borderClass: "border-amber-200/50 hover:border-amber-400 dark:border-amber-900/30 dark:hover:border-amber-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)]",
        badgeBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
      },
      cyan: {
        iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        borderClass: "border-cyan-200/50 hover:border-cyan-400 dark:border-cyan-900/30 dark:hover:border-cyan-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]",
        badgeBg: "bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400",
      },
      rose: {
        iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
        iconColor: "text-rose-600 dark:text-rose-400",
        borderClass: "border-rose-200/50 hover:border-rose-400 dark:border-rose-900/30 dark:hover:border-rose-700",
        glowClass: "group-hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.18)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]",
        badgeBg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400",
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
    if (!hoursForToday || !hoursForToday.open || !hoursForToday.close) {
        return false;
    }

    const openTimeInMinutes = timeToMinutes(hoursForToday.open);
    const closeTimeInMinutes = timeToMinutes(hoursForToday.close);

    if (openTimeInMinutes === null || closeTimeInMinutes === null) return false;

    if (openTimeInMinutes <= closeTimeInMinutes) {
        return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    }
    return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
  };

  const isOpen = isBusinessOpen(listing.opening_hours);

  // Star ratings layout renderer
  const renderStars = (rating) => {
    const hasRating = rating !== undefined && rating !== null && rating > 0;
    if (!hasRating) {
      return (
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
          No ratings yet
        </span>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Star className="w-3 h-3 fill-amber-500" />
          <span>{parseFloat(rating).toFixed(1)}</span>
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
          ({listing.reviewCount || 0} reviews)
        </span>
      </div>
    );
  };

  // Road distance checker (OSRM/Driving distance)
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
        console.warn("Featured card distance check failed", e);
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

  return (
    <article
      onClick={handleCardClick}
      className={`group relative flex flex-col overflow-hidden rounded-[24px] border bg-white dark:bg-dark-card transition-all duration-500 ${theme.borderClass} ${theme.glowClass} hover:-translate-y-1.5 cursor-pointer h-full shadow-md`}
    >
      {/* Banner / Cover Image with gradients */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900 border-b border-slate-100 dark:border-dark-border flex items-center justify-center">
        {listing.image ? (
          <img
            src={getImageUrl(listing.image)}
            alt={listing.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center p-8 text-center select-none group-hover:from-indigo-550/15 group-hover:to-purple-550/15 transition-all duration-500 relative">
            <CategoryIcon className={`absolute w-32 h-32 opacity-[0.04] dark:opacity-[0.03] pointer-events-none rotate-12 ${theme.iconColor}`} />
            <span className="text-slate-900 dark:text-slate-100 font-black uppercase text-lg sm:text-xl tracking-tight line-clamp-2 leading-snug px-5 relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
              {listing.name}
            </span>
          </div>
        )}

        {/* Ambient top dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

        {/* Top Floating Row */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          {/* Glassmorphic Category Label */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/25 dark:border-white/10 text-white select-none">
            <CategoryIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black tracking-wider uppercase">
              {theme.label}
            </span>
          </div>

          {/* Premium "FEATURED" badge with glow */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[9px] uppercase tracking-widest shadow-lg shadow-orange-500/30 animate-pulse select-none">
            <Sparkles className="w-3 h-3 text-white fill-white" />
            <span>Featured</span>
          </div>
        </div>

        {/* Bottom Floating Row Over Image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
          {/* Open / Closed tag */}
          {isOpen !== undefined && (
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border ${
              isOpen 
                ? "bg-emerald-500/90 text-white border-emerald-400/20" 
                : "bg-rose-500/90 text-white border-rose-400/20"
            }`}>
              {isOpen ? "Open Now" : "Closed"}
            </span>
          )}

          {/* Bookmark Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(listing.id);
            }}
            className="w-9 h-9 rounded-full bg-white/95 dark:bg-dark-card/95 hover:bg-white dark:hover:bg-dark-card-hover border border-slate-200/40 dark:border-dark-border text-slate-500 hover:text-rose-500 transition-colors flex items-center justify-center cursor-pointer shadow-md"
            title="Bookmark"
          >
            <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isBookmarked ? "text-rose-500 fill-rose-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Card Contents */}
      <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
        <div>
          {/* Subcategory and rating line */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md ${theme.badgeBg}`}>
              {listing.subcategory || listing.category}
            </span>
            {renderStars(listing.rating)}
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300 line-clamp-1 mb-2">
            {listing.name}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="text-[12px] font-semibold line-clamp-2 min-h-[36px]">{listing.address}</span>
          </div>

          {/* Distance Row */}
          {airDistance && (
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-bg/60 w-fit px-3 py-1 rounded-lg border border-slate-100 dark:border-dark-border/40 select-none mb-2">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span>{airDistance} km straight</span>
              </span>
              {roadDistance && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="flex items-center gap-1 text-emerald-650 dark:text-emerald-450">
                    <Car className="w-3 h-3 text-emerald-500 dark:text-emerald-450 shrink-0" />
                    <span>{roadDistance} km road</span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Call Bar */}
        <div className="mt-4 pt-4 border-t border-slate-150 dark:border-dark-border flex justify-between items-center gap-4 shrink-0">
          <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline tracking-wider uppercase select-none transition-colors">
            {theme.viewText}
          </span>

          {listing.phone ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${listing.phone}`, "_self");
              }}
              className="px-4.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-wider rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-md hover:shadow-primary-500/20 btn-premium-glow"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Call Now</span>
            </button>
          ) : (
            <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
              No Contact Details
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
