"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { sampleJobs } from "@/lib/sampleData";
import { supabase } from "@/lib/supabaseClient";
import { Briefcase, MapPin, DollarSign, ArrowRight } from "lucide-react";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      let dbJobs = [];
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (data && !error) {
          dbJobs = data;
        }
      } catch (e) {
        console.warn("Supabase jobs fetch failed", e);
      }

      if (dbJobs.length === 0) {
        dbJobs = sampleJobs;
      }
      setJobs(dbJobs);
      setLoading(false);
    }
    loadJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-12 lg:py-20 relative z-10">
        <div className="container-perfect max-w-4xl">
          
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight animate-fade-in">
              Job Opportunities
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-bold leading-relaxed max-w-md mx-auto">
              Find verified local vacancies, teaching positions, and business roles in Ghatal.
            </p>
          </div>

          {/* Jobs List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                  <div className="flex-grow space-y-3 w-full">
                    <div className="w-20 h-5 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="w-48 h-6 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="flex gap-4">
                      <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                  <div className="w-24 h-5 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 py-16 px-4 text-center max-w-xl mx-auto shadow-sm">
              <div className="mb-4">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Jobs Available
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                There are no active job vacancy postings at this time. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex-grow min-w-0">
                    <span className="inline-block bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-xl mb-3 tracking-widest uppercase shadow-sm">
                      {job.job_type || "Full Time"}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      {job.job_title}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-sm mb-4">
                      {job.company_name}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">{job.salary_range}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 group"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
