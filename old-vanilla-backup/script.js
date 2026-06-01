// Perfect Ghatal Guide Application - Complete Version
console.log('Ghatal Guide - Starting application...');

import { supabase } from './supabaseClient.js';

// Global state
let appState = {
    currentView: 'home',
    listings: [],
    filteredListings: [],
    searchTerm: '',
    // searchArea: '', // This is no longer needed
    selectedCategory: 'all',
    filterOpenOnly: false,
    currentSortOption: 'name', // ✅ State to store the current sort option
    darkMode: localStorage.getItem('darkMode') === 'true' || (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isAppInstalled: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    userLocation: null,
    isVoiceRecording: false,
    blogPosts: [], // For storing blog posts
    currentPost: null, // For storing the currently viewed post
    jobs: [], // For storing job posts
    currentJob: null, // For storing the currently viewed job
    currentUser: null, // To store logged-in user info
    userListings: [], // To store listings specific to the logged-in user
    userBookmarks: [] // To store bookmarked listing IDs
};

// Categories data
const categories = {
    health: { name: "Health & Wellness", icon: "🏥", subcategories: ["Hospitals", "Doctors", "Pharmacy"] },
    food: { name: "Food & Dining", icon: "🍽️", subcategories: ["Restaurants", "Cafes", "Sweets", "Desserts"] },
    shopping: { name: "Shopping", icon: "🛍️", subcategories: ["Apparel", "Electronics", "Groceries", "Book Store"] },
    services: { name: "Local Services", icon: "🔧", subcategories: ["Electricians", "Plumbers", "Mechanics"] },
    education: { name: "Education", icon: "🎓", subcategories: ["Schools", "Colleges", "Coaching Centers"] },
    emergency: { name: "Emergency", icon: "🚨", subcategories: ["Police", "Ambulance", "Fire Station", "Blood Banks"] }
};

// Enhanced sample data for demo
const sampleListings = [
    {
        id: 1,
        name: "Ghatal District Hospital",
        category: "health",
        subcategory: "Hospitals",
        address: "Hospital Road, Ghatal, Paschim Medinipur",
        lat: 22.6698,
        lng: 87.7215,
        phone: "9876543210",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop&q=80",
        rating: 4.2,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-01T10:00:00Z"
    },
    {
        id: 2,
        name: "Spice Garden Restaurant",
        category: "food",
        subcategory: "Restaurants",
        address: "Main Market, Ghatal Bazar, West Bengal",
        lat: 22.6750,
        lng: 87.7250,
        phone: "9876543211",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80",
        rating: 4.5,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-02T10:00:00Z"
    },
    {
        id: 3,
        name: "Tech Plaza Electronics",
        category: "shopping",
        subcategory: "Electronics",
        address: "Station Road, Near Railway Station, Ghatal",
        lat: 22.6655,
        lng: 87.7190,
        phone: "9876543212",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80",
        rating: 4.0,
        isOpen: false,
        status: "approved",
        created_at: "2025-01-03T10:00:00Z"
    },
    {
        id: 4,
        name: "Modern Pharmacy",
        category: "health",
        subcategory: "Pharmacy",
        address: "College Para, Ghatal",
        lat: 22.6710,
        lng: 87.7280,
        phone: "9876543213",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&q=80",
        rating: 4.3,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-04T10:00:00Z"
    },
    {
        id: 5,
        name: "Ghatal High School",
        category: "education",
        subcategory: "Schools",
        address: "School Street, Ghatal",
        lat: 22.6780,
        lng: 87.7220,
        phone: "9876543214",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop&q=80",
        rating: 4.1,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-05T10:00:00Z"
    },
    {
        id: 6,
        name: "Quick Fix Electronics Repair",
        category: "services",
        subcategory: "Electricians",
        address: "Market Complex, Ghatal",
        lat: 22.6745,
        lng: 87.7265,
        phone: "9876543215",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80",
        rating: 4.4,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-06T10:00:00Z"
    },
    {
        id: 7,
        name: "Sweet Corner",
        category: "food",
        subcategory: "Sweets",
        address: "Gandhi Road, Ghatal",
        lat: 22.6725,
        lng: 87.7240,
        phone: "9876543216",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&q=80",
        rating: 4.6,
        isOpen: true,
        status: "approved",
        created_at: "2025-01-07T10:00:00Z"
    },
    {
        id: 8,
        name: "Fashion Hub",
        category: "shopping",
        subcategory: "Apparel",
        address: "Main Bazar, Ghatal",
        lat: 22.6758,
        lng: 87.7255,
        phone: "9876543217",
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop&q=80",
        rating: 3.9,
        isOpen: false,
        status: "approved",
        created_at: "2025-01-08T10:00:00Z"
    }
];

// Sample Data for New Features
const sampleTransportation = {
    trains: [
        { name: "Panskura Local", from: "Ghatal", to: "Panskura", time: "07:30 AM", platform: "1", days: "Daily" },
        { name: "Howrah Fast Local", from: "Ghatal", to: "Howrah", time: "09:00 AM", platform: "2", days: "Mon-Sat" },
        { name: "Haldia Local", from: "Ghatal", to: "Haldia", time: "11:15 AM", platform: "1", days: "Daily" }
    ],
    buses: [
        { route: "Ghatal to Medinipur", frequency: "Every 30 mins", firstBus: "06:00 AM", lastBus: "08:00 PM" },
        { route: "Ghatal to Kolkata (Esplanade)", frequency: "Every 1 hour", firstBus: "05:30 AM", lastBus: "06:00 PM" },
        { route: "Ghatal to Daspur", frequency: "Every 20 mins", firstBus: "06:30 AM", lastBus: "09:00 PM" }
    ],
    totoRoutes: [
        { route: "Ghatal Bus Stand to Kushpata", fare: "₹10" },
        { route: "Ghatal Bazar to Vidyasagar Setu", fare: "₹15" },
        { route: "Konnagar to Ghatal College", fare: "₹10" }
    ]
};

// Add Blood Bank to sampleListings
sampleListings.push({
    id: 9,
    name: "Ghatal Sub-Divisional Hospital Blood Bank",
    category: "emergency",
    subcategory: "Blood Banks",
    address: "Hospital Road, Ghatal, Paschim Medinipur",
    lat: 22.6700,
    lng: 87.7218,
    phone: "03225255007",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop&q=80",
    rating: 4.8,
    isOpen: true,
    status: "approved",
    created_at: "2025-01-09T10:00:00Z",
    opening_hours: { status: 'open_24_7' },
    extra_info: {
        "Available Groups": "A+, B+, O+, AB+",
        "Contact Person": "Mr. S. Ghosh",
        "Helpline": "9988776655"
    }
});

sampleListings.push({
    id: 10,
    name: "Ghatal Book Centre",
    category: "shopping",
    subcategory: "Book Store",
    address: "Near Town Hall, Ghatal",
    lat: 22.6730,
    lng: 87.7230,
    phone: "9876543218",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop&q=80",
    rating: 4.5,
    isOpen: true,
    status: "approved",
    created_at: "2025-01-10T10:00:00Z",
    opening_hours: {
        "monday": { "open": "10:00", "close": "20:00" },
        "tuesday": { "open": "10:00", "close": "20:00" },
        "wednesday": { "open": "10:00", "close": "20:00" },
        "thursday": { "open": "10:00", "close": "20:00" },
        "friday": { "open": "10:00", "close": "20:00" },
        "saturday": { "open": "10:00", "close": "20:00" },
        "sunday": { "open": "11:00", "close": "14:00" }
    }
});



// Utility functions
const utils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    sanitizeHTML: (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatPhone: (phone) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
        }
        return phone;
    },

    generateStars: (rating) => {
        if (!rating || rating === 0) {
            return '<span class="text-gray-500 dark:text-gray-400">No ratings yet</span>';
        }
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        return `${stars} ${rating.toFixed(1)}`;
    },

    getImageUrl: (listing) => {
        const defaultBaseUrl = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?fit=crop&q=80&auto=format&ixlib=rb-4.0.3`;
        let providedUrl = listing.image;

        // If providedUrl is from Unsplash, remove existing w/h params to avoid duplication
        if (providedUrl && providedUrl.includes('images.unsplash.com')) {
            try {
                const urlObj = new URL(providedUrl);
                urlObj.searchParams.delete('w');
                urlObj.searchParams.delete('h');
                providedUrl = urlObj.toString();
            } catch (e) {
                console.warn("Invalid URL in listing.image, using as is:", providedUrl, e);
                // Fallback to using providedUrl as is if it's malformed
            }
        }

        return providedUrl || defaultBaseUrl;
    },

    truncateText: (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    calculateDistance: (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) {
            return null;
        }
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    },

    formatDistance: (km) => {
        if (km === null || km === undefined || km > 10000) { // Don't show for very large distances
            return '';
        }
        if (km < 1) {
            const meters = Math.round(km * 1000);
            return `${meters} m away`;
        }
        return `${km.toFixed(1)} km away`;
    },

    // [NEW] রাস্তার দূরত্ব মাপার ফাংশন
    getRoadDistance: async (startLat, startLng, endLat, endLng, elementId) => {
        try {
            // OSRM API কল (লংগিচিউড আগে, ল্যাটিচিউড পরে)
            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                // মিটার থেকে কিলোমিটার করা হলো
                const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
                
                // UI আপডেট করা
                const el = document.getElementById(elementId);
                if (el) {
                    // এরিয়াল আইকন সরিয়ে গাড়ির আইকন দেওয়া হলো
                    el.innerHTML = `🚗 ${distanceKm} km away`;
                    el.classList.add('text-green-600', 'dark:text-green-400', 'font-bold');
                    el.title = "Road Distance (Driving)";
                }
            }
        } catch (error) {
            // এরর হলে কিছু করার দরকার নেই, সোজা দূরত্বটাই থেকে যাবে
            console.warn("Road distance check failed:", error);
        }
    }
};

// Theme management
const themeManager = {
    init() {
        this.applyTheme();
        this.bindEvents();
        this.detectSystemTheme();
    },

    applyTheme() {
        const html = document.documentElement;
        if (appState.darkMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        // Update theme color meta tag
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = appState.darkMode ? '#1e293b' : '#1e3a8a';
        }
    },

    toggle() {
        appState.darkMode = !appState.darkMode;
        localStorage.setItem('darkMode', appState.darkMode);
        this.applyTheme();
        
        toastManager.show(
            `${appState.darkMode ? '🌙 Dark' : '☀️ Light'} mode enabled`, 
            'success'
        );
    },

    detectSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (localStorage.getItem('darkMode') === null) {
                appState.darkMode = e.matches;
                this.applyTheme();
            }
        });
    },

    bindEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
    }
};

// Toast notification system
const toastManager = {
    container: null,
    isInitialized: false,
    toastCount: 0,

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            console.warn('Toast container not found');
        }
        this.isInitialized = true;
    },

    show(message, type = 'info', duration = 5000) {
        if (!this.isInitialized || !this.container) {
            console.log(`Toast: ${message} (${type})`);
            return;
        }

        this.toastCount++;
        const toastId = `toast-${this.toastCount}`;
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast-enter transform transition-all duration-300 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 p-4 max-w-sm`;
        
        const icons = {
            success: { icon: '✅', color: 'text-green-600' },
            error: { icon: '❌', color: 'text-red-600' },
            warning: { icon: '⚠️', color: 'text-yellow-600' },
            info: { icon: 'ℹ️', color: 'text-blue-600' }
        };
        
        const { icon, color } = icons[type] || icons.info;
        
        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <span class="text-xl flex-shrink-0">${icon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">${utils.sanitizeHTML(message)}</p>
                </div>
                <button onclick="toastManager.remove('${toastId}')" class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">
                    <span class="sr-only">Close</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-enter-active');
        });

        // Auto remove
        setTimeout(() => this.remove(toastId), duration);
    },

    remove(toastId) {
        const toast = document.getElementById(toastId);
        if (!toast) return;
        
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
};

