"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleJobs } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, DollarSign, ArrowLeft, Calendar, FileText, Send, FileQuestion } from "lucide-react";

export default function JobDetails({ params }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      let dbJob = null;
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .maybeSingle();
        if (data && !error) {
          dbJob = data;
        }
      } catch (e) {
        console.warn("DB job lookup failed", e);
      }

      if (!dbJob) {
        // Fallback to sampleJobs
        dbJob = sampleJobs.find((j) => String(j.id) === String(jobId));
      }
      setJob(dbJob);
      setLoading(false);
    }
    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <main className="flex-grow py-20 text-center px-4 relative z-10">
          <div className="mb-4">
            <FileQuestion className="w-12 h-12 text-slate-400 dark:text-slate-700 mx-auto" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Job Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The job vacancy you are looking for does not exist or has expired.</p>
          <Link href="/jobs" className="text-indigo-500 font-bold hover:underline">&larr; Back to Job Board</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100  relative overflow-hidden">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect max-w-3xl">
          
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Jobs</span>
          </Link>

          {/* Job Details Card */}
          <article className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
            
            {/* Header info */}
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20">
              <span className="inline-block bg-indigo-55 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black px-3.5 py-1.5 rounded-xl mb-3 tracking-widest uppercase shadow-sm">
                {job.job_type || "Full Time"}
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                {job.job_title}
              </h1>
              <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
                {job.company_name}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-dark-border text-sm font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">{job.salary_range}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-slate-400" />
                  <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 md:p-8 space-y-6">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2.5">
                  <FileText className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                  <span>Job Description</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm font-bold">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="pt-5 border-t border-slate-200 dark:border-dark-border">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                    Requirements
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm font-bold">
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* Apply Box */}
              <div className="mt-8 p-6 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1.5 text-sm sm:text-base">
                    Interested in this vacancy?
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">
                    Please apply by submitting your details directly to our community recruitment channel.
                  </p>
                </div>
                <a
                  href={`mailto:apply@ghatalguide.com?subject=Application for ${encodeURIComponent(job.job_title)}`}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply via Email</span>
                </a>
              </div>

            </div>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
