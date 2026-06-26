"use client";
import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { FileText, ShieldAlert, Scale, Edit3, HelpCircle, Mail, Globe } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow pt-24 pb-12 lg:pt-32 lg:pb-20 relative z-10">
        <div className="container-perfect max-w-4xl">
          
          {/* Header */}
          <div className="mb-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 mb-2">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Terms of Service
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider select-none">
              Last Updated: June 26, 2026
            </p>
          </div>

          {/* Terms Body */}
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-200 dark:border-dark-border/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm lg:text-base leading-relaxed text-slate-800 dark:text-slate-200">
            
            {/* Intro */}
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Welcome to <strong>Ghatal Guide</strong>. By accessing or using our website (ghatalguide.netlify.app), you agree to comply with and be bound by the following Terms of Service. Please read them carefully before using our platform.
            </p>

            <hr className="border-slate-100 dark:border-dark-border/50" />

            {/* 1. Acceptance of Terms */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                1. Acceptance of Terms
              </h2>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                By browsing, accessing, registering, or submitting listings on Ghatal Guide, you agree to these Terms of Service. If you do not agree to any part of these terms, you must discontinue your use of our platform immediately.
              </p>
            </section>

            {/* 2. Platform Purpose & Submissions */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                2. User-Submitted Content & Submissions
              </h2>
              <div className="space-y-3 text-slate-705 dark:text-slate-300">
                <p>
                  Ghatal Guide allows registered users to add business listings, services, and submit ratings or reviews.
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 font-medium">
                  <li>
                    <strong className="text-slate-900 dark:text-white">Accuracy:</strong> You agree that any information you submit (including business name, phone number, location details, opening hours) is accurate, up-to-date, and truthful.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Content Guidelines:</strong> You must not post reviews, comments, or business details that are defamatory, abusive, offensive, misleading, or spam.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Moderation:</strong> We reserve the right, at our absolute discretion, to edit, delete, or suspend any listing or review that violates our community standards without prior notice.
                  </li>
                </ul>
              </div>
            </section>

            {/* 3. Prohibited Conduct */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                3. Prohibited Activities
              </h2>
              <div className="space-y-2 text-slate-705 dark:text-slate-300">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside pl-4 space-y-2 font-medium">
                  <li>Use automated bots or scripts to scrape listing coordinates, reviews, or phone numbers.</li>
                  <li>Submit fake, fraudulent, or duplicate listings to manipulate directory search results.</li>
                  <li>Alter dynamic URLs (including the token security system) to execute crawl or denial-of-service attacks.</li>
                  <li>Impersonate local business owners or representatives.</li>
                </ul>
              </div>
            </section>

            {/* 4. Limitation of Liability */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                4. Disclaimer of Liability
              </h2>
              <div className="space-y-3 font-medium text-slate-705 dark:text-slate-300">
                <p>
                  Ghatal Guide is an open city companion and business directory. We do not operate or control any of the third-party businesses, doctor clinics, hospitals, or transportation services listed on our platform.
                </p>
                <p>
                  We strive to keep listings correct, but we make no warranties about the absolute accuracy, completeness, or reliability of any phone number, address, route distance, clinic timing, or pricing details.
                </p>
                <p className="text-amber-600 dark:text-amber-400 font-black">
                  Any agreement or interaction between you and a local service provider or business is solely at your own risk. Ghatal Guide will not be held liable for any damages or issues arising from these transactions.
                </p>
              </div>
            </section>

            {/* 5. Service Modification */}
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                5. Changes and Termination
              </h2>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                We reserve the right to modify, restrict, or suspend Ghatal Guide services, databases, or API systems (including distance routing proxies) at any time. We also reserve the right to amend these terms, and your continued usage after changes are posted constitutes acceptance.
              </p>
            </section>

            <hr className="border-slate-100 dark:border-dark-border/50" />

            {/* Contact Information */}
            <section className="space-y-4 bg-slate-50 dark:bg-dark-bg/60 p-6 rounded-2xl border border-slate-100 dark:border-dark-border/40">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Inquiries & Feedback
              </h3>
              <p className="font-medium text-sm text-slate-700 dark:text-slate-300">
                If you have questions about these terms or wish to report content violations, please contact us:
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
