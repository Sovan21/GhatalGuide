"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { 
  Mail, Lock, Key, ArrowLeft, Eye, EyeOff, Loader2, 
  Sparkles, Compass, MapPin, Calendar, CheckCircle2, AlertCircle 
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [authStep, setAuthStep] = useState("signin"); // 'signin', 'signup', 'forgot', 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Monitor Auth session: if already logged in, redirect away
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push(redirectPath);
      }
    });
  }, [router, redirectPath]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setAuthMessage("Signed in successfully!");
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + redirectPath
        }
      });
      if (error) throw error;
      setAuthMessage("Account created! Please check your inbox for verification link.");
    } catch (err) {
      setAuthError(err.message || "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setAuthStep("otp");
      setAuthMessage("OTP Code sent to your email!");
    } catch (err) {
      setAuthError(err.message || "Failed to send OTP.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "email" });
      if (error) throw error;
      setAuthMessage("Email verified and logged in successfully!");
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Invalid OTP code.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-all duration-300 ease-in-out">
      
      {/* ==================== FORM PANEL (Left/Full) ==================== */}
      <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center relative">
        
        {/* Step Navigation for Login/Signup */}
        {(authStep === "signin" || authStep === "signup") && (
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-200/40 dark:border-white/[0.04] transition-all">
            <button
              type="button"
              onClick={() => {
                setAuthError("");
                setAuthMessage("");
                setAuthStep("signin");
              }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 cursor-pointer ${
                authStep === "signin"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthError("");
                setAuthMessage("");
                setAuthStep("signup");
              }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 cursor-pointer ${
                authStep === "signup"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Back Button for Reset/OTP steps */}
        {(authStep === "forgot" || authStep === "otp") && (
          <button
            type="button"
            onClick={() => {
              setAuthError("");
              setAuthMessage("");
              setAuthStep("signin");
            }}
            className="self-start inline-flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors mb-8 cursor-pointer group"
          >
            <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Notifications */}
        {authError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[13px] text-red-600 dark:text-red-400 font-bold leading-snug flex items-start gap-2.5 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
            <span>{authError}</span>
          </div>
        )}
        {authMessage && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl text-[13px] text-green-600 dark:text-green-400 font-bold leading-snug flex items-start gap-2.5 mb-6 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500 dark:text-green-400" />
            <span>{authMessage}</span>
          </div>
        )}

        {/* Header Block */}
        <div className="mb-6">
          <h2 className="text-2.5xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {authStep === "signin" && "Welcome Back"}
            {authStep === "signup" && "Create Account"}
            {authStep === "forgot" && "Reset Password"}
            {authStep === "otp" && "Verify Code"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-[13px] sm:text-[14px] font-semibold leading-relaxed">
            {authStep === "signin" && "Sign in to access directory search, favorites, and list tools."}
            {authStep === "signup" && "Join Ghatal Guide to discover local businesses and post listings."}
            {authStep === "forgot" && "Confirm your email address below to receive a secure login OTP."}
            {authStep === "otp" && `Enter the verification code sent to ${email}.`}
          </p>
        </div>

        {/* Forms Container with Opacity/Fade Animation to prevent overflow scroll */}
        <div className="transition-opacity duration-300 ease-in-out">
          
          {/* SIGN IN FORM */}
          {authStep === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="you@example.com"
                  />
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError("");
                      setAuthMessage("");
                      setAuthStep("forgot");
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] text-[14.5px] cursor-pointer flex justify-center items-center gap-2"
              >
                {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Sign In"}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authStep === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="you@example.com"
                  />
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] text-[14.5px] cursor-pointer flex justify-center items-center gap-2"
              >
                {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Create Account"}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authStep === "forgot" && (
            <form onSubmit={handleSendReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[14.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all duration-200"
                    placeholder="you@example.com"
                  />
                  <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] text-[14.5px] cursor-pointer flex justify-center items-center gap-2"
              >
                {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Send Verification OTP"}
              </button>
            </form>
          )}

          {/* OTP VERIFICATION FORM */}
          {authStep === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Security Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-center tracking-widest font-black"
                    placeholder="123456"
                  />
                  <Key className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] text-[14.5px] cursor-pointer flex justify-center items-center gap-2"
              >
                {authLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Verify & Sign In"}
              </button>
              
              <div className="text-center text-xs mt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthError("");
                    setAuthMessage("");
                    setAuthStep("forgot");
                  }} 
                  className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 font-extrabold hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* ==================== PROMOTIONAL BRAND PANEL (Right, hidden on mobile) ==================== */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-650 via-indigo-700 to-violet-850 p-10 md:p-12 flex-col justify-between relative overflow-hidden text-white">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] right-[-10%] w-[320px] h-[320px] rounded-full bg-indigo-500/20 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[350px] h-[350px] rounded-full bg-fuchsia-500/15 blur-[80px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-2 border border-white/20">
            <Compass className="w-7 h-7 text-indigo-200 animate-float" />
          </div>
          <div>
            <h4 className="text-lg font-black tracking-wider uppercase">Ghatal Guide</h4>
            <p className="text-[10px] text-indigo-200 font-bold tracking-widest uppercase">Local Info Portal</p>
          </div>
        </div>

        {/* Brand Core Bullet Points */}
        <div className="relative z-10 space-y-7 my-auto">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0">
              <MapPin className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h5 className="font-bold text-[15px]">Comprehensive Directory</h5>
              <p className="text-sm text-indigo-100/80 mt-1 font-medium leading-relaxed">
                Access local listings, healthcare providers, retail stores, and emergency services in Ghatal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0">
              <Calendar className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h5 className="font-bold text-[15px]">Events & Local News</h5>
              <p className="text-sm text-indigo-100/80 mt-1 font-medium leading-relaxed">
                Stay updated with ongoing cultural events, festivals, job announcements, and community posts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h5 className="font-bold text-[15px]">Promote Your Business</h5>
              <p className="text-sm text-indigo-100/80 mt-1 font-medium leading-relaxed">
                Add and manage your businesses with reviews, details, working hours, and contact directions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-indigo-200/70 font-semibold">
          Ghatal Guide is dedicated to connecting citizens, visitors, and businesses across Ghatal.
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-24 sm:py-28 flex items-center justify-center relative z-10 px-4">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading Auth...</p>
          </div>
        }>
          <LoginContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
