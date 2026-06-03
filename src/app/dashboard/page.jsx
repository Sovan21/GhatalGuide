"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, PlusCircle, AlertCircle, CheckCircle, Clock, Trash2, Eye, Store, Pencil, Star, Info 
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast notifier
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Monitor Auth session
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session?.user) {
          router.push("/add-business");
        } else {
          setCurrentUser(session.user);
          loadUserListings(session.user.id);
        }
      })
      .catch((e) => {
        console.warn("Failed to retrieve auth session:", e);
        router.push("/add-business");
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push("/add-business");
      } else {
        setCurrentUser(session.user);
        loadUserListings(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadUserListings(userId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (data && !error) {
        setListings(data);
      }
    } catch (e) {
      console.warn("Failed to load user listings", e);
      showToast("Failed to load user listings.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteListing = async () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      // Find listing image to delete it from storage
      const listingToDelete = listings.find((l) => l.id === targetId);
      const imageUrl = listingToDelete?.image;

      const { error } = await supabase.from("listings").delete().eq("id", targetId);
      if (error) throw error;

      // Delete old image from storage bucket
      if (imageUrl && imageUrl.includes("listing-images")) {
        try {
          const fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
          await supabase.storage.from("listing-images").remove([fileName]);
        } catch (storageErr) {
          console.warn("Failed to clean up storage image on delete", storageErr);
        }
      }

      setListings(listings.filter((l) => l.id !== targetId));
      showToast("Listing deleted successfully!", "success");
    } catch (e) {
      showToast("Delete failed: " + e.message, "error");
    }
  };

  const handleRequestFeature = async (id) => {
    try {
      const { error } = await supabase
        .from("listings")
        .update({ feature_status: "requested" })
        .eq("id", id);
      if (error) throw error;
      
      showToast("Feature request sent successfully!", "success");
      setListings((prev) => 
        prev.map((l) => l.id === id ? { ...l, feature_status: "requested" } : l)
      );
    } catch (e) {
      showToast("Request failed: " + e.message, "error");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 text-xs font-black px-2.5 py-1.5 rounded-lg border border-emerald-100/10">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Approved</span>
        </span>
      ),
      pending_review: (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 text-xs font-black px-2.5 py-1.5 rounded-lg border border-amber-100/10">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs font-black px-2.5 py-1.5 rounded-lg border border-rose-100/10">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      ),
    };
    return badges[status] || badges.pending_review;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative overflow-hidden">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-12 relative z-10 pt-24">
        <div className="container-perfect max-w-5xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 text-center sm:text-left animate-fade-in">
            <div>
              <h1 className="text-4xl font-black text-slate-950 dark:text-white flex items-center justify-center sm:justify-start gap-2.5 tracking-tight">
                <LayoutDashboard className="w-8 h-8 text-primary-500" />
                <span>My Dashboard</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-bold">
                Manage your submitted business listings, audit reviews, or publish new ones.
              </p>
            </div>
            <Link
              href="/add-business"
              className="bg-primary-600 hover:bg-primary-700 text-white font-black px-5 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 flex items-center gap-2 text-sm shrink-0 cursor-pointer active:scale-98 btn-premium-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Listing</span>
            </Link>
          </div>

          {/* Stats Summary Cards */}
          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
              <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Listings</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{listings.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-xl flex items-center justify-center border border-primary-100/10"><Store className="w-6 h-6" /></div>
              </div>
              <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Approved</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {listings.filter(l => l.status === "approved").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100/10"><CheckCircle className="w-6 h-6" /></div>
              </div>
              <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Review</p>
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-450 mt-1">
                    {listings.filter(l => l.status === "pending_review").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100/10"><Clock className="w-6 h-6" /></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20 animate-fade-in">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border py-16 px-4 text-center max-w-xl mx-auto shadow-sm animate-fade-in">
              <div className="mb-4">
                <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Listings Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-bold leading-relaxed">
                You haven\'t added any listings on Ghatal Guide yet. Add your business or service today to grow locally!
              </p>
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 text-sm cursor-pointer btn-premium-glow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Your Listing</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border overflow-hidden shadow-sm animate-fade-in">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {listings.map((l) => (
                  <div key={l.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                        {getStatusBadge(l.status)}
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {l.subcategory || l.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Submitted on {new Date(l.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white truncate">
                        {l.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 truncate font-semibold">
                        {l.address}
                      </p>
                      {l.status === "rejected" && l.rejection_reason && (
                        <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-350 text-xs font-bold rounded-r-lg">
                          <strong>Rejection Reason:</strong> {l.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-dark-border">
                      
                      {/* Feature Request Actions */}
                      {l.status === "approved" && (
                        <>
                          {l.feature_status === "active" ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-black px-3 py-2 rounded-xl border border-amber-250/20">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>Featured Approved</span>
                            </span>
                          ) : l.feature_status === "requested" ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs font-black px-3 py-2 rounded-xl border border-blue-200/20">
                              <span>Request Sent</span>
                            </span>
                          ) : l.feature_status === "denied" ? (
                            <button
                              onClick={() => handleRequestFeature(l.id)}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black transition-colors cursor-pointer"
                              title="Request Feature Status Again"
                            >
                              Feature Rejected (Request Again?)
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRequestFeature(l.id)}
                              className="px-3.5 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-955/20 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black transition-colors cursor-pointer"
                              title="Request Feature Status"
                            >
                              Request Feature
                            </button>
                          )}
                        </>
                      )}

                      {l.status === "approved" && (
                        <Link
                          href={`/listings/${l.id}`}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="View Listing"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                      )}
                      
                      <Link
                        href={`/add-business?id=${l.id}`}
                        className="p-2.5 rounded-xl border border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-450 transition-colors"
                        title="Edit Listing"
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </Link>

                      <button
                        onClick={() => handleDeleteClick(l.id)}
                        className="p-2.5 rounded-xl border border-red-250 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 text-red-500 transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-zoom-in-fade">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-bounce-in">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100/10">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Listing?</h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6">
              Are you sure you want to permanently delete this listing? This action cannot be undone and will remove it from the directory.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-card-hover dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteListing}
                className="py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications System */}
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

      <Footer />
    </div>
  );
}
