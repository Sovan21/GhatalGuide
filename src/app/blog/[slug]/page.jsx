"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleBlogs } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, User, Calendar, FileQuestion } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export default function BlogPost({ params }) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const slug = decodeURIComponent(rawSlug);

  const [post, setPost] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      let dbPost = null;
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (data && !error) {
          dbPost = data;
        } else {
          if (error) console.warn("Supabase blog post lookup error:", error.message || error);
        }
      } catch (e) {
        console.warn("DB blog lookup failed", e);
      }

      if (!dbPost) {
        // Fallback to sampleBlogs
        dbPost = sampleBlogs.find((p) => p.slug === slug);
      }

      if (dbPost) {
        setPost(dbPost);
        // Parse markdown content into html and sanitize to prevent XSS
        if (dbPost.content) {
          marked.setOptions({ breaks: true, gfm: true });
          const rawHtml = marked.parse(dbPost.content);
          // Sanitize HTML — strips <script>, <iframe>, onerror, onload, etc.
          const cleanHtml = DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','hr','ul','ol','li',
              'a','strong','em','code','pre','blockquote','img','table','thead','tbody',
              'tr','th','td','span','div','sub','sup','del','s'],
            ALLOWED_ATTR: ['href','src','alt','title','class','id','target','rel'],
            ALLOW_DATA_ATTR: false,
          });
          setHtmlContent(cleanHtml);
        }
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <main className="flex-grow py-20 text-center px-4 relative z-10">
          <div className="mb-4">
            <FileQuestion className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Post Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The article you are looking for does not exist or has been removed.</p>
          <Link href="/blog" className="text-primary-500 font-black hover:underline">&larr; Back to Blog Feed</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect max-w-3xl">
          
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Blog Feed</span>
          </Link>

          {/* Blog Post Article */}
          <article className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border overflow-hidden p-6 md:p-10">
            
            {/* Header */}
            <header className="mb-8 pb-8 border-b border-slate-100 dark:border-dark-border">
              <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white mb-4 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author_name || "Admin"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-sm max-h-96">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rendered HTML Content - styled with typography styles */}
            <div 
              className="prose dark:prose-invert lg:prose-xl max-w-none text-slate-700 dark:text-slate-300 leading-relaxed font-medium space-y-5"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
