// supabaseClient.js

// Supabase লাইব্রেরি থেকে createClient ফাংশন ইম্পোর্ট করা হচ্ছে
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// আপনার Supabase প্রজেক্টের URL এবং Anon Key এখানে যোগ করুন
const supabaseUrl = 'https://gfdfhonfpbvyeogoqwbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZGZob25mcGJ2eWVvZ29xd2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIwNDEsImV4cCI6MjA3ODk0ODA0MX0.G1J0UKxzLlQ8Dr8jyjisqOqUvhk2yC07h1ko4-ThRtw';

// Supabase ক্লায়েন্ট তৈরি এবং এক্সপোর্ট করা হচ্ছে যাতে অন্য ফাইল থেকে import করা যায়
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
