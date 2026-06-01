import React from "react";
import Link from "next/link";
import { Bell, Heart, MapPin, ArrowUpRight, Sparkles, Send, Users } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Directory", href: "/directory" },
    { name: "Add Business", href: "/add-business" },
    { name: "Transportation", href: "/transportation" },
    { name: "Events", href: "/events" },
    { name: "Favorites", href: "/favorites" },
    { name: "Jobs", href: "/jobs" },
    { name: "Blog", href: "/blog" },
  ];

  const categories = [
    { name: "Health & Wellness", href: "/directory?category=health" },
    { name: "Food & Dining", href: "/directory?category=food" },
    { name: "Shopping", href: "/directory?category=shopping" },
    { name: "Local Services", href: "/directory?category=services" },
    { name: "Education", href: "/directory?category=education" },
    { name: "Emergency Services", href: "/directory?category=emergency" },
  ];

  return (
    <footer className="relative bg-slate-950 text-slate-200 overflow-hidden" role="contentinfo">
      {/* Gradient top border line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-perfect py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Brand & Newsletter Column (Left Side - Span 5) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-5 flex flex-col space-y-6">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="relative rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-500">
                  <img src="/logo.png" alt="Ghatal Guide Logo" className="h-9 w-9 bg-white rounded-[9px]" />
                </div>
                <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Ghatal Guide
                </span>
              </Link>
              <p className="text-slate-400 leading-relaxed text-[12.5px] font-medium pr-2">
                The definitive companion to making life in Ghatal Town simpler, connected, and digitally enabled. Find doctors, services, jobs, and timetables at your fingertips.
              </p>
              
              {/* Social Icons with glowing hovers */}
              <div className="flex items-center gap-2.5 pt-1">
                {[
                  { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                  { label: "Twitter", path: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
                  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="group relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300"
                    aria-label={social.label}
                  >
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter and Alerts inside Left column */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 space-y-4 shadow-xl hover:border-slate-700/80 transition-colors duration-300 max-w-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-1">
                <h4 className="font-black text-white text-[11px] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  Stay Connected
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Subscribe to weekly local digests and enable browser alerts for instant updates.
                </p>
              </div>
              
              {/* Newsletter Form */}
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="flex-grow bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                />
                <button 
                  onClick={() => alert("Newsletter subscription coming soon!")}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25"
                >
                  Join
                </button>
              </div>

              {/* Browser Alerts Button */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/40">
                <button 
                  onClick={() => alert("Notification features are coming soon!")}
                  className="w-full flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900/60 hover:text-white text-slate-350 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
                >
                  <Bell className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-shake" />
                  <span>Enable Browser Alerts</span>
                </button>

                {/* Active User Metrics */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold">
                  <Users className="w-3 h-3 text-emerald-500" />
                  <span>Join 1,200+ local citizens receiving alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer Column (Span 1) - Only visible on desktop */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Column (Right Side - Span 6) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-black text-white text-[12px] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                Quick Links
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12.5px] font-semibold">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-1.5 group"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-400 shrink-0" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-300 truncate">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-black text-white text-[12px] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                Categories
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12.5px] font-semibold">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link 
                      href={cat.href} 
                      className="text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-1.5 group"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-purple-400 shrink-0" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-300 truncate">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-800/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 text-center md:text-left">
              &copy; {new Date().getFullYear()} Ghatal Guide. Made with 
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline-block" /> 
              for our town.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-medium">
              <Link href="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
              <span className="hidden sm:inline text-slate-800">•</span>
              <span className="flex items-center gap-1.5 text-slate-600 select-none">
                <MapPin className="w-3 h-3 text-indigo-400" />
                Paschim Medinipur, WB
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
