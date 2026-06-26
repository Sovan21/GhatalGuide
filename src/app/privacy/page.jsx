"use client";
import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ShieldCheck, Eye, Database, Lock, Mail, FileText, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect max-w-4xl">
          
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Privacy Policy
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider select-none">
              Last Updated: June 26, 2026
            </p>
          </div>

          {/* Policy Body */}
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm lg:text-base leading-relaxed text-slate-800 dark:text-slate-200">
            
            {/* Intro */}
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Welcome to <strong>Ghatal Guide</strong>. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website (ghatalguide.netlify.app) and use our local directory services.
            </p>

            <hr className="border-slate-100 dark:border-dark-border/50" />

            {/* 1. Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                1. Information We Collect
              </h2>
              <div className="space-y-3 text-slate-750 dark:text-slate-300">
                <p>We only collect information that is necessary to provide and improve our services:</p>
                <ul className="list-disc list-inside pl-4 space-y-2 font-medium">
                  <li>
                    <strong className="text-slate-900 dark:text-white">Account Details:</strong> When you sign up or log in via Supabase, we collect details such as your email address and profile name to manage your dashboard and listing submittals.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">User-submitted Listings & Reviews:</strong> Any information you submit when adding a local business (name, contact, address, hours, photos) or posting reviews becomes public.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Location Data:</strong> To calculate straight-line and route distance to local businesses, we may ask for your device's GPS coordinates. 
                    <span className="text-indigo-650 dark:text-indigo-405 block mt-1 text-xs sm:text-sm font-bold">
                      Note: Your coordinates are processed entirely inside your browser (client-side) to calculate distances and are NEVER stored on our servers.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-2 text-slate-750 dark:text-slate-300">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside pl-4 space-y-2 font-medium">
                  <li>To provide, operate, and maintain the Ghatal Guide directory.</li>
                  <li>To verify user submissions and prevent spam or crawl attacks.</li>
                  <li>To process distance requests (using temporary location coordinates).</li>
                  <li>To send security codes or login authentication links via Supabase.</li>
                </ul>
              </div>
            </section>

            {/* 3. Cookies and Local Storage */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                3. Cookies and Local Storage
              </h2>
              <div className="space-y-2 text-slate-750 dark:text-slate-300">
                <p>
                  Ghatal Guide uses local storage and cookies to save preferences and sessions:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 font-medium">
                  <li>
                    <strong className="text-slate-900 dark:text-white">Authentication:</strong> Supabase uses local storage tokens to keep you logged in securely between browser sessions.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">User Preferences:</strong> We use local storage to remember user interface settings, such as Dark Mode or Language selection.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Third-Party Analytics:</strong> We may integrate services like Google Analytics which use standard cookies to help us evaluate site traffic patterns and optimize speeds.
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. Data Security */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                4. Data Security
              </h2>
              <p className="font-medium text-slate-750 dark:text-slate-300">
                We prioritize data safety. Ghatal Guide leverages Supabase backend security systems and strict SSL encryption. While we implement standard industry precautions, please note that no method of transmission over the internet is 100% secure, and we cannot guarantee absolute data safety.
              </p>
            </section>

            {/* 5. Sharing of Information */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                5. Third-Party Services
              </h2>
              <p className="font-medium text-slate-750 dark:text-slate-300">
                We do not sell or lease your personal data. We utilize trusted third-party providers to execute backend features:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 font-medium text-slate-750 dark:text-slate-300">
                <li><strong className="text-slate-900 dark:text-white">Supabase:</strong> For cloud database management and secure user authentication.</li>
                <li><strong className="text-slate-900 dark:text-white">Ola Maps:</strong> To resolve geographic route routing and coordinates query.</li>
              </ul>
            </section>

            <hr className="border-slate-100 dark:border-dark-border/50" />

            {/* Contact Us */}
            <section className="space-y-4 bg-slate-50 dark:bg-dark-bg/60 p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Contact Us
              </h3>
              <p className="font-medium text-sm text-slate-700 dark:text-slate-300">
                If you have any questions or suggestions regarding this Privacy Policy, or want to request account or business listing removal, please contact us:
              </p>
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                <p>Email: <a href="mailto:support.ghatalguide@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">support.ghatalguide@gmail.com</a></p>
                <p>Paschim Medinipur, West Bengal, India</p>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
