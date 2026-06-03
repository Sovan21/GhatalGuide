"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleBlogs } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { User, Calendar, ArrowRight, PenLine } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      let dbPosts = [];
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });
          
        if (data && !error) {
          dbPosts = data;
        } else {
          if (error) console.warn("Error fetching blog posts:", error.message || error);
        }
      } catch (e) {
        console.warn("Supabase blog posts load failed", e);
      }

      if (dbPosts.length === 0) {
        dbPosts = sampleBlogs;
      }
      setPosts(dbPosts);
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect">
          
          {/* Header */}
          <div className="mb-14 text-center space-y-3">
            <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight animate-fade-in">
              Ghatal Guide Blog
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold leading-relaxed max-w-md mx-auto">
              Local stories, guides, and cultural announcements from our editorial team.
            </p>
          </div>

          {/* Posts list */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border overflow-hidden flex flex-col animate-pulse h-[400px]">
                  <div className="h-48 w-full bg-slate-100 dark:bg-dark-card-hover" />
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <div className="w-20 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
                        <div className="w-20 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
                      </div>
                      <div className="w-3/4 h-5 rounded bg-slate-200 dark:bg-dark-card-hover" />
                      <div className="space-y-2">
                        <div className="w-full h-3 rounded bg-slate-200 dark:bg-dark-card-hover" />
                        <div className="w-full h-3 rounded bg-slate-200 dark:bg-dark-card-hover" />
                        <div className="w-2/3 h-3 rounded bg-slate-200 dark:bg-dark-card-hover" />
                      </div>
                    </div>
                    <div className="w-24 h-4 rounded bg-slate-200 dark:bg-dark-card-hover" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border py-16 px-4 text-center max-w-xl mx-auto shadow-sm">
              <div className="mb-4">
                <PenLine className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Blog Posts Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                We haven't published any articles yet. Stay tuned, exciting updates are on the way!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border overflow-hidden shadow-sm flex flex-col hover:shadow-lg transition-all duration-350 group"
                >
                  
                  {/* Featured Image */}
                  <div className="h-48 w-full bg-slate-100 dark:bg-dark-card-hover overflow-hidden relative">
                    <img
                      src={post.featured_image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3 font-bold">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {post.author_name || "Admin"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-950 dark:text-white line-clamp-2 leading-snug mb-3 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                        {post.content ? post.content.replace(/[#*`_]/g, "").substring(0, 140) + "..." : ""}
                      </p>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-primary-600 dark:text-primary-450 hover:text-primary-750 dark:hover:text-primary-350 transition-colors group-link w-fit"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                </article>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
