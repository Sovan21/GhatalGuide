"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { supabase } from "@/lib/supabaseClient";
import { categories } from "@/lib/sampleData";
import { 
  Building, Phone, Clock, MapPin, Link2, FileText, Image as ImageIcon, CheckCircle, 
  ChevronRight, ChevronDown, ArrowLeft, PlusCircle, LayoutDashboard, Compass, Lock, Mail, User, RotateCcw,
  MailOpen, AlertCircle, Info, Save, Eye, EyeOff,
  Activity, Utensils, ShoppingBag, Wrench, GraduationCap, ShieldAlert,
  Hospital, Stethoscope, Pill, Coffee, Candy, IceCream, Shirt, Smartphone,
  ShoppingBasket, BookOpen, Zap, Droplet, Car, School, Shield, Ambulance, Flame, Heart
} from "lucide-react";

const categoryIconMap = {
  health: <Activity className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  services: <Wrench className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  emergency: <ShieldAlert className="w-4 h-4" />,
};

const subcategoryIconMap = {
  // Health
  "Hospitals": <Hospital className="w-4 h-4" />,
  "Doctors": <Stethoscope className="w-4 h-4" />,
  "Pharmacy": <Pill className="w-4 h-4" />,
  // Food
  "Restaurants": <Utensils className="w-4 h-4" />,
  "Cafes": <Coffee className="w-4 h-4" />,
  "Sweets": <Candy className="w-4 h-4" />,
  "Desserts": <IceCream className="w-4 h-4" />,
  // Shopping
  "Apparel": <Shirt className="w-4 h-4" />,
  "Electronics": <Smartphone className="w-4 h-4" />,
  "Groceries": <ShoppingBasket className="w-4 h-4" />,
  "Book Store": <BookOpen className="w-4 h-4" />,
  // Services
  "Electricians": <Zap className="w-4 h-4" />,
  "Plumbers": <Droplet className="w-4 h-4" />,
  "Mechanics": <Car className="w-4 h-4" />,
  // Education
  "Schools": <School className="w-4 h-4" />,
  "Colleges": <GraduationCap className="w-4 h-4" />,
  "Coaching Centers": <BookOpen className="w-4 h-4" />,
  // Emergency
  "Police": <Shield className="w-4 h-4" />,
  "Ambulance": <Ambulance className="w-4 h-4" />,
  "Fire Station": <Flame className="w-4 h-4" />,
  "Blood Banks": <Heart className="w-4 h-4" />,
};

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

const placeholderMap = {
  // Health
  'Hospitals': 'e.g. Ghatal Sub-Divisional Hospital, Life Line Nursing Home',
  'Doctors': 'e.g. Dr. A. K. Roy (MBBS, MD), Dr. S. Sen (Pediatrician)',
  'Pharmacy': 'e.g. Subha Medical Store, Ghatal Pharmacy Centre',
  // Food
  'Restaurants': 'e.g. Spice Garden Restaurant, Ghatal Dhaba & Family Restaurant',
  'Cafes': 'e.g. The Coffee House, Ghatal Town Cafe & Bistro',
  'Sweets': 'e.g. Kalpataru Sweets, Sen Mahasay Sweet Shop',
  'Desserts': 'e.g. Creamy Delights Ice Cream, Mio Amore Ghatal Parlor',
  // Shopping
  'Apparel': 'e.g. Fashion Hub, New Look Garments, Adi Mohini Mohan Kanjilal',
  'Electronics': 'e.g. Tech Plaza Electronics, Ghatal Mobile & TV Center',
  'Groceries': 'e.g. Annapurna Grocery Store, Ghatal Daily Variety Store',
  'Book Store': 'e.g. Vidyasagar Book House, Student Corner Book Stall',
  // Services
  'Electricians': 'e.g. Roy Electricals & Wiring Service, Joy Guru Electric',
  'Plumbers': 'e.g. Bengal Plumbing & Sanitation, Ghatal Hardware & Plumbers',
  'Mechanics': 'e.g. Ghatal Auto Garage & Repairing, Bike Doctor Mechanic Shop',
  // Education
  'Schools': 'e.g. Ghatal High School, Ghatal Vidyasagar Girls High School',
  'Colleges': 'e.g. Ghatal Rabindra Satabarsiki Mahavidyalaya (Ghatal College)',
  'Coaching Centers': 'e.g. Roy Coaching Institute, Target Academy WBCS Coaching',
  // Emergency
  'Police': 'e.g. Ghatal Police Station, Sub-Divisional Police HQ',
  'Ambulance': 'e.g. 24/7 Red Cross Ambulance Service, Ghatal Municipality Ambulance',
  'Fire Station': 'e.g. Ghatal Sub-Divisional Fire Station',
  'Blood Banks': 'e.g. Ghatal Sub-Divisional Hospital Blood Bank'
};

