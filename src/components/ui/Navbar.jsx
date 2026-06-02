"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Sun, Moon, Menu, X, PlusCircle, LogOut, Heart, LayoutDashboard, ShieldCheck, ChevronDown, UserPlus,
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
      <div className={`max-w-7xl mx-auto pointer-events-auto transition-all duration-500 ease-out rounded-full border ${
        isScrolled 
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-lg dark:shadow-2xl shadow-slate-200/40 dark:shadow-black/40 border-slate-200/80 dark:border-white/[0.08]" 
          : "bg-white/70 dark:bg-slate-950/75 backdrop-blur-md shadow-md dark:shadow-xl shadow-slate-100/30 dark:shadow-black/20 border-slate-200/50 dark:border-white/[0.04]"
      }`}>

        <nav className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex justify-between items-center">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 p-[1.5px] group-hover:bg-primary-500 transition-all duration-300">
              <img src="/logo.png" alt="Ghatal Guide Logo" className="h-8.5 w-8.5 object-cover bg-white rounded-[10px]" />
            </div>
            <span className="text-[16.5px] sm:text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
              Ghatal Guide
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
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
            <Link
              href="/add-business"
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-[14.5px] font-bold transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 btn-premium-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Business</span>
            </Link>





            {/* Auth Dropdown - Only if logged in */}
            {currentUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                  <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl py-1.5 bg-white dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] focus:outline-none z-50 animate-fade-in text-slate-900 dark:text-white">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
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
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9.5 h-9.5 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all active:scale-90 cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
          </div>
        </nav>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in pointer-events-auto">
          {/* Backdrop Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity" 
          />
          
          {/* Drawer container panel */}
          <div className="relative ml-auto w-[85%] max-w-[340px] h-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-white/20 dark:border-white/10 shadow-[rgba(0,0,0,0.1)_0px_20px_50px] dark:shadow-[rgba(0,0,0,0.5)_0px_20px_50px] p-6 sm:p-8 overflow-y-auto flex flex-col transition-transform duration-500 ease-out rounded-l-[2rem] text-slate-900 dark:text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/50 dark:border-slate-800/50 mb-6">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 group"
              >
                <div className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-[3px] shadow-md group-hover:scale-105 transition-transform">
                  <img src="/logo.png" alt="Ghatal Guide Logo" className="h-8 w-8 object-cover bg-white rounded-[13px]" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Ghatal Guide
                </span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation links - Premium App Style */}
            <div className="space-y-2 flex-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[17px] font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className={`w-5.5 h-5.5 transition-transform duration-300 ${
                      isActive ? "text-white scale-110" : "text-slate-400 dark:text-slate-500"
                    }`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Primary Action Button */}
            <div className="mt-8 mb-6">
              <Link
                href="/add-business"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-[16px] font-black transition-all duration-300 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 active:scale-[0.98] btn-premium-glow"
              >
                <PlusCircle className="w-5.5 h-5.5" />
                <span>List Your Business</span>
              </Link>
            </div>

            {/* Profile / Bottom Action Controls */}
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 space-y-5">
              {currentUser ? (
                <div className="space-y-4">
                  {/* Profile info block */}
                  <div className="flex items-center gap-4 bg-slate-100/80 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                    {currentUser.user_metadata?.avatar_url ? (
                      <img
                        className="h-11 w-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                        src={currentUser.user_metadata.avatar_url}
                        alt="User Avatar"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        {getInitials(currentUser)}
                      </div>
                    )}
                    <div className="min-w-0 flex-grow">
                      <p className="text-[15px] font-black text-slate-900 dark:text-white truncate">
                        {currentUser.user_metadata?.full_name || "Ghatal User"}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Settings style navigation items */}
                  <div className="grid grid-cols-2 gap-3">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-black text-red-600 dark:text-red-400 transition-colors"
                      >
                        <ShieldCheck className="w-4.5 h-4.5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/favorites"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span>Favorites</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 py-3.5 rounded-xl font-bold text-sm transition-colors mt-2"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-[15px] transition-all active:scale-[0.98] shadow-md btn-premium-glow"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Sign In to Account</span>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
