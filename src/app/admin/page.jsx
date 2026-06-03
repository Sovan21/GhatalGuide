"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/adminSupabaseClient";
import { 
  ShieldAlert, Check, X, Trash2, LayoutDashboard, Database, MessageSquare, LogOut, Star, Clock 
} from "lucide-react";

export default function AdminDashboard() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Data states
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [listingsCount, setListingsCount] = useState({ total: 0, pending: 0, approved: 0 });
  const [activeTab, setActiveTab] = useState("listings"); // 'listings', 'reviews', 'blog', 'jobs'
  const [listingsFilter, setListingsFilter] = useState("pending_review"); // 'pending_review', 'approved', 'rejected'
  const [loadingData, setLoadingData] = useState(false);

  // Monitor Admin Session
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setIsAdminLoggedIn(true);
          loadAdminData();
        }
      })
      .catch((e) => {
        console.warn("Failed to retrieve auth session:", e);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAdminLoggedIn(true);
        loadAdminData();
      } else {
        setIsAdminLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load stats and listings for moderation
  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Listings
      const { data: listData, error: listErr } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (listData && !listErr) {
        setListings(listData);
        // Calculate counts
        const pending = listData.filter(l => l.status === "pending_review").length;
        const approved = listData.filter(l => l.status === "approved").length;
        setListingsCount({
          total: listData.length,
          pending,
          approved
        });
      }

      // 2. Fetch Reviews
      const { data: revData, error: revErr } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (revData && !revErr) {
        setReviews(revData);
      }
    } catch (e) {
      console.warn("Failed to load admin panel data", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      if (error) throw error;
      
      // Confirm the user is actually an admin
      const user = data.user;
      const isAdminRole = user?.user_metadata?.role === "admin" || user?.email?.endsWith("@ghatalguide.com") || user?.email === "shovaxxx@gmail.com";
      
      if (!isAdminRole) {
        // Sign out if not admin
        await supabase.auth.signOut();
        throw new Error("Access denied: You are not authorized as an administrator.");
      }
      
      setIsAdminLoggedIn(true);
      loadAdminData();
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
  };

  // Moderation Handlers
  const handleUpdateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      
      // Update local state
      setListings(listings.map(l => l.id === id ? { ...l, status } : l));
      alert(`Listing status updated to ${status}!`);
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  const handleDeleteListing = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setListings(listings.filter(l => l.id !== id));
      alert("Listing deleted successfully!");
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
      alert("Review deleted!");
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans  relative">
      <div className="mesh-bg" />

      {/* Navbar for Admin Panel */}
      <header className="glass border-b border-slate-200/50 dark:border-dark-border/50 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3 text-2xl font-black text-slate-950 dark:text-white">
          <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
          <span className="bg-gradient-to-r from-rose-500 to-primary-500 bg-clip-text text-transparent">Admin Panel</span>
        </div>
        {isAdminLoggedIn && (
          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </header>

      {/* Auth Block */}
      {!isAdminLoggedIn ? (
        <div className="flex-grow flex items-center justify-center p-4 relative z-10">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-100 dark:border-dark-border p-8 max-w-md w-full">
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-6 text-center">Admin Access</h3>
            
            {loginError && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  placeholder="admin@ghatalguide.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-rose-500 hover:bg-rose-650 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-sm mt-6 cursor-pointer"
              >
                {loginLoading ? "Authorizing Control..." : "Access Moderation"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Control Panel Control Content */
        <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 relative z-10">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-100 dark:border-dark-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Listings</span>
                <p className="text-3xl font-black mt-1 text-slate-950 dark:text-white">{listingsCount.total}</p>
              </div>
              <div className="p-3.5 bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-2xl border border-primary-100/10">
                <Database className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-100 dark:border-dark-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider animate-pulse">Pending Moderation</span>
                <p className="text-3xl font-black mt-1 text-amber-500">{listingsCount.pending}</p>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl border border-amber-100/10">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-100 dark:border-dark-border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Approved Active</span>
                <p className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{listingsCount.approved}</p>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl border border-emerald-100/10">
                <Check className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-1.5 w-fit gap-2 shadow-sm animate-fade-in select-none">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "listings"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Listings</span>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews</span>
            </button>
          </div>

          {/* Listings Moderation Section */}
          {activeTab === "listings" && (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Listings Management</h3>
                
                {/* Moderation status filters */}
                <div className="flex border border-slate-200 dark:border-dark-border rounded-xl p-1 gap-1 text-xs font-black select-none bg-slate-50 dark:bg-dark-bg">
                  <button
                    onClick={() => setListingsFilter("pending_review")}
                    className={`px-4 py-2 rounded-lg cursor-pointer ${listingsFilter === "pending_review" ? "bg-primary-500 text-white shadow-sm" : "text-slate-500"}`}
                  >
                    Pending Review
                  </button>
                  <button
                    onClick={() => setListingsFilter("approved")}
                    className={`px-4 py-2 rounded-lg cursor-pointer ${listingsFilter === "approved" ? "bg-primary-500 text-white shadow-sm" : "text-slate-500"}`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setListingsFilter("rejected")}
                    className={`px-4 py-2 rounded-lg cursor-pointer ${listingsFilter === "rejected" ? "bg-primary-500 text-white shadow-sm" : "text-slate-500"}`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-wider">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold">
                    {listings
                      .filter(l => l.status === listingsFilter)
                      .map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                          <td className="py-4 px-4 font-black text-slate-900 dark:text-white">{l.name}</td>
                          <td className="py-4 px-4 uppercase text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-wider">{l.subcategory || l.category}</td>
                          <td className="py-4 px-4 text-xs font-mono">{l.phone || "-"}</td>
                          <td className="py-4 px-4 truncate max-w-xs">{l.address}</td>
                          <td className="py-4 px-4 text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right flex justify-end gap-2">
                            {l.status === "pending_review" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(l.id, "approved")}
                                  className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 cursor-pointer"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(l.id, "rejected")}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {l.status === "rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(l.id, "approved")}
                                className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 cursor-pointer"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteListing(l.id)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-dark-card-hover dark:hover:bg-slate-700 text-red-500 border border-slate-200 dark:border-dark-border cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Moderation Section */}
          {activeTab === "reviews" && (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm p-6 space-y-6 animate-fade-in">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">Reviews Moderation</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Comment</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-white">{r.user_name}</td>
                        <td className="py-4 px-4 font-black text-yellow-500 flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-500 text-amber-500" /> {r.rating}</td>
                        <td className="py-4 px-4 max-w-sm whitespace-pre-wrap leading-relaxed">{r.comment}</td>
                        <td className="py-4 px-4 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      )}

    </div>
  );
}