// Loading manager
const loadingManager = {
    show() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
    },

    hide() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }
};

// Network status manager
const networkManager = {
    init() {
        this.bindEvents();
        // Remove the immediate updateStatus() call
    },

    bindEvents() {
        window.addEventListener('online', () => {
            // Double-check connectivity before declaring we're back online
            this.testConnectivity().then(isOnline => {
                if (isOnline) {
                    this.hideOfflineBanner();
                    toastManager.show('🌐 Connection restored', 'success');
                }
            });
        });

        window.addEventListener('offline', () => {
            this.showOfflineBanner();
        });
    },

    async testConnectivity() {
        try {
            // Test with a lightweight request
            await fetch(window.location.origin + '/manifest.json', { 
                method: 'HEAD',
                cache: 'no-cache',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            // This catch block means we are likely offline
            this.showOfflineBanner(); // Ensure banner is shown if test fails
            return false;
        }
    },

    showOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.classList.remove('hidden');
            toastManager.show('📱 You are offline', 'warning');
        }
    }, 

    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }
}; 





// =================================================================================
// AUTHENTICATION MODULE
// =================================================================================
const authManager = {
    init() {
        if (!supabase) return;

        // Listen for authentication state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, session);
            appState.currentUser = session ? session.user : null;
            this.updateUI(appState.currentUser);

            if (event === 'SIGNED_IN') {
                // Optional: redirect or perform actions on sign-in
            } else if (event === 'SIGNED_OUT') {
                // Redirect to home if user logs out from a protected page
                if (appState.currentView === 'dashboard') {
                    navigationManager.navigateTo('home');
                }
                // Clear bookmarks on logout
                appState.userBookmarks = [];
                // If on bookmarks page, redirect to home
                if (appState.currentView === 'bookmarks') {
                    navigationManager.navigateTo('home');
                }
            }
        });
    },

    updateUI(user) {
        const loggedOutViews = document.querySelectorAll('.logged-out-view');
        const loggedInViews = document.querySelectorAll('.logged-in-view');

        if (user) {
            // User is logged in
            loggedOutViews.forEach(el => el.classList.add('hidden'));
            loggedInViews.forEach(el => el.classList.remove('hidden'));

            // Add event listeners for logout buttons
            // and fetch user-specific data
            const avatarUrl = user.user_metadata?.avatar_url;
            const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
            const email = user.email;

            document.querySelectorAll('#user-avatar-button').forEach(el => {
                if (avatarUrl) {
                    el.src = avatarUrl;
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
            document.querySelectorAll('#user-initials-button').forEach(el => {
                if (!avatarUrl) {
                    el.textContent = fullName.charAt(0).toUpperCase();
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
            document.querySelectorAll('#user-menu-name').forEach(el => el.textContent = fullName);
            document.querySelectorAll('#user-menu-email').forEach(el => el.textContent = email);

            // and fetch user-specific data
            document.querySelectorAll('#logout-btn-desktop, #logout-btn-mobile').forEach(btn => {
                // Clone and replace to remove old listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', this.logout);
            });

            dataManager.fetchUserBookmarks();

        } else {
            // User is logged out
            loggedInViews.forEach(el => el.classList.add('hidden'));
            loggedOutViews.forEach(el => el.classList.remove('hidden'));
        }
    },

    async logout() {
        // --- IMPROVED SOLUTION ---
        // If an admin tries to log out from the main site, show a confirmation dialog
        // warning them that it will end their session everywhere, including the admin panel.
        if (appState.currentUser && appState.currentUser.user_metadata?.role === 'admin') {
            if (!confirm('You are logged in as an admin. Logging out here will also log you out of the Admin Panel. Are you sure you want to continue?')) {
                return; // User cancelled the logout
            }
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            toastManager.show(`Logout failed: ${error.message}`, 'error');
        } else {
            // On successful logout, clear any user-specific state
            appState.userBookmarks = [];
            toastManager.show('You have been logged out.', 'info');
        }
    }
};

// Data management
const dataManager = {
    async fetchListings() {
        console.log('📊 Fetching listings...');
        let rawListings = [];

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                rawListings = data || [];
            } catch (error) {
                console.warn('⚠️ Database fetch failed:', error);
            }
        }

        if (rawListings.length === 0) {
            // Fallback to sample data if DB fetch fails or returns empty
            rawListings = sampleListings;
            console.log(`📝 Using ${rawListings.length} sample listings`);
        }

        // Enhance all listings with their real, calculated rating from reviews
        const listingsWithRealRatings = await Promise.all(rawListings.map(async (listing) => {
            const reviews = await this.fetchReviews(listing.id);
            const realRating = reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
                : (listing.rating || 0); // Use supabase rating or default to 0
            
            return this.enhanceListing(listing, realRating, reviews.length);
        }));

        appState.listings = listingsWithRealRatings;
        console.log(`✅ Processed ${appState.listings.length} listings with real ratings.`);
    },

    enhanceListing(listing, realRating, reviewCount) {
        return {
            ...listing,
            rating: realRating,
            reviewCount: reviewCount,
            isOpen: listing.isOpen !== undefined ? listing.isOpen : this.isBusinessOpen(),
            distance: null
        };
    },

    isBusinessOpen(openingHours) {
        // Helper to convert "HH:MM" string to minutes from midnight
        const timeToMinutes = (timeStr) => {
            if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        // Handle explicit status types from the DB
        if (openingHours?.status === 'open_24_7') return true;
        if (openingHours?.status === 'temporarily_closed') return false;
        if (openingHours?.status === 'custom' && !openingHours.hours) return false;

        // Use the nested 'hours' object if it exists, otherwise use the openingHours object itself
        const hoursData = openingHours?.hours || openingHours;

        const now = new Date();
        const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        // Default behavior if no hours data is provided at all
        if (!hoursData) {
            // Default to open 9-5 on weekdays if no hours are provided
            const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            if (day === 0 || day === 6) return false; // Closed on weekends
            return currentTimeInMinutes >= 540 /* 9:00 AM */ && currentTimeInMinutes < 1020 /* 5:00 PM */;
        }

        const hoursForToday = hoursData[currentDayName];

        if (!hoursForToday || !hoursForToday.open || !hoursForToday.close) {
            return false; // Closed if no hours are set for today
        }

        const openTimeInMinutes = timeToMinutes(hoursForToday.open);
        const closeTimeInMinutes = timeToMinutes(hoursForToday.close);

        if (openTimeInMinutes === null || closeTimeInMinutes === null) return false;

        // Standard case: opens and closes on the same day (e.g., 09:00 - 17:00)
        if (openTimeInMinutes <= closeTimeInMinutes) {
            return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
        }
        // Overnight case: opens one day and closes the next (e.g., 22:00 - 04:00)
        return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
    },

    searchListings(query) {
        if (!query.trim()) {
            return appState.listings;
        }

        const searchTerm = query.toLowerCase();
        return appState.listings.filter(listing => 
            listing.name.toLowerCase().includes(searchTerm) ||
            listing.address.toLowerCase().includes(searchTerm) ||
            listing.subcategory.toLowerCase().includes(searchTerm) ||
            listing.category.toLowerCase().includes(searchTerm)
        );
    },

    filterByCategory(category) {
        if (category === 'all') {
            return appState.listings;
        }
        return appState.listings.filter(listing => listing.category === category);
    },

    sortListings(listings, sortBy) {
        const sorted = [...listings];
        
        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                // New logic: Filter > 3.5, sort by reviewCount desc, then rating desc
                return sorted
                    .filter(l => l.rating >= 3.5)
                    .sort((a, b) => {
                        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
                        return b.rating - a.rating;
                    });
            case 'distance':
                return sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            default:
                return sorted;
        }
    },

    async fetchReviews(listingId) {
        if (!supabase || !listingId) return [];
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('listing_id', listingId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },

    async submitReview(reviewData) {
        if (!supabase) {
            // Simulate success for offline/demo mode
            console.log('Simulating review submission:', reviewData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { error: null };
        }
        try {
            const { error } = await supabase.from('reviews').insert([reviewData]);
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    async fetchEvents() {
        if (!supabase) {
            console.log('supabase not available, falling back to sample events.');
            return sampleEvents; // Fallback to sample data if DB is not available
        }
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'published')
                .order('date', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return []; // Return empty array on error to show 'no events' message
        }
    },

    async fetchTrains() {
        if (!supabase) return sampleTransportation.trains; // Fallback to sample data
        try {
            const { data, error } = await supabase.from('trains').select('*').order('time', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching trains:', error);
            return [];
        }
    },

    async fetchBuses() {
        if (!supabase) return sampleTransportation.buses; // Fallback to sample data
        try {
            const { data, error } = await supabase.from('buses').select('*').order('route', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching buses:', error);
            return [];
        }
    },

    async fetchTotoRoutes() {
        if (!supabase) return sampleTransportation.totoRoutes; // Fallback to sample data
        try {
            const { data, error } = await supabase.from('toto_routes').select('*').order('route', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching toto routes:', error);
            return [];
        }
    },

    async fetchBlogPosts() {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            if (error) throw error;
            appState.blogPosts = data || [];
            return appState.blogPosts;
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    },

    async fetchPostBySlug(slug) {
        if (!supabase) return null;
        const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
        if (error) {
            console.error('Error fetching single post:', error);
            return null;
        }
        return data;
    },

    async fetchJobs() {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            if (error) throw error;
            appState.jobs = data || [];
            return appState.jobs;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },

    async fetchJobById(id) {
        if (!supabase) return null;
        const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching single job:', error);
            return null;
        }
        return data;
    },

    async fetchUserBookmarks() {
        if (!supabase || !appState.currentUser) {
            appState.userBookmarks = [];
            return;
        }
        const { data, error } = await supabase
            .from('bookmarks')
            .select('listing_id')
            .eq('user_id', appState.currentUser.id);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            appState.userBookmarks = [];
        } else {
            appState.userBookmarks = data.map(b => b.listing_id);
            console.log('🔖 Fetched bookmarks:', appState.userBookmarks);
            // Re-render current view to update bookmark icons
            renderer.rerenderCurrentView();
        }
    },

    async addBookmark(listingId) {
        if (!supabase || !appState.currentUser) return { error: { message: 'User not logged in' } };
        return await supabase.from('bookmarks').insert({
            user_id: appState.currentUser.id,
            listing_id: listingId
        });
    },

    async removeBookmark(listingId) {
        if (!supabase || !appState.currentUser) return { error: { message: 'User not logged in' } };
        return await supabase.from('bookmarks').delete()
            .eq('user_id', appState.currentUser.id)
            .eq('listing_id', listingId);
    }
};

// Search functionality
const searchManager = {
    debounceTimeout: null,
    currentQuery: '',

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Main search
        const mainSearch = document.getElementById('main-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (mainSearch) {
            mainSearch.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            
            mainSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });

            mainSearch.addEventListener('focus', (e) => {
                if (e.target.value.length >= 2) {
                    this.showSuggestions(e.target.value);
                }
            });

            mainSearch.addEventListener('blur', () => {
                setTimeout(() => this.hideSuggestions(), 150);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = mainSearch ? mainSearch.value : '';
                this.performSearch(query);
            });
        }

        // Directory search
        const directorySearch = document.getElementById('directory-search');
        if (directorySearch) {
            directorySearch.addEventListener('input', utils.debounce((e) => {
                this.performDirectorySearch(e.target.value);
            }, 300));
        }

        // Voice search
        const voiceBtn = document.getElementById('voice-search-btn');
        if (voiceBtn) {
            if (this.isVoiceSearchSupported()) {
                voiceBtn.addEventListener('click', () => this.startVoiceSearch());
            } else {
                voiceBtn.style.display = 'none';
            }
        }
    },

    handleSearchInput(query) {
        this.currentQuery = query;
        
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            if (query.length >= 2) {
                this.showSuggestions(query);
            } else {
                this.hideSuggestions();
            }
        }, 300);
    },

    performSearch(query) {
        console.log(`🔍 Performing search for: "${query}"`);
        
        appState.searchTerm = query.trim();
        
        if (appState.searchTerm) {
            // The search results will be calculated on the directory page itself.
            // We just need to navigate with the search term.
            navigationManager.navigateTo('directory', { search: appState.searchTerm });
        }
        
        this.hideSuggestions();
    },

    performDirectorySearch(query) {
        appState.searchTerm = query.trim();
        this.updateDirectoryResults();
    },

    updateDirectoryResults() {
        let results = appState.listings;
        
        if (appState.searchTerm) {
            results = dataManager.searchListings(appState.searchTerm);
        }
        
        if (appState.selectedCategory !== 'all') {
            results = results.filter(listing => listing.category === appState.selectedCategory);
        }
        
        if (appState.filterOpenOnly) {
            results = results.filter(listing => dataManager.isBusinessOpen(listing.opening_hours));
        }

        // Always apply the currently selected sort order from the dropdown
        // ✅ FIX: Use the stored sort option from appState instead of reading from a non-existent element.
        // This ensures that the sort order is preserved when navigating back to the directory.
        const sortBy = appState.currentSortOption;
        results = dataManager.sortListings(results, sortBy);

        // Re-calculate distances if a location is available
        if (appState.userLocation) {
            results.forEach(listing => {
                listing.distance = utils.calculateDistance(
                    appState.userLocation.latitude, appState.userLocation.longitude,
                    listing.lat, listing.lng
                );
            });
        }

        appState.filteredListings = results;
        renderer.renderListings(appState.filteredListings);
        renderer.updateResultsInfo(appState.filteredListings.length);
    },

    generateSuggestions(query) {
        const suggestions = new Set();
        const searchTerm = query.toLowerCase();

        // Add category matches
        Object.values(categories).forEach(category => {
            if (category.name.toLowerCase().includes(searchTerm)) {
                suggestions.add(category.name);
            }
            
            category.subcategories?.forEach(sub => {
                if (sub.toLowerCase().includes(searchTerm)) {
                    suggestions.add(sub);
                }
            });
        });

        // Add business name matches
        appState.listings.forEach(listing => {
            if (listing.name.toLowerCase().includes(searchTerm)) {
                suggestions.add(listing.name);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    },

    showSuggestions(query) {
        const suggestions = this.generateSuggestions(query);
        const container = document.getElementById('search-suggestions');
        
        if (!container || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-600 last:border-b-0" data-suggestion="${utils.sanitizeHTML(suggestion)}">
                <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <span class="text-gray-900 dark:text-white">${utils.sanitizeHTML(suggestion)}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.dataset.suggestion;
                const mainSearch = document.getElementById('main-search');
                if (mainSearch) {
                    mainSearch.value = suggestion;
                }
                this.performSearch(suggestion);
            });
        });

        container.classList.remove('hidden');
    },

    hideSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.add('hidden');
        }
    },

    isVoiceSearchSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    },

    startVoiceSearch() {
        if (!this.isVoiceSearchSupported()) {
            toastManager.show('Voice search is not supported in your browser', 'warning');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true; // Keep listening until stopped
        recognition.interimResults = true; // Get results as the user speaks
        recognition.lang = 'en-US';

        const voiceBtn = document.getElementById('voice-search-btn');
        const mainSearch = document.getElementById('main-search');
        const listeningIndicator = document.getElementById('voice-listening-indicator');
        let finalTranscript = '';
        let originalPlaceholder = '';
        
        if (voiceBtn) {
            voiceBtn.classList.add('recording');
            appState.isVoiceRecording = true;
        }
        
        if (mainSearch) {
            originalPlaceholder = mainSearch.placeholder;
            mainSearch.placeholder = 'Listening...';
            mainSearch.value = ''; // Clear previous search
        }
        
        recognition.onstart = () => {
            console.log('🎤 Voice search started. Listening...');
        };
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript = event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const transcript = finalTranscript || interimTranscript;
            if (mainSearch) {
                mainSearch.value = transcript;
            }
            
            // If there's a final result, perform the search
            if (finalTranscript) {
                recognition.stop(); // Stop listening and trigger onend
            }
        };

        recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            
            let message = 'Voice search failed. Please try again.';
            if (event.error === 'not-allowed') {
                message = 'Microphone access denied. Please allow it in your browser settings.';
            } else if (event.error === 'no-speech') {
                message = 'No speech detected. Please try again.';
            }
            
            toastManager.show(message, 'error');
        };

        recognition.onend = () => {
            if (voiceBtn) {
                voiceBtn.classList.remove('recording');
            }
            if (listeningIndicator) listeningIndicator.classList.add('hidden');
            if (mainSearch) {
                mainSearch.placeholder = originalPlaceholder;
            }
            appState.isVoiceRecording = false;

            const query = mainSearch.value.trim();
            if (query) {
                console.log('🎤 Final voice search query:', query);
                this.performSearch(query);
            }
        };

        try {
            recognition.start();
        } catch (error) {
            console.error('Voice recognition start error:', error);
            toastManager.show('Could not start voice search', 'error');
        }
    },

    handleCategoryFilter(category) {
        appState.selectedCategory = category;
        this.updateDirectoryResults();
        
        // Close filter panel on mobile after selection
        const filterSidebar = document.getElementById('filter-sidebar');
        if (filterSidebar && filterSidebar.classList.contains('mobile-active')) {
            document.getElementById('filter-overlay').classList.add('hidden');
            filterSidebar.classList.remove('mobile-active');
            document.body.style.overflow = ''; // Restore scrolling
        }

        const categoryName = categories[category]?.name || 'All Categories';
        const titleEl = document.getElementById('directory-title');
        if (titleEl) {
            titleEl.textContent = categoryName;
        }
    }
};

