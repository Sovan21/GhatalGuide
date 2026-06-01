// =================================================================================
// Ghatal Guide - Admin Panel JavaScript
// =================================================================================
import { supabase } from './adminSupabaseClient.js';

// Rename 'db' to 'supabase' for consistency
const db = supabase;

// --- DOM ELEMENT REFERENCES ---
const DOMElements = {
    loginView: document.getElementById('login-view'),
    dashboardView: document.getElementById('dashboard-view'),
    loginBox: document.getElementById('login-box'),
    loginForm: document.getElementById('login-form'),
    passwordToggle: document.getElementById('password-toggle'),
    eyeOpenIcon: document.getElementById('eye-open-icon'),
    eyeClosedIcon: document.getElementById('eye-closed-icon'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    sunIcon: document.getElementById('sun-icon'),
    moonIcon: document.getElementById('moon-icon'),
    mainPanels: document.querySelectorAll('.main-panel'),
    mainTabsContainer: document.getElementById('main-admin-tabs'),
    listingsPanel: {
        container: document.getElementById('listings-container'),
        tabsContainer: document.getElementById('admin-tabs'),
        loading: document.getElementById('loading'),
        search: document.getElementById('admin-search-input'),
        categoryFilter: document.getElementById('category-filter'),
        sortSelect: document.getElementById('sort-listings'),
        noResults: document.getElementById('no-listings'),
        bulkActionBar: document.getElementById('bulk-action-bar'),
        selectAllCheckbox: document.getElementById('select-all-listings'),
        bulkActionSelect: document.getElementById('bulk-action-select'),
        bulkActionApplyBtn: document.getElementById('bulk-action-apply'),
        bulkCounter: document.getElementById('bulk-counter'),
    },
    reviewsPanel: {
        container: document.getElementById('reviews-container'),
        tabsContainer: document.getElementById('review-tabs'),
        search: document.getElementById('admin-review-search-input'),
        noResults: document.getElementById('no-reviews'),
        bulkActionBar: document.getElementById('bulk-review-action-bar'),
        selectAllCheckbox: document.getElementById('select-all-reviews'),
        bulkActionSelect: document.getElementById('bulk-review-action-select'),
        bulkActionApplyBtn: document.getElementById('bulk-review-action-apply'),
        bulkReviewCounter: document.getElementById('bulk-review-counter'),
    },
    blogPanel: {
        container: document.getElementById('posts-container'),
        tabsContainer: document.getElementById('post-tabs'),
        search: document.getElementById('admin-post-search-input'),
        noResults: document.getElementById('no-posts'),
        addBtn: document.getElementById('add-post-btn'),
    },
    jobsPanel: {
        container: document.getElementById('jobs-container'),
        tabsContainer: document.getElementById('job-tabs'),
        search: document.getElementById('admin-job-search-input'),
        noResults: document.getElementById('no-jobs'),
        addBtn: document.getElementById('add-job-btn'),
    },
    eventsPanel: {
        container: document.getElementById('events-container'),
        tabsContainer: document.getElementById('event-tabs'),
        search: document.getElementById('admin-event-search-input'),
        noResults: document.getElementById('no-events'),
        addBtn: document.getElementById('add-event-btn'),
    },
    transportationPanel: {
        tabsContainer: document.getElementById('transport-tabs'),
        sectionTitle: document.getElementById('transport-section-title'),
        addBtn: document.getElementById('add-transport-btn'),
        search: document.getElementById('admin-transport-search-input'),
        dataContainer: document.getElementById('transport-data-container'),
        noResults: document.getElementById('no-transport-results'),
    },
    stats: {
        approvedListings: document.getElementById('stat-approved-listings'),
        pendingListings: document.getElementById('stat-pending-listings'),
        pendingReviews: document.getElementById('stat-pending-reviews'),
        approvedReviews: document.getElementById('stat-approved-reviews'),
        totalListings: document.getElementById('stat-total-listings'),
        rejectedListings: document.getElementById('stat-rejected-listings'),
    },
  editModal: {
        modal: document.getElementById('edit-modal'),
        form: document.getElementById('edit-form'),
        closeBtn: document.getElementById('close-edit-modal'),
        saveBtn: document.getElementById('save-edit-btn'),
        idInput: document.getElementById('edit-listing-id'),
        categorySelect: document.getElementById('edit-category'),
        subcategorySelect: document.getElementById('edit-subcategory'), // Added
        imageUpload: document.getElementById('edit-image-upload'),
        imageUrlInput: document.getElementById('edit-image-url'),
        imagePreview: document.getElementById('edit-image-preview'),
        imagePreviewWrapper: document.getElementById('edit-image-preview-wrapper'),
        // NEW: Opening Hours elements for Edit Modal
        hoursDropdown: document.getElementById('edit-hours-dropdown'),
        hoursDropdownButton: document.getElementById('edit-hours-dropdown-button'),
        hoursDropdownPanel: document.getElementById('edit-hours-dropdown-panel'),
        hoursDropdownSelected: document.getElementById('edit-hours-dropdown-selected'),
        hoursDropdownChevron: document.getElementById('edit-hours-dropdown-chevron'),
        hoursTypeInput: document.getElementById('edit-hours-type'),
        customHoursSection: document.getElementById('edit-custom-hours-section'),
        openingHoursInputs: document.getElementById('edit-opening-hours-inputs'),
        copyHoursBtn: document.getElementById('edit-copy-hours-btn'),
    nameLabel: document.getElementById('edit-name-label'),

    },
    addModal: {
        modal: document.getElementById('add-modal'),
        form: document.getElementById('add-form'),
        closeBtn: document.getElementById('close-add-modal'),
        saveBtn: document.getElementById('save-add-btn'),
        categorySelect: document.getElementById('add-category'),
        subcategorySelect: document.getElementById('add-subcategory'),
        imageUpload: document.getElementById('add-image-upload'),
        imageUrlInput: document.getElementById('add-image-url'),
        imagePreview: document.getElementById('add-image-preview'),
        imagePreviewWrapper: document.getElementById('add-image-preview-wrapper'),
        nameLabel: document.getElementById('add-name-label'), // NEW: Reference to the name label
        subcategoryWrapper: document.getElementById('add-subcategory-wrapper'),
        // Opening Hours elements for Add Modal
        hoursDropdown: document.getElementById('add-hours-dropdown'),
        hoursDropdownButton: document.getElementById('add-hours-dropdown-button'),
        hoursDropdownPanel: document.getElementById('add-hours-dropdown-panel'),
        hoursDropdownSelected: document.getElementById('add-hours-dropdown-selected'),
        hoursDropdownChevron: document.getElementById('add-hours-dropdown-chevron'),
        hoursTypeInput: document.getElementById('add-hours-type'),
        customHoursSection: document.getElementById('add-custom-hours-section'),
        openingHoursInputs: document.getElementById('add-opening-hours-inputs'),
        copyHoursBtn: document.getElementById('add-copy-hours-btn'),
    },
    editReviewModal: {
        modal: document.getElementById('edit-review-modal'),
        form: document.getElementById('edit-review-form'),
        closeBtn: document.getElementById('close-edit-review-modal'),
        saveBtn: document.getElementById('save-review-edit-btn'),
        idInput: document.getElementById('edit-review-id'),
        ratingContainer: document.getElementById('edit-review-rating'),
    },
    postModal: {
        modal: document.getElementById('post-modal'),
        form: document.getElementById('post-form'),
        closeBtn: document.getElementById('close-post-modal'),
        saveBtn: document.getElementById('save-post-btn'),
        title: document.getElementById('post-modal-title'),
    },
    jobModal: {
        modal: document.getElementById('job-modal'),
        form: document.getElementById('job-form'),
        closeBtn: document.getElementById('close-job-modal'),
        saveBtn: document.getElementById('save-job-btn'),
        title: document.getElementById('job-modal-title'),
    },
    eventModal: {
        modal: document.getElementById('event-modal'),
        form: document.getElementById('event-form'),
        closeBtn: document.getElementById('close-event-modal'),
        saveBtn: document.getElementById('save-event-btn'),
        title: document.getElementById('event-modal-title'),
    },
    trainModal: {
        modal: document.getElementById('train-modal'),
        form: document.getElementById('train-form'),
        title: document.getElementById('train-modal-title'),
    },
    busModal: {
        modal: document.getElementById('bus-modal'),
        form: document.getElementById('bus-form'),
        title: document.getElementById('bus-modal-title'),
    },
    totoRouteModal: {
        modal: document.getElementById('toto-route-modal'),
        form: document.getElementById('toto-route-form'),
        title: document.getElementById('toto-route-modal-title'),
    },
    toastContainer: document.getElementById('toast-container'),
    recentActivity: {
        container: document.getElementById('recent-activity-container'),
        noActivity: document.getElementById('no-recent-activity'),
    }
    ,
    confirmationModal: {
        modal: document.getElementById('confirmation-modal'),
        title: document.getElementById('confirmation-title'),
        message: document.getElementById('confirmation-message'),
        icon: document.getElementById('confirmation-icon'),
        confirmBtn: document.getElementById('confirm-action-btn'),
        cancelBtn: document.getElementById('confirm-cancel-btn'),
        rejectionReasonWrapper: document.getElementById('rejection-reason-wrapper'),
        rejectionReasonInput: document.getElementById('rejection-reason'),
    }
};

// --- STATE MANAGEMENT ---
const AppState = {
    listings: [],
    reviews: [],
    posts: [],
    jobs: [],
    events: [],
    trains: [],
    buses: [],
    toto_routes: [],
    activeListingStatus: 'pending_review',
    activeReviewStatus: 'pending',
    activePostStatus: 'published',
    activeJobStatus: 'active',
    activeEventStatus: 'published',
    activeTransportType: 'trains',
    activeListingCategory: 'all',
    activeListingSort: 'newest',
    selectedListingIds: [],
    selectedReviewIds: [],
    addModalHasUnsavedChanges: false,
    isListingSelectionMode: false,
    isReviewSelectionMode: false,
    activeReviewSearchTerm: '',
    charts: {},
    isDarkMode: false,
    categories: {
        health: { name: "Health & Wellness", icon: "🏥", subcategories: ["Hospitals", "Doctors", "Pharmacy"] },
        food: { name: "Food & Dining", icon: "🍽️", subcategories: ["Restaurants", "Cafes", "Sweets", "Desserts"] },
        shopping: { name: "Shopping", icon: "🛍️", subcategories: ["Apparel", "Electronics", "Groceries", "Book Store"] },
        services: { name: "Local Services", icon: "🔧", subcategories: ["Electricians", "Plumbers", "Mechanics"] },
        education: { name: "Education", icon: "🎓", subcategories: ["Schools", "Colleges", "Coaching Centers"] },
        emergency: { name: "Emergency", icon: "🚨", subcategories: ["Police", "Ambulance", "Fire Station", "Blood Banks"] }
    },
};

// =================================================================================
// UI MODULE
// =================================================================================

const Utils = {
    sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    ,
    extractLatLngFromGoogleMapsLink: (url) => {
        if (!url) return { lat: null, lng: null };
        // Regex to find @latitude,longitude,zoom_level
        const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match && match.length >= 3) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lng };
            }
        }
        return { lat: null, lng: null };
    },
};
const UI = {
    showView(view) {
        DOMElements.loginView.style.display = view === 'login' ? 'flex' : 'none';
        DOMElements.dashboardView.style.display = view === 'dashboard' ? 'block' : 'none';
    },

    toggleTheme() {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        AppState.isDarkMode = isDarkMode;
        localStorage.setItem('adminDarkMode', String(isDarkMode));
        this.setChartDefaults(isDarkMode);
        // Update existing charts
        const newTextColor = isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)';
        Object.values(AppState.charts).forEach(chart => {
            if (chart) {
                // Update the colors for all scales (x and y axes)
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) {
                            scale.ticks.color = newTextColor;
                        }
                    });
                }
                // Update the color for the legend
                if (chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = newTextColor;
                }
                chart.update();
            }
        });
        this.renderListings(); // Re-render listings to apply new theme colors
        this.renderReviews(); // Re-render reviews to apply new theme colors
        this.showToast(`Switched to ${isDarkMode ? 'Dark' : 'Light'} Mode`, 'info');
    },

    initializeTheme() {
        const preferredTheme = localStorage.getItem('adminDarkMode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkMode = preferredTheme === 'true' || (preferredTheme === null && systemPrefersDark);
        AppState.isDarkMode = isDarkMode;
        this.setChartDefaults(isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    },

    setChartDefaults(isDarkMode) {
        const textColor = isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'; // gray-200 / gray-700
        const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(229, 231, 235, 1)'; // slate-700 / gray-200
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
    },

    showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };
        toast.className = `transform transition-all duration-300 text-white px-4 py-3 rounded-lg shadow-lg ${colors[type]}`;
        toast.textContent = message;
        DOMElements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    renderListings() {
        const container = DOMElements.listingsPanel.container;
        container.innerHTML = '';
        DOMElements.listingsPanel.noResults.style.display = 'none';

        if (AppState.listings.length === 0) {
            DOMElements.listingsPanel.noResults.style.display = 'block';
            const searchVal = DOMElements.listingsPanel.search.value;
            // Format status text to be more readable
            const statusText = (AppState.activeListingStatus || 'pending_review').replace('_', ' ');
            const titleElement = DOMElements.listingsPanel.noResults.querySelector('p.font-semibold');
            const subtitleElement = DOMElements.listingsPanel.noResults.querySelector('p.text-gray-500');

            titleElement.textContent = searchVal
                ? `🤔 No listings found for "${searchVal}"`
                : `🎉 No ${statusText} listings found!`; // Message according to status
            subtitleElement.textContent = searchVal
                ? 'Try a different search term or clear the search.'
                : `All listings in the "${statusText}" category are up-to-date.`;
            return;
        }

        AppState.listings.forEach(listing => {
            const card = document.createElement('div');
            card.className = `relative listing-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1`;
            card.dataset.id = listing.id;
            if (AppState.selectedListingIds.includes(listing.id)) card.classList.add('card-selected');
            card.innerHTML = this.getListingCardHTML(listing);
            container.appendChild(card);
        });
        this.updateBulkActionBar();
    },

    getListingCardHTML(listing) {
        const userEmail = listing.user_email; // We now get this directly from our RPC function
        const emailSubject = `Regarding your Ghatal Guide listing: "${listing.name}"`;
        const emailBody = `Hello,\n\nWe're contacting you about your business listing, "${listing.name}", on Ghatal Guide.\n\n[Your message here]\n\nThanks,\nGhatal Guide Admin`;
        const mailtoLink = userEmail ? `mailto:${userEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}` : '#';

        const emailButton = userEmail ? `
            <a href="${mailtoLink}" class="btn btn-secondary btn-sm flex-1" title="Email the owner">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>Contact User</span>
            </a>` : '';
        const buttons = {
            pending_review: `
                <div class="w-full flex gap-2 mb-2">
                    <button data-id="${listing.id}" data-action="approve" class="btn btn-success flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Approve</span></button>
                    <button data-id="${listing.id}" data-action="reject" class="btn btn-danger flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>Reject</span></button>
                </div>
                <div class="w-full flex gap-2">
                    <button data-id="${listing.id}" data-action="edit" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg><span>Edit</span></button>
                </div>`,
            approved: `
                <div class="w-full flex gap-2 mb-2">
                    <button data-id="${listing.id}" data-action="toggle-feature" class="btn ${listing.is_featured ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'btn-secondary'} btn-sm flex-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        <span>${listing.is_featured ? 'Featured' : 'Feature'}</span>
                    </button>
                    <button data-id="${listing.id}" data-action="edit" class="btn btn-primary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg><span>Edit</span></button>
                    ${emailButton}
                </div>
                <div class="w-full flex gap-2">
                    <button data-id="${listing.id}" data-action="move-to-rejected" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg><span>To Rejected</span></button>
                    <button data-id="${listing.id}" data-action="delete" class="btn btn-danger btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg><span>Delete</span></button>
                </div>`,
            rejected: `
                <div class="w-full flex gap-2">
                    <button data-id="${listing.id}" data-action="move-to-approved" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>To Approved</span></button>
                    <button data-id="${listing.id}" data-action="delete" class="btn btn-danger btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg><span>Delete</span></button>
                </div>`,
            feature_requests: `
                <div class="w-full flex gap-2 mb-2"> 
                    <button data-id="${listing.id}" data-action="approve-feature" class="btn btn-success flex-1">Approve Feature</button>
                    <button data-id="${listing.id}" data-action="deny-feature" class="btn btn-danger flex-1">Deny Feature</button>
                </div>
                <div class="w-full flex gap-2">
                    <button data-id="${listing.id}" data-action="remove-feature" class="btn btn-secondary flex-1">Remove Feature</button>
                </div>`
        };
        const cardContentHTML = `
            <div class="selection-indicator">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="p-6 flex-grow select-none card-content-area">
                <div class="flex justify-between items-start">
                    <p class="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">${Utils.sanitizeHTML(listing.subcategory || listing.category)}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
                <h3 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">${Utils.sanitizeHTML(listing.name)}</h3>
                <p class="text-gray-600 dark:text-gray-400 mt-1">${Utils.sanitizeHTML(listing.address)}</p>
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3 text-sm">
                    <p class="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>${Utils.sanitizeHTML(listing.phone)}</span>
                    </p>
                    ${userEmail ? `
                    <p class="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <svg class="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                        <a href="${mailtoLink}" class="hover:underline">${Utils.sanitizeHTML(userEmail)}</a>
                    </p>
                    ` : '<p class="text-sm text-gray-500">User not found or deleted.</p>'}
                    ${listing.description ? `<p class="text-gray-600 dark:text-gray-300 italic">"${Utils.sanitizeHTML(listing.description)}"</p>` : ''}
                    <div class="flex gap-4">
                        ${listing.googleMapLink ? `<a href="${listing.googleMapLink}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">Map Link</a>` : ''}
                        ${listing.image ? `<a href="${listing.image}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">Image</a>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Determine which set of buttons to show
        const actionButtonsHTML = AppState.activeListingStatus === 'feature_requests'
            ? buttons.feature_requests
            : buttons[listing.status] || '';

        return `${cardContentHTML}<div class="card-actions flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">${actionButtonsHTML}</div>`;
    },

    renderReviews() {
        const container = DOMElements.reviewsPanel.container;
        container.innerHTML = '';
        DOMElements.reviewsPanel.noResults.style.display = 'none';

        if (AppState.reviews.length === 0) {
            DOMElements.reviewsPanel.noResults.style.display = 'block';
            const searchVal = DOMElements.reviewsPanel.search.value;
            // Format status text to be more readable
            const statusText = (AppState.activeReviewStatus || 'pending').replace('_', ' ');
            const titleElement = DOMElements.reviewsPanel.noResults.querySelector('p.font-semibold');
            const subtitleElement = DOMElements.reviewsPanel.noResults.querySelector('p.text-gray-500');

            titleElement.textContent = searchVal
                ? `🤔 No reviews found for "${searchVal}"`
                : `🎉 No ${statusText} reviews found!`; // Message according to status
            subtitleElement.textContent = searchVal ? 'Try a different search term.' : `There are no reviews in the "${statusText}" category.`;

            return;
        }

        AppState.reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'relative review-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1';
            card.dataset.id = review.id;
            if (AppState.selectedReviewIds.includes(review.id)) card.classList.add('card-selected');
            card.innerHTML = this.getReviewCardHTML(review);
            container.appendChild(card);
        });
        this.updateBulkReviewActionBar();
    },

    renderPosts() {
        const container = DOMElements.blogPanel.container;
        container.innerHTML = '';
        DOMElements.blogPanel.noResults.style.display = 'none';

        if (AppState.posts.length === 0) {
            DOMElements.blogPanel.noResults.style.display = 'block';
            const searchVal = DOMElements.blogPanel.search.value;
            const statusText = AppState.activePostStatus;
            const titleElement = DOMElements.blogPanel.noResults.querySelector('p.font-semibold');
            titleElement.textContent = searchVal ? `🤔 No posts found for "${searchVal}"` : `✍️ No ${statusText} posts found!`;
            return;
        }

        AppState.posts.forEach(post => {
            const card = document.createElement('div');
            card.className = `post-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg flex flex-col md:flex-row items-start gap-6 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`;
            card.dataset.id = post.id;
            card.innerHTML = this.getPostCardHTML(post);
            container.appendChild(card);
        });
    },

    getPostCardHTML(post) {
        const excerpt = post.content ? Utils.sanitizeHTML(post.content.substring(0, 150) + '...') : 'No content yet.';
        const imageUrl = post.featured_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80';

        return `
            <img src="${imageUrl}" alt="${Utils.sanitizeHTML(post.title)}" class="w-full md:w-48 h-40 object-cover rounded-lg">
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${Utils.sanitizeHTML(post.title)}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">by ${Utils.sanitizeHTML(post.author_name || 'Unknown')}</p>
                <p class="text-gray-600 dark:text-gray-300 mt-3 text-sm leading-relaxed">${excerpt}</p>
                <div class="mt-4 flex gap-2">
                    <button data-id="${post.id}" data-action="edit-post" class="btn btn-primary btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <span>Edit</span>
                    </button>
                    <button data-id="${post.id}" data-action="delete-post" class="btn btn-danger btn-sm">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `;
    },

    openPostModal(post = null) {
        const modal = DOMElements.postModal;
        modal.form.reset();
        if (post) { // Edit mode
            modal.title.textContent = 'Edit Post';
            modal.form.querySelector('#edit-post-id').value = post.id;
            modal.form.querySelector('#post-title').value = post.title;
            modal.form.querySelector('#post-slug').value = post.slug;
            modal.form.querySelector('#post-content').value = post.content || '';
            modal.form.querySelector('#post-author').value = post.author_name || 'Admin';
            modal.form.querySelector('#post-image-url').value = post.featured_image_url || '';
            modal.form.querySelector('#post-status').value = post.status;
        } else { // Add mode
            modal.title.textContent = 'Add New Post';
        }
        this.openModal(modal.modal);
    },

    renderJobs() {
        const container = DOMElements.jobsPanel.container;
        container.innerHTML = '';
        DOMElements.jobsPanel.noResults.style.display = 'none';

        if (AppState.jobs.length === 0) {
            DOMElements.jobsPanel.noResults.style.display = 'block';
            const searchVal = DOMElements.jobsPanel.search.value;
            const statusText = AppState.activeJobStatus;
            const titleElement = DOMElements.jobsPanel.noResults.querySelector('p.font-semibold');
            titleElement.textContent = searchVal ? `🤔 No jobs found for "${searchVal}"` : `💼 No ${statusText} jobs found!`;
            return;
        }

        AppState.jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = `job-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`;
            card.dataset.id = job.id;
            card.innerHTML = this.getJobCardHTML(job);
            container.appendChild(card);
        });
    },

    getJobCardHTML(job) {
        return `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${Utils.sanitizeHTML(job.job_title)}</h3>
                    <p class="text-md text-gray-600 dark:text-gray-300">${Utils.sanitizeHTML(job.company_name)} - <span class="text-sm text-gray-500 dark:text-gray-400">${Utils.sanitizeHTML(job.location)}</span></p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${new Date(job.created_at).toLocaleDateString()}</p>
            </div>
            <div class="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                ${job.description ? `<p><strong>Description:</strong> ${Utils.sanitizeHTML(job.description.substring(0, 100))}...</p>` : ''}
                ${job.job_type ? `<p><strong>Type:</strong> <span class="font-semibold">${Utils.sanitizeHTML(job.job_type)}</span></p>` : ''}
                ${job.salary_range ? `<p><strong>Salary:</strong> <span class="font-semibold">${Utils.sanitizeHTML(job.salary_range)}</span></p>` : ''}
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
                <button data-id="${job.id}" data-action="edit-job" class="btn btn-primary btn-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>Edit</span>
                </button>
                <button data-id="${job.id}" data-action="delete-job" class="btn btn-danger btn-sm">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Delete</span>
                </button>
            </div>
        `;
    },

    openJobModal(job = null) {
        const modal = DOMElements.jobModal;
        modal.form.reset();
        if (job) { // Edit mode
            modal.title.textContent = 'Edit Job Posting';
            Object.keys(job).forEach(key => {
                const input = modal.form.querySelector(`[name="${key}"]`);
                if (input) input.value = job[key] || '';
            });
            modal.form.querySelector('#edit-job-id').value = job.id;
        } else { // Add mode
            modal.title.textContent = 'Add New Job Posting';
        }
        this.openModal(modal.modal);
    },

    renderEvents() {
        const container = DOMElements.eventsPanel.container;
        container.innerHTML = '';
        DOMElements.eventsPanel.noResults.style.display = 'none';

        if (AppState.events.length === 0) {
            DOMElements.eventsPanel.noResults.style.display = 'block';
            const searchVal = DOMElements.eventsPanel.search.value;
            const statusText = AppState.activeEventStatus;
            const titleElement = DOMElements.eventsPanel.noResults.querySelector('p.font-semibold');
            titleElement.textContent = searchVal ? `🤔 No events found for "${searchVal}"` : `🎉 No ${statusText} events found!`;
            return;
        }

        AppState.events.forEach(event => {
            const card = document.createElement('div');
            card.className = `event-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`;
            card.dataset.id = event.id;
            card.innerHTML = this.getEventCardHTML(event);
            container.appendChild(card);
        });
    },

    getEventCardHTML(event) {
        return `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${Utils.sanitizeHTML(event.title)}</h3>
                    <p class="text-md text-gray-600 dark:text-gray-300">${Utils.sanitizeHTML(event.location)} - <span class="text-sm text-gray-500 dark:text-gray-400">${new Date(event.date).toLocaleDateString()} at ${event.time}</span></p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">${new Date(event.created_at).toLocaleDateString()}</p>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mt-3 text-sm leading-relaxed">${Utils.sanitizeHTML(event.description)}</p>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
                <button data-id="${event.id}" data-action="edit-event" class="btn btn-primary btn-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <span>Edit</span>
                </button>
                <button data-id="${event.id}" data-action="delete-event" class="btn btn-danger btn-sm">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Delete</span>
                </button>
            </div>
        `;
    },

    openEventModal(event = null) {
        const modal = DOMElements.eventModal;
        modal.form.reset();
        if (event) { // Edit mode
            modal.title.textContent = 'Edit Event';
            Object.keys(event).forEach(key => {
                const input = modal.form.querySelector(`[name="${key}"]`);
                if (input) input.value = event[key] || '';
            });
            modal.form.querySelector('#edit-event-id').value = event.id;
        } else { // Add mode
            modal.title.textContent = 'Add New Event';
        }
        this.openModal(modal.modal);
    },

    renderTransportation() {
        const container = DOMElements.transportationPanel.dataContainer;
        const noResults = DOMElements.transportationPanel.noResults;
        const type = AppState.activeTransportType;
        const data = AppState[type];

        container.innerHTML = '';
        noResults.style.display = 'none';

        if (data.length === 0) {
            noResults.style.display = 'block';
            const searchVal = DOMElements.transportationPanel.search.value;
            const titleElement = noResults.querySelector('p.font-semibold');
            titleElement.textContent = searchVal ? `🤔 No results for "${searchVal}"` : `No ${type.replace('_', ' ')} found.`;
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = `transport-card bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`;
            card.dataset.id = item.id;
            card.innerHTML = this.getTransportCardHTML(item, type);
            container.appendChild(card);
        });
    },

    getTransportCardHTML(item, type) {
        let content = '';
        if (type === 'trains') {
            content = `<h3 class="font-bold text-lg">${Utils.sanitizeHTML(item.name)}</h3><p class="text-sm text-gray-500">${Utils.sanitizeHTML(item.from_station)} to ${Utils.sanitizeHTML(item.to_station)}</p><p>Time: ${item.time}, Days: ${item.days}</p>`;
        } else if (type === 'buses') {
            content = `<h3 class="font-bold text-lg">${Utils.sanitizeHTML(item.route)}</h3><p class="text-sm">Frequency: ${item.frequency}</p><p>First/Last: ${item.first_bus} / ${item.last_bus}</p>`;
        } else if (type === 'toto_routes') {
            content = `<h3 class="font-bold text-lg">${Utils.sanitizeHTML(item.route)}</h3><p class="text-lg font-semibold text-primary-600">${item.fare}</p>`;
        }

        return `
            <div class="flex justify-between items-center">
                <div class="flex-1">${content}</div>
                <div class="flex flex-col gap-2 ml-4">
                    <button data-id="${item.id}" data-action="edit-transport" class="btn btn-primary btn-sm p-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                    <button data-id="${item.id}" data-action="delete-transport" class="btn btn-danger btn-sm p-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
            </div>
        `;
    },

    openTransportModal(type, item = null) {
        const modalMap = {
            trains: DOMElements.trainModal,
            buses: DOMElements.busModal,
            toto_routes: DOMElements.totoRouteModal,
        };
        const modalElements = modalMap[type];
        if (!modalElements) return;

        modalElements.form.reset();
        if (item) { // Edit mode
            modalElements.title.textContent = `Edit ${type.replace('_', ' ')}`;
            Object.keys(item).forEach(key => {
                const input = modalElements.form.querySelector(`[name="${key}"]`);
                if (input) input.value = item[key] || '';
            });
            // Ensure the hidden ID field is populated for editing
            const idInput = modalElements.form.querySelector('input[name="id"]');
            if (idInput) idInput.value = item.id;
        } else { // Add mode
            modalElements.title.textContent = `Add New ${type.replace('_', ' ')}`;
        }
        this.openModal(modalElements.modal);
    },

    getReviewCardHTML(review) {
        const listingName = review.listing ? review.listing.name : 'Unknown Listing';
        const buttons = {
            pending: `
                <button data-id="${review.id}" data-action="edit-review" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg><span>Edit</span></button>
                <button data-id="${review.id}" data-action="approve-review" class="btn btn-success flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Approve</span></button>
                <button data-id="${review.id}" data-action="reject-review" class="btn btn-danger flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>Reject</span></button>`,
            approved: `
                <button data-id="${review.id}" data-action="edit-review" class="btn btn-primary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg><span>Edit</span></button>
                <button data-id="${review.id}" data-action="reject-review" data-new-status="rejected" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg><span>To Rejected</span></button>
                <button data-id="${review.id}" data-action="delete-review" class="btn btn-danger btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg><span>Delete</span></button>`,
            rejected: `
                <button data-id="${review.id}" data-action="edit-review" class="btn btn-primary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg><span>Edit</span></button>
                <button data-id="${review.id}" data-action="approve-review" data-new-status="approved" class="btn btn-secondary btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>To Approved</span></button>
                <button data-id="${review.id}" data-action="delete-review" class="btn btn-danger btn-sm flex-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg><span>Delete</span></button>`
        };
        return `
            <div class="selection-indicator !bg-purple-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="p-6 flex-grow pointer-events-none select-none">
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center font-bold text-purple-600 dark:text-purple-300 flex-shrink-0">
                        ${Utils.sanitizeHTML(review.user_name.charAt(0).toUpperCase())}
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center">
                            <h4 class="font-bold text-gray-900 dark:text-white">${Utils.sanitizeHTML(review.user_name)}</h4>
                            <div class="text-yellow-400 text-sm">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Review for <span class="font-semibold text-purple-600 dark:text-purple-400">${Utils.sanitizeHTML(listingName)}</span></p>
                    </div>
                </div>
                <p class="mt-4 text-gray-700 dark:text-gray-300 italic">"${Utils.sanitizeHTML(review.review_text)}"</p>
                <p class="text-xs text-gray-400 mt-4 text-right">Submitted: ${new Date(review.created_at).toLocaleString()}</p>
            </div>
            <div class="card-actions flex gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                ${buttons[review.status] || ''}
            </div>`;
    },

    updateCountBadge(type, count) {
        const badge = document.getElementById(`${type}-count`);
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count <= 0);
        }
    },

    updateAllStats(counts) {
        DOMElements.stats.approvedListings.textContent = counts.listings.approved || 0;
        DOMElements.stats.pendingListings.textContent = counts.listings.pending_review || 0;
        DOMElements.stats.pendingReviews.textContent = counts.reviews.pending || 0;
        DOMElements.stats.approvedReviews.textContent = counts.reviews.approved || 0;
        DOMElements.stats.rejectedListings.textContent = counts.listings.rejected || 0;
        DOMElements.stats.totalListings.textContent = (counts.listings.approved || 0) + (counts.listings.pending_review || 0) + (counts.listings.rejected || 0);

        this.updateCountBadge('pending', counts.listings.pending_review);
        this.updateCountBadge('approved', counts.listings.approved);
        this.updateCountBadge('rejected', counts.listings.rejected);
        this.updateCountBadge('review-pending', counts.reviews.pending);
        this.updateCountBadge('review-approved', counts.reviews.approved);
        this.updateCountBadge('review-rejected', counts.reviews.rejected);

        // Update post counts
        this.updateCountBadge('post-published', counts.posts?.published || 0);
        this.updateCountBadge('post-draft', counts.posts?.draft || 0);

        // Update job counts
        this.updateCountBadge('job-active', counts.jobs?.active || 0);
        this.updateCountBadge('job-expired', counts.jobs?.expired || 0);

        // Update event counts
        this.updateCountBadge('event-published', counts.events?.published || 0);
        this.updateCountBadge('event-draft', counts.events?.draft || 0);

        // Update feature request count
        this.updateCountBadge('feature-request', counts.featureRequests || 0);
    },

    renderRecentActivities(listings) {
        const container = DOMElements.recentActivity.container;
        const noActivityMsg = DOMElements.recentActivity.noActivity;

        if (listings.length === 0) {
            noActivityMsg.classList.remove('hidden');
            // Clear any existing items
            container.querySelectorAll('.recent-activity-item').forEach(item => item.remove());
            return;
        }

        noActivityMsg.classList.add('hidden');
        container.innerHTML = listings.map(listing => `
            <div class="recent-activity-item flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 flex-shrink-0">
                        ${Utils.sanitizeHTML(listing.name.charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800 dark:text-gray-200">${Utils.sanitizeHTML(listing.name)}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${Utils.sanitizeHTML(listing.subcategory)} &bull; Submitted on ${new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-success" data-action="approve" data-id="${listing.id}" data-new-status="approved">Approve</button>
                    <button class="btn btn-sm btn-danger" data-action="reject" data-id="${listing.id}" data-new-status="rejected">Reject</button>
                </div>
            </div>
        `).join('');
    },

    switchMainTab(panelId) {
        DOMElements.mainPanels.forEach(panel => panel.classList.add('hidden'));
        document.getElementById(panelId).classList.remove('hidden');

        DOMElements.mainTabsContainer.querySelectorAll('.main-tab-btn').forEach(btn => {
            const isActive = btn.dataset.panel === panelId;
            btn.classList.toggle('border-blue-500', isActive);
            btn.classList.toggle('text-blue-600', isActive);
            btn.classList.toggle('dark:text-blue-400', isActive);
            btn.classList.toggle('border-transparent', !isActive);
            btn.classList.toggle('text-gray-500', !isActive);
            btn.classList.toggle('dark:text-gray-400', !isActive);
        });
        sessionStorage.setItem('adminActiveMainTab', panelId); // Save active main tab
    },

    setActiveSubTab(container, status, activeClasses) {
        // Define all possible active classes to ensure they are all removed
        const allActiveClasses = [
            'border-blue-500', 'text-blue-600', 'dark:border-blue-400', 'dark:text-blue-400',
            'border-yellow-500', 'text-yellow-600', 'dark:border-yellow-400', 'dark:text-yellow-400',
            'border-purple-500', 'text-purple-600', 'dark:border-purple-400', 'dark:text-purple-400',
            'border-green-500', 'text-green-600', 'dark:border-green-400', 'dark:text-green-400',
            'border-indigo-500', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400',
            'border-pink-500', 'text-pink-600', 'dark:border-pink-400', 'dark:text-pink-400',
            'border-teal-500', 'text-teal-600', 'dark:border-teal-400', 'dark:text-teal-400'
        ];

        container.querySelectorAll('button').forEach(btn => {
            const isActive = btn.dataset.status === status || btn.dataset.type === status;
            // First, remove all possible active classes and add inactive classes
            btn.classList.remove(...allActiveClasses);
            btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');

            if (isActive) {
                // If this is the active button, remove inactive classes and add the correct active ones
                btn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
                btn.classList.add(activeClasses.border, activeClasses.text, activeClasses.darkBorder, activeClasses.darkText);
            }
        });
        // Sub-tab states are saved in their respective setActiveXTab functions
    },

    openModal(modalElement) {
        modalElement.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalElement) {
        modalElement.classList.add('hidden');
        document.body.style.overflow = '';
    },

    showConfirmation({ title, message, onConfirm, type = 'danger' }) {
        const modal = DOMElements.confirmationModal;
        modal.title.textContent = title;
        modal.message.textContent = message;

        // Handle rejection reason input
        const isRejectAction = title.toLowerCase().includes('reject');
        modal.rejectionReasonWrapper.classList.toggle('hidden', !isRejectAction);
        modal.rejectionReasonInput.value = '';

        // Reset classes
        modal.confirmBtn.className = 'btn py-3 px-6';
        modal.icon.innerHTML = '';

        const settings = {
            danger: {
                btnClass: 'btn-danger',
                icon: '<svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>',
                iconBg: 'bg-red-100 dark:bg-red-900'
            },
            success: {
                btnClass: 'btn-success',
                icon: '<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
                iconBg: 'bg-green-100 dark:bg-green-900'
            }
        };

        modal.confirmBtn.classList.add(settings[type].btnClass);
        modal.icon.className = `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${settings[type].iconBg}`;
        modal.icon.innerHTML = settings[type].icon;

        // Clone and replace the button to remove old event listeners
        const newConfirmBtn = modal.confirmBtn.cloneNode(true);
        modal.confirmBtn.parentNode.replaceChild(newConfirmBtn, modal.confirmBtn);
        DOMElements.confirmationModal.confirmBtn = newConfirmBtn;

        newConfirmBtn.onclick = () => {
            const reason = isRejectAction ? modal.rejectionReasonInput.value.trim() : null;
            onConfirm(reason); // Pass reason to the callback
            this.closeModal(modal.modal);
        };
        modal.cancelBtn.onclick = () => this.closeModal(modal.modal);
        this.openModal(modal.modal);
    },

    populatePostSlug(title) {
        const slugInput = DOMElements.postModal.form.querySelector('#post-slug');
        if (!slugInput) return;

        // Only auto-populate if slug is empty (to avoid overwriting user's custom slug)
        if (slugInput.value.trim() === '') {
            const slug = title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // remove non-word chars
                .replace(/[\s_-]+/g, '-') // swap spaces for -
                .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
            slugInput.value = slug;
        }
    },

    // NEW: Utility function to get dynamic business name label based on subcategory
    getAddBusinessNameLabel(subcategory) {
        // A comprehensive map for business name labels based on subcategory
        const labelMap = {
            // Health
            'Hospitals': 'Hospital Name *',
            'Doctors': 'Doctor Name *',
            'Pharmacy': 'Pharmacy Name *',
            // Food
            'Restaurants': 'Restaurant Name *',
            'Cafes': 'Cafe Name *',
            'Sweets': 'Sweet Shop Name *',
            'Desserts': 'Dessert Shop Name *',
            // Shopping
            'Apparel': 'Store Name *',
            'Electronics': 'Store Name *',
            'Groceries': 'Store Name *',
            'Book Store': 'Book Store Name *',
            // Services
            'Electricians': 'Service Provider Name *',
            'Plumbers': 'Service Provider Name *',
            'Mechanics': 'Service Provider Name *',
            // Education
            'Schools': 'School Name *',
            'Colleges': 'College Name *',
            'Coaching Centers': 'Institute Name *',
            // Emergency
            'Blood Banks': 'Blood Bank Name *'
        };
        return labelMap[subcategory] || 'Name *';
    },
    
    // UI অবজেক্টের ভেতরে এই ফাংশনটি রিপ্লেস করুন
