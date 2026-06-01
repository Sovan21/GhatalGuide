import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// আপনার নতুন প্রজেক্টের ক্রেডেনশিয়াল
const supabaseUrl = 'https://gfdfhonfpbvyeogoqwbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZGZob25mcGJ2eWVvZ29xd2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIwNDEsImV4cCI6MjA3ODk0ODA0MX0.G1J0UKxzLlQ8Dr8jyjisqOqUvhk2yC07h1ko4-ThRtw';

// Supabase ক্লায়েন্ট তৈরি (আলাদা স্টোরেজ কী বা বাক্স সহ)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-admin-auth-token', // এই লাইনটি অ্যাডমিনের সেশন আলাদা রাখবে
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});