// Shared mobile menu handler
function bindMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn'); // Get the close button
        if (!mobileMenuBtn || !mobileMenuPanel || !mobileMenuOverlay || !hamburgerIcon) return;

    const toggleMenu = (forceClose = false) => {
        const isOpen = mobileMenuPanel.classList.contains('open');
        if (forceClose || isOpen) {
            mobileMenuPanel.classList.remove('open');
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuOverlay.classList.remove('opacity-100');
            hamburgerIcon.classList.remove('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overflow-hidden-body');
        } else {
            mobileMenuPanel.classList.add('open');
            mobileMenuOverlay.classList.remove('hidden');
            requestAnimationFrame(() => mobileMenuOverlay.classList.add('opacity-100'));
            hamburgerIcon.classList.add('open');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('overflow-hidden-body');
        }
    };
    mobileMenuBtn.addEventListener('click', () => toggleMenu());
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', () => toggleMenu(true)); // Explicitly bind close button
    mobileMenuOverlay.addEventListener('click', () => toggleMenu(true));
    window.addEventListener('resize', () => window.innerWidth >= 768 && toggleMenu(true));
    window.mobileMenuManager = { toggleMenu }; // Expose for delegated events
}

// Navigation system
const navigationManager = {
    init() {
        this.bindEvents();
        this.handleInitialRoute();
    },

    bindEvents() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav]');
            if (navLink) {
                e.preventDefault();
                const params = JSON.parse(navLink.dataset.params || '{}');                
                this.navigateTo(navLink.dataset.nav, params);                
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigateTo(e.state.view, e.state.params || {}, false);
            }
        });

        bindMobileMenu();

        // Mobile filter toggle
        const mobileFilterBtn = document.getElementById('mobile-filter-btn');
        const filterSidebar = document.getElementById('filter-sidebar');
        const closeFilterSidebarBtn = document.getElementById('close-filter-sidebar');
        const filterOverlay = document.getElementById('filter-overlay');

        const openFilterPanel = () => {
            filterSidebar.classList.add('mobile-active');
            filterOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        };

        const closeFilterPanel = () => {
            filterSidebar.classList.remove('mobile-active');
            filterOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        };

        if (mobileFilterBtn && filterSidebar && filterOverlay) {
            mobileFilterBtn.addEventListener('click', () => {
                openFilterPanel();
            });
        }

        if (closeFilterSidebarBtn && filterOverlay) {
            closeFilterSidebarBtn.addEventListener('click', closeFilterPanel);
            filterOverlay.addEventListener('click', closeFilterPanel);
        }

        // User menu dropdown logic (moved here for global availability)
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');

        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the document click listener from closing it immediately
                const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
                userMenuButton.setAttribute('aria-expanded', String(!isExpanded));
                
                if (isExpanded) {
                    userMenuDropdown.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => userMenuDropdown.classList.add('hidden'), 300); // Hide after animation
                } else {
                    userMenuDropdown.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        userMenuDropdown.classList.remove('opacity-0', '-translate-y-2');
                    });
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!userMenuButton.contains(event.target) && !userMenuDropdown.contains(event.target)) {
                    userMenuButton.setAttribute('aria-expanded', 'false');
                    userMenuDropdown.classList.add('hidden', 'opacity-0', '-translate-y-2');
                }
            });
        }

    },

    handleInitialRoute() {
        const hash = window.location.hash;
        if (hash.startsWith('#/')) {
            const path = hash.slice(2); // Remove '#/'
            const [view, paramString] = path.split('?');
            const parsedParams = {};
            
            if (paramString) {
                new URLSearchParams(paramString).forEach((value, key) => {
                    parsedParams[key] = value;
                });
            }
            
            if (view && document.getElementById(`${view}-view`)) {
                this.navigateTo(view, parsedParams, false);                
                return;
            }
        }
        
        this.navigateTo('home', {}, !hash);
    },

    navigateTo(viewId, params = {}, updateHistory = true, shouldUpdateResults = true) {
        console.log(`🧭 Navigating to: ${viewId}`, params);
        
        appState.currentView = viewId;
        
        // Close user dropdown menu on navigation
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuButton && userMenuDropdown && userMenuButton.getAttribute('aria-expanded') === 'true') {
            userMenuButton.setAttribute('aria-expanded', 'false');
            userMenuDropdown.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => userMenuDropdown.classList.add('hidden'), 300);
        }

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update navigation state
        this.updateNavigation(viewId);        
        
        // Close mobile menu on navigation
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        if (mobileMenuPanel && mobileMenuPanel.classList.contains('open')) {
            mobileMenuPanel.classList.remove('open');
            document.getElementById('mobile-menu-overlay').classList.add('hidden');
            document.getElementById('mobile-menu-overlay').classList.remove('opacity-100');
            document.querySelector('.hamburger-icon').classList.remove('open');
            document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overflow-hidden-body');
        }

        // Handle view-specific logic
        switch (viewId) {
            case 'home':
                renderer.renderFeaturedBusinesses();
                // Reset quick filter buttons on home page view                
                document.querySelectorAll('.quick-filter-btn').forEach(btn => {
                    btn.classList.remove('active', 'bg-primary-600', 'text-white');
                    btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
                });
                // Also reset the underlying state                
                appState.filterOpenOnly = false;
                break;
            case 'directory':
                this.handleDirectoryView(params, shouldUpdateResults);                
                break;
            case 'listing':
                renderer.renderListingView(params.id);
                break;
            case 'transportation':
                renderer.renderTransportationView();
                break;
            case 'events':
                renderer.renderEventsView();
                break;
            case 'blog':
                renderer.renderBlogView();
                break;
            case 'post':
                if (params.slug) {
                    renderer.renderSinglePostView(params.slug);
                }
                break;
            case 'jobs':
                renderer.renderJobsView();
                break;
            case 'job-details':
                if (params.id) {
                    renderer.renderJobDetailsView(params.id);
                }
                break;
            case 'bookmarks':
                renderer.renderBookmarksView();
                break;
            case 'dashboard':
                renderer.renderDashboardView();
                break;
            default:
                console.warn(`Unknown view: ${viewId}`);
                break;
        }

        // Update URL
        if (updateHistory) {
            const state = { view: viewId, params };
            let url = `/#/${viewId}`;
            if (Object.keys(params).length > 0) {
                url += `?${new URLSearchParams(params).toString()}`;
            }

            if (viewId === 'home') url = '/';            
            
            if (history.pushState) {
                history.pushState(state, '', url);
            }
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateNavigation(activeView) {
        document.querySelectorAll('.nav-link').forEach(link => {
            // Remove active state from all links
            link.classList.remove('active-nav-link');
            link.removeAttribute('aria-current');
            if (link.dataset.nav === activeView) {
                link.setAttribute('aria-current', 'page');
                // Add active state to the correct link
                link.classList.add('active-nav-link');
            }
        });
    },

    handleDirectoryView(params, shouldUpdateResults = true) {
        // ✅ FIX: When the directory view is rendered, ensure the sort dropdown UI
        // matches the currently active sort option stored in the app state.
        const sortButtonText = document.getElementById('sort-select-selected-text');
        const optionText = document.querySelector(`#sort-select-options .custom-option[data-value="${appState.currentSortOption}"]`)?.textContent;
        if (sortButtonText && optionText) sortButtonText.textContent = optionText;

        // If navigating with specific params (e.g., from a category card), update the state.
        // Otherwise, preserve the existing search state (e.g., from a voice search).
        if (Object.keys(params).length > 0) {
            appState.selectedCategory = params.category || 'all';            
            appState.searchTerm = params.search || '';
        }
        
        renderer.renderDirectoryView(); // Renders the shell, filters, etc.
        if (shouldUpdateResults) {
            searchManager.updateDirectoryResults(); // Re-calculates and renders listings
        } else {
            renderer.renderListings(appState.filteredListings); // Renders the pre-sorted list
        }
    }
};

