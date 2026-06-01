// Perfect Ghatal Guide - Add Business Page Script

import { supabase } from './supabaseClient.js';

// Global state
let appState = {
    darkMode: localStorage.getItem('darkMode') === 'true' || (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
    currentUser: null,
};

// ✅ NEW: Polling variable for cross-device check
let pollingInterval;

// Categories data (needed for the form)
const categories = {
    health: { name: "Health & Wellness", icon: "🏥", subcategories: ["Hospitals", "Doctors", "Pharmacy"] },
    food: { name: "Food & Dining", icon: "🍽️", subcategories: ["Restaurants", "Cafes", "Sweets", "Desserts"] },
    shopping: { name: "Shopping", icon: "🛍️", subcategories: ["Apparel", "Electronics", "Groceries", "Book Store"] },
    services: { name: "Local Services", icon: "🔧", subcategories: ["Electricians", "Plumbers", "Mechanics"] },
    education: { name: "Education", icon: "🎓", subcategories: ["Schools", "Colleges", "Coaching Centers"] },
    emergency: { name: "Emergency", icon: "🚨", subcategories: ["Police", "Ambulance", "Fire Station", "Blood Banks"] }
};

// Utility functions
const utils = {
    sanitizeHTML: (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    isValidUrl: (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },
    extractLatLngFromGoogleMapsLink: (url) => {
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
    },
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
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.content = appState.darkMode ? '#1e293b' : '#1e3a8a';
        }
    },
    toggle() {
        appState.darkMode = !appState.darkMode;
        localStorage.setItem('darkMode', appState.darkMode);
        this.applyTheme();
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
        const { icon } = icons[type] || icons.info;
        toast.innerHTML = `
            <div class="flex items-start space-x-3">
                <span class="text-xl flex-shrink-0">${icon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">${utils.sanitizeHTML(message)}</p>
                </div>
                <button onclick="toastManager.remove('${toastId}')" class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">
                    <span class="sr-only">Close</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `;
        this.container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.add('toast-enter-active');
        });
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

// EMAIL CONFIRMATION POPUP MANAGER
const popupManager = {
    popup: null,
    title: null,
    message: null,
    confirmIcon: null,
    confirmedIcon: null,

    init() {
        this.popup = document.getElementById('email-confirmation-popup');
        this.title = document.getElementById('email-popup-title');
        this.message = document.getElementById('email-popup-message');
        this.confirmIcon = document.getElementById('email-confirm-icon');
        this.confirmedIcon = document.getElementById('email-confirmed-icon');
    },

    show(state) {
        if (!this.popup) return;

        if (state === 'awaiting-confirmation') {
            this.title.textContent = 'Please confirm your email';
            this.message.textContent = "We've sent a confirmation link to your email address. Please click the link to continue.";
            this.confirmIcon.style.display = 'flex';
            this.confirmedIcon.style.display = 'none';
        
        // ✅ এই নতুন অংশটুকু যোগ করুন:
        } else if (state === 'reset-sent') {
            this.title.textContent = 'Check your inbox';
            this.message.textContent = "We've sent a password reset link to your email. Click the link to create a new password.";
            this.confirmIcon.style.display = 'flex'; // খামের আইকনটিই ব্যবহার হবে
            this.confirmedIcon.style.display = 'none';
        // ✅ শেষ

        } else if (state === 'confirmed') {
            this.title.textContent = 'Email Confirmed!';
            this.message.textContent = 'Thank you for confirming your email. You are now logged in!';
            this.confirmIcon.style.display = 'none';
            this.confirmedIcon.style.display = 'flex';
        }

        this.popup.classList.remove('hidden');
        this.popup.classList.remove('animate-zoom-out-fade');
        this.popup.classList.add('animate-zoom-in-fade');
    },

    hide() {
        if (!this.popup) return;
        this.popup.classList.remove('animate-zoom-in-fade');
        this.popup.classList.add('animate-zoom-out-fade');
        setTimeout(() => {
            this.popup.classList.add('hidden');
        }, 500);
    }
};

// AUTHENTICATION MODULE
const authManager = {
    init() {
        if (!supabase) {
            console.error("Supabase client is not available.");
            return;
        }
        supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event, session);
    appState.currentUser = session ? session.user : null;
    this.updateUI(appState.currentUser);

    // ✅ নতুন অংশ: পাসওয়ার্ড রিকভারি ইভেন্ট ধরা
    if (event === 'PASSWORD_RECOVERY') {
        authModalManager.showUpdatePasswordModal();
    }
});

        // Check session on load
        supabase.auth.getSession().then(({ data: { session } }) => {
            const urlParams = new URLSearchParams(window.location.search);
            const listingId = urlParams.get('id');
            const lastView = sessionStorage.getItem('addBusinessActiveView');

            if (listingId) {
                return; 
            }

            if (session && lastView === 'dashboard') {
                console.log('Session found on load, switching to dashboard view.');
                addBusinessHandler.showView('dashboard');
            }
        });
    },
    updateUI(user) {
        const loggedOutViews = document.querySelectorAll('.logged-out-view');
        const loggedInViews = document.querySelectorAll('.logged-in-view');
        if (user) {
            loggedOutViews.forEach(el => el.classList.add('hidden'));
            loggedInViews.forEach(el => el.classList.remove('hidden'));

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

            document.querySelectorAll('#logout-btn-desktop, #logout-btn-mobile').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', this.logout);
            });

            bindMenuCloseEvents();
        } else {
            const authModal = document.getElementById('auth-modal');
            const dashboardView = document.getElementById('dashboard-view');

            if (dashboardView && !dashboardView.classList.contains('hidden')) {
                addBusinessHandler.showView('add-business');
            }

            this.scrollToAuthSection();

            loggedInViews.forEach(el => el.classList.add('hidden'));
            loggedOutViews.forEach(el => el.classList.remove('hidden'));

            document.querySelectorAll('.logged-out-view a[href="#add-business-form-section"]').forEach(link => {
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = newLink.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        this.scrollToAuthSection();
                    }
                });
            });

            bindMenuCloseEvents();
        }
    },

    scrollToAuthSection() {
        const targetElement = document.getElementById('add-business-form-section');
        const header = document.querySelector('header');
        
        if (targetElement) {
            const headerOffset = header ? header.offsetHeight : 80;
            const extraPadding = 20;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset - extraPadding;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth' 
            });

            setTimeout(() => {
                authModalManager.show();
            }, 500); 
        }
    },

    async logout() {
        if (appState.currentUser && appState.currentUser.user_metadata?.role === 'admin') {
            if (!confirm('You are logged in as an admin. Logging out here will also log you out of the Admin Panel. Are you sure you want to continue?')) {
                return;
            }
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            toastManager.show(`Logout failed: ${error.message}`, 'error');
        } else {
            toastManager.show('You have been logged out.', 'info');
        }
    }
};

