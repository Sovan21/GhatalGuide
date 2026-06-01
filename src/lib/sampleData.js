export const categories = {
  health: { name: "Health & Wellness", icon: "health", subcategories: ["Hospitals", "Doctors", "Pharmacy"] },
  food: { name: "Food & Dining", icon: "food", subcategories: ["Restaurants", "Cafes", "Sweets", "Desserts"] },
  shopping: { name: "Shopping", icon: "shopping", subcategories: ["Apparel", "Electronics", "Groceries", "Book Store"] },
  services: { name: "Local Services", icon: "services", subcategories: ["Electricians", "Plumbers", "Mechanics"] },
  education: { name: "Education", icon: "education", subcategories: ["Schools", "Colleges", "Coaching Centers"] },
  emergency: { name: "Emergency", icon: "emergency", subcategories: ["Police", "Ambulance", "Fire Station", "Blood Banks"] }
};

export const sampleListings = [
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
    reviewCount: 15,
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
    reviewCount: 38,
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
    reviewCount: 8,
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
    reviewCount: 22,
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
    reviewCount: 19,
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
    reviewCount: 5,
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
    reviewCount: 51,
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
    reviewCount: 14,
    isOpen: false,
    status: "approved",
    created_at: "2025-01-08T10:00:00Z"
  },
  {
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
    reviewCount: 29,
    isOpen: true,
    status: "approved",
    created_at: "2025-01-09T10:00:00Z"
  }
];

export const sampleTransportation = {
  trains: [
    { id: 1, name: "Panskura Local", from_station: "Ghatal", to_station: "Panskura", time: "07:30 AM", platform: "1", days: "Daily" },
    { id: 2, name: "Howrah Fast Local", from_station: "Ghatal", to_station: "Howrah", time: "09:00 AM", platform: "2", days: "Mon-Sat" },
    { id: 3, name: "Haldia Local", from_station: "Ghatal", to_station: "Haldia", time: "11:15 AM", platform: "1", days: "Daily" }
  ],
  buses: [
    { id: 1, route: "Ghatal to Medinipur", frequency: "Every 30 mins", first_bus: "06:00 AM", last_bus: "08:00 PM" },
    { id: 2, route: "Ghatal to Kolkata (Esplanade)", frequency: "Every 1 hour", first_bus: "05:30 AM", last_bus: "06:00 PM" },
    { id: 3, route: "Ghatal to Daspur", frequency: "Every 20 mins", first_bus: "06:30 AM", last_bus: "09:00 PM" }
  ],
  totoRoutes: [
    { id: 1, route: "Ghatal Bus Stand to Kushpata", fare: "₹10" },
    { id: 2, route: "Ghatal Bazar to Vidyasagar Setu", fare: "₹15" },
    { id: 3, route: "Konnagar to Ghatal College", fare: "₹10" }
  ]
};

export const sampleEvents = [
  {
    id: 1,
    title: "Ghatal Book Fair 2026",
    location: "Town Hall Ground, Ghatal",
    date: "2026-12-15",
    time: "02:00 PM - 09:00 PM",
    description: "Annual book fair featuring publishers from all over West Bengal, cultural events, and seminars.",
    created_at: "2025-05-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Free Medical Camp",
    location: "Ghatal College Hall",
    date: "2026-06-10",
    time: "09:00 AM - 04:00 PM",
    description: "Free general health checkup, pediatric care, and medicine distribution organized by Lions Club.",
    created_at: "2025-05-10T10:00:00Z"
  }
];

export const sampleJobs = [
  {
    id: 1,
    job_title: "High School Teacher (Science)",
    company_name: "Ghatal Vidyasagar High School",
    location: "Ghatal",
    description: "Seeking a passionate Science teacher for secondary sections. Minimum qualification: B.Sc & B.Ed.",
    job_type: "Full Time",
    salary_range: "₹25,000 - ₹35,000 / month",
    created_at: "2025-05-12T10:00:00Z"
  },
  {
    id: 2,
    job_title: "Store Executive",
    company_name: "Fashion Hub Apparel",
    location: "Ghatal Bazar",
    description: "Manage shop inventory, billing operations, and assist customers. Computer knowledge required.",
    job_type: "Part Time",
    salary_range: "₹8,000 - ₹12,000 / month",
    created_at: "2025-05-20T10:00:00Z"
  }
];

export const sampleBlogs = [
  {
    id: 1,
    title: "Exploring the Rich History of Ghatal Town",
    slug: "exploring-history-of-ghatal",
    author_name: "Sourav Roy",
    content: "Ghatal has a rich history dating back centuries. Located on the banks of the Shilabati River, it has been a center for trade and culture...",
    featured_image_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80",
    created_at: "2025-04-10T10:00:00Z"
  },
  {
    id: 2,
    title: "Top 5 Places to Visit in and Around Ghatal",
    slug: "top-5-places-visit-ghatal",
    author_name: "Amit Das",
    content: "From the historical Vidyasagar Smriti Mandir in Birsingha to the scenic riverside spots, here is a complete travel guide for tourists...",
    featured_image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop&q=80",
    created_at: "2025-04-22T10:00:00Z"
  }
];