// Rendering system
const renderer = {
    renderCategoryCards() {
        console.log('🎨 Rendering category cards...');
        
        const container = document.getElementById('category-container');
        if (!container) return;

        const categoryHTML = Object.entries(categories).map(([key, category]) => `
            <div class="category-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center cursor-pointer hover:shadow-xl transition-all duration-300" 
                 data-nav="directory" 
                 data-params='{"category": "${key}"}' 
                 tabindex="0" 
                 role="button" 
                 aria-label="Browse ${category.name}">
                <div class="text-4xl mb-4">${category.icon}</div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">${category.name}</h3>
            </div>
        `).join('');

        container.innerHTML = categoryHTML;
    },

    renderFeaturedBusinesses() {
        console.log('🌟 Rendering featured businesses...');
        
        const container = document.getElementById('featured-businesses');
        if (!container) return;

        // New logic: Show listings that are marked as featured
        const featured = appState.listings
            .filter(listing => listing.is_featured === true)
            // Sort featured listings by creation date (newest first) or rating
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3); // Showing 3 featured businesses for a cleaner look

        if (featured.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="no-results-illustration w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800">
                        <img src="logo.png" alt="Ghatal Guide" class="w-20 h-20">
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No featured businesses yet</h3>
                    <p class="text-gray-600 dark:text-gray-400">Check back soon for top-rated businesses in your area!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = featured.map(listing => this.createListingCard(listing, true)).join('');
    },

    renderServiceCards() {
        const container = document.getElementById('service-cards-container');
        if (!container) return;

        container.innerHTML = `
            <div class="category-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center cursor-pointer" data-nav="transportation" role="button">
                <div class="text-4xl mb-4">🚌</div><h3 class="font-bold text-lg text-gray-900 dark:text-white">Transportation</h3>
            </div>
            <div class="category-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center cursor-pointer" data-nav="events" role="button">
                <div class="text-4xl mb-4">🎉</div><h3 class="font-bold text-lg text-gray-900 dark:text-white">Events & News</h3>
            </div>
        `;
    },

    renderDirectoryView() {
        // Update title
        const titleEl = document.getElementById('directory-title');
        const subtitleEl = document.getElementById('directory-subtitle');
        
        if (titleEl) {
            if (appState.searchTerm) {
                titleEl.textContent = `Search Results for "${appState.searchTerm}"`;
                if (subtitleEl) {
                    subtitleEl.textContent = 'Found matching businesses in Ghatal';
                }
            } else if (appState.selectedCategory !== 'all') {
                const category = categories[appState.selectedCategory];
                titleEl.textContent = category ? category.name : 'Directory';
                if (subtitleEl) {
                    subtitleEl.textContent = 'Browse businesses in this category';
                }
            } else {
                titleEl.textContent = 'All Businesses';
                if (subtitleEl) {
                    subtitleEl.textContent = 'Browse all listings or search for specific businesses';
                }
            }
        }

        // Render filters
        this.renderFilters();
        
        // Set directory search value
        const directorySearch = document.getElementById('directory-search');
        if (directorySearch && appState.searchTerm) {
            directorySearch.value = appState.searchTerm;
        }

        // Sync "Open Now" toggle with app state
        const openNowToggle = document.getElementById('open-now-filter');
        if (openNowToggle) {
            openNowToggle.checked = appState.filterOpenOnly;
        }
    },

    renderFilters() {
        const container = document.getElementById('filters-container');
        if (!container) return;
        
        const filterCategories = [
            { key: 'all', name: 'All Categories' },
            ...Object.entries(categories).map(([key, cat]) => ({ key, name: cat.name }))
        ];
        
        container.innerHTML = filterCategories.map(category => `
            <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded transition-colors">
                <input type="radio" 
                       name="category-filter" 
                       value="${category.key}" 
                       ${category.key === appState.selectedCategory ? 'checked' : ''} 
                       class="text-primary-600 focus:ring-primary-500"
                       onchange="searchManager.handleCategoryFilter('${category.key}')">
                <span class="text-gray-700 dark:text-gray-300 font-medium">${category.name}</span>
            </label>
        `).join('');
    },

    renderListings(listings) {
        const container = document.getElementById('listings-container');
        if (!container) return;

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <div class="no-results-illustration w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center">
                        <span class="text-6xl">🔍</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search terms or browse categories</p>
                    <button onclick="shareManager.clearFilters()" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = listings.map(listing => this.createListingCard(listing)).join('');
    },

    createListingCard(listing, isFeatured = false) {
        const imageUrl400 = utils.getImageUrl(listing, 400, 300); // For srcset 400w and src
        const imageUrl800 = utils.getImageUrl(listing, 800, 600); // For srcset 800w
        const fallbackImageUrl = utils.getImageUrl({ image: null }, 400, 300); // Default fallback image
        const rating = utils.generateStars(listing.rating);
        const phone = utils.formatPhone(listing.phone);
        const isOpen = dataManager.isBusinessOpen(listing.opening_hours);
        
        // [UPDATE] দূরত্বের জন্য ইউনিক আইডি এবং লজিক
        const distanceText = utils.formatDistance(listing.distance); // প্রথমে সোজা দূরত্ব দেখাবে
        const distElementId = `dist-${listing.id}`; // ইউনিক আইডি

        // যদি ইউজার লোকেশন এবং দোকানের লোকেশন থাকে, তবে ১ সেকেন্ড পর OSRM কল করো
        if (appState.userLocation && listing.lat && listing.lng) {
            setTimeout(() => {
                utils.getRoadDistance(
                    appState.userLocation.latitude,
                    appState.userLocation.longitude,
                    listing.lat,
                    listing.lng,
                    distElementId
                );
            }, 1000); // ১ সেকেন্ড দেরি (Lazy Load)
        }

        // Special card for blood banks
        const isBookmarked = appState.currentUser && appState.userBookmarks.includes(listing.id);
        const bookmarkButtonHTML = appState.currentUser ? `
            <button 
                onclick="event.stopPropagation(); bookmarkManager.toggleBookmark(${listing.id}, this);" 
                class="bookmark-btn p-2 bg-gray-100 dark:bg-slate-700 hover:bg-pink-100 dark:hover:bg-pink-900 rounded-full transition-colors group ${isBookmarked ? 'bookmarked' : ''}" 
                title="${isBookmarked ? 'Remove from favorites' : 'Add to favorites'}"
                aria-label="${isBookmarked ? 'Remove from favorites' : 'Add to favorites'}">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                </svg>
            </button>
        ` : '';

        if (listing.subcategory === 'Blood Banks') {
            return this.createBloodBankCard(listing);
        }

        return `
            <div class="listing-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300" 
                 data-nav="listing" 
                 data-params='{"id": ${listing.id}}'
                 tabindex="0"
                 role="button"
                 aria-label="View details for ${utils.sanitizeHTML(listing.name)}"
                 >
                
                <div class="relative">
                    <img srcset="${imageUrl400} 400w, ${imageUrl800} 800w"
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         src="${imageUrl400}"
                         alt="${utils.sanitizeHTML(listing.name)}" 
                         class="w-full h-48 object-cover"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
                    
                    ${isFeatured ? '<div class="absolute top-3 left-3 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">⭐ FEATURED</div>' : ''}
                    
                    <div class="absolute top-3 right-3">
                        <span class="status-${isOpen ? 'open' : 'closed'} px-2 py-1 rounded-full text-xs font-medium">
                            ${isOpen ? '🟢 Open' : '🔴 Closed'}
                        </span>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                            ${utils.sanitizeHTML(listing.subcategory || listing.category)}
                        </p>
                        ${distanceText ? `
                            <span id="${distElementId}" class="text-sm text-gray-600 dark:text-gray-400 font-medium transition-all duration-500">✈️ ${distanceText}</span>
                        ` : ''}
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        ${utils.sanitizeHTML(listing.name)}
                    </h3>
                    
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        📍 ${utils.sanitizeHTML(listing.address)}
                    </p>
                    
                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-2 text-sm font-medium">
                            <span class="text-yellow-500">${rating}</span>
                            <span class="text-gray-400 text-xs">(${listing.reviewCount})</span>
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            ${listing.phone ? `
                                <button onclick="event.stopPropagation(); window.open('tel:${listing.phone}', '_self');" 
                                        class="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-full transition-colors group">
                                    <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </button>
                            ` : ''}
                            
                            <button onclick="event.stopPropagation(); shareManager.shareBusinessListing(${listing.id});" 
                                    class="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-full transition-colors group">
                                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                            </button>
                            ${bookmarkButtonHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    createBloodBankCard(listing) {
        const imageUrl = utils.getImageUrl(listing, 400, 300);
        const fallbackImageUrl = utils.getImageUrl({ image: null }, 400, 300);
        const phone = utils.formatPhone(listing.phone);
        const availableGroups = listing.extra_info?.["Available Groups"] || "N/A";

        return `
            <div class="listing-card bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 overflow-hidden" 
                 tabindex="0"
                 aria-label="View details for ${utils.sanitizeHTML(listing.name)}">
                
                <div class="relative">
                    <img src="${imageUrl}" alt="${utils.sanitizeHTML(listing.name)}" class="w-full h-48 object-cover" loading="lazy"
                         onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
                </div>

                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <p class="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                ${utils.sanitizeHTML(listing.subcategory)}
                            </p>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                ${utils.sanitizeHTML(listing.name)}
                            </h3>
                        </div>
                        <div class="text-4xl">🩸</div>
                    </div>
                    
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        📍 ${utils.sanitizeHTML(listing.address)}
                    </p>

                    <div class="bg-white dark:bg-slate-800 rounded-lg p-3 mb-4">
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Available Blood Groups</p>
                        <p class="text-lg font-bold text-red-600">${availableGroups}</p>
                    </div>
                    
                    <a href="tel:${listing.phone}" class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>Call Now: ${phone}</span>
                    </a>
                </div>
            </div>
        `;
    },

    async renderListingView(listingId) {
        console.log(`Rendering listing view for ID: ${listingId}`);
        
        const listing = appState.listings.find(l => l.id == listingId);
        if (!listing) {            
            toastManager.show('Business not found', 'error');
            navigationManager.navigateTo('directory', {}, false);
            return;
        }

        const container = document.getElementById('listing-content');
        if (!container) return;

        // Update page title for SEO and UX
        document.title = `${listing.name} - Ghatal Guide`;

        const imageUrl = utils.getImageUrl(listing, 800, 400); // Larger image for detail view
        const fallbackImageUrl = utils.getImageUrl({ image: null }, 800, 400);
        const phone = utils.formatPhone(listing.phone);
        const isOpen = dataManager.isBusinessOpen(listing.opening_hours);

        // Fetch reviews and calculate average rating
        const reviews = await dataManager.fetchReviews(listingId);
        const rating = listing.rating; // Use the pre-calculated real rating

        const isBookmarked = appState.currentUser && appState.userBookmarks.includes(listing.id);
        const bookmarkButtonHTML = appState.currentUser ? `
            <button 
                onclick="bookmarkManager.toggleBookmark(${listing.id}, this);"
                class="bookmark-btn bg-gray-100 hover:bg-pink-100 text-gray-600 dark:bg-slate-700 dark:hover:bg-pink-900 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${isBookmarked ? 'bookmarked' : ''}"
                title="${isBookmarked ? 'Remove from favorites' : 'Add to favorites'}">
                <svg class="w-5 h-5 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                </svg>
                <span class="font-semibold">${isBookmarked ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
        ` : '';
        container.innerHTML = `
            <div class="relative">
                <img src="${imageUrl}" 
                     alt="${utils.sanitizeHTML(listing.name)}" 
                     class="w-full h-64 md:h-96 object-cover"
                     onerror="this.onerror=null; this.src='${fallbackImageUrl}';">
                
                <div class="absolute top-6 right-6">
                    <span class="status-${isOpen ? 'open' : 'closed'} px-4 py-2 rounded-full text-sm font-medium">
                        ${isOpen ? '🟢 Open Now' : '🔴 Closed'}
                    </span>
                </div>
            </div>
            
            <div class="p-6 md:p-10">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-2">
                            ${utils.sanitizeHTML(listing.subcategory || listing.category)}
                        </p>
                        <h1 class="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            ${utils.sanitizeHTML(listing.name)}
                        </h1>
                        
                        <div class="flex items-center space-x-4 text-lg">
                            <span class="text-yellow-500">${utils.generateStars(rating)}</span>
                        </div>
                    </div>
                    
                    <div class="mt-6 lg:mt-0 flex space-x-3">
                        <button onclick="shareManager.shareBusinessListing(${listing.id})" 
                                class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                                title="Share ${utils.sanitizeHTML(listing.name)}"
                                aria-label="Share ${utils.sanitizeHTML(listing.name)}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                            <span class="font-semibold">Share</span>
                        </button>
                        ${bookmarkButtonHTML}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                            <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>Address</span>
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${utils.sanitizeHTML(listing.address)}</p>
                    </div>
                    
                    ${listing.phone ? `
                        <div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl">
                            <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                <span>Phone</span>
                            </h3>
                            <a href="tel:${listing.phone}" class="text-primary-600 dark:text-primary-400 hover:underline font-semibold text-lg">${phone}</a>
                        </div>
                    ` : ''}
                    
                    ${listing.googleMapLink ? `
                    <div class="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                            <span>🗺️</span>
                            <span>Location</span>
                        </h3>
                        <a href="${listing.googleMapLink}" 
                           target="_blank" 
                           class="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                            View on Google Maps
                        </a>
                    </div>` : ''}
                </div>
                
                ${listing.extra_info ? `
                    <div class="mb-8 px-6 md:px-10">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-4">Additional Information</h3>
                        <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${Object.entries(listing.extra_info).map(([key, value]) => `
                                <div>
                                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">${key}</p>
                                    <p class="font-semibold text-gray-800 dark:text-gray-200">${value}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Reviews Section -->
                ${this.createReviewsSection(listing.id, reviews)}
            </div>
        `;

        // Add structured data for SEO
        this.addStructuredData(listing, reviews);

        // Bind events for the new review form
        this.bindReviewFormEvents(listing.id);
    },
    
    addStructuredData(listing, reviews) {
        // Remove any existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        const schema = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": listing.name,
            "image": utils.getImageUrl(listing),
            "address": {
                "@type": "PostalAddress",
                "streetAddress": listing.address,
                "addressLocality": "Ghatal",
                "addressRegion": "WB",
                "addressCountry": "IN"
            },
            "telephone": listing.phone,
            "url": `${window.location.origin}/#/listing?id=${listing.id}`
        };

        if (reviews && reviews.length > 0) {
            schema.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": listing.rating.toFixed(1),
                "reviewCount": reviews.length
            };
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    },

    createReviewsSection(listingId, reviews) {
        const reviewCount = reviews.length;

        return `
            <div class="mt-10 pt-8 border-t border-gray-200 dark:border-slate-700">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews (${reviewCount})</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Add Review Form -->
                    <div class="md:col-span-1">
                        <div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 sticky top-24">
                            <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-4">Leave a Review</h3>
                            <form id="review-form" novalidate>
                                <input type="hidden" name="listing_id" value="${listingId}">
                                <div class="space-y-4">
                                    <div>
                                        <label for="user_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name *</label>
                                        <input type="text" name="user_name" id="user_name" required class="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                                    </div>
                                    <div>
                                        <label for="user_email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Email (Optional)</label>
                                        <input type="email" name="user_email" id="user_email" class="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="you@example.com">
                                    </div>
                                    <div>
                                        <label for="review_text" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review *</label>
                                        <textarea name="review_text" id="review_text" rows="4" required class="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating *</label>
                                        <div class="flex items-center space-x-1 star-rating">
                                            ${[5, 4, 3, 2, 1].map(star => `
                                                <input type="radio" id="star${star}" name="rating" value="${star}" class="sr-only" required>
                                                <label for="star${star}" class="cursor-pointer text-3xl text-gray-300 dark:text-gray-500 hover:text-yellow-400 transition-colors" title="${star} stars">★</label>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
                                        Submit Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Existing Reviews -->
                    <div class="md:col-span-2">
                        ${reviewCount > 0 ? reviews.map(review => `
                            <div class="border-b border-gray-200 dark:border-slate-700 py-6 last:border-b-0">
                                <div class="flex items-start space-x-4">
                                    <div class="w-12 h-12 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-300">
                                        ${review.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <h4 class="font-bold text-gray-900 dark:text-white">${utils.sanitizeHTML(review.user_name)}</h4>
                                                <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div class="text-yellow-500 text-sm flex items-center">
                                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <p class="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">${utils.sanitizeHTML(review.review_text)}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="text-center py-12">
                                <div class="text-5xl mb-4">🤔</div>
                                <h4 class="text-xl font-semibold text-gray-900 dark:text-white">No reviews yet</h4>
                                <p class="text-gray-600 dark:text-gray-400 mt-2">Be the first to share your experience!</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    bindReviewFormEvents(listingId) {
        const form = document.getElementById('review-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const formData = new FormData(form);
            const reviewData = {
                listing_id: listingId,
                user_name: formData.get('user_name'),
                user_email: formData.get('user_email') || null,
                review_text: formData.get('review_text'),
                rating: parseInt(formData.get('rating'), 10),
                status: 'pending' // All reviews must be approved
            };

            if (!reviewData.user_name || !reviewData.review_text || !reviewData.rating) {
                toastManager.show('Please fill all required fields.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
                return;
            }

            const { error } = await dataManager.submitReview(reviewData);

            if (error) {
                toastManager.show(`Submission failed: ${error.message}`, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
            } else {
                toastManager.show('Review submitted! It will appear after approval.', 'success', 6000);
                form.reset();
                // Reset star UI
                form.querySelectorAll('.star-rating label').forEach(label => {
                    label.style.color = '';
                });
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
            }
        });

        // Star rating interaction
        const starRating = form.querySelector('.star-rating');
        if (starRating) {
            starRating.addEventListener('mouseover', e => {
                if (e.target.tagName === 'LABEL') {
                    const rating = e.target.previousElementSibling.value;
                    starRating.querySelectorAll('label').forEach((label, index) => {
                        label.style.color = index < (5 - rating) ? '#d1d5db' : '#f59e0b';
                    });
                }
            });
            starRating.addEventListener('mouseout', () => {
                const checkedRadio = starRating.querySelector('input:checked');
                const rating = checkedRadio ? checkedRadio.value : 0;
                starRating.querySelectorAll('label').forEach((label, index) => {
                    label.style.color = index < (5 - rating) ? '' : '#f59e0b';
                });
            });
            starRating.addEventListener('click', e => {
                 if (e.target.tagName === 'LABEL') {
                    const rating = e.target.previousElementSibling.value;
                    starRating.querySelectorAll('label').forEach((label, index) => {
                        label.style.color = index < (5 - rating) ? '' : '#f59e0b';
                    });
                 }
            });
        }
    },

    updateResultsInfo(count) {
        const container = document.getElementById('results-info');
        if (!container) return;

        if (count === 0) {
            container.textContent = 'No results found';
        } else {
            container.textContent = `Showing ${count} result${count === 1 ? '' : 's'}`;
        }
    },

    renderFooterCategories() {
        const container = document.getElementById('footer-categories');
        if (!container) return;

        container.innerHTML = Object.entries(categories)
            .slice(0, 4)
            .map(([key, cat]) => `
                <li>
                    <a href="#" 
                       class="hover:text-white transition-colors" 
                       data-nav="directory" 
                       data-params='{"category": "${key}"}'>
                        ${cat.name}
                    </a>
                </li>
            `).join('');
    }
    ,

    async renderTransportationView() {
        const container = document.getElementById('transportation-content');
        if (!container) return;

        const [trains, buses, totoRoutes] = await Promise.all([
            dataManager.fetchTrains(),
            dataManager.fetchBuses(),
            dataManager.fetchTotoRoutes()
        ]);

        container.innerHTML = `
            <!-- Train Schedule -->
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3"><span class="text-3xl">🚆</span> Train Schedule</h2>
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th class="p-4">Train Name</th><th class="p-4">From</th><th class="p-4">To</th><th class="p-4">Time</th><th class="p-4">Days</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-slate-600">
                                ${trains.map(train => `
                                    <tr>
                                        <td class="p-4 font-medium">${train.name}</td>
                                        <td class="p-4">${train.from_station}</td>
                                        <td class="p-4">${train.to_station}</td>
                                        <td class="p-4">${train.time}</td>
                                        <td class="p-4">${train.days}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Bus Routes -->
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3"><span class="text-3xl">🚌</span> Major Bus Routes</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${buses.map(bus => `
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                            <h3 class="font-bold text-lg mb-2">${bus.route}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Frequency: ${bus.frequency}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">First/Last: ${bus.first_bus} / ${bus.last_bus}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Toto Routes -->
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3"><span class="text-3xl">🛺</span> Popular Toto Routes</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${totoRoutes.map(toto => `
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 class="font-medium">${toto.route}</h3>
                            <span class="font-bold text-lg text-primary-600 dark:text-primary-400">${toto.fare}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async renderEventsView() {
        const container = document.getElementById('events-content');
        if (!container) return;

        const events = await dataManager.fetchEvents();

        if (events.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-600 dark:text-gray-400">No upcoming events at the moment. Please check back later.</p>`;
            return;
        }
        container.innerHTML = events.map(event => `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
                <div class="md:w-1/4 bg-primary-50 dark:bg-primary-900/30 p-6 flex flex-col items-center justify-center text-center">
                    <p class="text-4xl font-bold text-primary-600 dark:text-primary-300">${new Date(event.date).getDate()}</p>
                    <p class="font-semibold text-primary-800 dark:text-primary-200">${new Date(event.date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(event.date).getFullYear()}</p>
                </div>
                <div class="p-6 flex-1">
                    <span class="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 mb-2">${event.category}</span>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${event.title}</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">${event.description}</p>
                    <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <p><strong>📍 Location:</strong> ${event.location}</p>
                        <p><strong>⏰ Time:</strong> ${event.time}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    async renderDashboardView() {
        const container = document.getElementById('dashboard-content');
        if (!container) return; 

        // Check if user is logged in
        if (!appState.currentUser) {
            toastManager.show('Please log in to view your dashboard.', 'error');
            // Redirect to login page
            setTimeout(() => { window.location.href = 'auth.html'; }, 1500);
            return;
        }

        container.innerHTML = `
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p class="mt-4 text-gray-600 dark:text-gray-400">Loading your businesses...</p>
            </div>`;

        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', appState.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            appState.userListings = data;

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                        <div class="text-5xl mb-4">📂</div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No businesses listed yet</h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">You haven't added any businesses. Let's change that!</p>
                        <a href="add-business.html" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            + Add Your First Business
                        </a>
                    </div>`;
            } else {
                 container.innerHTML = `
                    <div class="text-right mb-6">
                        <a href="add-business.html" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span>Add Another Business</span>
                        </a>
                    </div>
                    <div class="space-y-6">
                        ${data.map(listing => this.createDashboardListingCard(listing)).join('')}
                    </div>`;
                // --- FIX: Bind events to the newly rendered dashboard buttons ---
                // Bind delete buttons
                container.querySelectorAll('.dashboard-delete-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        dashboardManager.confirmDelete(btn.dataset.id);
                    });
                });
                // Bind "Add Another Business" button
                const addAnotherBtn = container.querySelector('.add-another-business-btn');
                if (addAnotherBtn) {
                    addAnotherBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = 'add-business.html'; // Navigate to the add business page
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user listings:', error);
            toastManager.show('Could not load your businesses. Please try again.', 'error');
            container.innerHTML = `<p class="text-center text-red-500">Failed to load data.</p>`;
        }
    },

    createDashboardListingCard(listing) {
        const statusStyles = {
            approved: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', icon: '✅' },
            pending_review: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', icon: '⏳' },
            rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', icon: '❌' }
        };
        const style = statusStyles[listing.status] || statusStyles.pending_review;

        return `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}">
                            ${style.icon} ${listing.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Submitted on ${new Date(listing.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">${utils.sanitizeHTML(listing.name)}</h4>
                    <p class="text-gray-600 dark:text-gray-400">${utils.sanitizeHTML(listing.address)}</p>
                </div>
                <div class="flex-shrink-0 flex items-center gap-3 w-full md:w-auto">
                    <button onclick="navigationManager.navigateTo('listing', {id: ${listing.id}})" class="flex-1 md:flex-initial bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        View
                    </button>
                    <a href="add-business.html?id=${listing.id}" class="flex-1 md:flex-initial text-center bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        Edit
                    </a>
                    <button data-id="${listing.id}" class="dashboard-delete-btn flex-1 md:flex-initial bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg font-medium transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    async renderBlogView() {
        const container = document.getElementById('blog-posts-container');
        if (!container) return;

        container.innerHTML = `<p class="col-span-full text-center">Loading posts...</p>`;
        const posts = await dataManager.fetchBlogPosts();

        if (posts.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center">No blog posts found yet. Check back soon!</p>`;
            return;
        }

        container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
    },

    createPostCard(post) {
        const imageUrl = post.featured_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80';
        const excerpt = post.content ? utils.truncateText(post.content.replace(/<[^>]*>?/gm, ''), 120) : 'Read more to find out...';

        return `
            <div class="listing-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer" 
                 data-nav="post" 
                 data-params='{"slug": "${post.slug}"}'
                 tabindex="0">
                <div class="relative">
                    <img src="${imageUrl}" alt="${utils.sanitizeHTML(post.title)}" class="w-full h-48 object-cover">
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">${utils.sanitizeHTML(post.title)}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">By ${utils.sanitizeHTML(post.author_name || 'Admin')} on ${new Date(post.created_at).toLocaleDateString()}</p>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">${excerpt}</p>
                    <span class="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Read More →</span>
                </div>
            </div>
        `;
    },

    async renderSinglePostView(slug) {
        const container = document.getElementById('post-content-container');
        if (!container) return;

        container.innerHTML = `<p>Loading post...</p>`;
        const post = await dataManager.fetchPostBySlug(slug);

        if (!post) {
            container.innerHTML = `<h1 class="text-2xl font-bold">Post not found</h1><p>The post you are looking for does not exist or has been moved.</p>`;
            return;
        }

        // Use the 'marked' library to convert markdown to HTML
        const postContentHtml = marked.parse(post.content || '');

        container.innerHTML = `
            <h1 id="post-title" class="text-3xl md:text-5xl font-bold mb-4">${utils.sanitizeHTML(post.title)}</h1>
            <p class="text-gray-500 dark:text-gray-400 mb-8">
                Published on ${new Date(post.created_at).toLocaleDateString()} by <strong>${utils.sanitizeHTML(post.author_name || 'Admin')}</strong>
            </p>
            ${post.featured_image_url ? `<img src="${post.featured_image_url}" alt="${utils.sanitizeHTML(post.title)}" class="w-full rounded-lg mb-8">` : ''}
            <div class="post-body">${postContentHtml}</div>
        `;
    },

    async renderJobsView() {
        const container = document.getElementById('jobs-list-container');
        if (!container) return;

        container.innerHTML = `<p>Loading job opportunities...</p>`;
        const jobs = await dataManager.fetchJobs();

        if (jobs.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">No job openings available at the moment. Please check back later.</p>`;
            return;
        }

        container.innerHTML = jobs.map(job => this.createJobCard(job)).join('');
    },

    createJobCard(job) {
        const jobTypeClass = job.job_type === 'Full-time' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';

        return `
            <div class="listing-card bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer" 
                 data-nav="job-details" 
                 data-params='{"id": "${job.id}"}'
                 tabindex="0">
                <div class="p-6">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${utils.sanitizeHTML(job.job_title)}</h3>
                        <span class="text-xs font-medium px-2.5 py-0.5 rounded-full mt-2 sm:mt-0 ${jobTypeClass}">${utils.sanitizeHTML(job.job_type || 'N/A')}</span>
                    </div>
                    <p class="text-md font-semibold text-gray-700 dark:text-gray-300">${utils.sanitizeHTML(job.company_name)}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">📍 ${utils.sanitizeHTML(job.location || 'Ghatal')}</p>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">${utils.sanitizeHTML(job.description || 'No description available.')}</p>
                    <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Posted on: ${new Date(job.created_at).toLocaleDateString()}</span>
                        <span class="font-semibold text-primary-600 dark:text-primary-400 hover:underline">View Details →</span>
                    </div>
                </div>
            </div>
        `;
    },

    async renderJobDetailsView(jobId) {
        const container = document.getElementById('job-details-container');
        if (!container) return;

        container.innerHTML = `<p>Loading job details...</p>`;
        const job = await dataManager.fetchJobById(jobId);

        if (!job) {
            container.innerHTML = `<h1 class="text-2xl font-bold">Job not found</h1><p>This job posting may have expired or been removed.</p>`;
            return;
        }

        container.innerHTML = `
            <h1 id="job-title-details" class="text-3xl md:text-4xl font-bold mb-2">${utils.sanitizeHTML(job.job_title)}</h1>
            <p class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">${utils.sanitizeHTML(job.company_name)}</p>
            <p class="text-md text-gray-500 dark:text-gray-400 mb-6">📍 ${utils.sanitizeHTML(job.location || 'Ghatal')}</p>
            
            <div class="flex flex-wrap gap-4 mb-8">
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">Type: ${utils.sanitizeHTML(job.job_type || 'N/A')}</span>
                ${job.salary_range ? `<span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300">Salary: ${utils.sanitizeHTML(job.salary_range)}</span>` : ''}
            </div>

            <h2 class="text-2xl font-bold mt-8 mb-4">Job Description</h2>
            <p>${utils.sanitizeHTML(job.description || 'No description provided.')}</p>

            <h2 class="text-2xl font-bold mt-8 mb-4">Requirements</h2>
            <p>${utils.sanitizeHTML(job.requirements || 'No requirements specified.')}</p>

            <h2 class="text-2xl font-bold mt-8 mb-4">How to Apply</h2>
            <p>Contact using the details below:</p>
            <p class="font-semibold text-lg mt-2">${utils.sanitizeHTML(job.contact_details || 'Contact information not provided.')}</p>

            <p class="text-xs text-gray-500 dark:text-gray-400 mt-12">Posted on: ${new Date(job.created_at).toLocaleDateString()}</p>
        `;
    },

    async renderBookmarksView() {
        const container = document.getElementById('bookmarks-content');
        if (!container) return;

        if (!appState.currentUser) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">Please <a href="add-business.html?action=login" class="text-primary-600 font-semibold hover:underline">log in</a> to see your favorite businesses.</p>
                </div>`;
            return;
        }

        container.innerHTML = `<p class="text-center">Loading your favorites...</p>`;
        const bookmarkedListings = appState.listings.filter(listing => appState.userBookmarks.includes(listing.id));

        if (bookmarkedListings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                    <div class="text-5xl mb-4">❤️</div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">Click the heart icon on any business to save it here.</p>
                    <button data-nav="directory" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Browse Businesses
                    </button>
                </div>`;
        } else {
            container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${bookmarkedListings.map(listing => this.createListingCard(listing)).join('')}</div>`;
        }
    },

    rerenderCurrentView() {
        navigationManager.navigateTo(appState.currentView, {}, false, true);
    }
};

const bookmarkManager = {
    async toggleBookmark(listingId, buttonElement) {
        if (!appState.currentUser) {
            toastManager.show('Please log in to save favorites.', 'info');
            // Redirect to login/signup page
            window.location.href = 'add-business.html?action=login';
            return;
        }

        const isBookmarked = appState.userBookmarks.includes(listingId);
        
        // Optimistic UI update
        this.updateBookmarkState(listingId, !isBookmarked, buttonElement);

        let result;
        if (isBookmarked) {
            result = await dataManager.removeBookmark(listingId);
        } else {
            result = await dataManager.addBookmark(listingId);
        }

        if (result.error) {
            // Revert UI on error
            this.updateBookmarkState(listingId, isBookmarked, buttonElement);
            toastManager.show(`Error: ${result.error.message}`, 'error');
        } else {
            toastManager.show(isBookmarked ? 'Removed from favorites' : 'Added to favorites!', 'success');
        }
    },

    updateBookmarkState(listingId, isBookmarked, buttonElement) {
        if (isBookmarked) {
            if (!appState.userBookmarks.includes(listingId)) {
                appState.userBookmarks.push(listingId);
            }
        } else {
            appState.userBookmarks = appState.userBookmarks.filter(id => id !== listingId);
        }

        // Update all buttons for this listing ID on the page
        document.querySelectorAll(`button[onclick*="toggleBookmark(${listingId},"]`).forEach(btn => {
            const svg = btn.querySelector('svg');
            const span = btn.querySelector('span');
            btn.classList.toggle('bookmarked', isBookmarked);
            btn.setAttribute('title', isBookmarked ? 'Remove from favorites' : 'Add to favorites');
            if (svg) {
                svg.setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
            }
            if (span) {
                span.textContent = isBookmarked ? 'Favorited' : 'Add to Favorites';
            }
        });
    }
};

const dashboardManager = {
    confirmDelete(listingId) {
        if (confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
            this.deleteListing(listingId);
        }
    },
    async deleteListing(listingId) {
        try {
            const { error } = await supabase.from('listings').delete().eq('id', listingId);
            if (error) throw error;
            toastManager.show('Listing deleted successfully!', 'success');
            renderer.renderDashboardView(); // Refresh the dashboard
        } catch (error) {
            console.error('Error deleting listing:', error);
            toastManager.show('Failed to delete listing. Please try again.', 'error');
        }
    }
};

const shareManager = {
    currentShareData: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.id === 'location-services-modal') {
                this.closeModal('location-services-modal');
            }
        });

        // Quick filter buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.handleQuickFilter(filter, e.target);
            });
        });

        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Custom Select Dropdown Logic
        function setupCustomSelect(wrapperId) {
            const wrapper = document.getElementById(wrapperId);
            if (!wrapper) return;

            const button = wrapper.querySelector('button');
            const optionsPanel = wrapper.querySelector('div[id$="-options"]');
            const selectedText = wrapper.querySelector('span[id$="-selected-text"]');
            const chevron = button.querySelector('svg');

            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                // Close other custom selects
                document.querySelectorAll('.custom-select-wrapper').forEach(otherWrapper => {
                    if (otherWrapper.id !== wrapperId) {
                        otherWrapper.querySelector('button').setAttribute('aria-expanded', 'false');
                        otherWrapper.querySelector('div[id$="-options"]').classList.add('hidden', 'opacity-0', '-translate-y-2');
                        otherWrapper.querySelector('svg').style.transform = 'rotate(0deg)';
                    }
                });

                button.setAttribute('aria-expanded', !isExpanded);
                togglePanel(!isExpanded);
            });

            optionsPanel.addEventListener('click', (e) => {
                e.preventDefault();
                const option = e.target.closest('.custom-option');
                if (option) {
                    const value = option.dataset.value;
                    selectedText.textContent = option.textContent;
                    togglePanel(false);

                    // Trigger the original select's change event logic
                    if (wrapperId === 'sort-select-wrapper') {
                        shareManager.handleSortChange(value);
                    } else if (wrapperId === 'view-mode-wrapper') {
                        shareManager.handleViewModeChange(value);
                    }
                }
            });

            document.addEventListener('click', () => {
                togglePanel(false);
            });

            function togglePanel(show) {
                if (show) {
                    optionsPanel.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        optionsPanel.classList.remove('opacity-0', '-translate-y-2');
                    });
                    chevron.style.transform = 'rotate(180deg)';
                } else {
                    optionsPanel.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => optionsPanel.classList.add('hidden'), 200);
                    chevron.style.transform = 'rotate(0deg)';
                }
                button.setAttribute('aria-expanded', String(show));
            }
        }

        setupCustomSelect('sort-select-wrapper');
        setupCustomSelect('view-mode-wrapper');
    },
    
    handleSortChange(sortBy) {
        // ✅ FIX: Store the selected sort option in the global state.
        appState.currentSortOption = sortBy;

        // If sorting by distance and we don't have the location yet, trigger the location flow.
        if (sortBy === 'distance' && !appState.listings.some(l => l.distance !== null)) {
            toastManager.show('Location needed to sort by distance.', 'info');
            geolocationManager.initiateLocationFlow();
            return; // The geolocation flow will handle sorting and rendering.
        }

        // Otherwise, sort the currently visible listings.
        const sortedListings = dataManager.sortListings(appState.filteredListings, sortBy);
        renderer.renderListings(sortedListings);
    },

    handleViewModeChange(viewMode) {
        const container = document.getElementById('listings-container');
        if (container) {
            if (viewMode === 'list') {
                container.classList.remove('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3');
                container.classList.add('grid-cols-1');
            } else {
                container.classList.remove('grid-cols-1');
                container.classList.add('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3');
            }
        }
    },

    shareBusinessListing(listingId) {
        if (navigator.share) {
            const listing = appState.listings.find(l => l.id == listingId);
            if (!listing) {
                toastManager.show('Business not found for sharing.', 'error');
                return;
            }

            const shareData = {
                title: `Check out ${listing.name} on Ghatal Guide`,
                text: `I found ${listing.name} at ${listing.address} on Ghatal Guide. Check it out!`,
                url: `${window.location.origin}/#/listing?id=${listing.id}`
            };

            navigator.share(shareData)
                .then(() => console.log('Successful share'))
                .catch((error) => {
                    // Don't show an error toast if the user cancels the share dialog
                    if (error.name !== 'AbortError') {
                        console.log('Error sharing:', error);
                        toastManager.show('Could not share at this time.', 'error');
                    }
                });
        } else {
            toastManager.show('Sharing is not supported on this browser.', 'warning');
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    handleOpenNowFilter(isChecked) {
        appState.filterOpenOnly = isChecked;
        searchManager.updateDirectoryResults();
    },

    handleQuickFilter(filter, button) {
        // Toggle button active state
        const isActive = button.classList.contains('active');
        
        // Remove active from all quick filter buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-primary-600', 'text-white');
            btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
        });

        if (!isActive) {
            button.classList.add('active', 'bg-primary-600', 'text-white');
            button.classList.remove('bg-white', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
        }

        // Apply filter logic
        let filteredListings = appState.listings;

        if (filter === 'near-me') {
            // When 'near-me' is clicked, clear other filters for a clean distance-based search.
            appState.selectedCategory = 'all';
            appState.searchTerm = '';
            appState.filterOpenOnly = false;
        }

        const handleNearMe = async () => {
            // The entire location logic is now self-contained in geolocationManager.
            // It will show toasts, handle errors, and sort listings upon success.
            // We just need to initiate the flow.
            geolocationManager.initiateLocationFlow();
        };

        if (!isActive) {
            switch (filter) {
                case 'open-now':
                    appState.filterOpenOnly = true;
                    break;
                case 'top-rated':
                    filteredListings = dataManager.sortListings(filteredListings, 'rating');
                    break;
                case 'near-me':
                    handleNearMe();
                    return; // handleNearMe will navigate
            }
        } else {
            // If button is toggled off
            appState.filterOpenOnly = false;
        }

        // For 'top-rated' and 'near-me', we filter immediately and show results.
        // For 'open-now', we navigate and let the directory view handle the filtering based on the new state.
        if (filter === 'open-now') {
            navigationManager.navigateTo('directory');
        } else {
            appState.filteredListings = filteredListings;
            navigationManager.navigateTo('directory');
        }
    },

    clearFilters() {
        // Reset all filter states
        appState.selectedCategory = 'all';
        appState.searchTerm = '';
        appState.filterOpenOnly = false;
        
        // Clear search inputs
        const searches = ['main-search', 'directory-search'];
        searches.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });

        // Reset quick filter buttons
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-primary-600', 'text-white');
            btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
        });

        // Reset category filters
        document.querySelectorAll('input[name="category-filter"]').forEach(radio => {
            radio.checked = radio.value === 'all';
        });

        // Reset sort
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.value = 'name';
        }

        // Update results
        appState.filteredListings = appState.listings;
        renderer.renderListings(appState.filteredListings);
        renderer.updateResultsInfo(appState.filteredListings.length);
        
        toastManager.show('Filters cleared', 'info');
    }
};