populateEditForm(listing) {
    const modalElements = DOMElements.editModal;
    const form = modalElements.form;

    // ১. সাধারণ ফিল্ডগুলো সেট করা
    modalElements.idInput.value = listing.id;
    form.querySelector('#edit-name').value = listing.name || '';
    form.querySelector('#edit-phone').value = listing.phone || '';
    form.querySelector('#edit-address').value = listing.address || '';
    form.querySelector('#edit-gmap').value = listing.googleMapLink || '';
    form.querySelector('#edit-description').value = listing.description || '';

    // ২. ইমেজ প্রিভিউ হ্যান্ডলিং
    modalElements.imageUpload.value = ''; // ফাইল ইনপুট রিসেট
    modalElements.imageUrlInput.value = listing.image || '';
    if (listing.image) {
        modalElements.imagePreview.src = listing.image;
        modalElements.imagePreviewWrapper.classList.remove('hidden');
    } else {
        modalElements.imagePreviewWrapper.classList.add('hidden');
    }

    // ৩. ক্যাটাগরি এবং সাব-ক্যাটাগরি সেটআপ
    modalElements.categorySelect.innerHTML = Object.entries(AppState.categories).map(([key, cat]) =>
        `<option value="${key}" ${listing.category === key ? 'selected' : ''}>${cat.name}</option>`
    ).join('');

    // সাব-ক্যাটাগরি অপশন জেনারেট করা এবং ভ্যালু সিলেক্ট করা
    this.populateSubcategories(listing.category, listing.subcategory);
    if (DOMElements.editModal.nameLabel) {
    DOMElements.editModal.nameLabel.textContent = this.getAddBusinessNameLabel(listing.subcategory);
}

    // ৪. Opening Hours লজিক (Dropdown + Custom Inputs)
    const hoursData = listing.opening_hours || { status: 'open_24_7' };
    const hoursType = hoursData.status || 'open_24_7';

    // Hidden input এ ভ্যালু সেট করা
    modalElements.hoursTypeInput.value = hoursType;

    // ড্রপডাউনের ডিসপ্লে টেক্সট আপডেট করা
    let displayHtml = '';
    if (hoursType === 'open_24_7') displayHtml = `<span class="text-xl">🕒</span><span class="font-medium text-gray-800 dark:text-gray-200">Open 24/7</span>`;
    else if (hoursType === 'temporarily_closed') displayHtml = `<span class="text-xl">⛔</span><span class="font-medium text-gray-800 dark:text-gray-200">Temporarily Closed</span>`;
    else displayHtml = `<span class="text-xl">⚙️</span><span class="font-medium text-gray-800 dark:text-gray-200">Set Custom Hours</span>`;
    
    modalElements.hoursDropdownSelected.innerHTML = `<span class="flex items-center gap-x-3">${displayHtml}</span>`;

    // Custom Hours হলে ইনপুট বক্স দেখানো
    if (hoursType === 'custom') {
        modalElements.customHoursSection.classList.remove('hidden');
        // ডাটাবেস থেকে পাওয়া সময় দিয়ে ইনপুট রেন্ডার করা
        this.renderEditOpeningHoursInputs(hoursData.hours); 
    } else {
        modalElements.customHoursSection.classList.add('hidden');
        modalElements.openingHoursInputs.innerHTML = '';
    }

    this.openModal(modalElements.modal);
},