const suggestionsMap = {
  // Health
  'Hospitals': ['Ghatal Sub-Divisional Hospital', 'Apollo Clinic Ghatal', 'Life Line Nursing Home', 'Nirmal Poly Clinic'],
  'Doctors': ['Dr. A. K. Roy (Cardiologist)', 'Dr. R. N. Sen (General Medicine)', 'Dr. P. K. Ghosh (Pediatrician)', 'Dr. S. Chatterjee (Gynaecologist)'],
  'Pharmacy': ['Subha Medical Store', 'Ghatal Pharmacy Centre', 'Dutta Medico', 'Medicare Drug House'],
  // Food
  'Restaurants': ['Spice Garden Restaurant', 'Ghatal Dhaba & Family Restora', 'Bengal Feast Restaurant', 'Highway Inn Eatery'],
  'Cafes': ['The Coffee House', 'Ghatal Town Cafe', 'Hangout Cafe & Snacks', 'Chai Break Bistro'],
  'Sweets': ['Kalpataru Sweets', 'Sen Mahasay Sweet Shop', 'Madan Mohan Sweets', 'Ghatal Kheer & Sandesh'],
  'Desserts': ['Creamy Delights Ice Cream', 'Mio Amore Ghatal Parlor', 'Kwality Walls Swirls', 'Cake & Bake Corner'],
  // Shopping
  'Apparel': ['Fashion Hub Store', 'New Look Garments', 'Adi Mohini Mohan Kanjilal', 'Puspa Dresses & Sarees'],
  'Electronics': ['Tech Plaza Electronics', 'Ghatal Mobile & TV Center', 'Dey Enterprise Electronics', 'Smart Choice Mobiles'],
  'Groceries': ['Annapurna Grocery Store', 'Ghatal Daily Variety Store', 'Maa Lakshmi Grocery Shop', 'Fresh Mart Supermarket'],
  'Book Store': ['Vidyasagar Book House', 'Student Corner Book Stall', 'Ghatal Pustakalaya', 'New Book Depot'],
  // Services
  'Electricians': ['Roy Electricals & Service', 'Joy Guru Electric Repairing', 'Sarkar House Wiring Solutions', 'Express Electricians'],
  'Plumbers': ['Bengal Plumbing & Sanitation', 'Ghatal Hardware & Plumbers', 'Sen Plumbing Contractor', 'Quick Pipe Plumbers'],
  'Mechanics': ['Ghatal Auto Garage', 'Bike Doctor Repairing Shop', 'Maa Tara Motor Cycle Mechanics', 'Express Car Repairing'],
  // Education
  'Schools': ['Ghatal High School', 'Vidyasagar Girls High School', 'Ghatal Shishu Niketan', 'St. Xavier School Ghatal'],
  'Colleges': ['Ghatal Rabindra Satabarsiki Mahavidyalaya', 'Ghatal Government Polytechnic College', 'Vidyasagar Primary Teachers Training College'],
  'Coaching Centers': ['Roy Coaching Institute', 'Target Academy WBCS Coaching', 'Science Hub Tuition Classes', 'Ghatal Math Academy'],
  // Emergency
  'Police': ['Ghatal Police Station', 'Kushpata Police Outpost', 'Daspur Police Station'],
  'Ambulance': ['Ghatal Municipality Ambulance Service', 'Red Cross 24/7 Ambulance Service', 'Ghatal Emergency Critical Care Ambulance'],
  'Fire Station': ['Ghatal Sub-Divisional Fire Station', 'Chandrakona Fire Station'],
  'Blood Banks': ['Ghatal Sub-Divisional Hospital Blood Bank', 'Red Cross Voluntary Blood Bank']
};