// Geolocation manager - Google Maps Style
// script.js ফাইলের geolocationManager অবজেক্ট
const geolocationManager = {
    async initiateLocationFlow() {
        if (!navigator.geolocation) {
            toastManager.show('Geolocation is not supported on this browser.', 'warning');
            this.resetNearMeButton();
            return;
        }

        try {
            // Use the Permissions API to check the status first for a better UX
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

            if (permissionStatus.state === 'granted') {
                // Permission already granted, directly get location
                toastManager.show('Fetching your location...', 'info');
                this.getLocation();
            } else if (permissionStatus.state === 'prompt') {
                // Permission not yet granted, show a toast and then request
                toastManager.show('Please allow location permission...', 'info');
                this.getLocation(); // This will trigger the browser prompt
            } else if (permissionStatus.state === 'denied') {
                // Permission was denied, inform the user
                toastManager.show('Location permission was denied. Please enable it in your browser settings.', 'error');
                this.resetNearMeButton();
            }

            permissionStatus.onchange = () => {
                console.log(`Geolocation permission state changed to: ${permissionStatus.state}`);
                // Optionally handle state changes, e.g., if user changes it from settings
            };

        } catch (error) {
            // Fallback for browsers that might not support Permissions API
            console.warn('Permissions API not fully supported, falling back to direct request.');
            this.getLocation();
        }
    },

    getLocation() {
        loadingManager.show(); // Show loader right before the request

        // First, try for a low-accuracy position. This is faster and helps check permission.
        navigator.geolocation.getCurrentPosition(
            (lowAccuracyPosition) => {
                // Low accuracy successful, now try for high accuracy (GPS)
                console.log('Permission granted. Checking GPS status...');
                this.checkHighAccuracyLocation(lowAccuracyPosition);
            },
            (error) => {
                // This block handles errors like PERMISSION_DENIED or POSITION_UNAVAILABLE
                loadingManager.hide();
                if (error.code === 1) { // PERMISSION_DENIED
                    toastManager.show('Location permission was denied.', 'error');
                } else {
                    toastManager.show('Could not get your location.', 'error');
                }
                this.resetNearMeButton();
            }, 
            { enableHighAccuracy: false }
        );
    },

    checkHighAccuracyLocation(fallbackPosition) {
        // Now request a high-accuracy position to check for GPS
        navigator.geolocation.getCurrentPosition(
            (highAccuracyPosition) => {
                // High accuracy (GPS) successful!
                toastManager.show('Accurate location found!', 'success');
                this.sortListingsByDistance(highAccuracyPosition.coords);
            },
            (error) => {
                if (error.code === 2) { // POSITION_UNAVAILABLE
                    // This specific error code often means GPS is off.
                    console.warn('GPS is off. Showing custom modal.');
                    loadingManager.hide(); 
                    this.showGPSModal(); 
                } else {
                    // For other errors, use the low-accuracy position as a fallback.
                    console.warn('High accuracy failed, using fallback.');
                    toastManager.show('Using approximate location.', 'warning');
                    this.sortListingsByDistance(fallbackPosition.coords);
                }
            }, 
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    },
    
    // দূরত্ব অনুযায়ী তালিকা সাজানো এবং ফলাফল দেখানো
    sortListingsByDistance(coords) {
        appState.userLocation = coords; // Save user location for later use
        loadingManager.hide(); // Hide loader as we start processing

        // Calculate distance for ALL listings and store it in the main state
        appState.listings.forEach(listing => {
            listing.distance = utils.calculateDistance( 
                coords.latitude, coords.longitude,
                listing.lat, listing.lng
            );
        });

        // Sort the entire list of businesses by the newly calculated distance
        const sortedByDistance = dataManager.sortListings(appState.listings, 'distance');
        // CRITICAL FIX: Update the filteredListings to be this newly sorted list.
        appState.filteredListings = sortedByDistance;

        toastManager.show('Sorting businesses by distance...', 'info');
        // Navigate to the directory but prevent it from re-filtering, then manually render the sorted list.
        navigationManager.navigateTo('directory', {}, true, false); 
        renderer.renderListings(appState.filteredListings); // Render the correctly sorted list

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'distance';
    },

    // Function to show your existing `location-services-modal`
    showGPSModal() {
        const modal = document.getElementById('location-services-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    // Function to try again after turning on GPS
    retryLocation() {
        this.closeModal('location-services-modal');
        this.initiateLocationFlow(); // Restart the whole flow
    },

    // A helper function to reset the 'Near Me' button
    resetNearMeButton() {
        const nearMeBtn = document.querySelector('.quick-filter-btn[data-filter="near-me"].active');
        if (nearMeBtn) {
            nearMeBtn.classList.remove('active', 'bg-primary-600', 'text-white');
            nearMeBtn.classList.add('bg-white', 'dark:bg-slate-800', 'text-gray-700', 'dark:text-gray-300');
        }
    },

};


// PWA Install Handler
const pwaManager = {
    deferredInstallPrompt: null,

    init() {
        // If the app is already installed, no need to listen for the prompt.
        if (appState.isAppInstalled) {
            console.log('PWA is already installed.');
            return;
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredInstallPrompt = e;
            console.log('`beforeinstallprompt` event was fired. App is installable.');
            // By not showing any custom UI, the browser will show its default install icon in the omnibox/address bar.
        });

        window.addEventListener('appinstalled', () => {
            appState.isAppInstalled = true;
            this.deferredInstallPrompt = null;
            toastManager.show('✅ App installed successfully!', 'success');
        });
    }
};

const notificationManager = {
    VAPID_PUBLIC_KEY: 'BOTxDi9eNBwIK7hDGCc2svQCjLpU8y0OqFuDr94aa-YCDlM-6cnE9sI5-7SKfsxEXaitmxKKbDqbCcPEGoFIh4c', // ⚠️ আপনার নিজের Public Key এখানে পেস্ট করুন

    init() {
        const enableBtn = document.getElementById('enable-notifications-btn');
        if (!enableBtn) return;

        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            enableBtn.textContent = 'Notifications Not Supported';
            enableBtn.disabled = true;
            return;
        }

        enableBtn.addEventListener('click', () => this.requestPermission());

        // Check current permission status and update UI
        this.updateButtonUI();
    },

    async updateButtonUI() {
        const enableBtn = document.getElementById('enable-notifications-btn');
        if (Notification.permission === 'granted') {
            enableBtn.textContent = 'Notifications Enabled';
            enableBtn.disabled = true;
        } else if (Notification.permission === 'denied') {
            enableBtn.textContent = 'Notifications Blocked';
            enableBtn.disabled = true;
        }
    },

    async requestPermission() {
        const permissionResult = await Notification.requestPermission();
        this.updateButtonUI();

        if (permissionResult === 'granted') {
            console.log('Notification permission granted.');
            await this.subscribeUser();
        } else {
            console.log('Notification permission denied.');
            toastManager.show('You have disabled notifications. You can enable them from browser settings.', 'warning');
        }
    },

    async subscribeUser() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
            });

            console.log('User is subscribed:', subscription);
            await this.saveSubscription(subscription);
            toastManager.show('Notifications enabled successfully!', 'success');
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
            toastManager.show('Failed to enable notifications.', 'error');
        }
    },

    async saveSubscription(subscription) {
        if (!supabase) return;
        const { error } = await supabase.from('push_subscriptions').insert({
            subscription_details: subscription,
            endpoint: subscription.endpoint,
            user_id: appState.currentUser ? appState.currentUser.id : null
        });
        if (error && error.code !== '23505') { // 23505 is unique_violation, ignore if already subscribed
            console.error('Error saving subscription:', error);
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
};

// Main application initialization
const app = {
    async init() {
        console.log('🚀 Initializing Ghatal Guide...');
    
    // Register service worker first
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration.scope);
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }
    
    try {
        loadingManager.show();

        // Initialize core systems that don't depend on data
        themeManager.init();
        toastManager.init();
        networkManager.init();
        pwaManager.init();
        notificationManager.init();

            // Initialize Auth Manager to check user status
            authManager.init();

            // Load data
            await dataManager.fetchListings();
            
            // Initialize components
            navigationManager.init(); // This will now run after data is loaded
            
            // Render initial content
            renderer.renderCategoryCards();
            renderer.renderServiceCards();
            renderer.renderFooterCategories();
            
            searchManager.init();
            shareManager.init();
            console.log('✅ Ghatal Guide initialized successfully!');
            toastManager.show('Welcome to Ghatal Guide!', 'success');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            toastManager.show('Failed to load some features. Please refresh the page.', 'error');
        } finally {
            loadingManager.hide();
        }
    }
};

