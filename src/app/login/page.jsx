"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { KeyRound, Mail, User, Lock, RotateCcw, ShieldCheck, MailOpen, CheckCircle, AlertCircle, Info, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Auth States
  const [panelActive, setPanelActive] = useState("left"); // 'left' = signin, 'right' = signup
  const [authStep, setAuthStep] = useState("signin"); // 'signin', 'forgot', 'otp', 'update-password'
  
  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Feedback
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Verification Polling States
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [pollingCountdown, setPollingCountdown] = useState(180); // 3 minutes in seconds
  const pollingRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push(redirectPath);
      }
    });

    // Cleanup polling on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [router, redirectPath]);

  // Handlers
  const togglePanel = (direction) => {
    setPanelActive(direction);
    setAuthError("");
    setAuthMessage("");
    setAuthStep("signin");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      showToast("Signed in successfully!", "success");
      setAuthMessage("Signed in successfully!");
      
      // Check user listings to redirect appropriately
      const user = signInData.user;
      let hasShops = false;
      try {
        const { count } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (count > 0) hasShops = true;
      } catch (e) {
        console.warn("Failed to retrieve user listing count:", e);
      }

      setTimeout(() => {
        if (hasShops) {
          router.push("/dashboard");
        } else {
          router.push(redirectPath);
        }
      }, 1000);
    } catch (err) {
      setAuthError(err.message || "Wrong password or email. Please try again.");
      showToast(err.message || "Wrong password or email. Please try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match. Please try again.");
      showToast("Passwords do not match. Please try again.", "warning");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin + "/add-business"
        }
      });
      
      // Catch existing registered emails
      if (error) {
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
          setAuthMessage("This email is already registered. Please sign in.");
          showToast("This email is already registered. Please sign in.", "info");
          togglePanel("left");
          return;
        }
        throw error;
      }

      if (data?.user && data?.user?.identities?.length === 0) {
        setAuthMessage("This email is already registered. Please sign in.");
        showToast("This email is already registered. Please sign in.", "info");
        togglePanel("left");
        return;
      }

      if (data?.user) {
        setAuthMessage("Account created! Verification email sent.");
        showToast("Confirmation email sent! Please check your inbox.", "success");
        setIsAwaitingConfirmation(true);
        startPollingForConfirmation(email, password);
      }
    } catch (err) {
      setAuthError(err.message || "Signup failed");
      showToast(err.message || "Signup failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Polling for confirmation link clicked on another device
  const startPollingForConfirmation = (signUpEmail, signUpPassword) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const startTime = Date.now();
    const duration = 3 * 60 * 1000; // 3 minutes

    pollingRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(pollingRef.current);
        setIsAwaitingConfirmation(false);
        setAuthError("Email verification timeout. Please check your inbox and log in manually once verified.");
        showToast("Email verification timeout. Please sign in manually.", "warning");
        return;
      }

      setPollingCountdown(Math.max(0, Math.floor((duration - elapsed) / 1000)));

      const { data } = await supabase.auth.signInWithPassword({
        email: signUpEmail,
        password: signUpPassword
      });

      if (data?.session) {
        clearInterval(pollingRef.current);
        setIsAwaitingConfirmation(false);
        showToast("Email Verified! Logged in successfully.", "success");
        setAuthMessage("Email Verified! Redirecting to dashboard...");
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      }
    }, 3000);
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
      setAuthMessage("Security code sent to your email!");
      showToast("OTP Code sent to your email!", "success");
    } catch (err) {
      setAuthError(err.message || "Failed to send OTP.");
      showToast(err.message || "Failed to send OTP.", "error");
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
      setAuthStep("update-password");
      setAuthMessage("Code verified! Please set your new password.");
      showToast("Verification successful!", "success");
    } catch (err) {
      setAuthError(err.message || "Invalid OTP code.");
      showToast(err.message || "Invalid OTP code.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setAuthMessage("Password updated successfully!");
      showToast("Password updated! Logging in...", "success");
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (err) {
      setAuthError(err.message || "Failed to update password.");
      showToast(err.message || "Failed to update password.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const googleSvg = (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );

  const facebookSvg = (
    <svg className="w-5 h-5 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const linkedinSvg = (
    <svg className="w-5 h-5 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );

  const githubSvg = (
    <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );

  return (
    <div className="w-full flex justify-center py-12 lg:py-16 px-4 select-none relative z-10">
      
      {/* Container to handle the relative overlapping panels */}
      <div className={`auth-container panel-${panelActive}-active relative w-full max-w-md h-[650px] flex justify-center`}>
        
        {/* Sign In Container (Left Panel) */}
        <div id="signin-container" className="auth-panel">
          <div className="bg-[#e0e8f0] dark:bg-[#1a202c] p-8 rounded-[32px] shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] border border-white/5 transition-all duration-300">
            {authStep === "signin" && (
              <>
                <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight text-slate-800 dark:text-slate-200">Login Form</h2>
                
                <form onSubmit={handleSignIn} className="space-y-6">
                  {/* Email/Phone/Username Input */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email/Phone/Username"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                  </div>
                  
                  {/* Password Input */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Checkbox and Forgot Password Link */}
                  <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-700 dark:text-slate-400 select-none">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="w-4 h-4 rounded bg-[#e0e8f0] dark:bg-[#1a202c] border-none shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-primary-600 focus:ring-0 cursor-pointer appearance-none checked:bg-primary-500 checked:border-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:text-white after:font-black after:hidden checked:after:block" 
                      />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button" onClick={() => { setAuthError(""); setAuthStep("forgot"); }}
                      className="text-primary-650 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                  {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                  
                  {/* Sign In submit button */}
                  <button 
                    type="submit" disabled={authLoading}
                    className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? "Signing In..." : "Sign in"}
                  </button>
                </form>

                {/* Create Account link */}
                <div className="flex justify-between items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-400 mt-6">
                  <span>Don't have an account?</span>
                  <button onClick={() => togglePanel('right')} className="text-primary-650 hover:underline cursor-pointer">
                    Create account
                  </button>
                </div>

                {/* Social Sign In Options */}
                <div className="mt-6 text-center">
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Or continue with</span>
                  <div className="flex justify-center gap-4">
                    {[
                      { icon: googleSvg, label: "Google" },
                      { icon: facebookSvg, label: "Facebook" },
                      { icon: linkedinSvg, label: "LinkedIn" },
                      { icon: githubSvg, label: "GitHub" }
                    ].map((provider) => (
                      <button
                        key={provider.label}
                        type="button"
                        onClick={() => showToast(`${provider.label} sign-in option coming soon!`, "info")}
                        className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-105 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] transition-all cursor-pointer"
                        title={`Sign in with ${provider.label}`}
                      >
                        {provider.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {authStep === "forgot" && (
              <>
                <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Reset Password</h3>
                
                <form onSubmit={handleSendReset} className="space-y-6">
                  {/* Email Input */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                  </div>
                  
                  {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                  {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                  
                  <button 
                    type="submit" disabled={authLoading} 
                    className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer"
                  >
                    {authLoading ? "Sending..." : "Send Security Code"}
                  </button>
                  <button 
                    type="button" onClick={() => setAuthStep("signin")} 
                    className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold text-xs cursor-pointer mt-4"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </form>
              </>
            )}

            {authStep === "otp" && (
              <>
                <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Verify Security Code</h3>
                
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP input field */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <input 
                      type="text" required maxLength="6" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-transparent border-none outline-none py-3.5 text-center text-2xl tracking-[0.5em] font-black text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-0 focus:border-none focus:outline-none"
                    />
                  </div>
                  
                  {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                  {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                  
                  <button 
                    type="submit" disabled={authLoading} 
                    className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer"
                  >
                    {authLoading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button 
                    type="button" onClick={() => setAuthStep("forgot")} 
                    className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold text-xs cursor-pointer mt-4"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Back
                  </button>
                </form>
              </>
            )}

            {authStep === "update-password" && (
              <>
                <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Set New Password</h3>
                
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  {/* New Password Input */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}
                      required 
                      minLength="6" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter New Password"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                  {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                  
                  <button 
                    type="submit" disabled={authLoading} 
                    className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer"
                  >
                    {authLoading ? "Updating..." : "Save Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Sign Up Container (Right Panel) */}
        <div id="signup-container" className="auth-panel">
          <div className="bg-[#e0e8f0] dark:bg-[#1a202c] p-8 rounded-[32px] shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] border border-white/5 transition-all duration-300">
            <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight text-slate-800 dark:text-slate-200">Register</h2>
            
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full Name Input */}
              <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                <div className="pl-5 text-slate-700 dark:text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                />
              </div>
              
              {/* Email/Phone/Username Input */}
              <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                <div className="pl-5 text-slate-700 dark:text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email/Phone/Username"
                  className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                />
              </div>
              
              {/* Create Password Input */}
              <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                <div className="pl-5 text-slate-700 dark:text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required 
                  minLength="6" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password"
                  className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Confirm Password Input */}
              <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                <div className="pl-5 text-slate-700 dark:text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  required 
                  minLength="6" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
              {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}

              {/* Convex Submit button */}
              <button 
                type="submit" disabled={authLoading}
                className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {authLoading ? "Creating Account..." : "Sign up"}
              </button>
            </form>
            
            {/* Click here to sign in link */}
            <div className="flex justify-between items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-400 mt-6">
              <span>Already have an account?</span>
              <button onClick={() => togglePanel('left')} className="text-primary-650 hover:underline cursor-pointer">
                Click here to sign in
              </button>
            </div>

            {/* Social Sign Up Options */}
            <div className="mt-6 text-center">
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Or continue with</span>
              <div className="flex justify-center gap-4">
                {[
                  { icon: googleSvg, label: "Google" },
                  { icon: facebookSvg, label: "Facebook" },
                  { icon: linkedinSvg, label: "LinkedIn" },
                  { icon: githubSvg, label: "GitHub" }
                ].map((provider) => (
                  <button
                    key={provider.label}
                    type="button"
                    onClick={() => showToast(`${provider.label} sign-up option coming soon!`, "info")}
                    className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-105 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] transition-all cursor-pointer"
                    title={`Sign up with ${provider.label}`}
                  >
                    {provider.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Awaiting Confirmation Modal (Popup Manager) */}
      {isAwaitingConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-zoom-in-fade">
          <div className="bg-[#e0e8f0] dark:bg-[#1a202c] rounded-[32px] p-8 max-w-md w-full shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] text-center animate-bounce-in">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <span className="absolute inset-0 rounded-full border-4 border-indigo-50 dark:border-indigo-950" />
              <span className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center">
                <MailOpen className="w-8 h-8 text-primary-500 animate-pulse" />
              </span>
            </div>
            
            <h3 className="text-2xl font-black mb-3 text-slate-800 dark:text-slate-200">Awaiting Confirmation</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-bold leading-relaxed">
              We've sent an email verification link to <span className="text-primary-650 font-extrabold">{email}</span>. Please click the link to verify your account.
            </p>
            
            <div className="p-4 bg-[#e0e8f0]/40 dark:bg-[#1a202c]/40 rounded-2xl shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] mb-6 text-xs font-black text-slate-500">
              <p className="uppercase tracking-wider">Device Verification Polling Active</p>
              <p className="text-primary-650 dark:text-primary-400 text-xl mt-1.5 font-black">
                {Math.floor(pollingCountdown / 60)}:{(pollingCountdown % 60).toString().padStart(2, "0")}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (pollingRef.current) clearInterval(pollingRef.current);
                setIsAwaitingConfirmation(false);
              }}
              className="w-full py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-101 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-700 dark:text-slate-300 rounded-full font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Cancel Verification
            </button>
          </div>
        </div>
      )}

      {/* Toast System (Toast Manager) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs font-black tracking-wide flex items-center justify-between gap-4 animate-slide-up backdrop-blur-md ${
              t.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-500/20"
                : t.type === "error"
                ? "bg-rose-500/90 text-white border-rose-500/20"
                : t.type === "warning"
                ? "bg-amber-500/90 text-slate-950 border-amber-500/20"
                : "bg-primary-600/90 text-white border-primary-650/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && <CheckCircle className="w-4.5 h-4.5 text-white" />}
              {t.type === "error" && <AlertCircle className="w-4.5 h-4.5 text-white" />}
              {t.type === "warning" && <AlertCircle className="w-4.5 h-4.5 text-slate-950" />}
              {t.type === "info" && <Info className="w-4.5 h-4.5 text-white" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-white hover:opacity-85 font-extrabold focus:outline-none text-base cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#e0e8f0] dark:bg-[#1a202c] text-slate-900 dark:text-slate-100  relative overflow-hidden">
      
      {/* Ambient backgrounds */}
      <div className="blur-bubble bg-primary-500/5 dark:bg-primary-500/10 top-20 left-10 animate-float" />
      <div className="blur-bubble bg-indigo-500/5 dark:bg-indigo-500/10 bottom-20 right-10 animate-float" style={{ animationDelay: "2s" }} />
      <div className="mesh-bg opacity-30" />

      <Navbar />

      <main className="flex-grow pt-28 pb-16 flex items-center justify-center relative z-10 overflow-hidden">
        <Suspense fallback={
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        }>
          <LoginContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