renderEditOpeningHoursInputs(existingHours = null) {
    const container = DOMElements.editModal.openingHoursInputs;
    if (!container) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    container.innerHTML = days.map(day => {
        const dayKey = day.toLowerCase();
        // ডাটা থাকলে সেটা দেখাবে, না থাকলে খালি স্ট্রিং
        const dayData = existingHours && existingHours[dayKey] ? existingHours[dayKey] : { open: '', close: '' };
        
        return `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <label class="font-medium text-gray-700 dark:text-gray-300">${day}</label>
            <div class="col-span-2 grid grid-cols-2 gap-2">
                <input type="time" name="edit-open-${dayKey}" 
                       value="${dayData.open || ''}"
                       class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <input type="time" name="edit-close-${dayKey}" 
                       value="${dayData.close || ''}"
                       class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
        </div>
    `;}).join('');
},



    populateSubcategories(categoryKey, selectedSubcategory) {
        const subcategorySelect = DOMElements.editModal.subcategorySelect;
        const category = AppState.categories[categoryKey];
        if (category && category.subcategories) {
            subcategorySelect.innerHTML = category.subcategories.map(sub =>
                `<option value="${sub}" ${selectedSubcategory === sub ? 'selected' : ''}>${sub}</option>`
            ).join('');
            subcategorySelect.parentElement.style.display = 'block';
        } else {
            subcategorySelect.innerHTML = '';
            subcategorySelect.parentElement.style.display = 'none';
        }
    },

    // NEW: Utility for Add Modal opening hours dropdown styling
    addModalHoursDropdownStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .add-hours-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
            .add-hours-option:hover, .add-hours-option.selected { background-color: #dbeafe; /* primary-100 */ }
            .dark .add-hours-option:hover, .dark .add-hours-option.selected { background-color: #1e40af; /* primary-800 */ }
        `;
        document.head.appendChild(style);
    },

    populateEditReviewForm(review) {
        const modal = DOMElements.editReviewModal;
        modal.idInput.value = review.id;
        modal.form.querySelector('#edit-review-user-name').value = review.user_name || '';
        modal.form.querySelector('#edit-review-text').value = review.review_text || '';

        const starRadio = modal.ratingContainer.querySelector(`input[name="rating"][value="${review.rating}"]`);
        if (starRadio) starRadio.checked = true;

        this.updateStarDisplay(modal.ratingContainer, review.rating);
        this.openModal(modal.modal);
    },

    updateStarDisplay(container, rating) {
        container.querySelectorAll('label').forEach(label => {
            const starValue = parseInt(label.getAttribute('for').replace('edit-star', ''), 10);
            label.classList.toggle('text-yellow-400', starValue <= rating);
            label.classList.toggle('text-gray-300', starValue > rating);
            label.classList.toggle('dark:text-gray-500', starValue > rating);
        });
    },

    updateBulkActionBar() {
        const count = AppState.selectedListingIds.length;
        const bar = DOMElements.listingsPanel.bulkActionBar;
        const counter = DOMElements.listingsPanel.bulkCounter;

        if (count > 0) {
            bar.classList.remove('hidden');
            counter.textContent = `${count} selected`;
        } else {
            bar.classList.add('hidden');
        }
        // Update "Select All" checkbox state
        DOMElements.listingsPanel.selectAllCheckbox.checked = count > 0 && count === AppState.listings.length;
    },

    updateBulkReviewActionBar() {
        const count = AppState.selectedReviewIds.length;
        const bar = DOMElements.reviewsPanel.bulkActionBar;
        const counter = DOMElements.reviewsPanel.bulkReviewCounter;

        if (count > 0) {
            bar.classList.remove('hidden');
            counter.textContent = `${count} selected`;
        } else {
            bar.classList.add('hidden');
        }
        DOMElements.reviewsPanel.selectAllCheckbox.checked = count > 0 && count === AppState.reviews.length;
    }

};

// =================================================================================
// CHART MODULE
// =================================================================================
const ChartManager = {
    createListingsByCategoryChart(data) {
        const ctx = document.getElementById('listings-by-category-chart').getContext('2d');
        if (AppState.charts.listings) AppState.charts.listings.destroy();

        const labels = data.map(item => AppState.categories[item.category]?.name || item.category);
        const counts = data.map(item => item.count);

        AppState.charts.listings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Approved Listings',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            color: AppState.isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: AppState.isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'
                        }
                    }
                },
                plugins: {
                    legend: { 
                        display: false,
                        labels: {
                            color: AppState.isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const categoryKey = Object.keys(AppState.categories).find(key => AppState.categories[key].name === labels[index]);
                        if (categoryKey) {
                            UI.showToast(`Showing approved listings for: ${labels[index]}`, 'info');
                            UI.switchMainTab('listings-panel');
                            setActiveListingTab('approved', categoryKey);
                        }
                    }
                }
            }
        });
    },

    createReviewsStatusChart(data) {
        const ctx = document.getElementById('reviews-status-chart').getContext('2d');
        if (AppState.charts.reviews) AppState.charts.reviews.destroy();

        AppState.charts.reviews = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Approved', 'Rejected'],
                datasets: [{
                    data: [data.pending, data.approved, data.rejected],
                    backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            color: AppState.isDarkMode ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'
                        }
                    }
                },
                onClick: (e, elements) => {
                    if (elements.length > 0) {
                        const statusKey = ['pending', 'approved', 'rejected'][elements[0].index];
                        UI.showToast(`Showing ${statusKey} reviews`, 'info');
                        UI.switchMainTab('reviews-panel');
                        setActiveReviewTab(statusKey);
                    }
                }
            }
        });
    },

    createSubmissionsOverTimeChart(data) {
        const ctx = document.getElementById('submissions-over-time-chart').getContext('2d');
        if (AppState.charts.submissions) AppState.charts.submissions.destroy();

        const labels = data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const counts = data.map(item => item.count);

        AppState.charts.submissions = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Listings',
                    data: counts,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    tension: 0.3,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    }
};

// =================================================================================
// API MODULE
// =================================================================================
const API = {
    async fetchListings(status, categoryFilter = 'all', searchQuery = null, sortBy = 'newest') {
        // --- ROBUST SOLUTION ---
        // The new `get_admin_listings` RPC function now returns the complete `listings` table structure,
        // which prevents "structure mismatch" errors. However, it does not return the user's email.
        // We will fetch the listings first, then fetch all required user emails in a single, separate query.
        // This is an optimized approach that avoids the N+1 problem.

        // 1. Fetch all listings for the given status using the robust RPC function.
        const { data: listings, error } = await db.rpc('get_admin_listings', {
            listing_status: status
        });

        if (error) {
            UI.showToast('Error fetching listings: ' + error.message, 'error');
            console.error("Error fetching listings:", error);
            return [];
        }

        if (!listings || listings.length === 0) {
            return [];
        }

        // 2. Collect all unique user IDs from the fetched listings.
        const userIds = [...new Set(listings.map(l => l.user_id).filter(id => id))];

        // 3. Fetch emails for all those user IDs in one single query.
        let userEmailMap = new Map();
        if (userIds.length > 0) {
            const { data: users, error: userError } = await db.from('users').select('id, email').in('id', userIds);
            if (!userError && users) {
                users.forEach(user => userEmailMap.set(user.id, user.email));
            }
        }

        // 4. Combine the listings with their corresponding user emails.
        let combinedData = listings.map(listing => ({
            ...listing,
            user_email: userEmailMap.get(listing.user_id) || null
        }));

        let filteredData = combinedData;

        // Client-side filtering
        if (categoryFilter && categoryFilter !== 'all') {
            filteredData = filteredData.filter(item => item.category === categoryFilter);
        }
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.name.toLowerCase().includes(lowercasedQuery) ||
                item.address.toLowerCase().includes(lowercasedQuery) ||
                (item.user_email && item.user_email.toLowerCase().includes(lowercasedQuery))
            );
        }

        // Client-side sorting
        if (sortBy === 'oldest') filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (sortBy === 'name_asc') filteredData.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'newest') filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return filteredData;
    },

    async fetchReviews(status, searchQuery = null) {
        let query = db
            .from('reviews')
            .select('*, listing:listings (name)')
            .eq('status', status);

        if (searchQuery) {
            const searchTerm = `%${searchQuery}%`;
            // Correct syntax for .or() with a foreign table filter.
            // We are searching in the review's text, the user's name,
            // and the name of the listing associated with the review.
            // The `listings!listing_id` part tells Supabase to look through the relationship.
            query = query.or(`review_text.ilike.${searchTerm},user_name.ilike.${searchTerm},listings!listing_id.name.ilike.${searchTerm}`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: true });

        if (error) {
            UI.showToast('Error fetching reviews: ' + error.message, 'error');
            return [];
        }
        return data;
    },

    async fetchRecentPendingListings() {
        const { data, error } = await db
            .from('listings')
            .select('*')
            .eq('status', 'pending_review')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) {
            console.error('Error fetching recent listings:', error);
            return [];
        }
        return data;
    },

    async fetchAllCounts() {
        const listingStatuses = ['pending_review', 'approved', 'rejected'];
        const reviewStatuses = ['pending', 'approved', 'rejected'];
        const postStatuses = ['published', 'draft'];
        const jobStatuses = ['active', 'expired'];
        const eventStatuses = ['published', 'draft'];
        
        const listingPromises = listingStatuses.map(status =>
            db.from('listings').select('id', { count: 'exact', head: true }).eq('status', status)
        );
        const reviewPromises = reviewStatuses.map(status =>
            db.from('reviews').select('id', { count: 'exact', head: true }).eq('status', status)
        );
        const postPromises = postStatuses.map(status =>
            db.from('posts').select('id', { count: 'exact', head: true }).eq('status', status)
        );
        const jobPromises = jobStatuses.map(status =>
            db.from('jobs').select('id', { count: 'exact', head: true }).eq('status', status)
        );
        const eventPromises = eventStatuses.map(status =>
            db.from('events').select('id', { count: 'exact', head: true }).eq('status', status)
        );
        // Add promise for feature requests
        const featureRequestPromise = db.from('listings').select('id', { count: 'exact', head: true }).eq('feature_status', 'requested');


        const [listingResults, reviewResults, postResults, jobResults, eventResults, featureRequestResult] = await Promise.all([
            Promise.all(listingPromises),
            Promise.all(reviewPromises),
            Promise.all(postPromises),
            Promise.all(jobPromises),
            Promise.all(eventPromises),
            featureRequestPromise
        ]);

        const counts = {
            listings: listingStatuses.reduce((acc, status, i) => ({ ...acc, [status]: listingResults[i].count }), {}),
            reviews: reviewStatuses.reduce((acc, status, i) => ({ ...acc, [status]: reviewResults[i].count }), {}),
            posts: postStatuses.reduce((acc, status, i) => ({ ...acc, [status]: postResults[i].count }), {}),
            jobs: jobStatuses.reduce((acc, status, i) => ({ ...acc, [status]: jobResults[i].count }), {}),
            events: eventStatuses.reduce((acc, status, i) => ({ ...acc, [status]: eventResults[i].count }), {}),
            featureRequests: featureRequestResult.count
        };

        UI.updateAllStats(counts);

        // Fetch and create charts safely
        try {
            const { data: categoryData, error } = await db.rpc('get_category_counts');
            if (error) {
                console.error('Error fetching category counts for chart:', error);
                throw error; // Rethrow to be caught by the outer catch block if needed
            }
            ChartManager.createListingsByCategoryChart(categoryData || []);

        // Fetch and create submissions over time chart
        const { data: submissionsData, error: submissionsError } = await db.rpc('get_submissions_over_time');
        if (submissionsError) {
            console.error('Error fetching submissions over time for chart:', submissionsError);
        } else {
            ChartManager.createSubmissionsOverTimeChart(submissionsData || []);
        }
        } catch (chartError) {
            console.error("Could not render Listings by Category chart.", chartError);
        }

        ChartManager.createReviewsStatusChart(counts.reviews);
    },

    async approveListingWithEdgeFunction(id) {
        try {
            const { data: { session } } = await db.auth.getSession();
            if (!session) {
                throw new Error("Authentication token not found.");
            }

            const { data, error } = await db.functions.invoke('approve-listing', {
                body: { listingId: id },
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (error) throw error;

            // Use the message from the function if available
            UI.showToast(data.message || 'Listing approved!', 'success');
            loadListings();
            this.fetchAllCounts();
            this.fetchRecentPendingListings().then(UI.renderRecentActivities);
        } catch (err) {
            UI.showToast(`Failed to approve listing: ${err.message}`, 'error');
        }
    },

    async updateListingStatus(id, newStatus, reason = null) {
        const updateData = { status: newStatus };
        // Add rejection_reason if provided
        if (newStatus === 'rejected' && reason) updateData.rejection_reason = reason;
        const { data, error } = await db.from('listings').update(updateData).eq('id', id).select().single();

        if (error) {
            UI.showToast(`Failed to update listing.`, 'error');
            return false; // Indicate failure
        } else {
            UI.showToast(`Listing ${newStatus}!`, 'success');
            // OPTIMIZATION: Instead of a full reload, remove the card from the UI directly
            // and then update counts in the background. This provides instant feedback.
            const cardToRemove = DOMElements.listingsPanel.container.querySelector(`.listing-card[data-id="${id}"]`);
            if (cardToRemove) {
                cardToRemove.style.transition = 'opacity 0.5s, transform 0.5s';
                cardToRemove.style.opacity = '0';
                cardToRemove.style.transform = 'scale(0.9)';
                setTimeout(() => cardToRemove.remove(), 500);
            }
            this.fetchAllCounts();
            this.fetchRecentPendingListings().then(UI.renderRecentActivities); // Added to refresh the dashboard list
            return true; // Indicate success
        }
    },

    async deleteImage(imageUrl) {
        if (!imageUrl || !imageUrl.includes('listing-images')) {
            // Not a valid, deletable image URL
            return;
        }
        try {
            const bucketName = 'listing-images';
            const fileName = imageUrl.substring(imageUrl.lastIndexOf(bucketName) + bucketName.length + 1);
            
            console.log(`Attempting to delete old image: ${fileName}`);
            const { error } = await db.storage.from(bucketName).remove([fileName]);
            if (error) throw error;
            console.log(`Successfully deleted old image: ${fileName}`);
        } catch (error) {
            console.error('Error deleting old image:', error.message);
        }
    },
    async uploadImage(file) {
        if (!file) return null;

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const { data, error } = await db.storage
            .from('listing-images')
            .upload(fileName, file);

        if (error) {
            UI.showToast(`Image upload failed: ${error.message}`, 'error');
            return null;
        }

        // Get the public URL of the uploaded file
        const { data: { publicUrl } } = db.storage.from('listing-images').getPublicUrl(data.path);
        return publicUrl;
    },

    async updateFeatureStatus(id, shouldFeature) {
        const updateData = {
            is_featured: shouldFeature, // This will be true for approve, false for deny/remove
            feature_status: shouldFeature ? 'active' : 'denied' // 'denied' can be a temporary status
        };

        const { error } = await db.from('listings').update(updateData).eq('id', id);

        if (error) {
            UI.showToast('Failed to update feature status.', 'error');
        } else {
            const message = shouldFeature ? 'Business is now featured!' : 'Feature request denied.';
            UI.showToast(message, 'success');
            loadListings(); // Reload the current tab
            this.fetchAllCounts(); // Update all counts
        }
    },

    async bulkUpdateListingStatus(ids, newStatus, reason = null) {
        const updateData = { status: newStatus };
        if (newStatus === 'rejected' && reason) updateData.rejection_reason = reason;

        const { error } = await db.from('listings').update(updateData).in('id', ids);
        if (error) {
            UI.showToast(`Failed to update ${ids.length} listings.`, 'error');
            return false;
        }
        UI.showToast(`${ids.length} listings updated to ${newStatus}!`, 'success');
        loadListings();
        this.fetchAllCounts();
        return true;
    },

    async deleteListing(id) {
        const { error } = await db.from('listings').delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete listing.', 'error');
        } else {
            UI.showToast('Listing permanently deleted!', 'success');
            loadListings();
            this.fetchAllCounts();
        }
    },

    async bulkDeleteListings(ids) {
        const { error } = await db.from('listings').delete().in('id', ids);
        if (error) {
            UI.showToast(`Failed to delete ${ids.length} listings.`, 'error');
            return false;
        }
        UI.showToast(`${ids.length} listings permanently deleted!`, 'success');
        loadListings();
        this.fetchAllCounts();
        return true;
    },


    async saveListingChanges(id, updatedData) {
        const { error } = await db.from('listings').update(updatedData).eq('id', id);
        if (error) {
            UI.showToast('Failed to save changes.', 'error');
            return false;
        }
        UI.showToast('Listing updated successfully!', 'success');
        loadListings();
        return true;
    },

    async createListing(newListingData) {
        const { error } = await db.from('listings').insert([newListingData]);
        if (error) {
            UI.showToast('Failed to create new listing. ' + error.message, 'error');
            return false;
        }
        UI.showToast('New listing created successfully! It is now pending review.', 'success');
        loadListings();
        this.fetchAllCounts();
        return true;
    },
    async updateReviewStatus(id, newStatus, reason = null) {
        const { error } = await db.from('reviews').update({ status: newStatus }).eq('id', id);
        if (error) {
            UI.showToast(`Failed to update review.`, 'error');
        } else {
            UI.showToast(`Review has been ${newStatus}!`, 'success');
            loadReviews();
            this.fetchAllCounts();
        }
    },

    async bulkUpdateReviewStatus(ids, newStatus) {
        const { error } = await db.from('reviews').update({ status: newStatus }).in('id', ids);
        if (error) {
            UI.showToast(`Failed to update ${ids.length} reviews.`, 'error');
            return false;
        }
        UI.showToast(`${ids.length} reviews updated to ${newStatus}!`, 'success');
        loadReviews();
        this.fetchAllCounts();
        return true;
    },


    async deleteReview(id) {
        const { error } = await db.from('reviews').delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete review.', 'error');
        } else {
            UI.showToast('Review permanently deleted!', 'success');
            loadReviews();
            this.fetchAllCounts();
        }
    },

    async bulkDeleteReviews(ids) {
        const { error } = await db.from('reviews').delete().in('id', ids);
        if (error) {
            UI.showToast(`Failed to delete ${ids.length} reviews.`, 'error');
            return false;
        }
        UI.showToast(`${ids.length} reviews permanently deleted!`, 'success');
        loadReviews();
        this.fetchAllCounts();
        return true;
    },

    async saveReviewChanges(id, updatedData) {
        const { error } = await db.from('reviews').update(updatedData).eq('id', id);
        if (error) {
            UI.showToast('Failed to save review changes.', 'error');
            return false;
        }
        UI.showToast('Review updated successfully!', 'success');
        loadReviews();
        return true;
    }
    ,

    async fetchPosts(status, searchQuery = null) {
        let query = db.from('posts').select('*').eq('status', status);
        if (searchQuery) {
            query = query.ilike('title', `%${searchQuery}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            UI.showToast('Error fetching posts: ' + error.message, 'error');
            return [];
        }
        return data;
    },

    async savePost(id, postData) {
        let response;
        if (id) { // Update existing post
            response = await db.from('posts').update(postData).eq('id', id);
        } else { // Create new post
            response = await db.from('posts').insert([postData]);
        }

        const { error } = response;
        if (error) {
            UI.showToast(`Failed to save post: ${error.message}`, 'error');
            return false;
        }

        UI.showToast('Post saved successfully!', 'success');
        loadPosts();
        this.fetchAllCounts();
        return true;
    },

    async deletePost(id) {
        const { error } = await db.from('posts').delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete post.', 'error');
        } else {
            UI.showToast('Post permanently deleted!', 'success');
            loadPosts();
            this.fetchAllCounts();
        }
    },

    async fetchJobs(status, searchQuery = null) {
        let query = db.from('jobs').select('*').eq('status', status);
        if (searchQuery) {
            query = query.or(`job_title.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            UI.showToast('Error fetching jobs: ' + error.message, 'error');
            return [];
        }
        return data;
    },

    async saveJob(id, jobData) {
        let response;
        if (id) { // Update
            response = await db.from('jobs').update(jobData).eq('id', id);
        } else { // Create
            response = await db.from('jobs').insert([jobData]);
        }

        const { error } = response;
        if (error) {
            UI.showToast(`Failed to save job: ${error.message}`, 'error');
            return false;
        }

        UI.showToast('Job posting saved successfully!', 'success');
        loadJobs();
        this.fetchAllCounts();
        return true;
    },

    async deleteJob(id) {
        const { error } = await db.from('jobs').delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete job.', 'error');
        } else {
            UI.showToast('Job posting permanently deleted!', 'success');
            loadJobs();
            this.fetchAllCounts();
        }
    },

    async fetchEvents(status, searchQuery = null) {
        let query = db.from('events').select('*').eq('status', status);
        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
        }
        const { data, error } = await query.order('date', { ascending: false });
        if (error) {
            UI.showToast('Error fetching events: ' + error.message, 'error');
            return [];
        }
        return data;
    },

    async saveEvent(id, eventData) {
        let response;
        if (id) { // Update
            response = await db.from('events').update(eventData).eq('id', id);
        } else { // Create
            response = await db.from('events').insert([eventData]);
        }

        const { error } = response;
        if (error) {
            UI.showToast(`Failed to save event: ${error.message}`, 'error');
            return false;
        }

        UI.showToast('Event saved successfully!', 'success');
        loadEvents();
        this.fetchAllCounts();
        return true;
    },

    async deleteEvent(id) {
        const { error } = await db.from('events').delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete event.', 'error');
        } else {
            UI.showToast('Event permanently deleted!', 'success');
            loadEvents();
            this.fetchAllCounts();
        }
    },

    async fetchTransportationData(type, searchQuery = null) {
        let query = db.from(type).select('*');
        if (searchQuery) {
            if (type === 'trains') query = query.or(`name.ilike.%${searchQuery}%,from_station.ilike.%${searchQuery}%,to_station.ilike.%${searchQuery}%`);
            if (type === 'buses') query = query.or(`route.ilike.%${searchQuery}%`);
            if (type === 'toto_routes') query = query.or(`route.ilike.%${searchQuery}%`);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            UI.showToast(`Error fetching ${type}: ${error.message}`, 'error');
            return [];
        }
        return data;
    },

    async saveTransportItem(type, id, itemData) {
        // SECURITY ENHANCEMENT: Use an RPC function for inserts to properly bypass RLS
        // even with WITH CHECK policies. The 'service_role' key grants permission.
        let response;
        if (id) { // Update
            response = await db.from(type).update(itemData).eq('id', id);
        } else { // Create
            // Use RPC for insert to ensure RLS is correctly bypassed
            response = await db.rpc('admin_insert_transport', {
                table_name: type,
                item_data: itemData
            });
        }

        const { error } = response;
        if (error) {
            UI.showToast(`Failed to save item: ${error.message}`, 'error');
            return false;
        }
        UI.showToast('Item saved successfully!', 'success');
        loadTransportationData();
        return true;
    },

    async deleteTransportItem(type, id) {
        const { error } = await db.from(type).delete().eq('id', id);
        if (error) {
            UI.showToast('Failed to delete item.', 'error');
        } else {
            UI.showToast('Item permanently deleted!', 'success');
            loadTransportationData();
        }
    }
};

// =================================================================================
// APPLICATION LOGIC & EVENT HANDLERS
// =================================================================================

async function loadListings() {
    DOMElements.listingsPanel.loading.style.display = 'block';
    
    // Special case for feature requests
    if (AppState.activeListingStatus === 'feature_requests') {
        await loadFeatureRequests();
        return;
    }

    const listings = await API.fetchListings(AppState.activeListingStatus, AppState.activeListingCategory, DOMElements.listingsPanel.search.value, AppState.activeListingSort);
    AppState.listings = listings;

    DOMElements.listingsPanel.loading.style.display = 'none';
    UI.renderListings();
}
async function loadFeatureRequests() {
    DOMElements.listingsPanel.loading.style.display = 'block';
    
    let query = db.from('listings').select('*').eq('feature_status', 'requested');
    const searchQuery = DOMElements.listingsPanel.search.value;
    if (searchQuery) {
        const searchTerm = `%${searchQuery}%`;
        query = query.or(`name.ilike.${searchTerm},address.ilike.${searchTerm}`);
    }
    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
        UI.showToast('Error fetching feature requests: ' + error.message, 'error');
        AppState.listings = [];
    } else {
        AppState.listings = data;
    }
    DOMElements.listingsPanel.loading.style.display = 'none';
    UI.renderListings();
}

async function loadReviews() {
    const reviews = await API.fetchReviews(AppState.activeReviewStatus, AppState.activeReviewSearchTerm);
    AppState.reviews = reviews;
    DOMElements.reviewsPanel.search.value = AppState.activeReviewSearchTerm;
    UI.renderReviews();
}

async function loadPosts() {
    const posts = await API.fetchPosts(AppState.activePostStatus, DOMElements.blogPanel.search.value);
    AppState.posts = posts;
    UI.renderPosts();
}

async function loadJobs() {
    const jobs = await API.fetchJobs(AppState.activeJobStatus, DOMElements.jobsPanel.search.value);
    AppState.jobs = jobs;
    UI.renderJobs();
}

async function loadEvents() {
    const events = await API.fetchEvents(AppState.activeEventStatus, DOMElements.eventsPanel.search.value);
    AppState.events = events;
    UI.renderEvents();
}

async function loadTransportationData() {
    const type = AppState.activeTransportType;
    const data = await API.fetchTransportationData(type, DOMElements.transportationPanel.search.value);
    AppState[type] = data;
    UI.renderTransportation();
}

async function handleLogin(e) {
    e.preventDefault();
    DOMElements.loginError.textContent = '';
    const email = DOMElements.emailInput.value;
    const password = DOMElements.passwordInput.value;

    const loginBtn = DOMElements.loginForm.querySelector('button[type="submit"]');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
        console.error('Login Error:', error.message); // Log the real error for debugging
        if (error.message.includes('Email not confirmed')) {
            DOMElements.loginError.textContent = 'Email not confirmed. Please check your inbox for a confirmation link.';
        } else {
            DOMElements.loginError.textContent = 'Incorrect email or password.';
        }
        DOMElements.loginBox.classList.add('shake');
        setTimeout(() => DOMElements.loginBox.classList.remove('shake'), 820);
    } else if (data.user) {
        // IMPORTANT: Check for admin role in user_metadata
        // The role should be set in the Supabase dashboard under Authentication > Users > User Metadata
        if (data.user.user_metadata?.role === 'admin') {
            // Login successful and user is an admin
            await initializeApp();
        } else {
            // User is valid but not an admin
            DOMElements.loginError.textContent = 'Access Denied. You are not an admin.';
            await db.auth.signOut(); // Log out the non-admin user immediately
        }
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
}

async function handleLogout() {
    await db.auth.signOut();
    UI.showView('login'); // Show login screen after logout
    DOMElements.passwordInput.value = '';
    DOMElements.emailInput.value = '';
}

function setActiveListingTab(status) {
    AppState.activeListingStatus = status;
    UI.setActiveSubTab(DOMElements.listingsPanel.tabsContainer, status, {
        border: status === 'feature_requests' ? 'border-yellow-500' : 'border-blue-500',
        text: status === 'feature_requests' ? 'text-yellow-600' : 'text-blue-600',
        darkBorder: status === 'feature_requests' ? 'dark:border-yellow-400' : 'dark:border-blue-400',
        darkText: status === 'feature_requests' ? 'dark:text-yellow-400' : 'dark:text-blue-400'
    });
    sessionStorage.setItem('adminActiveListingStatus', status);
    loadListings();
}

function setActiveReviewTab(status) {
    AppState.activeReviewStatus = status;
    UI.setActiveSubTab(DOMElements.reviewsPanel.tabsContainer, status, {
        border: 'border-purple-500', text: 'text-purple-600', darkBorder: 'dark:border-purple-400', darkText: 'dark:text-purple-400'
    });
    sessionStorage.setItem('adminActiveReviewStatus', status);
    loadReviews();
}

function setActivePostTab(status) {
    AppState.activePostStatus = status;
    UI.setActiveSubTab(DOMElements.blogPanel.tabsContainer, status, {
        border: 'border-green-500', text: 'text-green-600', darkBorder: 'dark:border-green-400', darkText: 'dark:text-green-400'
    });
    sessionStorage.setItem('adminActivePostStatus', status);
    loadPosts();
}

function setActiveJobTab(status) {
    AppState.activeJobStatus = status;
    UI.setActiveSubTab(DOMElements.jobsPanel.tabsContainer, status, {
        border: 'border-indigo-500', text: 'text-indigo-600', darkBorder: 'dark:border-indigo-400', darkText: 'dark:text-indigo-400'
    });
    sessionStorage.setItem('adminActiveJobStatus', status);
    loadJobs();
}

function setActiveEventTab(status) {
    AppState.activeEventStatus = status;
    UI.setActiveSubTab(DOMElements.eventsPanel.tabsContainer, status, {
        border: 'border-pink-500', text: 'text-pink-600', darkBorder: 'dark:border-pink-400', darkText: 'dark:text-pink-400'
    });
    sessionStorage.setItem('adminActiveEventStatus', status);
    loadEvents();
}

function setActiveTransportTab(type) {
    AppState.activeTransportType = type;
    UI.setActiveSubTab(DOMElements.transportationPanel.tabsContainer, type, {
        border: 'border-teal-500', text: 'text-teal-600', darkBorder: 'dark:border-teal-400', darkText: 'dark:text-teal-400'
    });
    sessionStorage.setItem('adminActiveTransportType', type);
    // Update section title and search placeholder
    DOMElements.transportationPanel.sectionTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    DOMElements.transportationPanel.search.placeholder = `Search ${type.replace('_', ' ')}...`;
    loadTransportationData();
}

async function handleSaveEdit() {
    const modal = DOMElements.editModal;
    const form = modal.form;

    if (!form.reportValidity()) return;

    modal.saveBtn.disabled = true;
    modal.saveBtn.textContent = 'Saving...';

    // ১. ইমেজ আপলোড হ্যান্ডলিং
    const imageFile = modal.imageUpload.files[0];
    const existingImageUrl = modal.imageUrlInput.value;
    let finalImageUrl = existingImageUrl;

    if (imageFile) {
        const newImageUrl = await API.uploadImage(imageFile);
        if (newImageUrl) {
            finalImageUrl = newImageUrl;
            // নতুন ইমেজ আপলোড হলে পুরনোটি ডিলিট করা
            if (existingImageUrl) {
                await API.deleteImage(existingImageUrl);
            }
        }
    }

    const formData = new FormData(modal.form);
    const listingId = formData.get('listing_id');

    // ২. Opening Hours ডাটা প্রসেসিং
    const hoursType = formData.get('hours-type');
    let openingHoursData = { status: hoursType, hours: null };

    if (hoursType === 'custom') {
        const customHours = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let hasCustomHours = false;
        
        days.forEach(day => {
            const open = formData.get(`edit-open-${day}`);
            const close = formData.get(`edit-close-${day}`);
            
            if (open && close) {
                customHours[day] = { open, close };
                hasCustomHours = true;
            } else {
                customHours[day] = null;
            }
        });
        
        if (hasCustomHours) openingHoursData.hours = customHours;
    }

    // ৩. ডাটা অবজেক্ট তৈরি
    const updatedData = {
        name: formData.get('name'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        googleMapLink: formData.get('googleMapLink') || null,        
        lat: null,
        lng: null,
        image: finalImageUrl, 
        description: formData.get('description') || null,
        opening_hours: openingHoursData
    };

    // Google Map লিঙ্ক থেকে Lat/Lng বের করা
    if (updatedData.googleMapLink) {
        const { lat, lng } = Utils.extractLatLngFromGoogleMapsLink(updatedData.googleMapLink);
        updatedData.lat = lat;
        updatedData.lng = lng;
    }

    // ৪. সেভ করা
    const success = await API.saveListingChanges(listingId, updatedData);

    modal.saveBtn.disabled = false;
    modal.saveBtn.textContent = 'Save Changes';

    if (success) {
        UI.closeModal(modal.modal);
    }
}


async function handleSaveReviewEdit() {
    const modal = DOMElements.editReviewModal;
    const form = modal.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }
    const formData = new FormData(form);
    const reviewId = formData.get('review_id');
    const updatedData = {
        user_name: formData.get('user_name'),
        review_text: formData.get('review_text'),
        rating: parseInt(formData.get('rating'), 10),
    };

    modal.saveBtn.disabled = true;
    modal.saveBtn.textContent = 'Saving...';

    const success = await API.saveReviewChanges(reviewId, updatedData);

    modal.saveBtn.disabled = false;
    modal.saveBtn.textContent = 'Save Changes';

    if (success) {
        UI.closeModal(modal.modal);
    }
}

function handleOpenAddModal() {
    const modal = DOMElements.addModal;
    modal.form.reset(); // Clear previous data

    // Populate category dropdown
    const categorySelect = modal.categorySelect;
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>' + Object.entries(AppState.categories).map(([key, cat]) =>
            `<option value="${key}">${cat.name}</option>`
        ).join('');
    }

    // Hide subcategory initially
    if (modal.subcategoryWrapper) {
        modal.subcategoryWrapper.style.display = 'none';
    }
    if (modal.subcategorySelect) {
        modal.subcategorySelect.innerHTML = '';
    }

    if (modal.nameLabel) {
        modal.nameLabel.textContent = 'Business Name *'; // Reset name label to default
    }
    // Reset opening hours to default (Open 24/7)
    if (modal.hoursTypeInput) {
        modal.hoursTypeInput.value = 'open_24_7';
    }
    if (modal.hoursDropdownSelected) {
        modal.hoursDropdownSelected.innerHTML = `<span class="text-xl">🕒</span><span class="font-medium text-gray-800 dark:text-gray-200">Open 24/7</span>`;
    }
    if (modal.customHoursSection) {
        modal.customHoursSection.classList.add('hidden');
    }
    if (modal.openingHoursInputs) {
        modal.openingHoursInputs.innerHTML = ''; // Clear custom hours inputs
    }
    
    // Reset unsaved changes flag
    AppState.addModalHasUnsavedChanges = false;
    DOMElements.addModal.form.removeEventListener('input', setAddModalUnsavedChanges); // Remove old listener
    DOMElements.addModal.form.addEventListener('input', setAddModalUnsavedChanges); // Add fresh listener

    UI.openModal(modal.modal);
}

async function handleAddNewListing() {
    const modal = DOMElements.addModal;
    const form = modal.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }

    modal.saveBtn.disabled = true;
    
    // Disable the beforeunload warning for submission
    AppState.addModalHasUnsavedChanges = false;
    modal.saveBtn.textContent = 'Creating...';

    // Handle image upload
    const imageFile = modal.imageUpload.files[0];
    let finalImageUrl = null;
    if (imageFile) {
        const newImageUrl = await API.uploadImage(imageFile);
        if (newImageUrl) {
            finalImageUrl = newImageUrl;
        }
    }

    const formData = new FormData(modal.form);
    const hoursType = formData.get('hours-type');
    let openingHoursData = { status: hoursType, hours: null };

    if (hoursType === 'custom') {
        const customHours = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let hasCustomHours = false;
        days.forEach(day => {
            const open = formData.get(`add-open-${day}`);
            const close = formData.get(`add-close-${day}`);
            if (open && close) {
                customHours[day] = { open, close };
                hasCustomHours = true;
            } else {
                customHours[day] = null;
            }
        });
        if (hasCustomHours) openingHoursData.hours = customHours;
    }

    // Extract lat/lng from Google Maps link if available
    const googleMapLink = formData.get('googleMapLink') || null;
    let lat = null;
    let lng = null;
    if (googleMapLink) {
        const coords = Utils.extractLatLngFromGoogleMapsLink(googleMapLink);
        lat = coords.lat;
        lng = coords.lng;
    }
    const newListingData = {
        name: formData.get('name'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        googleMapLink: googleMapLink,
        lat: lat, // Store extracted latitude
        lng: lng, // Store extracted longitude
        image: finalImageUrl, // Use the uploaded image URL
        description: formData.get('description') || null,
        status: 'pending_review', // New listings are always pending
        opening_hours: openingHoursData
    };
    const success = await API.createListing(newListingData);
    modal.saveBtn.disabled = false;
    modal.saveBtn.textContent = 'Create Listing';
    if (success) {
        UI.closeModal(modal.modal);
    } else {
        AppState.addModalHasUnsavedChanges = true; // Re-enable if submission fails
    }
}

async function handleSavePost() {
    const modal = DOMElements.postModal;
    const form = modal.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }
    const formData = new FormData(form);
    const postId = formData.get('post_id');
    const postData = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        content: formData.get('content'),
        author_name: formData.get('author_name'),
        featured_image_url: formData.get('featured_image_url') || null,
        status: formData.get('status'),
    };

    modal.saveBtn.disabled = true;
    modal.saveBtn.textContent = 'Saving...';

    const success = await API.savePost(postId, postData);

    modal.saveBtn.disabled = false;
    modal.saveBtn.textContent = 'Save Post';
    if (success) UI.closeModal(modal.modal);
}

async function handleSaveJob() {
    const modal = DOMElements.jobModal;
    const form = modal.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }
    const formData = new FormData(form);
    const jobId = formData.get('job_id');
    const jobData = {
        job_title: formData.get('job_title'),
        company_name: formData.get('company_name'),
        location: formData.get('location'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        contact_details: formData.get('contact_details'),
        job_type: formData.get('job_type'),
        salary_range: formData.get('salary_range'),
        status: formData.get('status'),
    };

    modal.saveBtn.disabled = true;
    const success = await API.saveJob(jobId, jobData);
    modal.saveBtn.disabled = false;
    if (success) UI.closeModal(modal.modal);
}

async function handleSaveEvent() {
    const modal = DOMElements.eventModal;
    const form = modal.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }
    const formData = new FormData(form);
    const eventId = formData.get('event_id');
    const eventData = {
        title: formData.get('title'),
        date: formData.get('date') || null,
        time: formData.get('time') || null,
        location: formData.get('location') || null,
        description: formData.get('description') || null,
        category: formData.get('category') || null,
        status: formData.get('status'),
    };

    modal.saveBtn.disabled = true;
    const success = await API.saveEvent(eventId, eventData);
    modal.saveBtn.disabled = false;
    if (success) UI.closeModal(modal.modal);
}

async function handleSaveTransport(type) {
    const modalMap = {
        trains: DOMElements.trainModal,
        buses: DOMElements.busModal,
        toto_routes: DOMElements.totoRouteModal
    };
    const modalElements = modalMap[type];
    if (!modalElements) return;

    const form = modalElements.form;
    if (!form.reportValidity()) {
        return; // Stop if form is invalid
    }

    const formData = new FormData(form);
    const id = formData.get('id');
    const itemData = Object.fromEntries(formData.entries());
    delete itemData.id; // Remove id from data object
    
    const saveBtn = modalElements.modal.querySelector(`button[data-save-modal]`);
    saveBtn.disabled = true;
    const success = await API.saveTransportItem(type, id, itemData);
    saveBtn.disabled = false;
    if (success) UI.closeModal(modalElements.modal);
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedSearch = debounce((query) => {
    loadListings();
}, 400);

const debouncedReviewSearch = debounce((query) => {
    AppState.activeReviewSearchTerm = query;
    loadReviews();
}, 400);

const debouncedPostSearch = debounce(() => {
    loadPosts();
}, 400);

const debouncedJobSearch = debounce(() => {
    loadJobs();
}, 400);

function setupEventListeners() {
    DOMElements.loginForm.addEventListener('submit', handleLogin);
    DOMElements.logoutBtn.addEventListener('click', handleLogout);
    DOMElements.passwordToggle.addEventListener('click', handlePasswordToggle);
    DOMElements.themeToggle.addEventListener('click', () => UI.toggleTheme());
    document.getElementById('add-listing-btn').addEventListener('click', handleOpenAddModal);
    DOMElements.listingsPanel.search.addEventListener('input', (e) => debouncedSearch(e.target.value));
    DOMElements.listingsPanel.categoryFilter.addEventListener('change', (e) => {
        AppState.activeListingCategory = e.target.value;
        AppState.selectedListingIds = []; // Clear selection on filter change
        loadListings();
    });
    DOMElements.listingsPanel.sortSelect.addEventListener('change', (e) => {
        AppState.activeListingSort = e.target.value;
        loadListings();
    });

// Admin Home Button (Logo) Click Event
const homeBtn = document.getElementById('admin-home-btn');
if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        UI.switchMainTab('dashboard-panel'); // ড্যাশবোর্ড প্যানেলে নিয়ে যাবে
        
        // ✅ এই লাইনটি যোগ করুন পেজ উপরে তোলার জন্য:
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    });
}
    // setupEventListeners ফাংশনের ভেতরে:

// ১. Copy Hours বাটন বাইন্ডিং
if (DOMElements.editModal.copyHoursBtn) {
    DOMElements.editModal.copyHoursBtn.addEventListener('click', copyEditMondayHours);
}

// ২. সাব-ক্যাটাগরি পরিবর্তনের সাথে নামের লেবেল পরিবর্তন (Add ফর্মের মতো)
if (DOMElements.editModal.subcategorySelect) {
    DOMElements.editModal.subcategorySelect.addEventListener('change', (e) => {
        const selectedSubcategory = e.target.value;
        if (DOMElements.editModal.nameLabel) {
             // UI.getAddBusinessNameLabel ফাংশনটিই এখানে ব্যবহার করা যাবে কারণ লজিক একই
            DOMElements.editModal.nameLabel.textContent = UI.getAddBusinessNameLabel(selectedSubcategory);
        }
    });
}


    DOMElements.reviewsPanel.search.addEventListener('input', (e) => debouncedReviewSearch(e.target.value));
    DOMElements.blogPanel.search.addEventListener('input', debouncedPostSearch);
    DOMElements.jobsPanel.search.addEventListener('input', debouncedJobSearch);
    DOMElements.blogPanel.addBtn.addEventListener('click', () => UI.openPostModal());
    DOMElements.jobsPanel.addBtn.addEventListener('click', () => UI.openJobModal());

    DOMElements.eventsPanel.search.addEventListener('input', debounce(() => loadEvents(), 400));
    DOMElements.eventsPanel.addBtn.addEventListener('click', () => UI.openEventModal());

    DOMElements.transportationPanel.search.addEventListener('input', debounce(() => loadTransportationData(), 400));
    DOMElements.transportationPanel.addBtn.addEventListener('click', () => UI.openTransportModal(AppState.activeTransportType));



    // Warn user before leaving if add-modal has unsaved changes
    window.addEventListener('beforeunload', (event) => {
        if (AppState.addModalHasUnsavedChanges) event.preventDefault();
    });

    // Main Tab Navigation
    DOMElements.mainTabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.main-tab-btn');
        if (tab) UI.switchMainTab(tab.dataset.panel);
    });

    // Listings Sub-Tab Navigation
    DOMElements.listingsPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.tab-btn');
        if (tab) {
            AppState.selectedListingIds = []; // Clear selection on tab change
            setActiveListingTab(tab.dataset.status);
        }
    });

    // Reviews Sub-Tab Navigation
    DOMElements.reviewsPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.review-tab-btn');
        if (tab) setActiveReviewTab(tab.dataset.status);
    });

    // Blog Sub-Tab Navigation
    DOMElements.blogPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.post-tab-btn');
        if (tab) setActivePostTab(tab.dataset.status);
    });

    // Job Sub-Tab Navigation
    DOMElements.jobsPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.job-tab-btn');
        if (tab) setActiveJobTab(tab.dataset.status);
    });

    // Event Sub-Tab Navigation
    DOMElements.eventsPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.event-tab-btn');
        if (tab) setActiveEventTab(tab.dataset.status);
    });

    // Transportation Sub-Tab Navigation
    DOMElements.transportationPanel.tabsContainer.addEventListener('click', (e) => {
        if (e.button !== 0) return; // Ensure only left-click works
        const tab = e.target.closest('.transport-tab-btn');
        if (tab) setActiveTransportTab(tab.dataset.type);
    });

    // Event Delegation for Event Actions
    DOMElements.eventsPanel.container.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'edit-event') {
            const event = AppState.events.find(ev => ev.id == id);
            if (event) UI.openEventModal(event);
        } else if (action === 'delete-event') {
            UI.showConfirmation({ title: 'Delete Event?', message: 'This event will be permanently deleted.', onConfirm: () => API.deleteEvent(id), type: 'danger' });
        }
    });

    // Event Delegation for Transport Actions
    DOMElements.transportationPanel.dataContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;
        const type = AppState.activeTransportType;

        if (action === 'edit-transport') {
            const item = AppState[type].find(i => i.id == id);
            if (item) UI.openTransportModal(type, item);
        } else if (action === 'delete-transport') {
            UI.showConfirmation({ title: 'Delete Item?', message: 'This item will be permanently deleted.', onConfirm: () => API.deleteTransportItem(type, id), type: 'danger' });
        }
    });

    // Event Delegation for Blog Actions
    DOMElements.blogPanel.container.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'edit-post') {
            const post = AppState.posts.find(p => p.id == id);
            if (post) UI.openPostModal(post);
        } else if (action === 'delete-post') {
            UI.showConfirmation({ title: 'Delete Post?', message: 'This post will be permanently deleted.', onConfirm: () => API.deletePost(id), type: 'danger' });
        }
    });

    // Event Delegation for Job Actions
    DOMElements.jobsPanel.container.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'edit-job') {
            const job = AppState.jobs.find(j => j.id == id);
            if (job) UI.openJobModal(job);
        } else if (action === 'delete-job') {
            UI.showConfirmation({ title: 'Delete Job?', message: 'This job posting will be permanently deleted.', onConfirm: () => API.deleteJob(id), type: 'danger' });
        }
    });

    // Event Delegation for Review Actions
    DOMElements.reviewsPanel.container.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'approve-review') {
            UI.showConfirmation({ title: 'Approve Review?', message: 'This review will become public.', onConfirm: () => API.updateReviewStatus(id, 'approved'), type: 'success' });
        } else if (action === 'reject-review') {
            UI.showConfirmation({ title: 'Reject Review?', message: 'This review will be moved to the rejected tab.', onConfirm: (reason) => API.updateReviewStatus(id, 'rejected', reason), type: 'danger' });
        } else if (action === 'delete-review') {
            UI.showConfirmation({ title: 'Delete Review?', message: 'This review will be permanently deleted.', onConfirm: () => API.deleteReview(id), type: 'danger' });
        } else if (action === 'edit-review') {
            const review = AppState.reviews.find(r => r.id == id);
            if (review) UI.populateEditReviewForm(review);
        }
    });

    // Event Delegation for Recent Activity Actions
    DOMElements.recentActivity.container.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-id]');
        if (button) handleCardAction(e); // Reuse the main card action handler
    });

    // Edit Modal Listeners
// --- Edit Opening Hours Dropdown Logic ---
    const editHoursDropdown = DOMElements.editModal.hoursDropdown;
    if (editHoursDropdown) {
        const button = DOMElements.editModal.hoursDropdownButton;
        const panel = DOMElements.editModal.hoursDropdownPanel;
        const hiddenInput = DOMElements.editModal.hoursTypeInput;
        const selectedDisplay = DOMElements.editModal.hoursDropdownSelected;
        const chevron = DOMElements.editModal.hoursDropdownChevron;
        const customHoursSection = DOMElements.editModal.customHoursSection;

        const toggleEditDropdown = (forceClose = false) => {
            const isOpen = !panel.classList.contains('hidden');
            if (forceClose || isOpen) {
                panel.classList.add('hidden');
                chevron.style.transform = 'rotate(0deg)';
            } else {
                panel.classList.remove('hidden');
                chevron.style.transform = 'rotate(180deg)';
            }
        };

        // Button Click
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEditDropdown();
        });

        // Close when clicking outside
        DOMElements.editModal.modal.addEventListener('click', (e) => {
            if (!editHoursDropdown.contains(e.target)) {
                toggleEditDropdown(true);
            }
        });

        // Option Select
        panel.querySelectorAll('.add-hours-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const content = option.innerHTML;

                hiddenInput.value = value;
                selectedDisplay.innerHTML = `<span class="flex items-center gap-x-3">${content}</span>`;

                if (value === 'custom') {
                    customHoursSection.classList.remove('hidden');
                    // যদি ইনপুট বক্সগুলো খালি থাকে (প্রথমবার সিলেক্ট করলে), তবে রেন্ডার করো
                    if (DOMElements.editModal.openingHoursInputs.innerHTML.trim() === '') {
                        UI.renderEditOpeningHoursInputs(); 
                    }
                } else {
                    customHoursSection.classList.add('hidden');
                }
                toggleEditDropdown(true);
            });
        });
    }


    DOMElements.editModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.editModal.modal));
    DOMElements.editModal.saveBtn.addEventListener('click', handleSaveEdit);
    DOMElements.editModal.categorySelect.addEventListener('change', (e) => UI.populateSubcategories(e.target.value));
    DOMElements.editModal.imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                DOMElements.editModal.imagePreview.src = event.target.result;
                DOMElements.editModal.imagePreviewWrapper.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            DOMElements.editModal.imagePreviewWrapper.classList.add('hidden');
        }
    });
    DOMElements.editModal.modal.addEventListener('click', (e) => e.target === DOMElements.editModal.modal && UI.closeModal(DOMElements.editModal.modal));

    // Add Modal Listeners
    DOMElements.addModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.addModal.modal));
    DOMElements.addModal.saveBtn.addEventListener('click', handleAddNewListing);
    DOMElements.addModal.modal.addEventListener('click', (e) => e.target === DOMElements.addModal.modal && UI.closeModal(DOMElements.addModal.modal));
    // Populate subcategories when category changes in Add Modal
    DOMElements.addModal.categorySelect.addEventListener('change', (e) => {
        const categoryKey = e.target.value;
        const subcategorySelect = DOMElements.addModal.subcategorySelect;
        const subcategoryWrapper = DOMElements.addModal.subcategoryWrapper;
        const category = AppState.categories[categoryKey];
    
        // Always reset name label to default when category changes
        if (DOMElements.addModal.nameLabel) {
            DOMElements.addModal.nameLabel.textContent = 'Name *';
        }
    
        // Ensure subcategory elements exist before trying to manipulate them
        if (!subcategorySelect || !subcategoryWrapper) {
            console.warn("Subcategory elements not found in addModal.");
            return;
        }
    
        if (category && category.subcategories && category.subcategories.length > 0) {
            subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>' + category.subcategories.map(sub => `<option value="${sub}">${sub}</option>`).join('');
            subcategoryWrapper.style.display = 'block';
            // The onchange for subcategory is now a separate listener below.
        } else {
            subcategoryWrapper.style.display = 'none';
            subcategorySelect.innerHTML = ''; // Clear subcategory options
        }
    });
    // NEW: Separate event listener for subcategory change in Add Modal
    DOMElements.addModal.subcategorySelect.addEventListener('change', (e) => {
        const selectedSubcategory = e.target.value;
        if (selectedSubcategory && DOMElements.addModal.nameLabel) { // Only update if a valid subcategory is selected
            if (DOMElements.addModal.nameLabel) {
                DOMElements.addModal.nameLabel.textContent = UI.getAddBusinessNameLabel(selectedSubcategory);
            };
        } else {
            // If subcategory is cleared or no subcategory selected, reset to default
            // If subcategory is cleared or no subcategory selected, reset to default
            if (DOMElements.addModal.nameLabel) {
                DOMElements.addModal.nameLabel.textContent = 'Name *';
            }
        }
    });
    DOMElements.addModal.imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                DOMElements.addModal.imagePreview.src = event.target.result;
                DOMElements.addModal.imagePreviewWrapper.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            DOMElements.addModal.imagePreviewWrapper.classList.add('hidden');
        }
    });

    // NEW: Opening hours dropdown logic for Add Modal
    const addHoursDropdown = DOMElements.addModal.hoursDropdown;
    if (addHoursDropdown) {
        const button = DOMElements.addModal.hoursDropdownButton;
        const panel = DOMElements.addModal.hoursDropdownPanel;
        const hiddenInput = DOMElements.addModal.hoursTypeInput;
        const selectedDisplay = DOMElements.addModal.hoursDropdownSelected;
        const chevron = DOMElements.addModal.hoursDropdownChevron;
        const customHoursSection = DOMElements.addModal.customHoursSection;

        const toggleDropdown = (forceClose = false) => {
            const isOpen = !panel.classList.contains('hidden');
            if (forceClose || isOpen) {
                panel.style.transform = 'scale(0.95)';
                panel.style.opacity = '0';
                setTimeout(() => panel.classList.add('hidden'), 150);
                chevron.style.transform = 'rotate(0deg)';
                button.setAttribute('aria-expanded', 'false');
            } else {
                panel.classList.remove('hidden');
                requestAnimationFrame(() => {
                    panel.style.transform = 'scale(1)';
                    panel.style.opacity = '1';
                });
                chevron.style.transform = 'rotate(180deg)';
                button.setAttribute('aria-expanded', 'true');
            }
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal click listener from closing it
            toggleDropdown();
        });
        // Use modal for click outside to close dropdown
        DOMElements.addModal.modal.addEventListener('click', (e) => {
            if (!addHoursDropdown.contains(e.target)) {
                toggleDropdown(true);
            }
        });

        panel.querySelectorAll('.add-hours-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const content = option.innerHTML;

                hiddenInput.value = value;
                selectedDisplay.innerHTML = `<span class="flex items-center gap-x-3">${content}</span>`;

                if (value === 'custom') {
                    customHoursSection.classList.remove('hidden');
                    renderAddOpeningHoursInputs(); // Call the new function
                } else {
                    customHoursSection.classList.add('hidden');
                }
                toggleDropdown(true);
            });
        });

        // Bind copy hours button for Add Modal
        if (DOMElements.addModal.copyHoursBtn) {
            DOMElements.addModal.copyHoursBtn.removeEventListener('click', copyAddMondayHours); // Prevent duplicate listeners
            DOMElements.addModal.copyHoursBtn.addEventListener('click', copyAddMondayHours);
        }
    }

    // Edit Review Modal Listeners
    DOMElements.editReviewModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.editReviewModal.modal));
    DOMElements.editReviewModal.saveBtn.addEventListener('click', handleSaveReviewEdit);
    DOMElements.editReviewModal.modal.addEventListener('click', (e) => e.target === DOMElements.editReviewModal.modal && UI.closeModal(DOMElements.editReviewModal.modal));
    DOMElements.editReviewModal.ratingContainer.addEventListener('change', (e) => {
        if (e.target.name === 'rating') {
            UI.updateStarDisplay(DOMElements.editReviewModal.ratingContainer, e.target.value);
        }
    });

    // Post Modal Listeners
    DOMElements.postModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.postModal.modal));
    DOMElements.postModal.saveBtn.addEventListener('click', handleSavePost);
    DOMElements.postModal.modal.addEventListener('click', (e) => e.target === DOMElements.postModal.modal && UI.closeModal(DOMElements.postModal.modal));
    DOMElements.postModal.form.querySelector('#post-title').addEventListener('keyup', (e) => UI.populatePostSlug(e.target.value));

    // Job Modal Listeners
    DOMElements.jobModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.jobModal.modal));
    DOMElements.jobModal.saveBtn.addEventListener('click', handleSaveJob);
    DOMElements.jobModal.modal.addEventListener('click', (e) => e.target === DOMElements.jobModal.modal && UI.closeModal(DOMElements.jobModal.modal));

    // Event Modal Listeners
    DOMElements.eventModal.closeBtn.addEventListener('click', () => UI.closeModal(DOMElements.eventModal.modal));
    DOMElements.eventModal.saveBtn.addEventListener('click', handleSaveEvent);
    DOMElements.eventModal.modal.addEventListener('click', (e) => e.target === DOMElements.eventModal.modal && UI.closeModal(DOMElements.eventModal.modal));

    // Transport Modals Listeners
    ['trains', 'buses', 'toto_routes'].forEach(type => {
        // Correctly generate modal IDs: 
        // 'trains' -> 'train-modal'
        // 'buses' -> 'bus-modal'
        // 'toto_routes' -> 'toto-route-modal'
        const modalId = type === 'buses' 
            ? 'bus-modal' 
            : `${type.replace(/s$/, '').replace('_', '-')}-modal`;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.querySelector(`button[data-close-modal="${modalId}"]`).addEventListener('click', () => UI.closeModal(modal));
            modal.querySelector(`button[data-save-modal="${modalId}"]`).addEventListener('click', () => handleSaveTransport(type));
            modal.addEventListener('click', (e) => e.target === modal && UI.closeModal(modal));
        }
    });

    // --- Input Sanitization ---
    // Restrict phone number fields to digits only for a better user experience.
    const addPhoneInput = DOMElements.addModal.form.querySelector('#add-phone');
    if (addPhoneInput) {
        addPhoneInput.addEventListener('input', (e) => {
            // Remove non-digits and limit to 10 characters
            const sanitized = e.target.value.replace(/\D/g, '');
            e.target.value = sanitized.substring(0, 10);
        });
    }
    const editPhoneInput = DOMElements.editModal.form.querySelector('#edit-phone');
    if (editPhoneInput) {
        editPhoneInput.addEventListener('input', (e) => {
            // Remove non-digits and limit to 10 characters
            const sanitized = e.target.value.replace(/\D/g, '');
            e.target.value = sanitized.substring(0, 10);
        });
    }

    // Bulk Action Listeners (Listings)
    DOMElements.listingsPanel.selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        AppState.selectedListingIds = isChecked ? AppState.listings.map(l => l.id) : [];
        DOMElements.listingsPanel.container.querySelectorAll('.listing-card').forEach(card => {
            card.classList.toggle('card-selected', isChecked);
        });
        UI.updateBulkActionBar();
    });

    DOMElements.listingsPanel.bulkActionApplyBtn.addEventListener('click', () => {
        const action = DOMElements.listingsPanel.bulkActionSelect.value;
        const ids = AppState.selectedListingIds;
        if (!action || ids.length === 0) {
            UI.showToast('Please select an action and at least one listing.', 'info');
            return;
        }

        const onConfirm = async (reason = null) => {
            if (action === 'approve') await API.bulkUpdateListingStatus(ids, 'approved');
            if (action === 'reject') await API.bulkUpdateListingStatus(ids, 'rejected', reason);
            if (action === 'delete') await API.bulkDeleteListings(ids);
            AppState.selectedListingIds = [];
            AppState.isListingSelectionMode = false;
            UI.updateBulkActionBar();
        };

        UI.showConfirmation({
            title: `Bulk ${action}?`,
            message: `Are you sure you want to ${action} ${ids.length} listings? This action cannot be undone.`,
            onConfirm: onConfirm,
            type: action === 'delete' || action === 'reject' ? 'danger' : 'success'
        });
    });

    // Bulk Action Listeners (Reviews)
    DOMElements.reviewsPanel.selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        AppState.selectedReviewIds = isChecked ? AppState.reviews.map(r => r.id) : [];
        DOMElements.reviewsPanel.container.querySelectorAll('.review-card').forEach(card => {
            card.classList.toggle('card-selected', isChecked);
        });
        UI.updateBulkReviewActionBar();
    });

    DOMElements.reviewsPanel.bulkActionApplyBtn.addEventListener('click', () => {
        const action = DOMElements.reviewsPanel.bulkActionSelect.value;
        const ids = AppState.selectedReviewIds;
        if (!action || ids.length === 0) return;

        const onConfirm = async () => {
            const statusMap = { 'approve-review': 'approved', 'reject-review': 'rejected' };
            if (statusMap[action]) await API.bulkUpdateReviewStatus(ids, statusMap[action]);
            if (action === 'delete-review') await API.bulkDeleteReviews(ids);
            AppState.selectedReviewIds = [];
            UI.updateBulkReviewActionBar();
            AppState.isReviewSelectionMode = false;
        };

        UI.showConfirmation({ title: `Bulk Action`, message: `Perform '${action}' on ${ids.length} reviews?`, onConfirm, type: 'danger' });
    });

    // --- Long Press and Selection Logic ---
    function setupCardSelection(container, cardSelector, appStateKey, selectionModeKey, updateActionBar) {
        let pressTimer = null;
        let isLongPress = false;
        let hasScrolled = false; // নতুন ফ্ল্যাগ: ব্যবহারকারী স্ক্রল করেছেন কিনা তা ট্র্যাক করার জন্য

        const startPress = (e) => {
            const card = e.target.closest(cardSelector);
            if (!card) return;

            isLongPress = false;
            hasScrolled = false; // প্রতিটি নতুন টাচ শুরু হওয়ার সময় ফ্ল্যাগ রিসেট করুন

            pressTimer = setTimeout(() => {
                isLongPress = true;
                toggleSelection(card);
                if (!AppState[selectionModeKey]) AppState[selectionModeKey] = true;
            }, 500); // 500ms for long press
        };

        const endPress = (e) => {
            clearTimeout(pressTimer);
            const card = e.target.closest(cardSelector);
            if (!card) return;
            
            if (hasScrolled) return; // যদি স্ক্রল করা হয়ে থাকে, তবে আর কিছু করবেন না
            if (isLongPress) {
                e.preventDefault(); // Prevent click event after a long press
            } else {
                // This is a regular click
                if (AppState[selectionModeKey]) {
                    e.preventDefault();
                    toggleSelection(card);
                } else {
                    // Handle normal click actions (like edit, approve, etc.)
                    handleCardAction(e);
                }
            }
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            hasScrolled = true; // যদি টাচ মুভ হয়, তার মানে ব্যবহারকারী স্ক্রল করছেন
        };

        const toggleSelection = (card) => {
            const id = parseInt(card.dataset.id, 10);
            const selectedIds = AppState[appStateKey];
            const index = selectedIds.indexOf(id);

            if (index > -1) {
                selectedIds.splice(index, 1);
                card.classList.remove('card-selected');
            } else {
                selectedIds.push(id);
                card.classList.add('card-selected');
            }

            if (selectedIds.length === 0) AppState[selectionModeKey] = false;

            updateActionBar();
        };

        container.addEventListener('mousedown', startPress);
        container.addEventListener('mouseup', endPress);
        container.addEventListener('mouseleave', cancelPress);
        container.addEventListener('touchstart', startPress, { passive: true });
        container.addEventListener('touchend', endPress);
        container.addEventListener('touchmove', cancelPress, { passive: true });
    }

    function handleCardAction(e) {
        // Ensure only left-clicks trigger actions to prevent right-click context menu issues.
        if (e.button !== 0) return;

        const button = e.target.closest('button[data-id]');
        // If a link was clicked, let the browser handle it.
        // Only proceed if a button with data-action was clicked.
        if (e.target.closest('a[href]') || !button) {
            return;
        }

        const id = button.dataset.id;
        const action = button.dataset.action;
        if (action === 'approve') {
            // Use the new Edge Function for approvals
            // --- FIX ---
            // The Edge Function `approve-listing` is not deployed or is failing.
            // We will fall back to using the standard `updateListingStatus` API call,
            // which simply updates the database record's status to 'approved'.
            // This will fix the approval functionality, though it won't send any email notifications
            // that the Edge Function might have been designed to send.
            UI.showConfirmation({
                title: 'Approve Listing?',
                message: 'This will make the listing visible to all users.',
                onConfirm: () => API.updateListingStatus(id, 'approved'),
                type: 'success'
            });
        } else if (action === 'reject' || action === 'move-to-rejected') {
            // This block now handles both rejecting a 'pending' listing and moving an 'approved' listing to 'rejected'.
            const title = action === 'reject' ? 'Reject Listing?' : 'Move to Rejected?';
            const message = action === 'reject' 
                ? 'This listing will be moved to the rejected tab. You can provide a reason below.'
                : 'This approved listing will be moved to the rejected tab. You can provide a reason.';
            
            // Pass a callback to onConfirm to handle UI update
            const onConfirmCallback = async (reason) => {
                const success = await API.updateListingStatus(id, 'rejected', reason);
                if (success) {
                    // The API function now handles the UI update, but we could do more here if needed.
                }
            };

            UI.showConfirmation({ title, message, onConfirm: onConfirmCallback, type: 'danger' });
        } else if (action === 'move-to-approved') {
            UI.showConfirmation({
                title: 'Re-Approve Listing?',
                message: 'This listing will be moved back to the approved tab and become public.',
                onConfirm: () => API.updateListingStatus(id, 'approved'),
                type: 'success'
            });
        } else if (action === 'delete') {
            UI.showConfirmation({ title: 'Permanently Delete?', message: 'This action is irreversible. The listing will be deleted forever.', onConfirm: () => API.deleteListing(id), type: 'danger' });
        } else if (action === 'edit') {
            const listing = AppState.listings.find(l => l.id == id);
            if (listing) UI.populateEditForm(listing);
        } else if (action === 'toggle-feature') { // This action is on the 'approved' tab
            const listing = AppState.listings.find(l => l.id == id);
            if (listing) {
                // --- FIX ---
                // When toggling the feature off, we must also reset the feature_status
                // so the user's dashboard updates correctly via realtime.
                const isCurrentlyFeatured = listing.is_featured;
                const updatePayload = isCurrentlyFeatured 
                    ? { is_featured: false, feature_status: null } // Reset status when removing feature
                    : { is_featured: true, feature_status: 'active' }; // Set status when adding feature
                API.saveListingChanges(id, updatePayload);
            }
        } else if (action === 'approve-feature') {
            const message = 'This will mark the business as "Featured" and show it on the homepage.';
            UI.showConfirmation({ title: 'Approve Feature Request?', message, onConfirm: () => API.updateFeatureStatus(id, true), type: 'success' });
        } else if (action === 'deny-feature') {
            const message = 'This will deny the feature request. The user can request again later.';
            UI.showConfirmation({ title: 'Deny Feature Request?', message, onConfirm: () => API.updateFeatureStatus(id, false), type: 'danger' });
        } else if (action === 'remove-feature') {
            const message = 'This will remove the "Featured" status from the listing and reset its request state.';
            UI.showConfirmation({ title: 'Remove Feature?', message, onConfirm: () => API.saveListingChanges(id, { is_featured: false, feature_status: null }), type: 'danger' });
        }
    }

    // NEW: Utility functions for Add Modal opening hours
    function renderAddOpeningHoursInputs() {
        const container = DOMElements.addModal.openingHoursInputs;
        if (!container) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        container.innerHTML = days.map(day => `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label class="font-medium text-gray-700 dark:text-gray-300">${day}</label>
                <div class="col-span-2 grid grid-cols-2 gap-2">
                    <input type="time" name="add-open-${day.toLowerCase()}" 
                           class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                           aria-label="${day} opening time">
                    <input type="time" name="add-close-${day.toLowerCase()}" 
                           class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                           aria-label="${day} closing time">
                </div>
            </div>
        `).join('');

        const copyBtn = DOMElements.addModal.copyHoursBtn;
        if (copyBtn) {
            copyBtn.removeEventListener('click', copyAddMondayHours); // Prevent duplicate listeners
            copyBtn.addEventListener('click', copyAddMondayHours);
        }
    }

    function copyAddMondayHours() {
        const openMonday = document.querySelector('input[name="add-open-monday"]').value;
        const closeMonday = document.querySelector('input[name="add-close-monday"]').value;
        if (!openMonday && !closeMonday) { UI.showToast("Monday's hours are not set.", 'warning'); return; }
        const days = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => { document.querySelector(`input[name="add-open-${day}"]`).value = openMonday; document.querySelector(`input[name="add-close-${day}"]`).value = closeMonday; });
        UI.showToast("Hours copied to all other days.", 'success');
    }
    function copyEditMondayHours() {
    const openMonday = document.querySelector('input[name="edit-open-monday"]').value;
    const closeMonday = document.querySelector('input[name="edit-close-monday"]').value;

    if (!openMonday && !closeMonday) { 
        UI.showToast("Monday's hours are not set.", 'warning'); 
        return; 
    }

    const days = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => { 
        const openInput = document.querySelector(`input[name="edit-open-${day}"]`);
        const closeInput = document.querySelector(`input[name="edit-close-${day}"]`);
        if (openInput) openInput.value = openMonday;
        if (closeInput) closeInput.value = closeMonday;
    });
    UI.showToast("Hours copied to all other days.", 'success');
}

    setupCardSelection(DOMElements.listingsPanel.container, '.listing-card', 'selectedListingIds', 'isListingSelectionMode', UI.updateBulkActionBar);
    setupCardSelection(DOMElements.reviewsPanel.container, '.review-card', 'selectedReviewIds', 'isReviewSelectionMode', UI.updateBulkReviewActionBar);
}

function setAddModalUnsavedChanges() {
    AppState.addModalHasUnsavedChanges = true;
}

function handlePasswordToggle() {
    const isPassword = DOMElements.passwordInput.type === 'password';
    DOMElements.passwordInput.type = isPassword ? 'text' : 'password';

    if (isPassword) { // Show password
        DOMElements.eyeOpenIcon.classList.add('hidden');
        DOMElements.eyeClosedIcon.classList.remove('hidden');
    } else { // Hide password
        DOMElements.eyeOpenIcon.classList.remove('hidden');
        DOMElements.eyeClosedIcon.classList.add('hidden');
    }
}

// =================================================================================
// INITIALIZATION
// =================================================================================
function initializeApp() {
    UI.showView('dashboard');

    // Style the logout button to look more professional
    if (DOMElements.logoutBtn) {
        DOMElements.logoutBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
        `;
        // Add Tailwind CSS classes for styling
        DOMElements.logoutBtn.classList.add('btn', 'btn-secondary', 'flex', 'items-center', 'gap-2');
    }

    
    // Retrieve and set active main tab
    const savedMainTab = sessionStorage.getItem('adminActiveMainTab');
    UI.switchMainTab(savedMainTab || 'dashboard-panel');
    
    API.fetchAllCounts();
    
    // Retrieve and set active sub-tabs
    const savedListingStatus = sessionStorage.getItem('adminActiveListingStatus');
    setActiveListingTab(savedListingStatus || AppState.activeListingStatus);
    // Populate category filter
    DOMElements.listingsPanel.categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        Object.entries(AppState.categories).map(([key, cat]) =>
            `<option value="${key}">${cat.name}</option>`
        ).join('');

    const savedReviewStatus = sessionStorage.getItem('adminActiveReviewStatus');
    setActiveReviewTab(savedReviewStatus || AppState.activeReviewStatus);
    const savedPostStatus = sessionStorage.getItem('adminActivePostStatus');
    setActivePostTab(savedPostStatus || AppState.activePostStatus);
    const savedJobStatus = sessionStorage.getItem('adminActiveJobStatus');
    setActiveJobTab(savedJobStatus || AppState.activeJobStatus);
    const savedEventStatus = sessionStorage.getItem('adminActiveEventStatus');
    setActiveEventTab(savedEventStatus || AppState.activeEventStatus);
    const savedTransportType = sessionStorage.getItem('adminActiveTransportType');
    setActiveTransportTab(savedTransportType || AppState.activeTransportType);
    
    API.fetchRecentPendingListings().then(listings => {
        UI.renderRecentActivities(listings);
    });
    UI.addModalHoursDropdownStyle(); // Add custom styles for add modal hours dropdown
}

async function checkAuth() {
    // Race condition on hard-reload: ensure supabase client is loaded before proceeding.
    if (typeof supabase === 'undefined') {
        console.warn("Supabase client not ready, retrying in 100ms...");
        setTimeout(checkAuth, 100);
        return;
    }
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
        // Also check role on page load/refresh
        if (session.user.user_metadata?.role === 'admin') {
            await initializeApp();
        } else {
            // If a non-admin user has a session, log them out and show login
            await db.auth.signOut();
            UI.showView('login');
        }
    } else {
        UI.showView('login');
    }
}

// --- Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    UI.initializeTheme();
    setupEventListeners();
    checkAuth();
});