// Global functions for onclick handlers
window.shareManager = shareManager;
window.searchManager = searchManager;
window.dataManager = dataManager; // Expose for inline event handlers
window.navigationManager = navigationManager;
window.utils = utils; // Explicitly expose utils globally
window.toastManager = toastManager;
window.geolocationManager = geolocationManager;
window.dashboardManager = dashboardManager; // Expose for dashboard actions
window.bookmarkManager = bookmarkManager; // Expose for bookmark actions

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM Content Loaded');

    // This script is for the main application.
    // The add-business page will have its own script.
    await app.init();

});

// Additional utility functions for better user experience
window.addEventListener('beforeunload', (e) => {
    // Warn user if they're leaving the add business form with unsaved changes
    const form = document.getElementById('add-business-form');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let hasChanges = false;
        
        inputs.forEach(input => {
            if (input.value.trim()) {
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modals and suggestions
    if (e.key === 'Escape') {
        searchManager.hideSuggestions();
        
        
        const successModal = document.getElementById('success-modal');
        if (successModal && !successModal.classList.contains('hidden')) {
            successModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        const locationModal = document.getElementById('location-services-modal');
        if (locationModal && !locationModal.classList.contains('hidden')) {
            shareManager.closeModal('location-services-modal');
        }
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('main-search') || document.getElementById('directory-search');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Don't show toast for every error to avoid spamming user
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        console.log(`⚡ Page loaded in ${loadTime}ms`);
    });
}

console.log('✨ Ghatal Guide script loaded successfully');

// Export for debugging (development only)
if (typeof window !== 'undefined') {
    window.GhatalGuideDebug = {
        appState,
        categories,
        utils,
        dataManager,
        searchManager,
        renderer,
        shareManager
    };
}
