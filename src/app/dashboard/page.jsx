"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { supabase } from "@/lib/supabaseClient";
import { LayoutDashboard, PlusCircle, AlertCircle, CheckCircle, Clock, Trash2, Eye, Store } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteListing = async (id) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setListings(listings.filter((l) => l.id !== id));
      alert("Listing deleted successfully!");
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: (
        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-black px-2.5 py-1.5 rounded-lg border border-emerald-200/20">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Approved</span>
        </span>
      ),
      pending_review: (
        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-black px-2.5 py-1.5 rounded-lg border border-amber-200/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 text-xs font-black px-2.5 py-1.5 rounded-lg border border-rose-200/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </span>
      ),
    };
    return badges[status] || badges.pending_review;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-12 relative z-10">
        <div className="container-perfect max-w-5xl">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 text-center sm:text-left">
            <div>
              <h1 className="text-4xl font-black text-slate-950 dark:text-white flex items-center justify-center sm:justify-start gap-2.5 tracking-tight animate-fade-in">
                <LayoutDashboard className="w-8 h-8 text-primary-500" />
                <span>My Dashboard</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-bold">
                Manage your submitted business listings, audit reviews, or publish new ones.
              </p>
            </div>
            <Link
              href="/add-business"
              className="bg-primary-500 hover:bg-primary-650 text-white font-black px-5 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Shop</span>
            </Link>
          </div>

          {/* Stats Summary Cards */}
          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Shops</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{listings.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-xl flex items-center justify-center border border-primary-100/10"><Store className="w-6 h-6" /></div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Approved</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {listings.filter(l => l.status === "approved").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100/10"><CheckCircle className="w-6 h-6" /></div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 py-16 px-4 text-center max-w-xl mx-auto shadow-sm animate-fade-in">
              <div className="mb-4">
                <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Listings Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-bold leading-relaxed">
                You haven't listed any businesses on Ghatal Guide yet. Connect your storefront today to grow locally!
              </p>
              <Link
                href="/add-business"
                className="bg-primary-500 hover:bg-primary-655 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md text-sm inline-block cursor-pointer"
              >
                + Add Your Business
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-fade-in">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {listings.map((l) => (
                  <div key={l.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                        {getStatusBadge(l.status)}
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {l.subcategory || l.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white truncate">
                        {l.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 truncate font-semibold">
                        {l.address}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                      {l.status === "approved" && (
                        <Link
                          href={`/listings/${l.id}`}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="View Listing"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="p-2.5 rounded-lg border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 text-red-500 transition-colors cursor-pointer"
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

      <Footer />
    </div>
  );
}
