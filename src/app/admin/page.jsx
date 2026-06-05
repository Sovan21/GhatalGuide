"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/adminSupabaseClient";
import { 
  ShieldAlert, Check, X, Trash2, LayoutDashboard, Database, MessageSquare, LogOut, Star, Clock, 
  Plus, Search, Filter, Edit2, Info, Calendar, MapPin, Briefcase, User, Eye, EyeOff, Train, 
  Bus, Settings, Activity, Utensils, ShoppingBag, Wrench, GraduationCap, Copy, ChevronRight, 
  Moon, Sun, HelpCircle, FileText, ChevronLeft, Menu, Bell, Compass
} from "lucide-react";

// Categories definition
const categories = {
  health: { name: "Health & Wellness", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  food: { name: "Food & Dining", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
  shopping: { name: "Shopping", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  services: { name: "Local Services", icon: Wrench, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
  education: { name: "Education", icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
  emergency: { name: "Emergency", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" }
};

// Map subcategory to specific business name label
const getBusinessNameLabel = (subcategory) => {
  const labelMap = {
    'Hospitals': 'Hospital Name',
    'Doctors': 'Doctor Name',
    'Pharmacy': 'Pharmacy Name',
    'Restaurants': 'Restaurant Name',
    'Cafes': 'Cafe Name',
    'Sweets': 'Sweet Shop Name',
    'Desserts': 'Dessert Shop Name',
    'Apparel': 'Store Name',
    'Electronics': 'Store Name',
    'Groceries': 'Store Name',
    'Book Store': 'Book Store Name',
    'Electricians': 'Service Provider Name',
    'Plumbers': 'Service Provider Name',
    'Mechanics': 'Service Provider Name',
    'Schools': 'School Name',
    'Colleges': 'College Name',
    'Coaching Centers': 'Institute Name',
    'Blood Banks': 'Blood Bank Name'
  };
  return labelMap[subcategory] || 'Business Name';
};

// Extract Lat/Lng from Google Maps link
const extractLatLngFromGoogleMapsLink = (url) => {
  if (!url) return { lat: null, lng: null };
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match && match.length >= 3) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  return { lat: null, lng: null };
};

// Generate slug for blog posts
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function AdminDashboard() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Active view states
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'listings', 'reviews', 'blog', 'jobs', 'events', 'transportation'
  const [listingsFilter, setListingsFilter] = useState("pending_review"); // 'pending_review', 'approved', 'rejected', 'feature_requests'
  const [reviewsFilter, setReviewsFilter] = useState("pending"); // 'pending', 'approved', 'rejected'
  const [postsFilter, setPostsFilter] = useState("published"); // 'published', 'draft'
  const [jobsFilter, setJobsFilter] = useState("active"); // 'active', 'expired'
  const [eventsFilter, setEventsFilter] = useState("published"); // 'published', 'draft'
  const [transportType, setTransportType] = useState("trains"); // 'trains', 'buses', 'toto_routes'

  // Search states
  const [listingsSearch, setListingsSearch] = useState("");
  const [reviewsSearch, setReviewsSearch] = useState("");
  const [postsSearch, setPostsSearch] = useState("");
  const [jobsSearch, setJobsSearch] = useState("");
  const [eventsSearch, setEventsSearch] = useState("");
  const [transportSearch, setTransportSearch] = useState("");

  // Filters & Sorting for Listings
  const [listingsCategory, setListingsCategory] = useState("all");
  const [listingsSort, setListingsSort] = useState("newest");

  // Selection states (for bulk actions)
  const [selectedListingIds, setSelectedListingIds] = useState([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState([]);

  // Data states
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [trains, setTrains] = useState([]);
  const [buses, setBuses] = useState([]);
  const [totoRoutes, setTotoRoutes] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  // Toast Notification State
  const [toastList, setToastList] = useState([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    showReasonInput: false,
    reasonValue: "",
    onConfirm: null
  });

  // Modal forms states
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);
  const [addListingData, setAddListingData] = useState({
    name: "", category: "health", subcategory: "Hospitals", phone: "", address: "", 
    googleMapLink: "", description: "", image: "",
    opening_hours: { status: "open_24_7", hours: null }
  });
  const [addListingImageFile, setAddListingImageFile] = useState(null);
  const [addListingImagePreview, setAddListingImagePreview] = useState("");

  const [editListingModalOpen, setEditListingModalOpen] = useState(false);
  const [editListingData, setEditListingData] = useState(null);
  const [editListingImageFile, setEditListingImageFile] = useState(null);
  const [editListingImagePreview, setEditListingImagePreview] = useState("");

  const [editReviewModalOpen, setEditReviewModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null);

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalData, setPostModalData] = useState({
    id: null, title: "", slug: "", content: "", author_name: "Admin", featured_image_url: "", status: "published"
  });

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobModalData, setJobModalData] = useState({
    id: null, job_title: "", company_name: "", location: "", description: "", requirements: "", contact_details: "", job_type: "Full-time", salary_range: "", status: "active"
  });

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState({
    id: null, title: "", date: "", time: "", location: "", description: "", category: "", status: "published"
  });

  const [transportModalOpen, setTransportModalOpen] = useState(false);
  const [transportModalType, setTransportModalType] = useState("trains");
  const [transportModalData, setTransportModalData] = useState({});

  // Trigger Toast Notification helper
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToastList(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastList(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Trigger Confirmation Modal helper
  const triggerConfirm = ({ title, message, type = "danger", showReasonInput = false, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      showReasonInput,
      reasonValue: "",
      onConfirm
    });
  };

  // Monitor Admin Session & Theme
  useEffect(() => {
    // Session load
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setIsAdminLoggedIn(true);
          setAdminUser(session.user);
          loadAllAdminData();
        }
      })
      .catch((e) => {
        console.warn("Failed to retrieve auth session:", e);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAdminLoggedIn(true);
        setAdminUser(session.user);
        loadAllAdminData();
      } else {
        setIsAdminLoggedIn(false);
        setAdminUser(null);
      }
    });

    // Dark Mode load
    const savedTheme = localStorage.getItem("adminDarkMode");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const darkEnabled = savedTheme === "true" || (savedTheme === null && systemDark);
    setIsDarkMode(darkEnabled);
    if (darkEnabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem("adminDarkMode", String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add("dark");
      showToast("Switched to Dark Mode", "info");
    } else {
      document.documentElement.classList.remove("dark");
      showToast("Switched to Light Mode", "info");
    }
  };

  // Fetch all tables with individual try-catch blocks
  const loadAllAdminData = async () => {
    setLoadingData(true);
    
    // Fetch Listings
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        setListings(data);
        const userIds = [...new Set(data.map(l => l.user_id).filter(id => id))];
        if (userIds.length > 0) {
          const { data: users, error: userErr } = await supabase
            .from("users")
            .select("id, email")
            .in("id", userIds);
          if (!userErr && users) {
            const emailMap = {};
            users.forEach(u => { emailMap[u.id] = u.email; });
            setUserEmails(emailMap);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load listings:", e.message);
    }

    // Fetch Reviews
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setReviews(data);
    } catch (e) {
      console.warn("Failed to load reviews:", e.message);
    }

    // Fetch Blog Posts
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setPosts(data);
    } catch (e) {
      console.warn("Failed to load blog posts:", e.message);
    }

    // Fetch Jobs
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setJobs(data);
    } catch (e) {
      console.warn("Failed to load jobs:", e.message);
    }

    // Fetch Events
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setEvents(data);
    } catch (e) {
      console.warn("Failed to load events:", e.message);
    }

    // Fetch Trains
    try {
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setTrains(data);
    } catch (e) {
      console.warn("Failed to load trains:", e.message);
    }

    // Fetch Buses
    try {
      const { data, error } = await supabase
        .from("buses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setBuses(data);
    } catch (e) {
      console.warn("Failed to load buses:", e.message);
    }

    // Fetch Toto Routes
    try {
      const { data, error } = await supabase
        .from("toto_routes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setTotoRoutes(data);
    } catch (e) {
      console.warn("Failed to load toto routes:", e.message);
    }

    setLoadingData(false);
  };

  // Auth Operations
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      if (error) throw error;
      
      const user = data.user;
      const isAdminRole = user?.user_metadata?.role === "admin" || user?.email?.endsWith("@ghatalguide.com") || user?.email === "shovaxxx@gmail.com";
      
      if (!isAdminRole) {
        await supabase.auth.signOut();
        throw new Error("Access denied: You are not authorized as an administrator.");
      }
      
      setIsAdminLoggedIn(true);
      setAdminUser(user);
      showToast("Access Granted. Welcome Admin", "success");
      loadAllAdminData();
    } catch (err) {
      setLoginError(err.message || "Login failed");
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    showToast("Logged out successfully", "info");
  };

  // Image Upload helper
  const handleImageUpload = async (file) => {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    try {
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(data.path);
      return publicUrl;
    } catch (err) {
      showToast(`Image upload failed: ${err.message}`, "error");
      return null;
    }
  };

  // Image Deletion helper
  const handleImageDelete = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('listing-images')) return;
    try {
      const bucketName = 'listing-images';
      const fileName = imageUrl.substring(imageUrl.lastIndexOf(bucketName) + bucketName.length + 1);
      await supabase.storage.from(bucketName).remove([fileName]);
    } catch (err) {
      console.warn("Failed to delete old image:", err.message);
    }
  };

  // --- LISTINGS CRUD HANDLERS ---
  const handleListingStatusUpdate = async (id, status, reason = null) => {
    try {
      const updatePayload = { status };
      if (status === "rejected" && reason) {
        updatePayload.rejection_reason = reason;
      }
      const { error } = await supabase
        .from("listings")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw error;
      
      setListings(prev => prev.map(l => l.id === id ? { ...l, ...updatePayload } : l));
      showToast(`Listing status updated to ${status}!`, "success");
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, "error");
    }
  };

  const handleListingDelete = async (id) => {
    try {
      const listingToDelete = listings.find(l => l.id === id);
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      
      if (listingToDelete?.image) {
        await handleImageDelete(listingToDelete.image);
      }
      setListings(prev => prev.filter(l => l.id !== id));
      showToast("Listing deleted successfully!", "success");
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      const nextVal = !currentVal;
      const { error } = await supabase
        .from("listings")
        .update({ is_featured: nextVal })
        .eq("id", id);
      if (error) throw error;
      
      setListings(prev => prev.map(l => l.id === id ? { ...l, is_featured: nextVal } : l));
      showToast(`Listing is now ${nextVal ? 'Featured' : 'Standard'}!`, "success");
    } catch (err) {
      showToast(`Feature toggle failed: ${err.message}`, "error");
    }
  };

  const handleFeatureRequestUpdate = async (id, shouldApprove) => {
    try {
      const updateData = {
        is_featured: shouldApprove,
        feature_status: shouldApprove ? 'active' : 'denied'
      };
      const { error } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;

      setListings(prev => prev.map(l => l.id === id ? { ...l, ...updateData } : l));
      showToast(shouldApprove ? "Feature request approved!" : "Feature request denied.", "success");
    } catch (err) {
      showToast(`Feature update failed: ${err.message}`, "error");
    }
  };

  const handleBulkListingStatus = async (status, reason = null) => {
    if (selectedListingIds.length === 0) return;
    try {
      const updatePayload = { status };
      if (status === "rejected" && reason) {
        updatePayload.rejection_reason = reason;
      }
      const { error } = await supabase
        .from("listings")
        .update(updatePayload)
        .in("id", selectedListingIds);
      if (error) throw error;

      setListings(prev => prev.map(l => selectedListingIds.includes(l.id) ? { ...l, ...updatePayload } : l));
      setSelectedListingIds([]);
      showToast(`Bulk updated ${selectedListingIds.length} listings to ${status}!`, "success");
    } catch (err) {
      showToast(`Bulk status update failed: ${err.message}`, "error");
    }
  };

  const handleBulkListingDelete = async () => {
    if (selectedListingIds.length === 0) return;
    try {
      const imagesToDelete = listings.filter(l => selectedListingIds.includes(l.id)).map(l => l.image).filter(img => img);
      const { error } = await supabase.from("listings").delete().in("id", selectedListingIds);
      if (error) throw error;

      for (const img of imagesToDelete) {
        await handleImageDelete(img);
      }
      setListings(prev => prev.filter(l => !selectedListingIds.includes(l.id)));
      setSelectedListingIds([]);
      showToast(`Bulk deleted ${selectedListingIds.length} listings!`, "success");
    } catch (err) {
      showToast(`Bulk delete failed: ${err.message}`, "error");
    }
  };

  const handleSaveAddListing = async (e) => {
    e.preventDefault();
    if (!addListingData.name || !addListingData.phone || !addListingData.address) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      let imageUrl = "";
      if (addListingImageFile) {
        imageUrl = await handleImageUpload(addListingImageFile);
      }

      // Extract coordinates
      let lat = null, lng = null;
      if (addListingData.googleMapLink) {
        const coords = extractLatLngFromGoogleMapsLink(addListingData.googleMapLink);
        lat = coords.lat;
        lng = coords.lng;
      }

      const newListing = {
        name: addListingData.name,
        category: addListingData.category,
        subcategory: addListingData.subcategory,
        phone: addListingData.phone,
        address: addListingData.address,
        googleMapLink: addListingData.googleMapLink || null,
        lat,
        lng,
        image: imageUrl || null,
        description: addListingData.description || null,
        status: "pending_review",
        opening_hours: addListingData.opening_hours
      };

      const { data, error } = await supabase.from("listings").insert([newListing]).select().single();
      if (error) throw error;

      if (data) {
        setListings(prev => [data, ...prev]);
        showToast("New listing created successfully!", "success");
        setAddListingModalOpen(false);
        setAddListingData({
          name: "", category: "health", subcategory: "Hospitals", phone: "", address: "", 
          googleMapLink: "", description: "", image: "",
          opening_hours: { status: "open_24_7", hours: null }
        });
        setAddListingImageFile(null);
        setAddListingImagePreview("");
      }
    } catch (err) {
      showToast(`Creation failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSaveEditListing = async (e) => {
    e.preventDefault();
    if (!editListingData.name || !editListingData.phone || !editListingData.address) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      let imageUrl = editListingData.image;
      if (editListingImageFile) {
        imageUrl = await handleImageUpload(editListingImageFile);
        if (editListingData.image && imageUrl) {
          await handleImageDelete(editListingData.image);
        }
      }

      // Extract coordinates
      let lat = editListingData.lat, lng = editListingData.lng;
      if (editListingData.googleMapLink) {
        const coords = extractLatLngFromGoogleMapsLink(editListingData.googleMapLink);
        if (coords.lat !== null && coords.lng !== null) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      const updatedPayload = {
        name: editListingData.name,
        category: editListingData.category,
        subcategory: editListingData.subcategory,
        phone: editListingData.phone,
        address: editListingData.address,
        googleMapLink: editListingData.googleMapLink || null,
        lat,
        lng,
        image: imageUrl || null,
        description: editListingData.description || null,
        opening_hours: editListingData.opening_hours
      };

      const { error } = await supabase
        .from("listings")
        .update(updatedPayload)
        .eq("id", editListingData.id);
      if (error) throw error;

      setListings(prev => prev.map(l => l.id === editListingData.id ? { ...l, ...updatedPayload } : l));
      showToast("Listing changes saved successfully!", "success");
      setEditListingModalOpen(false);
      setEditListingImageFile(null);
      setEditListingImagePreview("");
    } catch (err) {
      showToast(`Edit failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- REVIEWS CRUD HANDLERS ---
  const handleReviewStatusUpdate = async (id, status) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Review has been ${status}!`, "success");
    } catch (err) {
      showToast(`Failed to update review status: ${err.message}`, "error");
    }
  };

  const handleReviewDelete = async (id) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== id));
      showToast("Review permanently deleted!", "success");
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleBulkReviewStatus = async (status) => {
    if (selectedReviewIds.length === 0) return;
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status })
        .in("id", selectedReviewIds);
      if (error) throw error;

      setReviews(prev => prev.map(r => selectedReviewIds.includes(r.id) ? { ...r, status } : r));
      setSelectedReviewIds([]);
      showToast(`Bulk updated ${selectedReviewIds.length} reviews to ${status}!`, "success");
    } catch (err) {
      showToast(`Bulk review status update failed: ${err.message}`, "error");
    }
  };

  const handleBulkReviewDelete = async () => {
    if (selectedReviewIds.length === 0) return;
    try {
      const { error } = await supabase.from("reviews").delete().in("id", selectedReviewIds);
      if (error) throw error;

      setReviews(prev => prev.filter(r => !selectedReviewIds.includes(r.id)));
      setSelectedReviewIds([]);
      showToast(`Bulk deleted ${selectedReviewIds.length} reviews!`, "success");
    } catch (err) {
      showToast(`Bulk review delete failed: ${err.message}`, "error");
    }
  };

  const handleSaveReviewChanges = async (e) => {
    e.preventDefault();
    if (!editReviewData.user_name || !editReviewData.comment) {
      showToast("User name and review content cannot be empty", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const updateData = {
        user_name: editReviewData.user_name,
        comment: editReviewData.comment,
        rating: parseInt(editReviewData.rating, 10)
      };

      const { error } = await supabase
        .from("reviews")
        .update(updateData)
        .eq("id", editReviewData.id);
      if (error) throw error;

      setReviews(prev => prev.map(r => r.id === editReviewData.id ? { ...r, ...updateData } : r));
      showToast("Review changes saved successfully!", "success");
      setEditReviewModalOpen(false);
    } catch (err) {
      showToast(`Save review failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- BLOG CRUD HANDLERS ---
  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postModalData.title || !postModalData.slug || !postModalData.content) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const payload = {
        title: postModalData.title,
        slug: postModalData.slug,
        content: postModalData.content,
        author_name: postModalData.author_name || "Admin",
        featured_image_url: postModalData.featured_image_url || null,
        status: postModalData.status
      };

      if (postModalData.id) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", postModalData.id);
        if (error) throw error;
        setPosts(prev => prev.map(p => p.id === postModalData.id ? { ...p, ...payload } : p));
        showToast("Blog post updated successfully!", "success");
      } else {
        const { data, error } = await supabase.from("posts").insert([payload]).select().single();
        if (error) throw error;
        if (data) {
          setPosts(prev => [data, ...prev]);
          showToast("Blog post published successfully!", "success");
        }
      }
      setPostModalOpen(false);
    } catch (err) {
      showToast(`Save blog post failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePostDelete = async (id) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== id));
      showToast("Blog post deleted successfully!", "success");
    } catch (err) {
      showToast(`Delete post failed: ${err.message}`, "error");
    }
  };

  // --- JOBS CRUD HANDLERS ---
  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobModalData.job_title || !jobModalData.company_name || !jobModalData.location || !jobModalData.contact_details) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const payload = {
        job_title: jobModalData.job_title,
        company_name: jobModalData.company_name,
        location: jobModalData.location,
        description: jobModalData.description || null,
        requirements: jobModalData.requirements || null,
        contact_details: jobModalData.contact_details,
        job_type: jobModalData.job_type,
        salary_range: jobModalData.salary_range || null,
        status: jobModalData.status
      };

      if (jobModalData.id) {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", jobModalData.id);
        if (error) throw error;
        setJobs(prev => prev.map(j => j.id === jobModalData.id ? { ...j, ...payload } : j));
        showToast("Job posting updated successfully!", "success");
      } else {
        const { data, error } = await supabase.from("jobs").insert([payload]).select().single();
        if (error) throw error;
        if (data) {
          setJobs(prev => [data, ...prev]);
          showToast("Job posting published successfully!", "success");
        }
      }
      setJobModalOpen(false);
    } catch (err) {
      showToast(`Save job failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleJobDelete = async (id) => {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;

      setJobs(prev => prev.filter(j => j.id !== id));
      showToast("Job posting deleted successfully!", "success");
    } catch (err) {
      showToast(`Delete job failed: ${err.message}`, "error");
    }
  };

  // --- EVENTS CRUD HANDLERS ---
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventModalData.title || !eventModalData.date || !eventModalData.time || !eventModalData.location) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const payload = {
        title: eventModalData.title,
        date: eventModalData.date,
        time: eventModalData.time,
        location: eventModalData.location,
        description: eventModalData.description || null,
        category: eventModalData.category || null,
        status: eventModalData.status
      };

      if (eventModalData.id) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", eventModalData.id);
        if (error) throw error;
        setEvents(prev => prev.map(ev => ev.id === eventModalData.id ? { ...ev, ...payload } : ev));
        showToast("Event updated successfully!", "success");
      } else {
        const { data, error } = await supabase.from("events").insert([payload]).select().single();
        if (error) throw error;
        if (data) {
          setEvents(prev => [data, ...prev]);
          showToast("Event published successfully!", "success");
        }
      }
      setEventModalOpen(false);
    } catch (err) {
      showToast(`Save event failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEventDelete = async (id) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;

      setEvents(prev => prev.filter(ev => ev.id !== id));
      showToast("Event deleted successfully!", "success");
    } catch (err) {
      showToast(`Delete event failed: ${err.message}`, "error");
    }
  };

  // --- TRANSPORTATION CRUD HANDLERS ---
  const handleSaveTransport = async (e) => {
    e.preventDefault();
    if (transportModalType === "trains" && (!transportModalData.name || !transportModalData.from_station || !transportModalData.to_station || !transportModalData.time || !transportModalData.platform || !transportModalData.days)) {
      showToast("Please fill all fields", "error"); return;
    }
    if (transportModalType === "buses" && (!transportModalData.route || !transportModalData.frequency || !transportModalData.first_bus || !transportModalData.last_bus)) {
      showToast("Please fill all fields", "error"); return;
    }
    if (transportModalType === "toto_routes" && (!transportModalData.route || !transportModalData.fare)) {
      showToast("Please fill all fields", "error"); return;
    }

    setLoginLoading(true);
    try {
      const payload = { ...transportModalData };
      delete payload.id;
      delete payload.created_at;

      let res;
      if (transportModalData.id) {
        res = await supabase.from(transportModalType).update(payload).eq("id", transportModalData.id);
        if (res.error) throw res.error;
        
        const updatedItem = { id: transportModalData.id, ...payload };
        if (transportModalType === "trains") setTrains(prev => prev.map(t => t.id === transportModalData.id ? updatedItem : t));
        if (transportModalType === "buses") setBuses(prev => prev.map(b => b.id === transportModalData.id ? updatedItem : b));
        if (transportModalType === "toto_routes") setTotoRoutes(prev => prev.map(tr => tr.id === transportModalData.id ? updatedItem : tr));
        showToast("Transport item updated successfully!", "success");
      } else {
        res = await supabase.from(transportModalType).insert([payload]).select().single();
        if (res.error && res.error.message.toLowerCase().includes("policy")) {
          try {
            const rpcRes = await supabase.rpc('admin_insert_transport', {
              table_name: transportModalType,
              item_data: payload
            });
            if (rpcRes.error) throw rpcRes.error;
            res = rpcRes;
          } catch (e) {
            throw new Error(`RPC Insertion failed: ${e.message}`);
          }
        } else if (res.error) {
          throw res.error;
        }

        const dataItem = res.data;
        if (dataItem) {
          if (transportModalType === "trains") setTrains(prev => [dataItem, ...prev]);
          if (transportModalType === "buses") setBuses(prev => [dataItem, ...prev]);
          if (transportModalType === "toto_routes") setTotoRoutes(prev => [dataItem, ...prev]);
        } else {
          loadAllAdminData();
        }
        showToast("Transport item created successfully!", "success");
      }
      setTransportModalOpen(false);
    } catch (err) {
      showToast(`Save transport item failed: ${err.message}`, "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTransportDelete = async (type, id) => {
    try {
      const { error } = await supabase.from(type).delete().eq("id", id);
      if (error) throw error;

      if (type === "trains") setTrains(prev => prev.filter(t => t.id !== id));
      if (type === "buses") setBuses(prev => prev.filter(b => b.id !== id));
      if (type === "toto_routes") setTotoRoutes(prev => prev.filter(tr => tr.id !== id));
      showToast("Transport item deleted successfully!", "success");
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, "error");
    }
  };

  // Dynamic values calculation for Charts & Stats
  const stats = {
    totalListings: listings.length,
    approvedListings: listings.filter(l => l.status === "approved").length,
    pendingListings: listings.filter(l => l.status === "pending_review").length,
    rejectedListings: listings.filter(l => l.status === "rejected").length,
    pendingReviews: reviews.filter(r => r.status === "pending").length,
    approvedReviews: reviews.filter(r => r.status === "approved").length,
    featureRequests: listings.filter(l => l.feature_status === "requested").length,
    publishedBlogs: posts.filter(p => p.status === "published").length,
    draftBlogs: posts.filter(p => p.status === "draft").length,
    activeJobs: jobs.filter(j => j.status === "active").length,
    expiredJobs: jobs.filter(j => j.status === "expired").length,
    publishedEvents: events.filter(e => e.status === "published").length,
    draftEvents: events.filter(e => e.status === "draft").length
  };

  // Helper for Chart 1: Listings by Category (Bar Chart data)
  const getCategoryChartData = () => {
    const counts = {};
    Object.keys(categories).forEach(key => { counts[key] = 0; });
    listings.filter(l => l.status === "approved").forEach(l => {
      if (counts[l.category] !== undefined) counts[l.category]++;
    });
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  };

  // Helper for Chart 3: Daily Submissions (Line Chart data last 30 days)
  const getSubmissionsChartData = () => {
    const dailyCounts = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }
    listings.forEach(l => {
      const dateStr = new Date(l.created_at).toISOString().split('T')[0];
      if (dailyCounts[dateStr] !== undefined) {
        dailyCounts[dateStr]++;
      }
    });
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Custom SVG Bar Chart component
  const SVGBarChart = () => {
    const data = getCategoryChartData();
    const maxCount = Math.max(...data.map(d => d.count), 1);
    
    return (
      <div className="space-y-4">
        {data.map(({ category, count }) => {
          const cat = categories[category];
          const pct = (count / maxCount) * 100;
          const Icon = cat.icon;
          
          return (
            <div key={category} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-550 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <span className={`p-1 rounded-lg ${cat.bg} ${cat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-slate-700 dark:text-slate-350">{cat.name}</span>
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">{count}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-dark-bg h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-dark-border/40">
                <div
                  className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom SVG Donut Chart component
  const SVGDonutChart = () => {
    const pending = reviews.filter(r => r.status === "pending").length;
    const approved = reviews.filter(r => r.status === "approved").length;
    const rejected = reviews.filter(r => r.status === "rejected").length;
    const total = pending + approved + rejected || 1;
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const approvedStroke = (approved / total) * circumference;
    const pendingStroke = (pending / total) * circumference;
    const rejectedStroke = (rejected / total) * circumference;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="transparent"
              stroke="#10b981" strokeWidth="10"
              strokeDasharray={`${approvedStroke} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            <circle
              cx="60" cy="60" r={radius} fill="transparent"
              stroke="#3b82f6" strokeWidth="10"
              strokeDasharray={`${pendingStroke} ${circumference}`}
              strokeDashoffset={`-${approvedStroke}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            <circle
              cx="60" cy="60" r={radius} fill="transparent"
              stroke="#ef4444" strokeWidth="10"
              strokeDasharray={`${rejectedStroke} ${circumference}`}
              strokeDashoffset={`-${approvedStroke + pendingStroke}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-950 dark:text-white">{pending+approved+rejected}</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reviews</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-xs font-bold w-full max-w-[150px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Approved</span>
            </span>
            <span className="text-slate-900 dark:text-white font-extrabold">{approved}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Pending</span>
            </span>
            <span className="text-slate-900 dark:text-white font-extrabold">{pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Rejected</span>
            </span>
            <span className="text-slate-900 dark:text-white font-extrabold">{rejected}</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom SVG Line Chart component
  const SVGLineChart = () => {
    const data = getSubmissionsChartData();
    if (data.length === 0) return <div className="text-center text-xs py-10">No submission history found</div>;
    
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const width = 500;
    const height = 150;
    const padding = 12;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - (item.count / maxCount) * (height - 2 * padding);
      return { x, y, count: item.count, date: item.date };
    });

    const pathD = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';
      
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <div className="space-y-3">
        <div className="relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(148, 163, 184, 0.06)" strokeWidth="1" strokeDasharray="3 3" />
            {areaD && <path d={areaD} fill="url(#lineGrad)" className="transition-all duration-700" />}
            {pathD && <path d={pathD} fill="transparent" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="transition-all duration-700 animate-draw" />}
            {points.map((p, idx) => (
              <g key={idx} className="group">
                <circle
                  cx={p.x} cy={p.y} r="3"
                  className="fill-primary-500 stroke-white dark:stroke-dark-card stroke-2 hover:r-5 transition-all duration-150 cursor-pointer"
                />
                <title>{`${new Date(p.date).toLocaleDateString()}: ${p.count} submissions`}</title>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-[9px] font-black text-slate-400 dark:text-slate-555 px-2 uppercase tracking-wider">
          <span>{new Date(data[0]?.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
          <span>{new Date(data[Math.floor(data.length / 2)]?.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
          <span>{new Date(data[data.length - 1]?.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
        </div>
      </div>
    );
  };

  // Helper to trigger listing update status with confirmation modal
  const triggerListingStatusConfirm = (id, nextStatus) => {
    const name = listings.find(l => l.id === id)?.name || "this listing";
    triggerConfirm({
      title: nextStatus === "approved" ? "Approve Listing" : "Reject Listing",
      message: `Are you sure you want to ${nextStatus} "${name}"?`,
      type: nextStatus === "approved" ? "success" : "danger",
      showReasonInput: nextStatus === "rejected",
      onConfirm: (reason) => handleListingStatusUpdate(id, nextStatus, reason)
    });
  };

  const triggerListingDeleteConfirm = (id) => {
    const name = listings.find(l => l.id === id)?.name || "this listing";
    triggerConfirm({
      title: "Delete Listing Permanently",
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: () => handleListingDelete(id)
    });
  };

  // Cascade handler in forms
  const handleFormCategoryChange = (val, formType) => {
    const subcats = categories[val]?.subcategories || [];
    if (formType === "add") {
      setAddListingData(prev => ({
        ...prev,
        category: val,
        subcategory: subcats[0] || ""
      }));
    } else {
      setEditListingData(prev => ({
        ...prev,
        category: val,
        subcategory: subcats[0] || ""
      }));
    }
  };

  // Copy Hours Monday to all days helper
  const handleCopyHours = (formType) => {
    if (formType === "add") {
      const monHours = addListingData.opening_hours.hours?.monday || { open: "", close: "" };
      const newDays = {};
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(d => {
        newDays[d] = { ...monHours };
      });
      setAddListingData(prev => ({
        ...prev,
        opening_hours: { ...prev.opening_hours, hours: newDays }
      }));
      showToast("Copied Monday's hours to all days", "info");
    } else {
      const monHours = editListingData.opening_hours.hours?.monday || { open: "", close: "" };
      const newDays = {};
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(d => {
        newDays[d] = { ...monHours };
      });
      setEditListingData(prev => ({
        ...prev,
        opening_hours: { ...prev.opening_hours, hours: newDays }
      }));
      showToast("Copied Monday's hours to all days", "info");
    }
  };

  // Open Edit Modals
  const openEditListingModal = (listing) => {
    setEditListingData({
      ...listing,
      opening_hours: listing.opening_hours || { status: "open_24_7", hours: null }
    });
    setEditListingImagePreview(listing.image || "");
    setEditListingImageFile(null);
    setEditListingModalOpen(true);
  };

  const openEditReviewModal = (review) => {
    setEditReviewData(review);
    setEditReviewModalOpen(true);
  };

  const openAddPostModal = () => {
    setPostModalData({
      id: null, title: "", slug: "", content: "", author_name: "Admin", featured_image_url: "", status: "published"
    });
    setPostModalOpen(true);
  };

  const openEditPostModal = (post) => {
    setPostModalData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      author_name: post.author_name || "Admin",
      featured_image_url: post.featured_image_url || "",
      status: post.status
    });
    setPostModalOpen(true);
  };

  const openAddJobModal = () => {
    setJobModalData({
      id: null, job_title: "", company_name: "", location: "", description: "", requirements: "", contact_details: "", job_type: "Full-time", salary_range: "", status: "active"
    });
    setJobModalOpen(true);
  };

  const openEditJobModal = (job) => {
    setJobModalData({
      id: job.id,
      job_title: job.job_title,
      company_name: job.company_name,
      location: job.location,
      description: job.description || "",
      requirements: job.requirements || "",
      contact_details: job.contact_details || "",
      job_type: job.job_type || "Full-time",
      salary_range: job.salary_range || "",
      status: job.status
    });
    setJobModalOpen(true);
  };

  const openAddEventModal = () => {
    setEventModalData({
      id: null, title: "", date: "", time: "", location: "", description: "", category: "", status: "published"
    });
    setEventModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEventModalData({
      id: event.id,
      title: event.title,
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      description: event.description || "",
      category: event.category || "",
      status: event.status
    });
    setEventModalOpen(true);
  };

  const openAddTransportModal = (type) => {
    setTransportModalType(type);
    setTransportModalData({});
    setTransportModalOpen(true);
  };

  const openEditTransportModal = (type, item) => {
    setTransportModalType(type);
    setTransportModalData(item);
    setTransportModalOpen(true);
  };

  // Bulk selectors
  const toggleSelectListing = (id) => {
    setSelectedListingIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFilteredListings = (filteredItems) => {
    if (selectedListingIds.length === filteredItems.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredItems.map(item => item.id));
    }
  };

  const toggleSelectReview = (id) => {
    setSelectedReviewIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllFilteredReviews = (filteredItems) => {
    if (selectedReviewIds.length === filteredItems.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(filteredItems.map(item => item.id));
    }
  };

  // Helper search bindings to current view search inputs in top header
  const getActiveTabSearchValue = () => {
    if (activeTab === "listings") return listingsSearch;
    if (activeTab === "reviews") return reviewsSearch;
    if (activeTab === "blog") return postsSearch;
    if (activeTab === "jobs") return jobsSearch;
    if (activeTab === "events") return eventsSearch;
    if (activeTab === "transportation") return transportSearch;
    return "";
  };

  const handleActiveTabSearchChange = (val) => {
    if (activeTab === "listings") setListingsSearch(val);
    if (activeTab === "reviews") setReviewsSearch(val);
    if (activeTab === "blog") setPostsSearch(val);
    if (activeTab === "jobs") setJobsSearch(val);
    if (activeTab === "events") setEventsSearch(val);
    if (activeTab === "transportation") setTransportSearch(val);
  };

  // Get current path route display
  const getBreadcrumbPath = () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    if (activeTab === "listings") return ["Dashboard", "Listings", listingsFilter.replace("_", " ")];
    if (activeTab === "reviews") return ["Dashboard", "Reviews", reviewsFilter];
    if (activeTab === "blog") return ["Dashboard", "Blog Posts", postsFilter];
    if (activeTab === "jobs") return ["Dashboard", "Jobs", jobsFilter];
    if (activeTab === "events") return ["Dashboard", "Events", eventsFilter];
    if (activeTab === "transportation") return ["Dashboard", "Transportation", transportType.replace("_", " ")];
    return ["Dashboard", "Main Overview"];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      <div className="mesh-bg" />

      {/* --- LOGIN SCREEN --- */}
      {!isAdminLoggedIn ? (
        <div className="flex-grow flex items-center justify-center p-4 relative z-10">
          <div className="bg-white/80 dark:bg-dark-card/85 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-200/50 dark:border-dark-border p-8 max-w-md w-full animate-scale-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md rotate-12 transition-transform duration-350 hover:rotate-0">
                <ShieldAlert className="w-8 h-8 text-white -rotate-12 group-hover:rotate-0" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Admin Control Access</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black mt-1">Ghatal Guide Moderations</p>
            </div>
            
            {loginError && (
              <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30 rounded-xl text-xs text-rose-600 dark:text-rose-455 font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Admin Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-all"
                  placeholder="admin@ghatalguide.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-slate-50/50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-3.5 rounded-2xl transition-all shadow-md shadow-rose-500/10 text-sm mt-6 cursor-pointer flex justify-center items-center gap-2"
              >
                {loginLoading ? "Authorizing..." : "Access Control"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* --- PREMIUM SaaS DASHBOARD CONTAINER --- */
        <div className="flex-grow flex relative z-10 w-full overflow-hidden min-h-[calc(100vh-73px)]">
          
          {/* 1. SIDEBAR NAVIGATION */}
          <aside className={`bg-white/80 dark:bg-dark-card/90 backdrop-blur-md border-r border-slate-200/50 dark:border-dark-border flex flex-col justify-between transition-all duration-300 z-30 select-none ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}>
            <div className="flex flex-col gap-6 pt-5">
              {/* Logo block */}
              <div className="px-5 flex items-center justify-between">
                <div className={`flex items-center gap-3 overflow-hidden transition-all ${
                  isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}>
                  <div className="p-2 bg-primary-500 rounded-xl text-white shadow-sm flex-shrink-0">
                    <Compass className="w-4.5 h-4.5 animate-spin-slow" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white text-base tracking-tight whitespace-nowrap">Ghatal Guide</span>
                </div>
                
                {/* Collapse button */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 rounded-lg border border-slate-200/50 dark:border-dark-border/60 bg-slate-50 dark:bg-dark-bg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 transition-all cursor-pointer"
                >
                  {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              </div>

              {/* Sidebar Menu items */}
              <nav className="px-3 space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "listings", label: "Listings", icon: Database, badge: stats.pendingListings },
                  { id: "reviews", label: "Reviews", icon: MessageSquare, badge: stats.pendingReviews },
                  { id: "blog", label: "Blog Posts", icon: FileText },
                  { id: "jobs", label: "Job Postings", icon: Briefcase },
                  { id: "events", label: "Events", icon: Calendar },
                  { id: "transportation", label: "Transportation", icon: Train }
                ].map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all cursor-pointer relative group ${
                        isActive
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/10"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-450 dark:text-slate-500"}`} />
                      
                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap transition-all duration-200">{item.label}</span>
                      )}

                      {/* Pill active left line */}
                      {isActive && !isSidebarCollapsed && (
                        <span className="absolute left-0 top-1/3 bottom-1/3 w-1 bg-white rounded-r" />
                      )}

                      {/* Badge count overlay */}
                      {item.badge > 0 && (
                        <span className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white text-primary-600" : "bg-amber-500 text-white"
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Collapsed Tooltip */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom admin details */}
            <div className="p-3 border-t border-slate-200/50 dark:border-dark-border/60">
              <div className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-dark-bg/40 rounded-2xl overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-primary-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                  {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">Administrator</p>
                    <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 truncate mt-0.5">{adminUser?.email}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* 2. DYNAMIC WORKSPACE COMPONENT */}
          <div className="flex-grow flex flex-col overflow-y-auto">
            
            {/* STICKY FLOATING GLASS HEADER */}
            <header className="glass sticky top-0 z-20 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-dark-border/40">
              {/* Breadcrumb bread trail */}
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 dark:text-slate-500 select-none">
                {getBreadcrumbPath().map((path, idx, arr) => (
                  <React.Fragment key={path}>
                    <span className={idx === arr.length - 1 ? "text-primary-500" : "hover:text-slate-650 dark:hover:text-slate-350"}>
                      {path}
                    </span>
                    {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Sub-tab nested Search Input (compacts content view space) */}
              {activeTab !== "dashboard" && (
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={getActiveTabSearchValue()}
                    onChange={(e) => handleActiveTabSearchChange(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50/50 dark:bg-dark-bg/60 border border-slate-200 dark:border-dark-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  {getActiveTabSearchValue() && (
                    <button
                      onClick={() => handleActiveTabSearchChange("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </header>

            {/* MAIN INNER CONTAINER VIEW */}
            <main className="p-6 md:p-8 flex-grow space-y-8 max-w-6xl w-full mx-auto">
              
              {/* =========================================
                  DASHBOARD TAB PANEL
                 ========================================= */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Modern grid stats bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Approved Listings", count: stats.approvedListings, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/10", icon: Check },
                      { label: "Pending Listings", count: stats.pendingListings, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100/10", icon: Clock, pulse: true },
                      { label: "Pending Reviews", count: stats.pendingReviews, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100/10", icon: MessageSquare },
                      { label: "Approved Reviews", count: stats.approvedReviews, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-100/10", icon: Star },
                      { label: "Total Listings", count: stats.totalListings, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100/10", icon: Database },
                      { label: "Rejected Listings", count: stats.rejectedListings, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-100/10", icon: X }
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-slate-200/50 dark:border-dark-border shadow-sm flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-850"
                        >
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            <p className={`text-3xl font-black mt-1.5 ${stat.color} ${stat.pulse ? "animate-pulse" : ""}`}>
                              {stat.count}
                            </p>
                          </div>
                          <div className={`p-3.5 rounded-2xl border ${stat.bg} ${stat.color}`}>
                            <Icon className="w-5.5 h-5.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2 Column chart section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SVG Listings by category bar chart */}
                    <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">Approved Listings by Category</h3>
                        <SVGBarChart />
                      </div>
                    </div>

                    {/* SVG Reviews status donut chart */}
                    <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">Reviews Status Breakdown</h3>
                        <SVGDonutChart />
                      </div>
                    </div>
                  </div>

                  {/* SVG submissions line chart */}
                  <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Submission Rate Trend</h3>
                    <SVGLineChart />
                  </div>

                  {/* TIMELINE VIEW (Re-organized Recent activities) */}
                  <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Timeline Activity Feed</h3>
                      <span className="text-[10px] font-black text-amber-500 uppercase bg-amber-55/10 px-2 py-0.5 rounded-lg">
                        {listings.filter(l => l.status === "pending_review").length} Moderations Pending
                      </span>
                    </div>

                    {listings.filter(l => l.status === "pending_review").length === 0 ? (
                      <p className="text-xs text-slate-450 dark:text-slate-500 italic py-4">No recent activity requiring moderations.</p>
                    ) : (
                      <div className="relative border-l border-slate-150 dark:border-dark-border ml-3.5 pl-6 space-y-6 py-2">
                        {listings.filter(l => l.status === "pending_review").slice(0, 5).map(listing => (
                          <div key={listing.id} className="relative group">
                            {/* Dot timeline anchor */}
                            <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-amber-550 border-3 border-white dark:border-dark-card ring-4 ring-amber-500/10 group-hover:scale-110 transition-transform" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                  {listing.name}
                                </h4>
                                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                                  Category: <span className="font-bold text-slate-650 dark:text-slate-350">{listing.subcategory || listing.category}</span> &bull; Submitted on {new Date(listing.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => triggerListingStatusConfirm(listing.id, "approved")}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => triggerListingStatusConfirm(listing.id, "rejected")}
                                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* =========================================
                  LISTINGS TAB PANEL
                 ========================================= */}
              {activeTab === "listings" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Businesses Directory</h2>
                    
                    <button
                      onClick={() => {
                        setAddListingData({
                          name: "", category: "health", subcategory: "Hospitals", phone: "", address: "", 
                          googleMapLink: "", description: "", image: "",
                          opening_hours: { status: "open_24_7", hours: null }
                        });
                        setAddListingImageFile(null);
                        setAddListingImagePreview("");
                        setAddListingModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-black px-4.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-primary-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Business</span>
                    </button>
                  </div>

                  {/* Listings header controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div className="relative">
                      <select
                        value={listingsCategory}
                        onChange={(e) => setListingsCategory(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(categories).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
                      </select>
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sorting selector */}
                    <div className="relative">
                      <select
                        value={listingsSort}
                        onChange={(e) => setListingsSort(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="newest">Sort by: Newest First</option>
                        <option value="oldest">Sort by: Oldest First</option>
                        <option value="name_asc">Sort by: Name (A-Z)</option>
                      </select>
                      <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sliding pill sub-tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { filter: "pending_review", label: "Pending", count: stats.pendingListings },
                      { filter: "approved", label: "Approved", count: stats.approvedListings },
                      { filter: "rejected", label: "Rejected", count: stats.rejectedListings },
                      { filter: "feature_requests", label: "Features", count: stats.featureRequests }
                    ].map(tab => (
                      <button
                        key={tab.filter}
                        onClick={() => { setListingsFilter(tab.filter); setSelectedListingIds([]); }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          listingsFilter === tab.filter
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          listingsFilter === tab.filter ? "bg-primary-50 text-primary-655 dark:bg-primary-950/20" : "bg-slate-200 dark:bg-slate-800 text-slate-655"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Listings view builder */}
                  {(() => {
                    let filteredListings = listings;
                    if (listingsFilter === "feature_requests") {
                      filteredListings = filteredListings.filter(l => l.feature_status === "requested");
                    } else {
                      filteredListings = filteredListings.filter(l => l.status === listingsFilter);
                    }
                    if (listingsCategory !== "all") {
                      filteredListings = filteredListings.filter(l => l.category === listingsCategory);
                    }
                    if (listingsSearch) {
                      const searchLower = listingsSearch.toLowerCase();
                      filteredListings = filteredListings.filter(l => 
                        l.name.toLowerCase().includes(searchLower) ||
                        l.address.toLowerCase().includes(searchLower) ||
                        (userEmails[l.user_id] && userEmails[l.user_id].toLowerCase().includes(searchLower))
                      );
                    }
                    if (listingsSort === "oldest") {
                      filteredListings = [...filteredListings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    } else if (listingsSort === "name_asc") {
                      filteredListings = [...filteredListings].sort((a, b) => a.name.localeCompare(b.name));
                    } else {
                      filteredListings = [...filteredListings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    }

                    return (
                      <div className="space-y-4">
                        {/* Bulk Action Header bar */}
                        {filteredListings.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/70 dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => selectAllFilteredListings(filteredListings)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-bg dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border text-[11px] font-black text-slate-655 dark:text-slate-400 cursor-pointer"
                              >
                                {selectedListingIds.length === filteredListings.length ? "Deselect All" : "Select All"}
                              </button>
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                {selectedListingIds.length} listings selected
                              </span>
                            </div>

                            {selectedListingIds.length > 0 && (
                              <div className="flex gap-2">
                                {listingsFilter === "pending_review" && (
                                  <>
                                    <button
                                      onClick={() => triggerConfirm({
                                        title: "Bulk Approve Listings",
                                        message: `Are you sure you want to approve the ${selectedListingIds.length} selected listings?`,
                                        type: "success",
                                        onConfirm: () => handleBulkListingStatus("approved")
                                      })}
                                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                    >
                                      Approve Selected
                                    </button>
                                    <button
                                      onClick={() => triggerConfirm({
                                        title: "Bulk Reject Listings",
                                        message: `Are you sure you want to reject the ${selectedListingIds.length} selected listings?`,
                                        type: "danger",
                                        showReasonInput: true,
                                        onConfirm: (reason) => handleBulkListingStatus("rejected", reason)
                                      })}
                                      className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                    >
                                      Reject Selected
                                    </button>
                                  </>
                                )}

                                {listingsFilter === "rejected" && (
                                  <button
                                    onClick={() => triggerConfirm({
                                      title: "Bulk Approve Listings",
                                      message: `Are you sure you want to approve the ${selectedListingIds.length} selected listings?`,
                                      type: "success",
                                      onConfirm: () => handleBulkListingStatus("approved")
                                    })}
                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                  >
                                    Approve Selected
                                  </button>
                                )}

                                <button
                                  onClick={() => triggerConfirm({
                                    title: "Bulk Delete Listings",
                                    message: `Are you sure you want to permanently delete the ${selectedListingIds.length} selected listings? This cannot be undone.`,
                                    type: "danger",
                                    onConfirm: handleBulkListingDelete
                                  })}
                                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/35 rounded-xl text-xs font-black transition-all cursor-pointer"
                                >
                                  Delete Selected
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Listings Cards Container */}
                        {filteredListings.length === 0 ? (
                          <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                            <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                            <p className="font-bold text-slate-800 dark:text-slate-200">No listings found</p>
                            <p className="text-slate-450 dark:text-slate-500 text-xs mt-1">Refine your categories or search query parameters.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredListings.map(listing => {
                              const isSelected = selectedListingIds.includes(listing.id);
                              const cat = categories[listing.category] || { name: listing.category, icon: HelpCircle, bg: "bg-slate-50", color: "text-slate-500" };
                              const CatIcon = cat.icon;
                              
                              return (
                                <div
                                  key={listing.id}
                                  onClick={() => toggleSelectListing(listing.id)}
                                  className={`group bg-white dark:bg-dark-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-350 flex flex-col cursor-pointer relative ${
                                    isSelected ? "border-primary-500 ring-2 ring-primary-500/25" : "border-slate-200/70 dark:border-dark-border hover:border-slate-350 dark:hover:border-slate-700"
                                  }`}
                                >
                                  {/* Select Checkbox Anchor */}
                                  <div className="absolute top-4 left-4 z-20">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                      isSelected ? "bg-primary-500 border-primary-500 text-white" : "bg-white/90 border-slate-300 dark:bg-dark-card/90 dark:border-dark-border"
                                    }`}>
                                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                  </div>

                                  {/* Features label */}
                                  {listing.is_featured && (
                                    <span className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-amber-500 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                                      <span>Featured</span>
                                    </span>
                                  )}

                                  {/* Visual Thumbnail */}
                                  <div className="h-44 w-full bg-slate-100 dark:bg-slate-900 relative flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {listing.image ? (
                                      <img
                                        src={listing.image}
                                        alt={listing.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/20 dark:to-purple-950/20 flex flex-col items-center justify-center p-6 text-center select-none group-hover:from-indigo-550/15 group-hover:to-purple-550/15 transition-all duration-500 relative">
                                        <CatIcon className={`absolute w-24 h-24 opacity-[0.04] dark:opacity-[0.03] pointer-events-none rotate-12 ${cat.color}`} />
                                        <span className="text-slate-900 dark:text-slate-100 font-black uppercase text-sm sm:text-base tracking-tight line-clamp-2 leading-snug px-4.5 relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
                                          {listing.name}
                                        </span>
                                      </div>
                                    )}
                                    <span className={`absolute bottom-3 left-4 z-10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ${cat.bg}`}>
                                      {listing.subcategory || cat.name}
                                    </span>
                                  </div>

                                  {/* Card contents */}
                                  <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                          <CatIcon className="w-3 h-3 text-primary-500" />
                                          <span>{cat.name}</span>
                                        </span>
                                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <h4 className="font-extrabold text-slate-950 dark:text-white text-base leading-snug line-clamp-1">{listing.name}</h4>
                                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-semibold">{listing.address}</p>
                                      
                                      <div className="pt-3 border-t border-slate-100 dark:border-dark-border/40 space-y-1.5 text-xs font-semibold text-slate-650 dark:text-slate-350">
                                        <p className="flex items-center gap-2">
                                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                          <span>{listing.phone || "No contact number"}</span>
                                        </p>
                                        {userEmails[listing.user_id] && (
                                          <p className="flex items-center gap-2 truncate">
                                            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <a href={`mailto:${userEmails[listing.user_id]}`} className="hover:underline text-primary-500 truncate">{userEmails[listing.user_id]}</a>
                                          </p>
                                        )}
                                        {listing.rejection_reason && listing.status === "rejected" && (
                                          <p className="text-rose-500 dark:text-rose-450 bg-rose-50/50 dark:bg-rose-950/10 p-2 rounded-xl border border-rose-100/10 mt-1">
                                            <strong>Rejection reason:</strong> {listing.rejection_reason}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div 
                                      className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-dark-border/40"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {listingsFilter === "pending_review" && (
                                        <>
                                          <button
                                            onClick={() => triggerListingStatusConfirm(listing.id, "approved")}
                                            className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                                          >
                                            <Check className="w-4 h-4" />
                                            <span>Approve</span>
                                          </button>
                                          <button
                                            onClick={() => triggerListingStatusConfirm(listing.id, "rejected")}
                                            className="flex-grow flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-rose-500/10"
                                          >
                                            <X className="w-4 h-4" />
                                            <span>Reject</span>
                                          </button>
                                        </>
                                      )}

                                      {listingsFilter === "approved" && (
                                        <>
                                          <button
                                            onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1 ${
                                              listing.is_featured
                                                ? "bg-amber-500 border-amber-500 text-white hover:bg-amber-600 shadow-sm"
                                                : "bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-805"
                                            }`}
                                          >
                                            <Star className={`w-3.5 h-3.5 ${listing.is_featured ? "fill-white text-white" : ""}`} />
                                            <span>{listing.is_featured ? "Featured" : "Feature"}</span>
                                          </button>
                                          <button
                                            onClick={() => openEditListingModal(listing)}
                                            className="flex-grow py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                          </button>
                                          <button
                                            onClick={() => triggerListingStatusConfirm(listing.id, "rejected")}
                                            className="py-2 px-3 bg-slate-50 dark:bg-dark-card-hover border border-slate-200 dark:border-dark-border text-rose-500 rounded-xl text-xs font-black transition-all cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/15"
                                            title="Move to rejected"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}

                                      {listingsFilter === "rejected" && (
                                        <>
                                          <button
                                            onClick={() => triggerListingStatusConfirm(listing.id, "approved")}
                                            className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Move to Approved</span>
                                          </button>
                                          <button
                                            onClick={() => triggerListingDeleteConfirm(listing.id)}
                                            className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                            title="Delete permanently"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}

                                      {listingsFilter === "feature_requests" && (
                                        <>
                                          <button
                                            onClick={() => handleFeatureRequestUpdate(listing.id, true)}
                                            className="flex-grow py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Approve Feature</span>
                                          </button>
                                          <button
                                            onClick={() => handleFeatureRequestUpdate(listing.id, false)}
                                            className="flex-grow py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Deny</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* =========================================
                  REVIEWS TAB PANEL
                 ========================================= */}
              {activeTab === "reviews" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Customer Reviews Moderation</h2>
                  </div>

                  {/* Sliding pill tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { filter: "pending", label: "Pending", count: stats.pendingReviews },
                      { filter: "approved", label: "Approved", count: stats.approvedReviews },
                      { filter: "rejected", label: "Rejected", count: reviews.filter(r => r.status === "rejected").length }
                    ].map(tab => (
                      <button
                        key={tab.filter}
                        onClick={() => { setReviewsFilter(tab.filter); setSelectedReviewIds([]); }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          reviewsFilter === tab.filter
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          reviewsFilter === tab.filter ? "bg-primary-50 text-primary-655 dark:bg-primary-950/20" : "bg-slate-200 dark:bg-slate-800 text-slate-655"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Render reviews content */}
                  {(() => {
                    let filteredReviews = reviews.filter(r => r.status === reviewsFilter);
                    if (reviewsSearch) {
                      const searchLower = reviewsSearch.toLowerCase();
                      filteredReviews = filteredReviews.filter(r => 
                        r.user_name.toLowerCase().includes(searchLower) ||
                        r.comment.toLowerCase().includes(searchLower)
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* Bulk Action Header bar */}
                        {filteredReviews.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/70 dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => selectAllFilteredReviews(filteredReviews)}
                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-bg dark:hover:bg-slate-800 border border-slate-200 dark:border-dark-border text-[11px] font-black text-slate-655 dark:text-slate-400 cursor-pointer"
                              >
                                {selectedReviewIds.length === filteredReviews.length ? "Deselect All" : "Select All"}
                              </button>
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                {selectedReviewIds.length} reviews selected
                              </span>
                            </div>

                            {selectedReviewIds.length > 0 && (
                              <div className="flex gap-2">
                                {reviewsFilter === "pending" && (
                                  <>
                                    <button
                                      onClick={() => triggerConfirm({
                                        title: "Bulk Approve Reviews",
                                        message: `Are you sure you want to approve the ${selectedReviewIds.length} selected reviews?`,
                                        type: "success",
                                        onConfirm: () => handleBulkReviewStatus("approved")
                                      })}
                                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                    >
                                      Approve Selected
                                    </button>
                                    <button
                                      onClick={() => triggerConfirm({
                                        title: "Bulk Reject Reviews",
                                        message: `Are you sure you want to reject the ${selectedReviewIds.length} selected reviews?`,
                                        type: "danger",
                                        onConfirm: () => handleBulkReviewStatus("rejected")
                                      })}
                                      className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                    >
                                      Reject Selected
                                    </button>
                                  </>
                                )}
                                
                                {reviewsFilter === "rejected" && (
                                  <button
                                    onClick={() => triggerConfirm({
                                      title: "Bulk Approve Reviews",
                                      message: `Are you sure you want to approve the ${selectedReviewIds.length} selected reviews?`,
                                      type: "success",
                                      onConfirm: () => handleBulkReviewStatus("approved")
                                    })}
                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                  >
                                    Approve Selected
                                  </button>
                                )}

                                <button
                                  onClick={() => triggerConfirm({
                                    title: "Bulk Delete Reviews",
                                    message: `Are you sure you want to permanently delete the ${selectedReviewIds.length} selected reviews? This cannot be undone.`,
                                    type: "danger",
                                    onConfirm: handleBulkReviewDelete
                                  })}
                                  className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/35 rounded-xl text-xs font-black transition-all cursor-pointer"
                                >
                                  Delete Selected
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reviews list */}
                        {filteredReviews.length === 0 ? (
                          <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                            <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                            <p className="font-bold text-slate-800 dark:text-slate-200">No reviews found</p>
                            <p className="text-slate-450 dark:text-slate-500 text-xs mt-1">Refine your search input values.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReviews.map(review => {
                              const isSelected = selectedReviewIds.includes(review.id);
                              const listName = listings.find(l => l.id === review.listing_id)?.name || "Unknown Business";
                              
                              return (
                                <div
                                  key={review.id}
                                  onClick={() => toggleSelectReview(review.id)}
                                  className={`group bg-white dark:bg-dark-card border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-350 flex flex-col justify-between cursor-pointer relative ${
                                    isSelected ? "border-primary-500 ring-2 ring-primary-500/25" : "border-slate-200/70 dark:border-dark-border hover:border-slate-350 dark:hover:border-slate-700"
                                  }`}
                                >
                                  <div className="absolute top-4 left-4 z-20">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                      isSelected ? "bg-primary-500 border-primary-500 text-white" : "bg-white/90 border-slate-300 dark:bg-dark-card/90 dark:border-dark-border"
                                    }`}>
                                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start pl-7">
                                      <div>
                                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{review.user_name}</h4>
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 truncate max-w-[140px]">
                                          For: {listName}
                                        </p>
                                      </div>
                                      <span className="text-slate-450 dark:text-slate-550 text-[10px] font-bold">
                                        {new Date(review.created_at).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {/* Star Rating display */}
                                    <div className="flex gap-0.5 text-amber-500 pl-7">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-750"}`} />
                                      ))}
                                    </div>

                                    <p className="text-slate-650 dark:text-slate-300 text-xs italic font-semibold leading-relaxed mt-2 whitespace-pre-wrap pl-7 line-clamp-4">
                                      "{review.comment}"
                                    </p>
                                  </div>

                                  <div 
                                    className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-dark-border/45"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {reviewsFilter === "pending" && (
                                      <>
                                        <button
                                          onClick={() => handleReviewStatusUpdate(review.id, "approved")}
                                          className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Approve</span>
                                        </button>
                                        <button
                                          onClick={() => handleReviewStatusUpdate(review.id, "rejected")}
                                          className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm shadow-rose-500/10"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                          <span>Reject</span>
                                        </button>
                                      </>
                                    )}

                                    {reviewsFilter === "approved" && (
                                      <>
                                        <button
                                          onClick={() => openEditReviewModal(review)}
                                          className="flex-grow py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          onClick={() => handleReviewStatusUpdate(review.id, "rejected")}
                                          className="py-2 px-3 bg-slate-50 dark:bg-dark-card-hover border border-slate-200 dark:border-dark-border text-rose-500 rounded-xl text-xs font-black transition-all cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-955/15"
                                          title="Move to rejected"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    {reviewsFilter === "rejected" && (
                                      <>
                                        <button
                                          onClick={() => handleReviewStatusUpdate(review.id, "approved")}
                                          className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Approve Review</span>
                                        </button>
                                        <button
                                          onClick={() => triggerConfirm({
                                            title: "Delete Review Permanently",
                                            message: "Are you sure you want to permanently delete this review? This action cannot be undone.",
                                            type: "danger",
                                            onConfirm: () => handleReviewDelete(review.id)
                                          })}
                                          className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                          title="Delete permanently"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* =========================================
                  BLOG TAB PANEL
                 ========================================= */}
              {activeTab === "blog" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Blog Editorial Posts</h2>
                    
                    <button
                      onClick={openAddPostModal}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-black px-4.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-primary-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Post</span>
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { filter: "published", label: "Published", count: stats.publishedBlogs },
                      { filter: "draft", label: "Drafts", count: stats.draftBlogs }
                    ].map(tab => (
                      <button
                        key={tab.filter}
                        onClick={() => setPostsFilter(tab.filter)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          postsFilter === tab.filter
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          postsFilter === tab.filter ? "bg-primary-50 text-primary-655 dark:bg-primary-950/20" : "bg-slate-200 dark:bg-slate-800 text-slate-655"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Render posts */}
                  {(() => {
                    let filteredPosts = posts.filter(p => p.status === postsFilter);
                    if (postsSearch) {
                      const searchLower = postsSearch.toLowerCase();
                      filteredPosts = filteredPosts.filter(p => p.title.toLowerCase().includes(searchLower));
                    }

                    return filteredPosts.length === 0 ? (
                      <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                        <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">No blog posts found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPosts.map(post => (
                          <div
                            key={post.id}
                            className="bg-white dark:bg-dark-card border border-slate-200/60 dark:border-dark-border rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800"
                          >
                            <img
                              src={post.featured_image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80"}
                              alt={post.title}
                              className="w-full md:w-44 h-32 object-cover rounded-2xl bg-slate-100 dark:bg-slate-900 flex-shrink-0"
                            />
                            <div className="flex-grow space-y-2.5">
                              <div className="flex justify-between items-center text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-primary-500" />
                                  <span>{post.author_name || "Admin"}</span>
                                </span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="font-black text-slate-950 dark:text-white text-base md:text-lg leading-snug">{post.title}</h3>
                              <p className="text-slate-600 dark:text-slate-450 text-xs font-semibold leading-relaxed line-clamp-2">
                                {post.content ? post.content.replace(/[#*`_]/g, "").substring(0, 150) + "..." : "No content yet"}
                              </p>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => openEditPostModal(post)}
                                  className="px-3.5 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => triggerConfirm({
                                    title: "Delete Blog Post",
                                    message: `Are you sure you want to delete "${post.title}"?`,
                                    type: "danger",
                                    onConfirm: () => handlePostDelete(post.id)
                                  })}
                                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* =========================================
                  JOBS TAB PANEL
                 ========================================= */}
              {activeTab === "jobs" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Job Postings</h2>
                    
                    <button
                      onClick={openAddJobModal}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-black px-4.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-primary-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Job</span>
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { filter: "active", label: "Active", count: stats.activeJobs },
                      { filter: "expired", label: "Expired", count: stats.expiredJobs }
                    ].map(tab => (
                      <button
                        key={tab.filter}
                        onClick={() => setJobsFilter(tab.filter)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          jobsFilter === tab.filter
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          jobsFilter === tab.filter ? "bg-primary-50 text-primary-655 dark:bg-primary-950/20" : "bg-slate-200 dark:bg-slate-800 text-slate-655"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Render Jobs */}
                  {(() => {
                    let filteredJobs = jobs.filter(j => j.status === jobsFilter);
                    if (jobsSearch) {
                      const searchLower = jobsSearch.toLowerCase();
                      filteredJobs = filteredJobs.filter(j => 
                        j.job_title.toLowerCase().includes(searchLower) ||
                        j.company_name.toLowerCase().includes(searchLower)
                      );
                    }

                    return filteredJobs.length === 0 ? (
                      <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                        <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">No jobs found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredJobs.map(job => (
                          <div
                            key={job.id}
                            className="bg-white dark:bg-dark-card border border-slate-200/70 dark:border-dark-border rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-350"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <span className="bg-primary-50 dark:bg-primary-950/25 text-primary-500 px-2 py-0.5 rounded-lg">{job.job_type || "Full-time"}</span>
                                <span>{new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="font-black text-slate-950 dark:text-white text-base leading-snug">{job.job_title}</h3>
                              <p className="text-primary-500 text-xs font-bold flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{job.company_name}</span> &bull; <span className="text-slate-500 dark:text-slate-400">{job.location}</span>
                              </p>
                              
                              <div className="pt-3 border-t border-slate-100 dark:border-dark-border/40 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                {job.salary_range && <p><strong>Salary:</strong> {job.salary_range}</p>}
                                {job.contact_details && <p><strong>Contact:</strong> {job.contact_details}</p>}
                                {job.description && (
                                  <p className="text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 italic">
                                    "{job.description}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-dark-border/40">
                              <button
                                onClick={() => openEditJobModal(job)}
                                className="flex-grow py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => triggerConfirm({
                                  title: "Delete Job Posting",
                                  message: `Are you sure you want to delete "${job.job_title}"?`,
                                  type: "danger",
                                  onConfirm: () => handleJobDelete(job.id)
                                })}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 text-rose-505 border border-rose-205 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* =========================================
                  EVENTS TAB PANEL
                 ========================================= */}
              {activeTab === "events" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Local Happenings & Events</h2>
                    
                    <button
                      onClick={openAddEventModal}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-black px-4.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-primary-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Event</span>
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { filter: "published", label: "Published", count: stats.publishedEvents },
                      { filter: "draft", label: "Drafts", count: stats.draftEvents }
                    ].map(tab => (
                      <button
                        key={tab.filter}
                        onClick={() => setEventsFilter(tab.filter)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          eventsFilter === tab.filter
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          eventsFilter === tab.filter ? "bg-primary-50 text-primary-655 dark:bg-primary-950/20" : "bg-slate-200 dark:bg-slate-800 text-slate-655"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Render Events */}
                  {(() => {
                    let filteredEvents = events.filter(e => e.status === eventsFilter);
                    if (eventsSearch) {
                      const searchLower = eventsSearch.toLowerCase();
                      filteredEvents = filteredEvents.filter(e => 
                        e.title.toLowerCase().includes(searchLower) ||
                        e.location.toLowerCase().includes(searchLower)
                      );
                    }

                    return filteredEvents.length === 0 ? (
                      <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                        <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">No events found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEvents.map(event => (
                          <div
                            key={event.id}
                            className="bg-white dark:bg-dark-card border border-slate-200/70 dark:border-dark-border rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-350"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                <span className="bg-primary-50 dark:bg-primary-950/25 text-primary-500 px-2 py-0.5 rounded-lg">{event.category || "General"}</span>
                                <span>{new Date(event.created_at).toLocaleDateString()}</span>
                              </div>
                              <h3 className="font-black text-slate-955 dark:text-white text-base leading-snug">{event.title}</h3>
                              <p className="text-primary-500 text-xs font-bold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                              </p>
                              
                              <div className="pt-3 border-t border-slate-100 dark:border-dark-border/40 space-y-1.5 text-xs text-slate-655 dark:text-slate-300 font-semibold">
                                <p className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-450" />
                                  <span>{event.date} at {event.time}</span>
                                </p>
                                {event.description && (
                                  <p className="text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 italic">
                                    "{event.description}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-dark-border/40">
                              <button
                                onClick={() => openEditEventModal(event)}
                                className="flex-grow py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => triggerConfirm({
                                  title: "Delete Event",
                                  message: `Are you sure you want to delete "${event.title}"?`,
                                  type: "danger",
                                  onConfirm: () => handleEventDelete(event.id)
                                })}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* =========================================
                  TRANSPORTATION TAB PANEL
                 ========================================= */}
              {activeTab === "transportation" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Transportation Timetables</h2>
                    </div>
                    <button
                      onClick={() => openAddTransportModal(transportType)}
                      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-black px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-md shadow-primary-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Entry</span>
                    </button>
                  </div>

                  {/* Sliding pill sub-tabs */}
                  <div className="bg-slate-100/80 dark:bg-dark-bg p-1 rounded-2xl flex gap-1 w-fit select-none border border-slate-200/10">
                    {[
                      { type: "trains", label: "Train Timings" },
                      { type: "buses", label: "Bus Routes" },
                      { type: "toto_routes", label: "Toto Fares" }
                    ].map(tab => (
                      <button
                        key={tab.type}
                        onClick={() => { setTransportType(tab.type); setTransportSearch(""); }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                          transportType === tab.type
                            ? "bg-white dark:bg-dark-card text-primary-500 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Render Transport list */}
                  {(() => {
                    let list = transportType === "trains" ? trains : transportType === "buses" ? buses : totoRoutes;
                    
                    if (transportSearch) {
                      const searchLower = transportSearch.toLowerCase();
                      if (transportType === "trains") {
                        list = list.filter(t => 
                          t.name.toLowerCase().includes(searchLower) ||
                          t.from_station.toLowerCase().includes(searchLower) ||
                          t.to_station.toLowerCase().includes(searchLower)
                        );
                      } else {
                        list = list.filter(b => b.route.toLowerCase().includes(searchLower));
                      }
                    }

                    return list.length === 0 ? (
                      <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-3xl p-12 text-center shadow-sm">
                        <Info className="w-10 h-10 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                        <p className="font-bold text-slate-800 dark:text-slate-200">No records found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {list.map(item => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-dark-card border border-slate-200/70 dark:border-dark-border rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-350 dark:hover:border-slate-800 transition-all duration-350"
                          >
                            <div className="space-y-1">
                              {transportType === "trains" && (
                                <>
                                  <h3 className="font-black text-slate-950 dark:text-white text-base">{item.name}</h3>
                                  <p className="text-primary-500 text-xs font-bold">{item.from_station} to {item.to_station}</p>
                                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-450 pt-1.5">
                                    Departs: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{item.time}</span> &bull; Platform: {item.platform} &bull; Runs: {item.days}
                                  </p>
                                </>
                              )}

                              {transportType === "buses" && (
                                <>
                                  <h3 className="font-black text-slate-955 dark:text-white text-base">{item.route}</h3>
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Intervals: {item.frequency}</p>
                                  <p className="text-[11px] font-bold text-slate-450 dark:text-slate-500 pt-1">
                                    First Bus: <span className="text-slate-800 dark:text-slate-200">{item.first_bus}</span> &bull; Last Bus: <span className="text-slate-800 dark:text-slate-200">{item.last_bus}</span>
                                  </p>
                                </>
                              )}

                              {transportType === "toto_routes" && (
                                <>
                                  <h3 className="font-black text-slate-955 dark:text-white text-base">{item.route}</h3>
                                  <p className="text-emerald-600 dark:text-emerald-500 text-sm font-black mt-1">One-Way Fare: {item.fare}</p>
                                </>
                              )}
                            </div>

                            <div className="flex flex-col gap-1.5 ml-4">
                              <button
                                onClick={() => openEditTransportModal(transportType, item)}
                                className="p-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 text-primary-500 border border-primary-200/40 dark:border-primary-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => triggerConfirm({
                                  title: `Delete Transport Record`,
                                  message: `Are you sure you want to delete this timetable entry?`,
                                  type: "danger",
                                  onConfirm: () => handleTransportDelete(transportType, item.id)
                                })}
                                className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 text-rose-500 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* --- ADD LISTING MODAL --- */}
      {addListingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Add Business Listing</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Submit new business to directory</p>
              </div>
              <button
                onClick={() => setAddListingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddListing} className="overflow-y-auto p-6 space-y-6 flex-grow">
              
              {/* Organized form blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Panel 1: Categorization & Basic details */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-dark-border/40 pb-2">1. Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Category *</label>
                      <select
                        value={addListingData.category}
                        onChange={(e) => handleFormCategoryChange(e.target.value, "add")}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                      >
                        {Object.entries(categories).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Subcategory *</label>
                      <select
                        value={addListingData.subcategory}
                        onChange={(e) => setAddListingData(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                      >
                        {(categories[addListingData.category]?.subcategories || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                      {getBusinessNameLabel(addListingData.subcategory)} *
                    </label>
                    <input
                      type="text" required
                      value={addListingData.name}
                      onChange={(e) => setAddListingData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      placeholder="e.g. Apollo Pharmacy"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Contact Number *</label>
                    <input
                      type="tel" required
                      value={addListingData.phone}
                      onChange={(e) => setAddListingData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      placeholder="e.g. 9876543210"
                    />
                  </div>

                  {/* Image uploading */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Upload Thumbnail Image</label>
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddListingImageFile(file);
                          setAddListingImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-semibold focus:outline-none text-slate-500 dark:text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-primary-50 file:text-primary-600 dark:file:bg-primary-950/20 dark:file:text-primary-400 cursor-pointer"
                    />
                    
                    {addListingImagePreview && (
                      <div className="mt-3 relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-dark-border/50 shadow-inner">
                        <img src={addListingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setAddListingImageFile(null); setAddListingImagePreview(""); }}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: Location and hours */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-dark-border/40 pb-2">2. Location & Hours</h4>
                  
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Address *</label>
                    <textarea
                      required rows="3"
                      value={addListingData.address}
                      onChange={(e) => setAddListingData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                      placeholder="e.g. Kushpata, Ghatal, Paschim Medinipur"
                    />
                  </div>

                  {/* Google Maps link */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Google Maps Embed Link *</label>
                    <input
                      type="url" required
                      value={addListingData.googleMapLink}
                      onChange={(e) => setAddListingData(prev => ({ ...prev, googleMapLink: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>

                  {/* Hours Status preset */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Opening Hours preset</label>
                    <select
                      value={addListingData.opening_hours.status}
                      onChange={(e) => {
                        const val = e.target.value;
                        const emptyHours = {};
                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                          emptyHours[day] = { open: "", close: "" };
                        });
                        setAddListingData(prev => ({
                          ...prev,
                          opening_hours: {
                            status: val,
                            hours: val === "custom" ? emptyHours : null
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="open_24_7">Open 24/7</option>
                      <option value="temporarily_closed">Temporarily Closed</option>
                      <option value="custom">Set Custom Timings</option>
                    </select>
                  </div>

                  {/* Custom Hour Editor */}
                  {addListingData.opening_hours.status === "custom" && (
                    <div className="p-4 border border-slate-200/50 dark:border-dark-border/60 rounded-2xl bg-slate-50/50 dark:bg-dark-bg/30 space-y-4 max-h-56 overflow-y-auto">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const dayKey = day.toLowerCase();
                        return (
                          <div key={day} className="grid grid-cols-3 gap-2 items-center text-xs">
                            <span className="font-extrabold text-slate-600 dark:text-slate-400">{day}</span>
                            <input
                              type="time"
                              value={addListingData.opening_hours.hours?.[dayKey]?.open || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAddListingData(prev => {
                                  const nextHours = { ...prev.opening_hours.hours };
                                  nextHours[dayKey] = { ...nextHours[dayKey], open: val };
                                  return { ...prev, opening_hours: { ...prev.opening_hours, hours: nextHours } };
                                });
                              }}
                              className="px-2 py-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-[11px] font-bold focus:outline-none text-slate-900 dark:text-white"
                            />
                            <input
                              type="time"
                              value={addListingData.opening_hours.hours?.[dayKey]?.close || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAddListingData(prev => {
                                  const nextHours = { ...prev.opening_hours.hours };
                                  nextHours[dayKey] = { ...nextHours[dayKey], close: val };
                                  return { ...prev, opening_hours: { ...prev.opening_hours, hours: nextHours } };
                                });
                              }}
                              className="px-2 py-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-[11px] font-bold focus:outline-none text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      })}
                      
                      <button
                        type="button"
                        onClick={() => handleCopyHours("add")}
                        className="flex items-center gap-1 text-[10px] font-black text-primary-500 hover:underline cursor-pointer pt-2"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Monday to all days</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Description Span Full */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Business description details</label>
                <textarea
                  rows="4"
                  value={addListingData.description}
                  onChange={(e) => setAddListingData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                  placeholder="Describe services, specializations, business highlights..."
                />
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setAddListingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Creating..." : "Save Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT LISTING MODAL --- */}
      {editListingModalOpen && editListingData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <div>
                <h3 className="text-xl font-black text-slate-955 dark:text-white">Modify Listing Details</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Edit directory details for this business</p>
              </div>
              <button
                onClick={() => setEditListingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditListing} className="overflow-y-auto p-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column fields */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-dark-border/40 pb-2">1. Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Category *</label>
                      <select
                        value={editListingData.category}
                        onChange={(e) => handleFormCategoryChange(e.target.value, "edit")}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                      >
                        {Object.entries(categories).map(([key, value]) => (
                          <option key={key} value={key}>{value.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Subcategory *</label>
                      <select
                        value={editListingData.subcategory}
                        onChange={(e) => setEditListingData(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                      >
                        {(categories[editListingData.category]?.subcategories || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Name Label */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider font-extrabold">
                      {getBusinessNameLabel(editListingData.subcategory)} *
                    </label>
                    <input
                      type="text" required
                      value={editListingData.name}
                      onChange={(e) => setEditListingData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Contact Number *</label>
                    <input
                      type="tel" required
                      value={editListingData.phone}
                      onChange={(e) => setEditListingData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Thumbnail Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Change Thumbnail Image</label>
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditListingImageFile(file);
                          setEditListingImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-semibold focus:outline-none text-slate-500 dark:text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-primary-50 file:text-primary-600 dark:file:bg-primary-955/20 dark:file:text-primary-400 cursor-pointer"
                    />
                    
                    {editListingImagePreview && (
                      <div className="mt-3 relative w-full h-36 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-dark-border/50 shadow-inner">
                        <img src={editListingImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setEditListingImageFile(null); setEditListingImagePreview(""); }}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column fields */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-primary-500 uppercase tracking-wider border-b border-slate-100 dark:border-dark-border/40 pb-2">2. Location & Hours</h4>
                  
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Address *</label>
                    <textarea
                      required rows="3"
                      value={editListingData.address}
                      onChange={(e) => setEditListingData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  {/* Google maps link */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Google Maps link</label>
                    <input
                      type="url"
                      value={editListingData.googleMapLink || ""}
                      onChange={(e) => setEditListingData(prev => ({ ...prev, googleMapLink: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Opening hours dropdown status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Opening Hours Preset</label>
                    <select
                      value={editListingData.opening_hours.status}
                      onChange={(e) => {
                        const val = e.target.value;
                        const emptyHours = {};
                        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                          emptyHours[day] = { open: "", close: "" };
                        });
                        setEditListingData(prev => ({
                          ...prev,
                          opening_hours: {
                            status: val,
                            hours: val === "custom" ? emptyHours : null
                          }
                        }));
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="open_24_7">Open 24/7</option>
                      <option value="temporarily_closed">Temporarily Closed</option>
                      <option value="custom">Set Custom Timings</option>
                    </select>
                  </div>

                  {/* Custom Hour editor */}
                  {editListingData.opening_hours.status === "custom" && (
                    <div className="p-4 border border-slate-200/50 dark:border-dark-border/60 rounded-2xl bg-slate-50/50 dark:bg-dark-bg/30 space-y-4 max-h-56 overflow-y-auto">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                        const dayKey = day.toLowerCase();
                        return (
                          <div key={day} className="grid grid-cols-3 gap-2 items-center text-xs">
                            <span className="font-extrabold text-slate-650 dark:text-slate-350">{day}</span>
                            <input
                              type="time"
                              value={editListingData.opening_hours.hours?.[dayKey]?.open || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditListingData(prev => {
                                  const nextHours = { ...prev.opening_hours.hours };
                                  nextHours[dayKey] = { ...nextHours[dayKey], open: val };
                                  return { ...prev, opening_hours: { ...prev.opening_hours, hours: nextHours } };
                                });
                              }}
                              className="px-2 py-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-[11px] font-bold focus:outline-none text-slate-900 dark:text-white"
                            />
                            <input
                              type="time"
                              value={editListingData.opening_hours.hours?.[dayKey]?.close || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditListingData(prev => {
                                  const nextHours = { ...prev.opening_hours.hours };
                                  nextHours[dayKey] = { ...nextHours[dayKey], close: val };
                                  return { ...prev, opening_hours: { ...prev.opening_hours, hours: nextHours } };
                                });
                              }}
                              className="px-2 py-1.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-[11px] font-bold focus:outline-none text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      })}
                      
                      <button
                        type="button"
                        onClick={() => handleCopyHours("edit")}
                        className="flex items-center gap-1 text-[10px] font-black text-primary-500 hover:underline cursor-pointer pt-2"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Monday to all days</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Business description details</label>
                <textarea
                  rows="4"
                  value={editListingData.description || ""}
                  onChange={(e) => setEditListingData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setEditListingModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT BLOG POST MODAL --- */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {postModalData.id ? "Edit Editorial Post" : "Compose Editorial Post"}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Write local guide or news updates</p>
              </div>
              <button
                onClick={() => setPostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="overflow-y-auto p-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main Content Area (Left 2 cols) */}
                <div className="md:col-span-2 space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Post Title *</label>
                    <input
                      type="text" required
                      value={postModalData.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPostModalData(prev => {
                          const nextData = { ...prev, title: val };
                          if (!prev.id && (!prev.slug || prev.slug === generateSlug(prev.title || ''))) {
                            nextData.slug = generateSlug(val);
                          }
                          return nextData;
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      placeholder="e.g. A Visit to Vidyasagar Smriti Mandir"
                    />
                  </div>

                  {/* Markdown Content */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Article Content (Markdown Supported) *</label>
                    <textarea
                      required rows="14"
                      value={postModalData.content}
                      onChange={(e) => setPostModalData(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                      placeholder="Type article content..."
                    />
                  </div>
                </div>

                {/* Sidebar Controls (Right 1 col) */}
                <div className="space-y-4">
                  {/* Slug */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">URL Slug *</label>
                    <input
                      type="text" required
                      value={postModalData.slug}
                      onChange={(e) => setPostModalData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Author Name *</label>
                    <input
                      type="text" required
                      value={postModalData.author_name}
                      onChange={(e) => setPostModalData(prev => ({ ...prev, author_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Featured image url */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Featured Image URL *</label>
                    <input
                      type="url" required
                      value={postModalData.featured_image_url}
                      onChange={(e) => setPostModalData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Publish Status *</label>
                    <select
                      value={postModalData.status}
                      onChange={(e) => setPostModalData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Saving..." : "Save Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT JOB POSTING MODAL --- */}
      {jobModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-3xl w-full max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {jobModalData.id ? "Edit Job Posting" : "Publish Job Posting"}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Post new employment details</p>
              </div>
              <button
                onClick={() => setJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="overflow-y-auto p-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Job Title *</label>
                  <input
                    type="text" required
                    value={jobModalData.job_title}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, job_title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Company Name *</label>
                  <input
                    type="text" required
                    value={jobModalData.company_name}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Location *</label>
                  <input
                    type="text" required
                    value={jobModalData.location}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Contact details */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Contact details *</label>
                  <input
                    type="text" required
                    value={jobModalData.contact_details}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, contact_details: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Job Type *</label>
                  <select
                    value={jobModalData.job_type}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, job_type: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Salary */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Salary Range</label>
                  <input
                    type="text"
                    value={jobModalData.salary_range}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, salary_range: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    placeholder="e.g. ₹15,000 - ₹20,000"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Status *</label>
                  <select
                    value={jobModalData.status}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Job Description *</label>
                  <textarea
                    required rows="4"
                    value={jobModalData.description}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Requirements *</label>
                  <textarea
                    required rows="3"
                    value={jobModalData.requirements}
                    onChange={(e) => setJobModalData(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Saving..." : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT EVENT MODAL --- */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {eventModalData.id ? "Edit Event details" : "Publish Event Details"}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Post cultural or emergency announcements</p>
              </div>
              <button
                onClick={() => setEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-355 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="overflow-y-auto p-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Event Title *</label>
                  <input
                    type="text" required
                    value={eventModalData.title}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Date *</label>
                  <input
                    type="date" required
                    value={eventModalData.date}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Time *</label>
                  <input
                    type="text" required
                    value={eventModalData.time}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    placeholder="e.g. 06:00 PM onwards"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Location *</label>
                  <input
                    type="text" required
                    value={eventModalData.location}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Category *</label>
                  <input
                    type="text" required
                    value={eventModalData.category}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Cultural, Sports"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Publish Status *</label>
                  <select
                    value={eventModalData.status}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Description Details *</label>
                  <textarea
                    required rows="4"
                    value={eventModalData.description}
                    onChange={(e) => setEventModalData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT TRANSPORTATION MODAL --- */}
      {transportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-200/50 dark:border-dark-border max-w-lg w-full flex flex-col animate-scale-up overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border/40">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {transportModalData.id ? `Edit ${transportModalType.replace("_", " ")}` : `Add New ${transportModalType.replace("_", " ")}`}
              </h3>
              <button
                onClick={() => setTransportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransport} className="p-6 space-y-6">
              <div className="space-y-4">
                {transportModalType === "trains" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Train Name *</label>
                      <input
                        type="text" required
                        value={transportModalData.name || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">From Station *</label>
                        <input
                          type="text" required
                          value={transportModalData.from_station || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, from_station: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">To Station *</label>
                        <input
                          type="text" required
                          value={transportModalData.to_station || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, to_station: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Departs Time *</label>
                        <input
                          type="text" required
                          value={transportModalData.time || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          placeholder="e.g. 07:30 AM"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Platform *</label>
                        <input
                          type="text" required
                          value={transportModalData.platform || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, platform: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Active Days *</label>
                      <input
                        type="text" required
                        value={transportModalData.days || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, days: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Daily, Mon-Sat"
                      />
                    </div>
                  </>
                )}

                {transportModalType === "buses" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Route *</label>
                      <input
                        type="text" required
                        value={transportModalData.route || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, route: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Ghatal to Kolkata"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Frequency *</label>
                      <input
                        type="text" required
                        value={transportModalData.frequency || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Every 30 mins"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">First Bus *</label>
                        <input
                          type="text" required
                          value={transportModalData.first_bus || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, first_bus: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          placeholder="e.g. 06:00 AM"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Last Bus *</label>
                        <input
                          type="text" required
                          value={transportModalData.last_bus || ""}
                          onChange={(e) => setTransportModalData(prev => ({ ...prev, last_bus: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                          placeholder="e.g. 08:00 PM"
                        />
                      </div>
                    </div>
                  </>
                )}

                {transportModalType === "toto_routes" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Route *</label>
                      <input
                        type="text" required
                        value={transportModalData.route || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, route: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">One-way Fare *</label>
                      <input
                        type="text" required
                        value={transportModalData.fare || ""}
                        onChange={(e) => setTransportModalData(prev => ({ ...prev, fare: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        placeholder="e.g. ₹10"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Action row */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setTransportModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-primary-500/10 cursor-pointer"
                >
                  {loginLoading ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REUSABLE CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-slate-100 dark:border-dark-border max-w-md w-full p-8 text-center animate-scale-up">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              confirmModal.type === "success" ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
            }`}>
              {confirmModal.type === "success" ? <Check className="w-8 h-8 stroke-[2.5]" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <h3 className="text-2xl font-black text-slate-955 dark:text-white mb-4">
              {confirmModal.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-405 mb-8 text-xs font-bold leading-relaxed">
              {confirmModal.message}
            </p>
            
            {confirmModal.showReasonInput && (
              <div className="mb-6 text-left">
                <label className="block text-xs font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Reason for Rejection (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incomplete information, spam..."
                  value={confirmModal.reasonValue}
                  onChange={(e) => setConfirmModal(prev => ({ ...prev, reasonValue: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-6 py-3 rounded-xl text-xs font-black transition-all bg-slate-50 hover:bg-slate-100 dark:bg-dark-card-hover dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) {
                    confirmModal.onConfirm(confirmModal.showReasonInput ? confirmModal.reasonValue : null);
                  }
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all text-white cursor-pointer ${
                  confirmModal.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10" : "bg-red-500 hover:bg-red-650 shadow-md shadow-red-500/10"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATION CONTAINER --- */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toastList.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3.5 rounded-2xl shadow-xl text-white font-extrabold text-xs transform transition-all duration-300 flex items-center justify-between gap-3 animate-slide-in ${
              toast.type === "success" ? "bg-emerald-500" :
              toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToastList(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white hover:opacity-85 cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
