"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Sun, Moon, Menu, X, PlusCircle, LogOut, Heart, LayoutDashboard, ShieldCheck, ChevronDown, UserPlus, LogIn, Plus,
  Home, Compass, Bus, Calendar, BookOpen, Briefcase, ChevronRight
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    // Theme initialization
    const storedTheme = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = storedTheme === "true" || (storedTheme === null && prefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Scroll listener for dynamic floating dock layout
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);

    // Auth initialization & legacy DOM view reactivity support
    const updateLegacyViews = (user) => {
      if (typeof document === "undefined") return;
      const loggedOutElements = document.querySelectorAll(".logged-out-view");
      const loggedInElements = document.querySelectorAll(".logged-in-view");
      if (user) {
        loggedOutElements.forEach((el) => el.classList.add("hidden"));
        loggedInElements.forEach((el) => el.classList.remove("hidden"));
      } else {
        loggedInElements.forEach((el) => el.classList.add("hidden"));
        loggedOutElements.forEach((el) => el.classList.remove("hidden"));
      }
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const user = session?.user || null;
        setCurrentUser(user);
        updateLegacyViews(user);
      })
      .catch((err) => {
        console.warn("Failed to retrieve auth session:", err);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      updateLegacyViews(user);
      if (event === "SIGNED_OUT") {
        setIsDropdownOpen(false);
        router.push("/");
      }
    });

    // Click outside listener to close dropdown menu
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // If the click is inside dropdownRef (avatar button), let the click handler toggle it
        if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
          return;
        }
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem("darkMode", String(nextTheme));
    if (nextTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    if (currentUser?.user_metadata?.role === "admin") {
      if (!confirm("You are logged in as an admin. Logging out here will also log you out of the Admin Panel. Continue?")) {
        return;
      }
    }
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Directory", href: "/directory", icon: Compass },
    { name: "Transportation", href: "/transportation", icon: Bus },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
  ];

  const getInitials = (user) => {
    const name = user?.user_metadata?.full_name || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  const isAdmin = currentUser?.user_metadata?.role === "admin" || currentUser?.email === "shovaxxx@gmail.com" || currentUser?.email?.endsWith("@ghatalguide.com");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-3 sm:px-4 py-4 bg-transparent pointer-events-none">
      <div className={`max-w-7xl mx-auto relative pointer-events-auto transition-all duration-500 ease-out rounded-full border ${
        isScrolled 
          ? "bg-white/90 dark:bg-dark-bg/90 backdrop-blur-xl shadow-lg dark:shadow-2xl shadow-slate-200/40 dark:shadow-black/40 border-slate-200/80 dark:border-dark-border" 
          : "bg-white/70 dark:bg-dark-bg/75 backdrop-blur-md shadow-md dark:shadow-xl shadow-slate-100/30 dark:shadow-black/20 border-slate-200/50 dark:border-dark-border/40"
      }`}>

        <nav className="px-4 sm:px-5 lg:px-6 py-3 sm:py-3 flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-dark-card-hover p-[1.5px] group-hover:bg-primary-500 transition-all duration-300">
              <img src="/logo.png" alt="Ghatal Guide Logo" className="h-10 w-10 sm:h-11 sm:w-11 object-cover bg-white rounded-[10px]" />
            </div>
            <span className="text-[17px] sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-indigo-300 bg-clip-text text-transparent group-hover:scale-[1.01] transition-all duration-300 font-outfit select-none">
              Ghatal Guide
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden desk:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2.5 rounded-full text-[14.5px] font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? "text-primary-600 dark:text-primary-300 bg-primary-50/90 dark:bg-primary-900/40 border border-primary-100/40 dark:border-primary-500/30 shadow-sm" 
                      : "text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-9.5 h-9.5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all duration-300 active:scale-90 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
            </button>

            {/* Desktop List Business Button */}
            {!currentUser && (
              <Link
                href="/add-business"
                className="hidden desk:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-[14.5px] font-bold transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 btn-premium-glow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Business</span>
              </Link>
            )}

            {/* Auth Dropdown - Only if logged in */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth < 900) {
                      setIsMobileMenuOpen((prev) => !prev);
                    } else {
                      setIsDropdownOpen((prev) => !prev);
                    }
                  }}
                  className="flex items-center gap-1 text-sm rounded-full active:scale-95 transition-all cursor-pointer group"
                  aria-label="User menu"
                >
                  {currentUser.user_metadata?.avatar_url ? (
                    <img
                      className="h-8.5 w-8.5 rounded-full object-cover border-2 border-white/10 group-hover:border-primary-400/50 transition-colors"
                      src={currentUser.user_metadata.avatar_url}
                      alt="User Avatar"
                    />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {getInitials(currentUser)}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block transition-transform duration-200 group-hover:text-slate-800 dark:group-hover:text-white" />
                </button>
 
                {/* User Dropdown */}
                {isDropdownOpen && (
                  <div className="hidden desk:block origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl py-1.5 bg-white dark:bg-dark-card/98 backdrop-blur-xl border border-slate-200/80 dark:border-dark-border focus:outline-none z-50 animate-fade-in text-slate-900 dark:text-white">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border/50">
                      <p className="text-sm font-bold truncate">
                        {currentUser.user_metadata?.full_name || "Ghatal Guide User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="py-1 px-1.5 space-y-0.5">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-dark-card-hover rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card-hover rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-card-hover rounded-xl transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>Favorites</span>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 dark:border-white/[0.06] my-1"></div>
                    <div className="px-1.5">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-white/[0.05] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            {!currentUser && (
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen((prev) => !prev);
                }}
                className="desk:hidden w-9.5 h-9.5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all active:scale-90 cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Popover Menu Dropdown */}
        <div 
          id="mobile-menu-panel"
          ref={mobileMenuRef}
          className={`absolute top-[68px] right-2 sm:right-4 w-[280px] z-50 bg-white dark:bg-dark-card md:bg-white/85 md:dark:bg-dark-card/85 md:backdrop-blur-xl border border-slate-200/80 dark:border-dark-border shadow-2xl p-3.5 rounded-3xl flex flex-col text-slate-800 dark:text-white transition-[transform,opacity] duration-200 ease-out origin-top-right ${
            isMobileMenuOpen 
              ? "opacity-100 scale-100 pointer-events-auto" 
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="space-y-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-bold transition-colors duration-150 ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-500/20 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-dark-card-hover hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? "text-primary-600 dark:text-primary-400 scale-105" : "text-slate-400 dark:text-slate-500"
                  }`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            {/* List Business - Emerald color plus and text */}
            {!currentUser && (
              <Link
                href="/add-business"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/15 transition-colors duration-150"
              >
                <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>List Business</span>
              </Link>
            )}
          </div>
 
          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-dark-border/50 my-2" />
 
          {/* Profile / Login Controls */}
          <div className="space-y-0.5">
            {currentUser && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 bg-red-500/10 dark:bg-red-500/5 hover:bg-red-500/20 dark:hover:bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-2xl text-[15px] font-extrabold text-red-650 dark:text-red-400 transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-dark-card-hover hover:text-slate-950 dark:hover:text-white transition-colors duration-150"
                >
                  <LayoutDashboard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-dark-card-hover hover:text-slate-950 dark:hover:text-white transition-colors duration-150"
                >
                  <Heart className="w-5 h-5 text-rose-500 dark:text-rose-450" />
                  <span>Favorites</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/15 text-left transition-colors duration-150 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span>Log Out</span>
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