const googleSvg = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const facebookSvg = (
  <svg className="w-5 h-5 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const linkedinSvg = (
  <svg className="w-5 h-5 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const githubSvg = (
  <svg className="w-5 h-5 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  showSearch = false,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = showSearch
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none transition-all duration-200 text-left cursor-pointer disabled:opacity-55"
      >
        <span className={`flex items-center gap-2.5 ${selectedOption ? "" : "text-slate-400 dark:text-slate-500"}`}>
          {selectedOption && selectedOption.icon && (
            <span className="shrink-0 text-indigo-500 dark:text-indigo-400">{selectedOption.icon}</span>
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`} />
      </button>

      {isOpen && (
        <div className="absolute z-35 mt-2 w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] rounded-2xl p-2 border border-white/5 max-h-60 overflow-y-auto animate-zoom-in-fade origin-top">
          {showSearch && (
            <div className="p-1 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    opt.value === value
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-[#d4dfea] dark:hover:bg-[#222a3a]"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span className={`shrink-0 ${opt.value === value ? "text-white" : "text-indigo-500 dark:text-indigo-400"}`}>
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>
                  {opt.value === value && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </button>
              ))
            ) : (
              <p className="text-center text-xs text-slate-500 py-3 font-semibold">No options found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of ["00", "30"]) {
      const hStr = hour.toString().padStart(2, '0');
      const timeVal = `${hStr}:${min}`;
      
      // Build 12-hour AM/PM label
      const ampm = hour >= 12 ? 'PM' : 'AM';
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      const label = `${displayHour}:${min} ${ampm}`;
      
      options.push({ value: timeVal, label });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

function TimePickerDropdown({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = timeOptions.find(opt => opt.value === value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayLabel = selectedOption ? selectedOption.label : (() => {
    if (!value) return "Select";
    const parts = value.split(":");
    if (parts.length !== 2) return value;
    const h = parseInt(parts[0]);
    const m = parts[1];
    if (isNaN(h)) return value;
    const ampm = h >= 12 ? "PM" : "AM";
    let dispH = h % 12;
    if (dispH === 0) dispH = 12;
    return `${dispH}:${m} ${ampm}`;
  })();

  return (
    <div className="relative" ref={dropdownRef}>
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-3 py-2 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] rounded-xl text-slate-800 dark:text-slate-200 outline-none transition-all duration-200 text-left min-w-[100px] flex items-center justify-between cursor-pointer"
      >
        <span>{displayLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-45 mt-1 w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_12px_#becbdc,_-4px_-4px_12px_#ffffff] dark:shadow-[4px_4px_12px_#0e1117,_-4px_-4px_12px_#262f41] rounded-xl p-1 border border-white/5 max-h-48 overflow-y-auto animate-zoom-in-fade origin-top">
          {timeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                opt.value === value
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-[#d4dfea] dark:hover:bg-[#222a3a]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AddBusinessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editListingId = searchParams.get("id");

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form Step
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, 4

  // Form Fields States
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [hoursType, setHoursType] = useState("open_24_7"); // open_24_7, temporarily_closed, custom
  const [customHours, setCustomHours] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day.toLowerCase()] = { open: "09:00", close: "18:00" };
      return acc;
    }, {})
  );

  const [address, setAddress] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  // UI Utilities State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Inline Auth Overlay States
  const [panelActive, setPanelActive] = useState("left"); // 'left' = signin, 'right' = signup
  const [authStep, setAuthStep] = useState("signin"); // 'signin', 'forgot', 'otp', 'update-password'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState("");
  const [authNewPassword, setAuthNewPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authSubmitLoading, setAuthSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Polling states
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [pollingCountdown, setPollingCountdown] = useState(180);
  const pollingRef = useRef(null);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        setAuthError("");
        setAuthMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Fetch listing data in edit mode
  useEffect(() => {
    if (editListingId && currentUser) {
      fetchListingForEdit();
    }
  }, [editListingId, currentUser]);

  // Unsaved Changes Guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const fetchListingForEdit = async () => {
    try {
      const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", editListingId)
        .single();

      if (error || !listing) throw new Error("Could not find this business or listing.");
      
      if (listing.user_id !== currentUser.id) {
        showToast("You don't have permission to edit this business.", "error");
        router.push("/dashboard");
        return;
      }

      setBusinessName(listing.name);
      setCategory(listing.category);
      setPhone(listing.phone);
      setAddress(listing.address);
      setGoogleMapLink(listing.googleMapLink || "");
      setDescription(listing.description || "");
      setExistingImageUrl(listing.image || "");
      
      if (listing.opening_hours) {
        setHoursType(listing.opening_hours.status || "open_24_7");
        if (listing.opening_hours.hours) {
          setCustomHours(listing.opening_hours.hours);
        }
      }

      // We trigger a slight delay to allow category selection and then subcategory state update
      setTimeout(() => {
        setSubcategory(listing.subcategory || "");
      }, 200);

    } catch (err) {
      showToast(err.message || "Failed to load listing details.", "error");
      router.push("/dashboard");
    }
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setSubcategory("");
    setHasUnsavedChanges(true);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    setHasUnsavedChanges(true);
  };

  const handleCustomHoursChange = (day, type, value) => {
    setCustomHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleDayOpen = (dKey) => {
    setCustomHours((prev) => {
      const current = prev[dKey];
      const isCurrentlyOpen = !!(current && current.open && current.close);
      return {
        ...prev,
        [dKey]: isCurrentlyOpen ? { open: "", close: "" } : { open: "09:00", close: "18:00" }
      };
    });
    setHasUnsavedChanges(true);
  };

  const copyMondayHours = () => {
    const mondayHours = customHours.monday;
    const updated = daysOfWeek.reduce((acc, day) => {
      acc[day.toLowerCase()] = { ...mondayHours };
      return acc;
    }, {});
    setCustomHours(updated);
    showToast("Monday's hours copied to all days!", "success");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
      setHasUnsavedChanges(true);
    }
  };

  // Google Maps coords helper
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

  const validateStep = (step) => {
    if (step === 1) {
      if (!category) {
        showToast("Please select a category.", "warning");
        return false;
      }
      if (categories[category]?.subcategories?.length > 0 && !subcategory) {
        showToast("Please select a sub-category.", "warning");
        return false;
      }
      if (!businessName.trim()) {
        showToast("Please enter a business name.", "warning");
        return false;
      }
      if (!/^\d{10}$/.test(phone)) {
        showToast("Please enter a valid 10-digit phone number.", "warning");
        return false;
      }
    } else if (step === 2) {
      if (!address.trim()) {
        showToast("Please enter the complete address.", "warning");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Image Upload helper
  const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const { data, error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file);

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(data.path);
    return publicUrl;
  };

  // Delete old image helper
  const deleteOldImageFromStorage = async (url) => {
    if (!url || !url.includes("listing-images")) return;
    try {
      const fileName = url.substring(url.lastIndexOf("/") + 1);
      await supabase.storage.from("listing-images").remove([fileName]);
    } catch (err) {
      console.error("Failed to delete old image from storage", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNextStep();
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const uploadedUrl = await uploadImageToSupabase(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
          if (editListingId && existingImageUrl) {
            await deleteOldImageFromStorage(existingImageUrl);
          }
        }
      }

      const openingHoursData = {
        status: hoursType,
        hours: hoursType === "custom" ? customHours : null
      };

      const { lat, lng } = extractLatLngFromGoogleMapsLink(googleMapLink);

      const businessData = {
        name: businessName.trim(),
        category,
        subcategory,
        address: address.trim(),
        phone,
        googleMapLink: googleMapLink.trim() || null,
        lat,
        lng,
        image: finalImageUrl || null,
        description: description.trim() || null,
        status: "pending_review",
        opening_hours: openingHoursData,
        user_id: currentUser.id
      };

      if (editListingId) {
        const { error } = await supabase
          .from("listings")
          .update(businessData)
          .eq("id", editListingId)
          .eq("user_id", currentUser.id);

        if (error) throw error;
        
        setHasUnsavedChanges(false);
        showToast("Business updated successfully! Pending review re-approval.", "success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        const { error } = await supabase
          .from("listings")
          .insert([businessData]);

        if (error) throw error;
        
        setHasUnsavedChanges(false);
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || "Failed to submit listing. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Auth functions
  const handleInlineSignIn = async (e) => {
    e.preventDefault();
    setAuthSubmitLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: authEmail, 
        password: authPassword 
      });
      if (error) throw error;
      showToast("Successfully signed in!", "success");
    } catch (err) {
      setAuthError(err.message || "Sign in failed. Check credentials.");
      showToast(err.message || "Sign in failed.", "error");
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const handleInlineSignUp = async (e) => {
    e.preventDefault();
    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthSubmitLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: { full_name: authFullName },
          emailRedirectTo: window.location.origin + "/add-business"
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
          setAuthMessage("This email is already registered. Please sign in.");
          setPanelActive("left");
          return;
        }
        throw error;
      }

      if (data?.user && data?.user?.identities?.length === 0) {
        setAuthMessage("This email is already registered. Please sign in.");
        setPanelActive("left");
        return;
      }

      if (data?.user) {
        setAuthMessage("Account created! Verification link sent.");
        setIsAwaitingConfirmation(true);
        startPollingForConfirmation(authEmail, authPassword);
      }
    } catch (err) {
      setAuthError(err.message || "Signup failed.");
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const startPollingForConfirmation = (signUpEmail, signUpPassword) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const startTime = Date.now();
    const duration = 3 * 60 * 1000; // 3 minutes

    pollingRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(pollingRef.current);
        setIsAwaitingConfirmation(false);
        setAuthError("Email verification timeout. Please check your inbox and log in manually once verified.");
        showToast("Email verification timeout. Please sign in manually.", "warning");
        return;
      }

      setPollingCountdown(Math.max(0, Math.floor((duration - elapsed) / 1000)));

      const { data } = await supabase.auth.signInWithPassword({
        email: signUpEmail,
        password: signUpPassword
      });

      if (data?.session) {
        clearInterval(pollingRef.current);
        setIsAwaitingConfirmation(false);
        showToast("Email Verified! Logged in successfully.", "success");
        setAuthMessage("Email Verified! Redirecting...");
      }
    }, 3000);
  };

  const handleInlineForgotPassword = async (e) => {
    e.preventDefault();
    setAuthSubmitLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: authEmail });
      if (error) throw error;
      setAuthStep("otp");
      setAuthMessage("OTP Code sent to email!");
    } catch (err) {
      setAuthError(err.message || "Failed to send reset link.");
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const handleInlineVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthSubmitLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({ 
        email: authEmail, 
        token: authOtpCode, 
        type: "email" 
      });
      if (error) throw error;
      setAuthStep("update-password");
      setAuthMessage("Verification successful!");
    } catch (err) {
      setAuthError(err.message || "Invalid OTP code.");
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const handleInlineUpdatePassword = async (e) => {
    e.preventDefault();
    setAuthSubmitLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: authNewPassword });
      if (error) throw error;
      setAuthMessage("Password updated successfully!");
      showToast("Password updated!", "success");
    } catch (err) {
      setAuthError(err.message || "Failed to update password.");
    } finally {
      setAuthSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setBusinessName("");
    setPhone("");
    setHoursType("open_24_7");
    setAddress("");
    setGoogleMapLink("");
    setDescription("");
    setImageFile(null);
    setImagePreviewUrl("");
    setExistingImageUrl("");
    setCurrentStep(1);
    setIsSuccessModalOpen(false);
  };

  const getBusinessNameLabel = () => {
    if (subcategory) {
      return labelMap[subcategory] || "Business Name *";
    }
    return "Business Name *";
  };

  // loading view
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 font-bold loading-dots">Initializing</p>
          </div>
        </main>
      </div>
    );
  }

  // Not logged in: Show the Overlay Authentication Modal inline
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#e0e8f0] dark:bg-[#1a202c] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden ">
        
        {/* Ambient background layout */}
        <div className="blur-bubble bg-primary-500/5 dark:bg-primary-500/10 top-20 left-10 animate-float" />
        <div className="blur-bubble bg-indigo-500/5 dark:bg-indigo-500/10 bottom-20 right-10 animate-float" style={{ animationDelay: "2s" }} />
        <div className="mesh-bg opacity-30" />
        
        <Navbar />
        
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center relative z-10 px-2 sm:px-4">
          <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20">
            <div className="max-w-xl text-center lg:text-left px-2 sm:px-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-slate-200 leading-tight mb-4 lg:whitespace-normal">
                List Your Business on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500 font-extrabold">Ghatal Guide</span>
              </h1>
              <p className="text-sm lg:text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                Please sign in or create a free account to list and manage your business.
              </p>
            </div>

            <div className={`auth-container panel-${panelActive}-active relative w-full max-w-md h-[650px] flex justify-center shrink-0`}>
            
            {/* Sign In form container */}
            <div id="signin-container" className="auth-panel">
              <div className="bg-[#e0e8f0] dark:bg-[#1a202c] p-4 sm:p-8 rounded-[32px] shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] border border-white/5 transition-all duration-300">
                {authStep === "signin" && (
                  <>
                    <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight text-slate-800 dark:text-slate-200">Welcome Back</h2>
                    
                    <form onSubmit={handleInlineSignIn} className="space-y-6">
                      {/* Email Input */}
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <div className="pl-5 text-slate-700 dark:text-slate-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input 
                          type="email" 
                          required 
                          value={authEmail} 
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                        />
                      </div>
                      
                      {/* Password Input */}
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <div className="pl-5 text-slate-700 dark:text-slate-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          value={authPassword} 
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Remember me & Forgot password link */}
                      <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-700 dark:text-slate-400 select-none">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-4 h-4 rounded bg-[#e0e8f0] dark:bg-[#1a202c] border-none shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-primary-650 focus:ring-0 cursor-pointer appearance-none checked:bg-primary-500 checked:border-none flex items-center justify-center after:content-['✓'] after:text-[10px] after:text-white after:font-black after:hidden checked:after:block" 
                          />
                          <span>Remember me</span>
                        </label>
                        <button 
                          type="button" onClick={() => { setAuthError(""); setAuthStep("forgot"); }}
                          className="text-primary-650 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      
                      {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                      {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                      
                      <button 
                        type="submit" disabled={authSubmitLoading}
                        className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50"
                      >
                        {authSubmitLoading ? "Signing In..." : "Sign In"}
                      </button>
                    </form>

                    <div className="flex justify-between items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-400 mt-6">
                      <span>Don't have an account?</span>
                      <button onClick={() => setPanelActive('right')} className="text-primary-650 hover:underline cursor-pointer">
                        Create account
                      </button>
                    </div>

                    {/* Social Sign In Options */}
                    <div className="mt-6 text-center">
                      <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Or continue with</span>
                      <div className="flex justify-center gap-4">
                        {[
                          { icon: googleSvg, label: "Google" },
                          { icon: facebookSvg, label: "Facebook" },
                          { icon: linkedinSvg, label: "LinkedIn" },
                          { icon: githubSvg, label: "GitHub" }
                        ].map((provider) => (
                          <button
                            key={provider.label}
                            type="button"
                            onClick={() => showToast(`${provider.label} sign-in option coming soon!`, "info")}
                            className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-105 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] transition-all cursor-pointer"
                            title={`Sign in with ${provider.label}`}
                          >
                            {provider.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {authStep === "forgot" && (
                  <>
                    <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Reset Password</h3>
                    
                    <form onSubmit={handleInlineForgotPassword} className="space-y-6">
                      {/* Email Input */}
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <div className="pl-5 text-slate-700 dark:text-slate-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input 
                          type="email" 
                          required 
                          value={authEmail} 
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                        />
                      </div>
                      
                      {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                      {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                      
                      <button type="submit" className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer">
                        Send Security Code
                      </button>
                      <button type="button" onClick={() => setAuthStep("signin")} className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold text-xs cursor-pointer mt-4">
                        <RotateCcw className="w-3.5 h-3.5" /> Back to Sign In
                      </button>
                    </form>
                  </>
                )}

                {authStep === "otp" && (
                  <>
                    <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Verify Code</h3>
                    
                    <form onSubmit={handleInlineVerifyOtp} className="space-y-6">
                      {/* OTP input field */}
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <input 
                          type="text" 
                          required 
                          maxLength="6" 
                          placeholder="123456" 
                          value={authOtpCode} 
                          onChange={(e) => setAuthOtpCode(e.target.value)}
                          className="w-full bg-transparent border-none outline-none py-3.5 text-center text-2xl tracking-[0.5em] font-black text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-0 focus:border-none focus:outline-none"
                        />
                      </div>
                      
                      {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                      {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                      
                      <button type="submit" className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer">
                        Verify Code
                      </button>
                      <button type="button" onClick={() => setAuthStep("forgot")} className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 font-bold text-xs cursor-pointer mt-4">
                        <RotateCcw className="w-3.5 h-3.5" /> Back
                      </button>
                    </form>
                  </>
                )}

                {authStep === "update-password" && (
                  <>
                    <h3 className="text-2xl font-extrabold text-center text-slate-800 dark:text-slate-200 mb-6">Set Password</h3>
                    
                    <form onSubmit={handleInlineUpdatePassword} className="space-y-6">
                      {/* Password field */}
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <div className="pl-5 text-slate-700 dark:text-slate-400">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required 
                          minLength="6" 
                          value={authNewPassword} 
                          onChange={(e) => setAuthNewPassword(e.target.value)}
                          placeholder="New Password"
                          className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                      {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}
                      
                      <button type="submit" className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer">
                        Update Password
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Sign Up form container */}
            <div id="signup-container" className="auth-panel">
              <div className="bg-[#e0e8f0] dark:bg-[#1a202c] p-4 sm:p-8 rounded-[32px] shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] border border-white/5 transition-all duration-300">
                <h2 className="text-3xl font-extrabold text-center mb-8 tracking-tight text-slate-800 dark:text-slate-200">Register</h2>
                
                <form onSubmit={handleInlineSignUp} className="space-y-4">
                  {/* Full Name */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={authFullName} 
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={authEmail} 
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength="6" 
                      value={authPassword} 
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                    <div className="pl-5 text-slate-700 dark:text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      minLength="6" 
                      value={authConfirmPassword} 
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-transparent border-none outline-none pl-3 pr-12 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {authError && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/20 py-2.5 rounded-lg border border-rose-100/10 animate-shake">{authError}</p>}
                  {authMessage && <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-50 dark:bg-emerald-950/20 py-2.5 rounded-lg border border-emerald-100/10">{authMessage}</p>}

                  <button 
                    type="submit" disabled={authSubmitLoading}
                    className="w-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] hover:scale-[1.01] active:scale-[0.99] active:shadow-[inset_3px_3px_6px_#becbdc,_inset_-3px_-3px_6px_#ffffff] dark:active:shadow-[inset_3px_3px_6px_#0e1117,_inset_-3px_-3px_6px_#262f41] text-slate-800 dark:text-slate-200 py-3.5 rounded-full font-black text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50"
                  >
                    {authSubmitLoading ? "Creating Account..." : "Sign up"}
                  </button>
                </form>

                <div className="flex justify-between items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-400 mt-6">
                  <span>Already have an account?</span>
                  <button onClick={() => setPanelActive('left')} className="text-primary-650 hover:underline cursor-pointer">
                    Click here to sign in
                  </button>
                </div>

                {/* Social Sign Up Options */}
                <div className="mt-6 text-center">
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">Or continue with</span>
                  <div className="flex justify-center gap-4">
                    {[
                      { icon: googleSvg, label: "Google" },
                      { icon: facebookSvg, label: "Facebook" },
                      { icon: linkedinSvg, label: "LinkedIn" },
                      { icon: githubSvg, label: "GitHub" }
                    ].map((provider) => (
                      <button
                        key={provider.label}
                        type="button"
                        onClick={() => showToast(`${provider.label} sign-up option coming soon!`, "info")}
                        className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-105 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] transition-all cursor-pointer"
                        title={`Sign up with ${provider.label}`}
                      >
                        {provider.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
          </div>

          {/* Polling popup overlay */}
          {isAwaitingConfirmation && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-zoom-in-fade">
              <div className="bg-[#e0e8f0] dark:bg-[#1a202c] border border-white/5 rounded-[32px] p-8 max-w-sm w-full shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] text-center animate-bounce-in">
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full border-4 border-indigo-50 dark:border-indigo-950" />
                  <span className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <MailOpen className="w-6 h-6 text-primary-500 animate-pulse" />
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-800 dark:text-slate-200">Awaiting Confirmation</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-5 text-xs font-bold leading-relaxed">
                  We've sent a verification link to <span className="text-primary-650 font-extrabold">{authEmail}</span>. Please click it to verify.
                </p>
                <div className="p-3.5 bg-[#e0e8f0]/40 dark:bg-[#1a202c]/40 rounded-xl shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] mb-5 text-[10px] font-black text-slate-500">
                  <p>Verification Polling Active</p>
                  <p className="text-primary-650 dark:text-primary-400 text-lg mt-1 font-black">
                    {Math.floor(pollingCountdown / 60)}:{(pollingCountdown % 60).toString().padStart(2, "0")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setIsAwaitingConfirmation(false);
                  }}
                  className="w-full py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-101 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-700 dark:text-slate-300 rounded-full font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  Cancel Verification
                </button>
              </div>
            </div>
          )}

          {/* Toast notifications */}
          <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs font-black tracking-wide flex items-center justify-between gap-4 animate-slide-up backdrop-blur-md ${
                  t.type === "success"
                    ? "bg-emerald-500/90 text-white border-emerald-500/20"
                    : t.type === "error"
                    ? "bg-rose-500/90 text-white border-rose-500/20"
                    : t.type === "warning"
                    ? "bg-amber-500/90 text-slate-950 border-amber-500/20"
                    : "bg-primary-600/90 text-white border-primary-650/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.type === "success" && <CheckCircle className="w-4.5 h-4.5 text-white" />}
                  {t.type === "error" && <AlertCircle className="w-4.5 h-4.5 text-white" />}
                  {t.type === "warning" && <AlertCircle className="w-4.5 h-4.5 text-slate-950" />}
                  {t.type === "info" && <Info className="w-4.5 h-4.5 text-white" />}
                  <span>{t.message}</span>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                  className="text-white hover:opacity-85 font-extrabold focus:outline-none text-base cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged In: Show Multi-step Business Form
  return (
    <div className="min-h-screen bg-[#e0e8f0] dark:bg-[#1a202c] text-slate-900 dark:text-slate-100  flex flex-col relative overflow-hidden">
      
      {/* Ambient background layout */}
      <div className="blur-bubble bg-primary-500/5 dark:bg-primary-500/10 top-20 left-10 animate-float" />
      <div className="blur-bubble bg-indigo-500/5 dark:bg-indigo-500/10 bottom-20 right-10 animate-float" style={{ animationDelay: "2s" }} />
      <div className="mesh-bg opacity-30" />
      <Navbar />

      <main className="flex-grow pt-20 pb-16 relative z-10 px-2 sm:px-4">
        <div className="container-perfect max-w-5xl">
          
          {/* Form Header Banner */}
          {!editListingId && (
            <section className="text-center mb-10 animate-fade-in">
              <div className="inline-flex items-center gap-1.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] border border-white/5 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-6 select-none shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Free Business Listing</span>
              </div>
              
              <h1 id="form-main-title" className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-200 leading-[1.1] mb-4 tracking-tight">
                List Your Business on
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500 font-extrabold">
                  Ghatal Guide
                </span>
              </h1>
              
              <p id="form-subtitle" className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 font-bold">
                Join hundreds of local stores and get discovered by thousands of customers in Ghatal. Setup takes under 5 minutes!
              </p>
              
              {/* Progress Steps Indicator */}
              <div id="progress-indicator" className="flex flex-wrap items-center justify-center gap-4 max-w-xl mx-auto p-4 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[6px_6px_12px_#becbdc,_-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0e1117,_-6px_-6px_12px_#262f41] rounded-3xl border border-white/5">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep === step 
                        ? "bg-primary-600 text-white scale-110 shadow-md shadow-primary-500/20" 
                        : currentStep > step 
                        ? "bg-emerald-500 text-white" 
                        : "bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-400"
                    }`}>
                      {step}
                    </div>
                    {step < 3 && <div className="w-6 h-[2px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />}
                  </div>
                ))}
              </div>
            </section>
          )}

          {editListingId && (
            <section className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                <PlusCircle className="w-7 h-7 text-primary-500" />
                <span>Edit Your Business</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-bold">
                Update your listing details below to keep customers informed.
              </p>
            </section>
          )}

          {/* Form Container */}
          <div className="bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] rounded-[32px] border border-white/5 overflow-hidden animate-slide-up">
            
            {/* Form Steps */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-10 space-y-6 sm:space-y-8">
              
              {/* STEP 1: Details & Operating Hours */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                  {/* Primary Details Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 pb-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-400" />
                      <span>Business Categories & Primary Details</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Category Selection */}
                      <div className="relative z-20">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Category *</label>
                        <CustomSelect
                          value={category}
                          onChange={handleCategoryChange}
                          options={Object.entries(categories).map(([key, value]) => ({
                            value: key,
                            label: value.name,
                            icon: categoryIconMap[key]
                          }))}
                          placeholder="Select a Category"
                        />
                      </div>

                      {/* Sub-Category Selection */}
                      <div className="relative z-10">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Sub-Category *</label>
                        <CustomSelect
                          value={subcategory}
                          onChange={(val) => { setSubcategory(val); setHasUnsavedChanges(true); }}
                          options={(category && categories[category]?.subcategories || []).map((sub) => ({
                            value: sub,
                            label: sub,
                            icon: subcategoryIconMap[sub]
                          }))}
                          placeholder={category ? "Select a Sub-Category" : "Please select a Category first"}
                          showSearch={true}
                          disabled={!category}
                        />
                      </div>

                      {/* Business Name */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          {getBusinessNameLabel()}
                        </label>
                        <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                          <input 
                            type="text" 
                            value={businessName}
                            onChange={(e) => { setBusinessName(e.target.value); setHasUnsavedChanges(true); }}
                            placeholder={placeholderMap[subcategory] || "Enter business or service name"}
                            className="w-full bg-transparent border-none outline-none px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Phone Number * (10-Digit Mobile)</label>
                        <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                          <div className="pl-5 text-slate-700 dark:text-slate-400">
                            <Phone className="w-5 h-5" />
                          </div>
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="e.g. 9876543210"
                            className="w-full bg-transparent border-none outline-none pl-3 pr-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Separator Border */}
                  <div className="h-px bg-black/5 dark:bg-white/5 my-8" />

                  {/* Operating Hours Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 pb-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <span>Operating Hours</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Opening Hours Selector */}
                      <div className="md:col-span-2 relative z-30">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Opening Hours *</label>
                        <CustomSelect
                          value={hoursType}
                          onChange={(val) => { setHoursType(val); setHasUnsavedChanges(true); }}
                          options={[
                            { value: "open_24_7", label: "Open 24/7" },
                            { value: "temporarily_closed", label: "Temporarily Closed" },
                            { value: "custom", label: "Set Custom Hours" }
                          ]}
                          placeholder="Select Hours Option"
                        />
                      </div>

                      {/* Custom Hours list */}
                      {hoursType === "custom" && (
                        <div className="md:col-span-2 p-6 border border-white/5 rounded-3xl bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-black/5 dark:border-white/5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Specify open and close timings for operating days.</p>
                            <button 
                              type="button" 
                              onClick={copyMondayHours}
                              className="text-xs font-black text-primary-600 dark:text-primary-400 hover:underline text-left cursor-pointer"
                            >
                              Copy Monday's hours to all days
                            </button>
                          </div>
                          
                          <div className="space-y-2.5">
                            {daysOfWeek.map((day, index) => {
                              const dKey = day.toLowerCase();
                              const isDayOpen = !!(customHours[dKey] && customHours[dKey].open && customHours[dKey].close);
                              return (
                                <div key={day} style={{ zIndex: daysOfWeek.length - index }} className="relative flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-4 rounded-2xl bg-[#e0e8f0]/40 dark:bg-[#1a202c]/40 border border-white/5 shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] transition-all duration-300 gap-3">
                                  <div className="flex items-center justify-between sm:justify-start gap-4 min-w-[150px]">
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{day}</span>
                                    
                                    {/* Segmented control Open/Closed */}
                                    <div className="flex rounded-lg p-0.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] border border-white/5">
                                      <button
                                        type="button"
                                        onClick={() => { if (!isDayOpen) handleToggleDayOpen(dKey); }}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                                          isDayOpen 
                                            ? "bg-emerald-500 text-white shadow-sm" 
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                        }`}
                                      >
                                        Open
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { if (isDayOpen) handleToggleDayOpen(dKey); }}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                                          !isDayOpen 
                                            ? "bg-rose-500 text-white shadow-sm" 
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                        }`}
                                      >
                                        Closed
                                      </button>
                                    </div>
                                  </div>

                                  {isDayOpen ? (
                                    <div className="flex items-center gap-3 animate-fade-in">
                                      <TimePickerDropdown 
                                        label="From"
                                        value={customHours[dKey]?.open || "09:00"}
                                        onChange={(val) => handleCustomHoursChange(dKey, "open", val)}
                                      />
                                      <TimePickerDropdown 
                                        label="To"
                                        value={customHours[dKey]?.close || "18:00"}
                                        onChange={(val) => handleCustomHoursChange(dKey, "close", val)}
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic pr-2">Closed for the day</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location details, Description & Media */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 pb-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span>Location details, Description & Media</span>
                  </h3>

                  <div className="space-y-4">
                    {/* Full Address */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Full Address *</label>
                      <div className="relative w-full rounded-[20px] bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-1 transition-all duration-200">
                        <textarea 
                          rows="2" 
                          value={address}
                          onChange={(e) => { setAddress(e.target.value); setHasUnsavedChanges(true); }}
                          placeholder="Enter full business address, landmarks, and area details..."
                          className="w-full bg-transparent border-none outline-none px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {/* Google Maps Link */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Google Maps Share Link</label>
                      <div className="relative w-full rounded-full bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-0.5 flex items-center transition-all duration-200">
                        <div className="pl-4 text-slate-700 dark:text-slate-400">
                          <Link2 className="w-4 h-4" />
                        </div>
                        <input 
                          type="url" 
                          value={googleMapLink}
                          onChange={(e) => { setGoogleMapLink(e.target.value); setHasUnsavedChanges(true); }}
                          placeholder="e.g. https://maps.app.goo.gl/..."
                          className="w-full bg-transparent border-none outline-none pl-2.5 pr-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Business Image Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Business Storefront Image</label>
                      <div className="flex flex-col items-center justify-center p-5 border border-dashed border-slate-300 dark:border-dark-border rounded-[24px] bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] hover:bg-[#d4dfea] dark:hover:bg-[#222a3a] transition-all duration-250 cursor-pointer relative group text-center">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors mb-1.5" />
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">Click or drag image here to upload</p>
                      </div>
                      
                      {/* Image Preview */}
                      {(imagePreviewUrl || existingImageUrl) && (
                        <div className="mt-2.5 p-2 bg-[#e0e8f0] dark:bg-[#1a202c] border border-white/5 rounded-[20px] max-w-xs shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] animate-fade-in">
                          <p className="text-[9.5px] font-black uppercase text-slate-500 mb-1.5">Image Preview:</p>
                          <img 
                            src={imagePreviewUrl || existingImageUrl} 
                            alt="Business Cover Preview" 
                            className="rounded-xl max-h-32 w-full object-cover shadow-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Business Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Business Description</label>
                      <div className="relative w-full rounded-[20px] bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] p-1 transition-all duration-200">
                        <textarea 
                          rows="2" 
                          maxLength="500"
                          value={description}
                          onChange={(e) => { setDescription(e.target.value); setHasUnsavedChanges(true); }}
                          placeholder="Briefly describe your business..."
                          className="w-full bg-transparent border-none outline-none px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 focus:border-none focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review Details */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 pb-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-slate-400" />
                    <span>Review Business Information</span>
                  </h3>

                  <div className="p-6 bg-[#e0e8f0] dark:bg-[#1a202c] border border-white/5 rounded-3xl shadow-[inset_4px_4px_8px_#becbdc,_inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0e1117,_inset_-4px_-4px_8px_#262f41] divide-y divide-black/5 dark:divide-white/5 space-y-4">
                    
                    <div className="pt-0 flex flex-col sm:flex-row gap-2">
                      <p className="w-full sm:w-1/3 font-black text-slate-500 text-xs uppercase tracking-wide">{getBusinessNameLabel().replace(" *", "")}</p>
                      <p className="w-full sm:w-2/3 text-sm font-bold text-slate-800 dark:text-slate-200">{businessName}</p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-2">
                      <p className="w-full sm:w-1/3 font-black text-slate-500 text-xs uppercase tracking-wide">Category & Subcategory</p>
                      <p className="w-full sm:w-2/3 text-sm font-bold text-slate-800 dark:text-slate-200">
                        {categories[category]?.name} {subcategory ? `(${subcategory})` : ""}
                      </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-2">
                      <p className="w-full sm:w-1/3 font-black text-slate-500 text-xs uppercase tracking-wide">Phone Number</p>
                      <p className="w-full sm:w-2/3 text-sm font-bold text-slate-800 dark:text-slate-200">{phone}</p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-2">
                      <p className="w-full sm:w-1/3 font-black text-slate-500 text-xs uppercase tracking-wide">Operating Hours</p>
                      <div className="w-full sm:w-2/3 text-sm font-bold text-slate-800 dark:text-slate-200">
                        <p>{hoursType === "open_24_7" ? "Open 24/7" : hoursType === "temporarily_closed" ? "Temporarily Closed" : "Custom Timetable Set"}</p>
                        {hoursType === "custom" && (
                          <div className="mt-2 text-xs space-y-1 bg-[#d4dfea]/30 dark:bg-dark-card/30 p-3 rounded-xl">
                            {daysOfWeek.map((day) => {
                              const dKey = day.toLowerCase();
                              const isDayOpen = !!(customHours[dKey] && customHours[dKey].open && customHours[dKey].close);
                              const openTime = customHours[dKey]?.open;
                              const closeTime = customHours[dKey]?.close;
                              
                              const formatTime = (timeStr) => {
                                if (!timeStr) return "";
                                const parts = timeStr.split(":");
                                if (parts.length !== 2) return timeStr;
                                const hour = parseInt(parts[0]);
                                const ampm = hour >= 12 ? "PM" : "AM";
                                let dispHour = hour % 12;
                                if (dispHour === 0) dispHour = 12;
                                return `${dispHour}:${parts[1]} ${ampm}`;
                              };

                              return (
                                <div key={day} className="flex justify-between max-w-xs font-semibold py-0.5">
                                  <span className="text-slate-500 dark:text-slate-400">{day}:</span>
                                  <span>{isDayOpen ? `${formatTime(openTime)} - ${formatTime(closeTime)}` : "Closed"}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-2">
                      <p className="w-full sm:w-1/3 font-black text-slate-500 text-xs uppercase tracking-wide">Address</p>
                      <p className="w-full sm:w-2/3 text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{address}</p>
                    </div>

                  </div>
                </div>
              )}

              {/* Navigation Actions Footer */}
              <div className="flex justify-between items-center pt-6 border-t border-black/5 dark:border-white/5">
                {currentStep > 1 ? (
                  <button 
                    key="prev-btn"
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handlePrevStep(); }}
                    className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-[1.02] active:scale-[0.98] active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-700 dark:text-slate-300 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer animate-fade-in"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button 
                    key="next-btn"
                    type="button" 
                    onClick={(e) => { e.preventDefault(); handleNextStep(); }}
                    className="inline-flex items-center gap-1.5 px-8 py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-[1.02] active:scale-[0.98] active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-800 dark:text-slate-200 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer ml-auto"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ) : (
                  <button 
                    key="submit-btn"
                    type="button" 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-10 py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-[1.02] active:scale-[0.98] active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-800 dark:text-slate-200 rounded-full font-black text-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-700 dark:border-white border-t-transparent" />
                        <span>Submitting...</span>
                      </>
                    ) : editListingId ? (
                      <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Changes</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Submit for Review</span>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>

        </div>
      </main>

      {/* Success Modal (Popup Manager) */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-zoom-in-fade">
          <div className="bg-[#e0e8f0] dark:bg-[#1a202c] border border-white/5 rounded-[32px] p-8 max-w-md w-full shadow-[12px_12px_24px_#becbdc,_-12px_-12px_24px_#ffffff] dark:shadow-[12px_12px_24px_#0e1117,_-12px_-12px_24px_#262f41] text-center animate-bounce-in">
            <div className="w-16 h-16 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-2.5">Business Submitted!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6">
              Thank you for listing your storefront. It is now pending review and will appear live on the Ghatal Guide directory once verified.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={resetForm}
                className="w-full py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-101 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-700 dark:text-slate-300 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Add Another Business
              </button>
              <button 
                onClick={() => { setIsSuccessModalOpen(false); router.push("/dashboard"); }}
                className="w-full py-3.5 bg-[#e0e8f0] dark:bg-[#1a202c] shadow-[4px_4px_8px_#becbdc,_-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#0e1117,_-4px_-4px_8px_#262f41] hover:scale-101 active:shadow-[inset_2px_2px_4px_#becbdc,_inset_-2px_-2px_4px_#ffffff] dark:active:shadow-[inset_2px_2px_4px_#0e1117,_inset_-2px_-2px_4px_#262f41] text-slate-700 dark:text-slate-300 rounded-full font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border text-xs font-black tracking-wide flex items-center justify-between gap-4 animate-slide-up backdrop-blur-md ${
              t.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-500/20"
                : t.type === "error"
                ? "bg-rose-500/90 text-white border-rose-500/20"
                : t.type === "warning"
                ? "bg-amber-500/90 text-slate-950 border-amber-500/20"
                : "bg-primary-600/90 text-white border-primary-650/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && <CheckCircle className="w-4.5 h-4.5 text-white" />}
              {t.type === "error" && <AlertCircle className="w-4.5 h-4.5 text-white" />}
              {t.type === "warning" && <AlertCircle className="w-4.5 h-4.5 text-slate-950" />}
              {t.type === "info" && <Info className="w-4.5 h-4.5 text-white" />}
              <span>{t.message}</span>
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-white hover:opacity-80 font-extrabold focus:outline-none text-base cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default function AddBusiness() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AddBusinessContent />
    </Suspense>
  );
}