// Shared mobile menu handler
function bindMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const hamburgerIcon = document.querySelector('.hamburger-icon');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
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
  if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', () => toggleMenu(true));
  mobileMenuOverlay.addEventListener('click', () => toggleMenu(true));
  window.addEventListener('resize', () => window.innerWidth >= 768 && toggleMenu(true));
  window.mobileMenuManager = { toggleMenu };
}

function bindMenuCloseEvents() {
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    if (mobileMenuPanel) {
        mobileMenuPanel.removeEventListener('click', handleMenuClick);
        mobileMenuPanel.addEventListener('click', handleMenuClick);
    }
}

function handleMenuClick(event) {
    const target = event.target.closest('a, button');
    if (target) {
        if (window.mobileMenuManager && typeof window.mobileMenuManager.toggleMenu === 'function') {
                mobileMenuManager.toggleMenu(true);
        }
    }
}

// ✅ AUTHENTICATION MODAL MANAGER (UPDATED WITH CROSS-DEVICE POLLING)
const authModalManager = {
    modal: null,
    signupContainer: null,
    signinContainer: null,
    resetEmail: null,

   init() {
        this.modal = document.getElementById('auth-modal');
        this.signupContainer = document.getElementById('signup-container');
        this.formSectionToBlur = document.getElementById('add-business-form-section');
        this.signinContainer = document.getElementById('signin-container');
        
        // ✅ নতুন লাইন:
        this.updatePasswordModal = document.getElementById('update-password-modal');
        
        this.bindEvents();
    },

    bindEvents() {
        if (!this.modal) return;
        this.modal.querySelector('#signup-form')?.addEventListener('submit', this.handleSignUp.bind(this));
        this.modal.querySelector('#signin-form')?.addEventListener('submit', this.handleSignIn.bind(this));
        this.modal.querySelectorAll('.toggle-auth-form').forEach(btn => {
            btn.addEventListener('click', () => this.toggleForms());
        });
        this.modal.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.hideAuthErrors());
        });

        // ✅ নতুন ইভেন্ট লিসেনার:
        this.modal.querySelector('#forgot-password-link')?.addEventListener('click', () => this.toggleForgotPasswordView(true));
        this.modal.querySelector('#back-to-signin')?.addEventListener('click', () => this.toggleForgotPasswordView(false));
        this.modal.querySelector('#forgot-password-form')?.addEventListener('submit', this.handleSendResetLink.bind(this));
        
        if (this.updatePasswordModal) {
            this.updatePasswordModal.querySelector('#update-password-form')?.addEventListener('submit', this.handleUpdatePassword.bind(this));
        }

        // ৫. OTP ভেরিফিকেশন ফর্ম
        this.modal.querySelector('#otp-verification-form')?.addEventListener('submit', this.handleVerifyOtp.bind(this));
        
        // ৬. OTP পেজ থেকে ব্যাকে আসার বাটন
        this.modal.querySelector('#back-to-email')?.addEventListener('click', () => this.toggleOtpView(false));
    },

    show() {
        if (this.modal) {
            this.formSectionToBlur?.querySelector(':scope > div:not(#auth-modal)')?.classList.add('pointer-events-none');
            this.modal.classList.remove('hidden');
            this.modal.classList.add('animate-zoom-in-fade');
            setTimeout(() => {
                this.modal.classList.remove('animate-zoom-in-fade');
            }, 500);
        }
    },

    hide() {
        if (this.modal) {
            this.modal.classList.add('animate-zoom-out-fade');

            // Stop polling if active
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log("Stopped polling because modal closed.");
            }

            setTimeout(() => {
                this.modal.classList.add('hidden');
                this.modal.classList.remove('animate-zoom-out-fade');
                this.formSectionToBlur?.querySelector(':scope > div:not(#auth-modal)')?.classList.remove('pointer-events-none');

                // ✅ রিসেট লজিক: মডাল বন্ধ হলে সবকিছু 'Sign In' অবস্থায় ফিরিয়ে আনা
                
                // ১. সব সেকেন্ডারি ফর্ম বন্ধ করা
                this.modal.querySelector('#otp-verification-form')?.classList.add('hidden');
                this.modal.querySelector('#forgot-password-form')?.classList.add('hidden');
                
                // ২. মেইন সাইন-ইন ফর্ম চালু করা
                this.modal.querySelector('#signin-form')?.classList.remove('hidden');
                
                // ৩. টাইটেল এবং সাবটাইটেল ফিরিয়ে আনা
                const headerElements = this.modal.querySelectorAll('#signin-container h2, #signin-container > p:not(#forgot-error):not(#otp-error)');
                headerElements.forEach(el => el.classList.remove('hidden'));
                
                // ৪. নিচের "Don't have an account?" লেখাটি ফিরিয়ে আনা
                const footerText = this.modal.querySelector('#signin-container .text-center.text-sm.mt-6');
                if(footerText) footerText.classList.remove('hidden');

                // ৫. ইনপুট ফিল্ডগুলো ক্লিয়ার করা (অপশনাল, তবে ভালো)
                this.modal.querySelectorAll('input').forEach(input => input.value = '');
                this.hideAuthErrors();

            }, 500);
        }
    },
    
    toggleForms() {
        const authContainer = this.modal.querySelector('.auth-container');
        authContainer.classList.toggle('panel-left-active');
        authContainer.classList.toggle('panel-right-active');
    },

    switchToSignIn(email = '') {
        const authContainer = this.modal.querySelector('.auth-container');
        authContainer.classList.remove('panel-right-active');
        authContainer.classList.add('panel-left-active');
        const signinEmailInput = document.getElementById('signin-email');
        if (signinEmailInput && email) signinEmailInput.value = email;
    },

    // ✅ UPDATED: Error Message Handler (Resets Color)
    showAuthError(formType, message) {
        const containerId = formType === 'signin' ? '#signin-container' : '#signup-container';
        const errorId = formType === 'signin' ? '#signin-error' : '#signup-error';
        
        const panelContent = this.modal.querySelector(containerId);
        const errorEl = this.modal.querySelector(errorId);

        if (errorEl) {
            // 🧹 CLEANUP: আগের সব গ্রিন ক্লাস মুছে দিচ্ছি
            errorEl.classList.remove('text-green-600', 'font-bold', 'animate-pulse');
            
            // 🔴 RESET: আবার লাল রঙ সেট করছি
            errorEl.classList.add('text-red-500', 'text-sm', 'text-center');
            
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
        if (panelContent) {
            panelContent.classList.add('animate-shake');
            setTimeout(() => { panelContent.classList.remove('animate-shake'); }, 820);
        }
    },

    hideAuthErrors() {
        this.modal.querySelectorAll('#signin-error, #signup-error').forEach(el => {
            if (!el.classList.contains('hidden')) {
                el.classList.add('hidden');
            }
        });
    },

    // ✅ UPDATED: Handle Sign Up with Polling Logic
    async handleSignUp(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = form.querySelector('#signup-email').value;
        const password = form.querySelector('#signup-password').value;
        const confirmPassword = form.querySelector('#signup-confirm-password').value;

        if (password !== confirmPassword) {
            this.showAuthError('signup', 'Passwords do not match. Please try again.');
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
            // 1. Sign Up Request
            // IMPORTANT: We use the explicit Localhost URL to avoid token stripping issues
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/add-business.html'
                }
            });

            if (error) {
                this.showAuthError('signup', error.message);
            } else if (data.user && data.user.identities && data.user.identities.length === 0) {
                toastManager.show('This email is already registered. Please sign in.', 'info');
                this.toggleForms(); 
                const signinEmailInput = this.modal.querySelector('#signin-email');
                if (signinEmailInput) signinEmailInput.value = email;
            } else if (data.user) {
                // 2. Show Success Message
                toastManager.show('Confirmation email sent! Please check your inbox.', 'success', 8000);
                popupManager.show('awaiting-confirmation');
                
                // 3. Start Polling (Check for confirmation from Mobile/Other tabs)
                this.startPollingForConfirmation(email, password);
            }
        } catch (err) {
             console.error(err);
             this.showAuthError('signup', err.message || 'Signup failed');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    },

    // ✅ NEW: Polling Function to detect Mobile Confirmation
  // ✅ FINAL VERSION: With Delay & Color Fix
    startPollingForConfirmation(email, password) {
        console.log("⏳ Polling started...");
        
        if (pollingInterval) clearInterval(pollingInterval);

        const startTime = Date.now();
        const timeoutDuration = 3 * 60 * 1000; // 3 Minutes

        pollingInterval = setInterval(async () => {
            
            // Timeout Check
            if (Date.now() - startTime > timeoutDuration) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                alert("Time expired! Please log in manually.");
                
                const form = document.getElementById('signup-form');
                const btn = form ? form.querySelector('button[type="submit"]') : null;
                if(btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
                return;
            }

            // Check Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            // Safety Guard
            if (!pollingInterval) return; 

            if (data.session) {
                // 🎉 Success
                clearInterval(pollingInterval);
                pollingInterval = null;
                
                console.log("✅ Verified! Signing out and switching UI...");

                // 1. আগে সাইন-আউট করো
                await supabase.auth.signOut();

                // 2. ⏳ WAIT: এখানে ৩০০ms অপেক্ষা করছি যাতে Logout এর অ্যানিমেশন শেষ হয়ে যায়
                setTimeout(() => {
                    // 3. এখন আমাদের অ্যানিমেশন চালাও (Conflict হবে না)
                    popupManager.hide();
                    this.switchToSignIn(email); 

                    // 4. Success Message (Green)
                    const errorEl = document.getElementById('signin-error');
                    if (errorEl) {
                        // লাল রঙ সরিয়ে সবুজ করা হলো
                        errorEl.classList.remove('hidden', 'text-red-500'); 
                        errorEl.classList.add('text-green-600', 'font-bold', 'animate-pulse');
                        errorEl.textContent = "✅ Email Verified! Please enter your password to log in.";
                    }

                    // 5. ৫ সেকেন্ড পর সবুজ লেখাটা সরিয়ে নরমাল করে দাও
                    setTimeout(() => {
                        if (errorEl) {
                            errorEl.classList.remove('animate-pulse', 'text-green-600', 'font-bold');
                            errorEl.classList.add('hidden', 'text-red-500'); // লুকিয়ে ফেললাম এবং লাল রঙে রিসেট করলাম
                            errorEl.textContent = "";
                        }
                    }, 5000);

                }, 300); // 300ms delay
            }
        }, 3000);
    },


    async handleSignIn(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = form.querySelector('#signin-email').value;
        const password = form.querySelector('#signin-password').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing In...';

        try {
            const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                this.showAuthError('signin', 'Wrong password or email. Please try again.');
            } else {
                this.hideAuthErrors();
                toastManager.show('Successfully logged in!', 'success');
                const user = signInData.user;
                if (user) {
                    const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                    if (count > 0) {
                        toastManager.show('Loading your dashboard...', 'info');
                        setTimeout(() => {
                            this.hide();
                            addBusinessHandler.showView('dashboard');
                        }, 1000);
                    } else {
                         // If no listings, just close modal
                         this.hide();
                    }
                }
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }


    , // আগের ফাংশনের শেষে কমা দিতে ভুলবেন না

    // ✅ নতুন ফাংশনসমূহ:
    toggleForgotPasswordView(showForgot) {
        const signinForm = this.modal.querySelector('#signin-form');
        const forgotForm = this.modal.querySelector('#forgot-password-form');
        // টাইটেল এবং সাবটাইটেলগুলো হাইড করতে হবে
        const headerElements = this.modal.querySelectorAll('#signin-container h2, #signin-container > p:not(#forgot-error)'); 
        const footerText = this.modal.querySelector('#signin-container .text-center.text-sm.mt-6');

        if (showForgot) {
            signinForm.classList.add('hidden');
            if(footerText) footerText.classList.add('hidden');
            forgotForm.classList.remove('hidden');
            headerElements.forEach(el => el.classList.add('hidden'));
        } else {
            forgotForm.classList.add('hidden');
            signinForm.classList.remove('hidden');
            if(footerText) footerText.classList.remove('hidden');
            headerElements.forEach(el => el.classList.remove('hidden'));
        }
    },

    async handleSendResetLink(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const email = form.querySelector('#forgot-email').value;
        const errorEl = form.querySelector('#forgot-error');

        this.resetEmail = email; // ইমেইলটি সেভ করে রাখা হচ্ছে পরের ধাপের জন্য

        btn.disabled = true;
        btn.textContent = 'Sending Code...';
        errorEl.classList.add('hidden');

        try {
            // ✅ নতুন লজিক: OTP পাঠানো
            const { error } = await supabase.auth.signInWithOtp({
                email: email
            });

            if (error) throw error;

            toastManager.show('Security code sent to your email!', 'success');
            
            // OTP ইনপুট ফর্মটি দেখানো
            this.toggleOtpView(true);

        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Security Code';
        }
    },

    showUpdatePasswordModal() {
        this.hide(); // লগইন মডাল বন্ধ করুন
        if (this.updatePasswordModal) {
            this.updatePasswordModal.classList.remove('hidden');
        }
    },

    async handleUpdatePassword(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const newPassword = form.querySelector('#new-password').value;

        btn.disabled = true;
        btn.textContent = 'Updating...';

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            toastManager.show('Password updated! You are logged in.', 'success');
            this.updatePasswordModal.classList.add('hidden');
            addBusinessHandler.showView('dashboard');
        } catch (err) {
            toastManager.show(`Update failed: ${err.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Update Password';
        }
    },


    toggleOtpView(showOtp) {
        const forgotForm = this.modal.querySelector('#forgot-password-form');
        const otpForm = this.modal.querySelector('#otp-verification-form');
        const headerElements = this.modal.querySelectorAll('#signin-container h2, #signin-container > p:not(#forgot-error):not(#otp-error)'); 

        if (showOtp) {
            forgotForm.classList.add('hidden');
            otpForm.classList.remove('hidden');
            headerElements.forEach(el => el.classList.add('hidden'));
        } else {
            otpForm.classList.add('hidden');
            forgotForm.classList.remove('hidden');
        }
    },

    async handleVerifyOtp(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const token = form.querySelector('#otp-code').value;
        const errorEl = form.querySelector('#otp-error');

        btn.disabled = true;
        btn.textContent = 'Verifying...';
        errorEl.classList.add('hidden');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: this.resetEmail,
                token: token,
                type: 'email'
            });

            if (error) throw error;

            toastManager.show('Code verified! Please set your new password.', 'success');
            
            this.hide(); 
            this.showUpdatePasswordModal();

        } catch (err) {
            console.error(err);
            errorEl.textContent = 'Invalid code or expired. Please try again.';
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Verify Code';
        }
    }

}; // <--- ৩. এটা হলো authModalManager এর শেষের ব্র্যাকেট (এটা ফাইলে আগেই ছিল)





// Add business form handler
const addBusinessHandler = {
    init() {
        const form = document.getElementById('add-business-form');
        this.currentStep = 1;
        this.userListings = []; 
        if (!form) return;

        console.log('📝 Initializing add business form...');
        
        toastManager.init();
        authModalManager.init(); // ✅ আগে মডাল ম্যানেজার রেডি করুন
        popupManager.init();
        themeManager.init();
        
        authManager.init();      // ✅ সবার শেষে অথেন্টিকেশন চালু করুন

        this.renderForm();
        this.bindEvents();
        bindMobileMenu(); 
        listenForFormChanges(); 

        const urlParams = new URLSearchParams(window.location.search);
        const listingId = urlParams.get('id');

        if (listingId) {
            this.setupEditMode(listingId);
        } else {
            this.setupAddMode();

            if (urlParams.get('action') === 'login') {
                authModalManager.show();
            }
        }

        // supabase.auth.onAuthStateChange((event, session) => {
        //     if (session) {
        //         authModalManager.hide();
        //     }
        // });
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.remove('hidden');
            this.scrollToView(targetView);
            sessionStorage.setItem('addBusinessActiveView', viewId);
        }

        if (viewId === 'dashboard') {
            this.renderDashboardView();
        } else {
            sessionStorage.removeItem('addBusinessActiveView');
            // window.location.href = 'add-business.html'; // Optional reload if needed
        }
    },

    scrollToView(element) {
        const header = document.querySelector('header');
        const headerOffset = header ? header.offsetHeight + 20 : 20;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    renderForm() {
        const form = document.getElementById('add-business-form');
        if (!form) return;
        
        form.innerHTML = `
            <input type="hidden" id="edit-listing-id" name="listing_id">
            <div id="form-step-1" class="form-step space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label for="b-category" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Category *
                        </label>
                        <select id="b-category" name="b-category" required 
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                            <option value="" disabled selected>Select a Category</option>
                            ${Object.entries(categories)
                                .map(([key, value]) => `<option value="${key}">${value.icon} ${value.name}</option>`).join('')}
                        </select>
                    </div>
                    <div id="subcategory-wrapper" style="display: none;">
                        <label for="b-subcategory" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Sub-Category *
                        </label>
                        <select id="b-subcategory" name="b-subcategory" required 
                                class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                            <option value="" disabled selected>Select a Sub-Category</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="b-name" id="b-name-label" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Business Name *
                        </label>
                        <input type="text" id="b-name" name="b-name" required 
                               class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                               placeholder="Enter your business name">
                    </div>
                    <div class="md:col-span-2">
                        <label for="b-phone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number *
                        </label>
                        <input type="tel" id="b-phone" name="b-phone" required 
                               class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                               placeholder="Enter phone number">
                    </div>
                </div>
                <div>
                        <label for="hours-type" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Opening Hours *
                        </label>
                        <div id="hours-dropdown" class="relative">
                            <input type="hidden" id="hours-type" name="hours-type" value="open_24_7">
                            <button type="button" id="hours-dropdown-button" class="w-full flex items-center justify-between text-left px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" aria-haspopup="listbox" aria-expanded="false">
                                <span id="hours-dropdown-selected" class="flex items-center gap-x-3">
                                    <span class="text-xl">🕒</span>
                                    <span class="font-medium text-gray-800 dark:text-gray-200">Open 24/7</span>
                                </span>
                                <svg id="hours-dropdown-chevron" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <div id="hours-dropdown-panel" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-10 hidden">
                                <div class="p-2 space-y-1">
                                    <div class="hours-option" data-value="open_24_7">🕒 Open 24/7</div>
                                    <div class="hours-option" data-value="temporarily_closed">⛔ Temporarily Closed</div>
                                    <div class="hours-option" data-value="custom">⚙️ Set Custom Hours</div>
                                </div>
                            </div>
                        </div>
                    </div>
                <div id="custom-hours-section" class="hidden mt-4 p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                        <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                            Let customers know when you're open. Leave times blank if you're closed on a particular day.
                        </p>
                        <div class="space-y-4" id="opening-hours-inputs">
                            </div>
                        <div class="mt-4">
                            <button type="button" id="copy-hours-btn" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                                Copy Monday's hours to all days
                            </button>
                        </div>
                    </div>
            </div>
            <div id="form-step-2" class="form-step hidden space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="b-address" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Full Address *
                        </label>
                        <textarea id="b-address" name="b-address" required rows="3"
                                  class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder="Enter complete address with area and landmarks"></textarea>
                    </div>
                    <div>
                        <label for="b-gmap" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Google Maps Link
                        </label>
                        <input type="url" id="b-gmap" name="b-gmap" 
                               class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                               placeholder="https://maps.app.goo.gl/...">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Add your Google Maps location link</p>
                    </div>
                    <div class="md:col-span-2">
                        <label for="b-image-upload" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Upload Business Image
                        </label>
                        <input type="file" id="b-image-upload" name="image_upload" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800" accept="image/png, image/jpeg, image/webp">
                        <input type="hidden" id="b-image-url" name="b-image">
                        <div id="b-image-preview-wrapper" class="mt-4 hidden">
                            <p class="text-xs text-gray-500 mb-2">Image Preview:</p>
                            <img id="b-image-preview" src="" alt="Image Preview" class="max-h-48 rounded-lg shadow-md border border-gray-200 dark:border-slate-600">
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Upload a photo of your business.</p>
                    </div>
                    <div class="md:col-span-2">
                        <label for="b-description" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Business Description
                        </label>
                        <textarea id="b-description" name="b-description" rows="3"
                                  class="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-all"
                                  placeholder="Briefly describe your business and services..." 
                                  maxlength="500"></textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Maximum 500 characters</p>
                    </div>
                </div>
            </div>
            <div id="form-step-3" class="form-step hidden space-y-6">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Review Your Information</h3>
                <p class="text-gray-600 dark:text-gray-400">Please check all the details below before submitting. You can go back to edit if needed.</p>
                <div id="review-panel" class="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 space-y-4">
                    </div>
            </div>
            <div id="form-navigation" class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <button type="button" id="prev-btn" class="bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-lg font-semibold transition-colors hidden">
                    ← Previous
                </button>
                <button type="button" id="next-btn" class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors ml-auto">
                    Next: Location →
                </button>
                <button type="submit" id="submit-btn"
                        class="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-12 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hidden">
                    🚀 Submit for Review
                </button>
            </div>
        `;

        // Custom style for the radio button indicator
        const style = document.createElement('style');
        style.textContent = `
            #hours-dropdown-panel {
                transform-origin: top;
                transition: transform 0.15s ease-out, opacity 0.15s ease-out;
            }
            .hours-option {
                display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background-color 0.2s;
            }
            .hours-option:hover, .hours-option.selected {
                background-color: #dbeafe; /* primary-100 */
            }
            .dark .hours-option:hover, .dark .hours-option.selected { background-color: #1e40af; /* primary-800 */ }
        `;
        document.head.appendChild(style);
    },

    async setupAddMode() {
        // Ensure user is logged in to add a new business
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toastManager.show('Please log in or sign up to add a business.', 'info');
            authModalManager.show();
        }
    },

    async setupEditMode(listingId) {
        document.getElementById('page-title').textContent = 'Edit Your Business - Ghatal Guide';
        document.getElementById('form-main-title').innerHTML = `Edit Your Business on <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">Ghatal Guide</span>`;
        document.getElementById('form-subtitle').textContent = 'Update your business details below to keep your listing accurate.';
        document.getElementById('form-header-title').textContent = 'Edit Business Details';
        document.getElementById('form-header-subtitle').textContent = 'Make changes and save to update your listing.';
        document.getElementById('submit-btn').innerHTML = '💾 Save Changes';

        const url = new URL(window.location);
        url.searchParams.set('id', listingId);
        window.history.pushState({ path: url.href }, '', url.href);

        document.getElementById('benefits-section').style.display = 'none';
        document.getElementById('progress-indicator').style.display = 'none';

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toastManager.show('Please log in to edit your business.', 'info');
                authModalManager.show();
                return;
            }

            const { data: listing, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .eq('user_id', user.id)
                .single();

            if (error || !listing) {
                throw new Error("Could not find this business or you don't have permission to edit it.");
            }

            document.getElementById('edit-listing-id').value = listing.id;
            document.getElementById('b-name').value = listing.name;
            document.getElementById('b-phone').value = listing.phone;
            document.getElementById('b-address').value = listing.address;
            document.getElementById('b-gmap').value = listing.googleMapLink || '';
            
            const imageUrlInput = document.getElementById('b-image-url');
            const imagePreview = document.getElementById('b-image-preview');
            const imagePreviewWrapper = document.getElementById('b-image-preview-wrapper');
            imageUrlInput.value = listing.image || '';
            imagePreview.src = listing.image || '';
            imagePreviewWrapper.classList.toggle('hidden', !listing.image);

            document.getElementById('b-description').value = listing.description || '';

            const categorySelect = document.getElementById('b-category');
            categorySelect.value = listing.category;
            categorySelect.dispatchEvent(new Event('change'));

            setTimeout(() => {
                document.getElementById('b-subcategory').value = listing.subcategory;
            }, 100);

            if (listing.opening_hours) {
                const hoursType = listing.opening_hours.status;
                const hoursData = listing.opening_hours.hours;

                const option = document.querySelector(`.hours-option[data-value="${hoursType}"]`);
                if (option) option.click();

                if (hoursType === 'custom' && hoursData) {
                    setTimeout(() => { 
                        for (const day in hoursData) {
                            if (hoursData[day]) {
                                const openInput = document.querySelector(`input[name="open-${day}"]`);
                                const closeInput = document.querySelector(`input[name="close-${day}"]`);
                                if (openInput) openInput.value = hoursData[day].open;
                                if (closeInput) closeInput.value = hoursData[day].close;
                            }
                        }
                    }, 200);
                }
            }

        } catch (err) {
            toastManager.show(err.message, 'error');
            document.getElementById('add-business-form').innerHTML = `<p class="text-center text-red-500 font-semibold">${err.message}</p>`;
            setTimeout(() => { window.location.href = 'index.html#dashboard'; }, 3000);
        }
    },

    renderOpeningHoursInputs() {
        const container = document.getElementById('opening-hours-inputs');
        if (!container) return;

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        container.innerHTML = days.map(day => `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label class="font-medium text-gray-700 dark:text-gray-300">${day}</label>
                <div class="col-span-2 grid grid-cols-2 gap-2">
                    <input type="time" name="open-${day.toLowerCase()}" 
                           class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                           aria-label="${day} opening time">
                    <input type="time" name="close-${day.toLowerCase()}" 
                           class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                           aria-label="${day} closing time">
                </div>
            </div>
        `).join('');

        const copyBtn = document.getElementById('copy-hours-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', this.copyMondayHours.bind(this));
        }
    },


    bindEvents() {
        const form = document.getElementById('add-business-form');
        const categorySelect = document.getElementById('b-category');
        const subcategoryWrapper = document.getElementById('subcategory-wrapper');
        const subcategorySelect = document.getElementById('b-subcategory');
        const businessNameLabel = document.getElementById('b-name-label');
        const hoursDropdown = document.getElementById('hours-dropdown');
        const imageUploadInput = document.getElementById('b-image-upload');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');

        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const selectedCategoryKey = e.target.value;
                const selectedCategory = categories[selectedCategoryKey];

                if (selectedCategory && selectedCategory.subcategories.length > 0) {
                    subcategorySelect.innerHTML = `
                        <option value="" disabled selected>Select a Sub-Category</option>
                        ${selectedCategory.subcategories.map(sub => 
                            `<option value="${sub}">${sub}</option>`
                        ).join('')}
                    `;
                    subcategoryWrapper.style.display = 'block';
                    subcategorySelect.required = true;
                } else {
                    subcategoryWrapper.style.display = 'none';
                    subcategorySelect.required = false;
                }
            });
        }

        if (subcategorySelect) {
            subcategorySelect.addEventListener('change', (e) => {
                const selectedSubcategory = e.target.value;
                businessNameLabel.textContent = this.getBusinessNameLabel(selectedSubcategory);
            });
        }

        const phoneInput = document.getElementById('b-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                
                e.target.value = value;
            });
        }

        const descriptionInput = document.getElementById('b-description');
        if (descriptionInput) {
            const helpText = descriptionInput.parentNode.querySelector('.text-xs');
            descriptionInput.addEventListener('input', (e) => {
                const remaining = 500 - e.target.value.length;
                helpText.textContent = `Optional: ${remaining} characters remaining`;
                
                if (remaining < 50) {
                    helpText.classList.add('text-yellow-500');
                    helpText.classList.remove('text-gray-500', 'dark:text-gray-400');
                } else {
                    helpText.classList.remove('text-yellow-500');
                    helpText.classList.add('text-gray-500', 'dark:text-gray-400');
                }
            });
        }

        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                const preview = document.getElementById('b-image-preview');
                const previewWrapper = document.getElementById('b-image-preview-wrapper');
                if (file && preview && previewWrapper) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.src = event.target.result;
                        previewWrapper.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeStep(1));
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeStep(-1));
        }

        document.addEventListener('click', (e) => {
            const navTarget = e.target.closest('[data-nav]');
            if (navTarget) {
                e.preventDefault();
                this.showView(navTarget.dataset.nav);
            }
        });

        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');

        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
                userMenuButton.setAttribute('aria-expanded', String(!isExpanded));
                
                if (isExpanded) {
                    userMenuDropdown.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => userMenuDropdown.classList.add('hidden'), 300);
                } else {
                    userMenuDropdown.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        userMenuDropdown.classList.remove('opacity-0', '-translate-y-2');
                    });
                }
            });

            document.addEventListener('click', (event) => {
                if (userMenuButton && userMenuDropdown && !userMenuButton.contains(event.target) && !userMenuDropdown.contains(event.target)) {
                    if (userMenuButton.getAttribute('aria-expanded') === 'true') {
                        userMenuButton.setAttribute('aria-expanded', 'false');
                        userMenuDropdown.classList.add('opacity-0', '-translate-y-2');
                        setTimeout(() => userMenuDropdown.classList.add('hidden'), 300);
                    }
                }
            });

            userMenuDropdown.addEventListener('click', (event) => {
                if (event.target.closest('a, button')) {
                    userMenuButton.setAttribute('aria-expanded', 'false');
                    userMenuDropdown.classList.add('opacity-0', '-translate-y-2');
                    setTimeout(() => userMenuDropdown.classList.add('hidden'), 300);
                }
            });
        }

        const submitAnotherBtn = document.getElementById('submit-another');
        const viewDirectoryBtn = document.getElementById('view-directory');

        if (submitAnotherBtn) {
            submitAnotherBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        if (viewDirectoryBtn) {
            viewDirectoryBtn.addEventListener('click', () => {
                window.location.href = 'index.html#directory';
            });
        }

        if (hoursDropdown) {
            const button = document.getElementById('hours-dropdown-button');
            const panel = document.getElementById('hours-dropdown-panel');
            const hiddenInput = document.getElementById('hours-type');
            const selectedDisplay = document.getElementById('hours-dropdown-selected');
            const chevron = document.getElementById('hours-dropdown-chevron');
            const customHoursSection = document.getElementById('custom-hours-section');

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

            button.addEventListener('click', () => toggleDropdown());
            document.addEventListener('click', (e) => {
                if (!hoursDropdown.contains(e.target)) {
                    toggleDropdown(true);
                }
            });

            panel.querySelectorAll('.hours-option').forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const content = option.innerHTML;

                    hiddenInput.value = value;
                    selectedDisplay.innerHTML = `<span class="flex items-center gap-x-3">${content}</span>`;

                    if (value === 'custom') {
                        customHoursSection.classList.remove('hidden');
                        this.renderOpeningHoursInputs();
                    } else {
                        customHoursSection.classList.add('hidden');
                    }
                    toggleDropdown(true);
                });
            });
        }
    },

    changeStep(direction) {
        const newStep = this.currentStep + direction;

        if (direction > 0 && !this.validateStep(this.currentStep)) {
            toastManager.show('Please fill all required fields (*) in the current step.', 'error');
            return;
        }

        if (newStep > 0 && newStep <= 3) {
            if (newStep === 3) {
                this.populateReviewPanel();
            }

            document.getElementById(`form-step-${this.currentStep}`).classList.add('hidden');
            document.getElementById(`form-step-${newStep}`).classList.remove('hidden');
            this.currentStep = newStep;
            this.updateUIForStep(newStep);
        }
    },

    validateStep(step) {
        let isValid = true;
        const requiredFields = {
            1: ['b-category', 'b-name', 'b-phone'],
            2: ['b-address']
        };

        if (requiredFields[step]) {
            requiredFields[step].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value) {
                    isValid = false;
                    field.classList.add('border-red-500');
                    field.addEventListener('input', () => field.classList.remove('border-red-500'), { once: true });
                }
            });
        }
        return isValid;
    },

    updateUIForStep(step) {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        document.querySelectorAll('.progress-step').forEach(el => {
            const stepNum = parseInt(el.dataset.step, 10);
            el.classList.remove('active', 'completed');
            if (stepNum < step) {
                el.classList.add('completed');
            } else if (stepNum === step) {
                el.classList.add('active');
            }
        });

        prevBtn.classList.toggle('hidden', step === 1);
        nextBtn.classList.toggle('hidden', step === 3);
        submitBtn.classList.toggle('hidden', step !== 3);

        if (step === 2) {
            nextBtn.innerHTML = 'Next: Review →';
        } else {
            nextBtn.innerHTML = 'Next: Location →';
        }
    },

    populateReviewPanel() {
        const panel = document.getElementById('review-panel');
        const formData = new FormData(document.getElementById('add-business-form'));
        const data = Object.fromEntries(formData.entries());

        const categoryName = categories[data['b-category']]?.name || 'N/A';
        const subCategoryName = data['b-subcategory'] || 'N/A';
        const hoursType = data['hours-type'];
        let hoursText = 'Open 24/7';
        if (hoursType === 'temporarily_closed') hoursText = 'Temporarily Closed';
        if (hoursType === 'custom') hoursText = 'Custom Hours';

        const reviewItem = (label, value) => {
            if (!value) return '';
            return `<div class="flex flex-col sm:flex-row"><p class="w-full sm:w-1/3 font-semibold text-gray-800 dark:text-gray-200">${label}:</p><p class="w-full sm:w-2/3 text-gray-600 dark:text-gray-400">${utils.sanitizeHTML(value)}</p></div>`;
        };

        panel.innerHTML = `
            ${reviewItem('Business Name', data['b-name'])}
            ${reviewItem('Category', categoryName)}
            ${reviewItem('Sub-Category', subCategoryName)}
            ${reviewItem('Phone Number', data['b-phone'])}
            ${reviewItem('Address', data['b-address'])}
            ${reviewItem('Opening Hours', hoursText)}
            ${reviewItem('Google Maps Link', data['b-gmap'])}
            ${reviewItem('Description', data['b-description'])}
        `;

        const imagePreview = document.getElementById('b-image-preview');
        if (imagePreview && imagePreview.src && !imagePreview.src.endsWith('add-business.html')) {
            panel.innerHTML += `<div class="flex flex-col sm:flex-row"><p class="w-full sm:w-1/3 font-semibold text-gray-800 dark:text-gray-200">Image:</p><div class="w-full sm:w-2/3"><img src="${imagePreview.src}" class="max-h-32 rounded-lg border border-gray-300 dark:border-slate-500"></div></div>`;
        }
    },

    copyMondayHours() {
        const openMonday = document.querySelector('input[name="open-monday"]').value;
        const closeMonday = document.querySelector('input[name="close-monday"]').value;

        if (!openMonday && !closeMonday) {
            toastManager.show("Monday's hours are not set.", 'warning');
            return;
        }

        const days = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            document.querySelector(`input[name="open-${day}"]`).value = openMonday;
            document.querySelector(`input[name="close-${day}"]`).value = closeMonday;
        });
        toastManager.show("Hours copied to all other days.", 'success');
    },

    getBusinessNameLabel(subcategory) {
        const labelMap = {
            'Hospitals': 'Hospital Name *',
            'Doctors': 'Doctor Name *',
            'Pharmacy': 'Pharmacy Name *',
            'Restaurants': 'Restaurant Name *',
            'Cafes': 'Cafe Name *',
            'Sweets': 'Sweet Shop Name *',
            'Desserts': 'Dessert Shop Name *',
            'Apparel': 'Store Name *',
            'Electronics': 'Store Name *',
            'Groceries': 'Store Name *',
            'Book Store': 'Book Store Name *',
            'Electricians': 'Service Provider Name *',
            'Plumbers': 'Service Provider Name *',
            'Mechanics': 'Service Provider Name *',
            'Schools': 'School Name *',
            'Colleges': 'College Name *',
            'Coaching Centers': 'Institute Name *',
            'Blood Banks': 'Blood Bank Name *'
        };
        
        return labelMap[subcategory] || 'Business Name *';
    },

    async deleteImage(imageUrl) {
        if (!imageUrl || !imageUrl.includes('listing-images')) {
            return;
        }
        try {
            const bucketName = 'listing-images';
            const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            
            console.log(`Attempting to delete old image from user form: ${fileName}`);
            const { data, error } = await supabase.storage.from(bucketName).remove([fileName]);
            if (error) throw error;
            console.log(`Successfully deleted old image: ${fileName}`);
        } catch (error) {
            console.error('Error deleting old image from user form:', error.message);
        }
    },

    async uploadImage(file) {
        if (!file) return null;

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        const { data, error } = await supabase.storage
            .from('listing-images') 
            .upload(fileName, file);

        if (error) {
            toastManager.show(`Image upload failed: ${error.message}`, 'error');
            return null;
        }

        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(data.path);
        return publicUrl;
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const isEditMode = !!document.getElementById('edit-listing-id').value;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block"></span><span class="ml-2">Submitting...</span>';
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in to perform this action.');

            const imageFile = document.getElementById('b-image-upload').files[0];
            const existingImageUrl = document.getElementById('b-image-url').value;
            let finalImageUrl = existingImageUrl; 

            if (imageFile) {
                const newImageUrl = await this.uploadImage(imageFile);
                if (newImageUrl) {
                    finalImageUrl = newImageUrl;
                    if (isEditMode && existingImageUrl) await this.deleteImage(existingImageUrl);
                }
            }

            const formData = new FormData(e.target);
            const hoursType = formData.get('hours-type');
            let openingHoursData = { status: hoursType, hours: null };

            if (hoursType === 'custom') {
                const customHours = {};
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                let hasCustomHours = false;
                days.forEach(day => {
                    const open = formData.get(`open-${day}`);
                    const close = formData.get(`close-${day}`);
                    if (open && close) {
                        customHours[day] = { open, close };
                        hasCustomHours = true;
                    } else {
                        customHours[day] = null;
                    }
                });
                if (hasCustomHours) {
                    openingHoursData.hours = customHours;
                }
            }

            const googleMapLink = formData.get('b-gmap') || null;
            let lat = null;
            let lng = null;
            if (googleMapLink) {
                const coords = utils.extractLatLngFromGoogleMapsLink(googleMapLink);
                lat = coords.lat;
                lng = coords.lng;
            }
            const businessData = {
                name: formData.get('b-name'),
                category: formData.get('b-category'),
                subcategory: formData.get('b-subcategory'),
                address: formData.get('b-address'),
                phone: formData.get('b-phone'),
                googleMapLink: googleMapLink,
                lat: lat, 
                lng: lng, 
                image: finalImageUrl, 
                description: formData.get('b-description') || null,
                status: 'pending_review',
                opening_hours: openingHoursData,
                user_id: user.id 
            };

            if (!businessData.name || !businessData.category || !businessData.address || !businessData.phone) {
                throw new Error('Please fill in all required fields');
            }

            if (!/^[\d]{10}$/.test(businessData.phone.replace(/\D/g, ''))) {
                throw new Error('Please enter a valid 10-digit Indian phone number.');
            }

            const urlFields = ['googleMapLink'];
            for (const field of urlFields) {
                if (businessData[field]) { 
                    if (typeof utils === 'undefined' || typeof utils.isValidUrl !== 'function') {
                        console.error("Error: utils.isValidUrl is not defined or not a function. This indicates a script loading or execution issue.");
                        throw new Error("Internal error: URL validation function missing. Please check console for details.");
                    }
                    if (!utils.isValidUrl(businessData[field])) {
                    throw new Error(`Please enter a valid URL for ${field}`);
                }
                }
            }

            const listingId = formData.get('listing_id');
            if (listingId) {
                console.log("Updating listing:", listingId, businessData);
                const { error } = await supabase.from('listings').update(businessData).eq('id', listingId).eq('user_id', user.id);
                if (error) throw error;
                toastManager.show('Business updated successfully! It is now pending re-approval.', 'success');
                setTimeout(() => { window.location.href = 'index.html#dashboard'; }, 2000);
            } else {
                console.log("Submitting to Supabase:", businessData);
                const { error } = await supabase.from('listings').insert([businessData]);
                if (error) throw error;
                this.showSuccessModal();
            }

        } catch (error) {
            console.error('Submission error:', error);
            toastManager.show(error.message || 'Failed to submit business. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = isEditMode ? '💾 Save Changes' : '🚀 Submit for Review';
        }
    },

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            const step1 = document.querySelector('.progress-step.active');
            const step2 = document.querySelectorAll('.progress-step')[1];
            
            if (step1) {
                step1.classList.remove('active'); 
                step1.classList.add('completed');
            }
            
            if (step2) {
                step2.classList.add('active');
            }
        }
    },

    async renderDashboardView() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        if (!appState.currentUser) {
            toastManager.show('Please log in to view your dashboard.', 'error');
            this.showView('add-business'); 
            authModalManager.show();
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

            this.userListings = data;

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-200 dark:border-slate-700">
                        <div class="text-5xl mb-4">📂</div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No businesses listed yet</h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">You haven't added any businesses. Let's change that!</p>
                        <button data-nav="add-business" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            + Add Your First Business
                        </button>
                    </div>`;
            } else {
                container.innerHTML = `
                    <div class="text-right mb-6">
                        <button data-nav="add-business" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            <span>Add Another Business</span>
                        </button>
                    </div>
                    <div class="space-y-6">${data.map(listing => this.createDashboardListingCard(listing)).join('')}</div>`;
                container.querySelectorAll('.dashboard-edit-btn').forEach(btn => btn.addEventListener('click', () => {
                    const listingId = btn.dataset.id;
                    this.showView('add-business');
                    this.setupEditMode(listingId);
                }));
                container.querySelectorAll('.dashboard-feature-btn').forEach(btn => btn.addEventListener('click', () => this.requestFeature(btn.dataset.id)));
                container.querySelectorAll('.dashboard-delete-btn').forEach(btn => btn.addEventListener('click', () => this.confirmDelete(btn.dataset.id)));
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

        let featureButtonHTML = '';
        if (listing.status === 'approved') {
            switch (listing.feature_status) {
                case 'active':
                    featureButtonHTML = `<button disabled class="flex-1 md:flex-initial bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-lg font-medium opacity-70 cursor-not-allowed">⭐ Feature Approved</button>`;
                    break;
                case 'requested':
                    featureButtonHTML = `<button disabled class="flex-1 md:flex-initial bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium opacity-70 cursor-not-allowed">Request Sent</button>`;
                    break;
                case 'denied':
                    featureButtonHTML = `<button data-id="${listing.id}" class="dashboard-feature-btn flex-1 md:flex-initial bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg font-medium transition-colors">Feature Rejected (Request Again?)</button>`;
                    break;
                default: 
                    featureButtonHTML = `<button data-id="${listing.id}" class="dashboard-feature-btn flex-1 md:flex-initial bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-medium transition-colors">Request Feature</button>`;
            }
        }

        return `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}">${style.icon} ${listing.status.replace('_', ' ').toUpperCase()}</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Submitted on ${new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white">${utils.sanitizeHTML(listing.name)}</h4>
                    <p class="text-gray-600 dark:text-gray-400">${utils.sanitizeHTML(listing.address)}</p>
                    ${listing.status === 'rejected' && listing.rejection_reason ? `
                        <div class="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 text-red-700 dark:text-red-300 text-sm">
                            <strong>Rejection Reason:</strong> ${utils.sanitizeHTML(listing.rejection_reason)}
                        </div>
                    ` : ''}
                </div>
                <div class="flex-shrink-0 flex items-center gap-3 w-full md:w-auto">
                    ${featureButtonHTML}
                    <button data-id="${listing.id}" class="dashboard-edit-btn flex-1 md:flex-initial bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-colors">Edit</button>
                    <button data-id="${listing.id}" class="dashboard-delete-btn flex-1 md:flex-initial bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg font-medium transition-colors">Delete</button>
                </div>
            </div>`;
    },

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
            this.renderDashboardView(); 
        } catch (error) {
            console.error('Error deleting listing:', error);
            toastManager.show('Failed to delete listing. Please try again.', 'error');
        }
    },

    async requestFeature(listingId) {
        if (!listingId) return;
        try {
            const { error } = await supabase
                .from('listings')
                .update({ feature_status: 'requested' })
                .eq('id', listingId);
            if (error) throw error;
            toastManager.show('Feature request sent! The admin will review it shortly.', 'success');
            this.renderDashboardView(); 
        } catch (error) {
            toastManager.show('Failed to send feature request. Please try again.', 'error');
        }
    }
};

window.toastManager = toastManager;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded for Add Business Page');
    addBusinessHandler.init();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const successModal = document.getElementById('success-modal');
        if (successModal && !successModal.classList.contains('hidden')) {
            successModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
});

let hasUnsavedChanges = false;

function setUnsavedChanges(status) {
    hasUnsavedChanges = status;
}

function listenForFormChanges() {
    const form = document.getElementById('add-business-form');
    if (form) {
        form.addEventListener('input', () => setUnsavedChanges(true));

        form.addEventListener('submit', () => {
            window.removeEventListener('beforeunload', beforeUnloadHandler);
            setTimeout(() => {
                window.addEventListener('beforeunload', beforeUnloadHandler);
            }, 1000);
        });
    }
}

const beforeUnloadHandler = (event) => {
    if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
};

window.addEventListener('beforeunload', beforeUnloadHandler);