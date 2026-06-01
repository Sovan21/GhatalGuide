"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { supabase } from "@/lib/supabaseClient";
import { categories } from "@/lib/sampleData";
import { 
  Building, MapPin, Phone, Clock, FileText, CheckCircle, ArrowRight, ArrowLeft, Check, Loader2 
} from "lucide-react";

export default function AddBusiness() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Listing Form inputs
  const [currentStep, setCurrentStep] = useState(1);
  const [shopName, setShopName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  // Opening Hours
  const [hoursType, setHoursType] = useState("open_24_7"); // 'open_24_7', 'custom'
  const [customHours, setCustomHours] = useState({
    monday: { open: "09:00", close: "21:00", closed: false },
    tuesday: { open: "09:00", close: "21:00", closed: false },
    wednesday: { open: "09:00", close: "21:00", closed: false },
    thursday: { open: "09:00", close: "21:00", closed: false },
    friday: { open: "09:00", close: "21:00", closed: false },
    saturday: { open: "09:00", close: "21:00", closed: false },
    sunday: { open: "09:00", close: "13:00", closed: false },
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);

  // Monitor Auth session
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session?.user) {
          router.push("/login?redirect=/add-business");
        } else {
          setCurrentUser(session.user);
          setCheckingAuth(false);
        }
      })
      .catch((e) => {
        console.warn("Failed to retrieve auth session:", e);
        router.push("/login?redirect=/add-business");
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login?redirect=/add-business");
      } else if (session?.user) {
        setCurrentUser(session.user);
        setCheckingAuth(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Parse Map Link for Coordinates
  useEffect(() => {
    if (!mapLink) return;
    const match = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match && match.length >= 3) {
      setLatitude(match[1]);
      setLongitude(match[2]);
    }
  }, [mapLink]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormSubmitting(true);
    try {
      const hoursData = hoursType === "open_24_7" ? { status: "open_24_7" } : { status: "custom", hours: customHours };
      const listingObj = {
        user_id: currentUser.id,
        name: shopName,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        phone,
        address,
        description,
        image: imageUrl || null,
        googleMapLink: mapLink || null,
        lat: latitude ? parseFloat(latitude) : null,
        lng: longitude ? parseFloat(longitude) : null,
        opening_hours: hoursData,
        status: "pending_review",
      };

      const { error } = await supabase.from("listings").insert(listingObj);
      if (error) throw error;
      setSuccessState(true);
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">
      <div className="mesh-bg" />
      <Navbar />

      <main className="flex-grow py-12 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="mb-10 text-center space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Add Your Business
            </h1>
            <div className="h-1.5 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-bold">
              Get discovered by thousands of local residents and visitors in Ghatal.
            </p>
          </div>

          {checkingAuth ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-bold text-slate-500">Checking authorization...</p>
            </div>
          ) : successState ? (
            /* Success Completion Card */
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                Listing Submitted!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-bold">
                Thank you for listing your business! It has been submitted for review. An administrator will verify the details, and once approved, it will go live in our guide directory.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-xs sm:text-sm cursor-pointer"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setShopName("");
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    setPhone("");
                    setAddress("");
                    setDescription("");
                    setImageUrl("");
                    setMapLink("");
                    setLatitude("");
                    setLongitude("");
                    setCurrentStep(1);
                    setSuccessState(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black py-3.5 rounded-xl transition-all text-xs sm:text-sm cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            /* Wizard Form */
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              
              {/* Stepper Timeline Progress Bar */}
              <div className="px-6 py-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 select-none">
                <div className="flex items-center justify-between max-w-xl mx-auto relative">
                  
                  {/* Progress Line Behind Stepper Circles */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300" 
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />
                  </div>

                  {/* Stepper Circle 1 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > 1 
                        ? "bg-emerald-600 text-white" 
                        : currentStep === 1 
                          ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                    }`}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black mt-2 ${currentStep === 1 ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`}>
                      Info
                    </span>
                  </div>

                  {/* Stepper Circle 2 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > 2 
                        ? "bg-emerald-600 text-white" 
                        : currentStep === 2 
                          ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                    }`}>
                      {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black mt-2 ${currentStep === 2 ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`}>
                      Contact
                    </span>
                  </div>

                  {/* Stepper Circle 3 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > 3 
                        ? "bg-emerald-600 text-white" 
                        : currentStep === 3 
                          ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                    }`}>
                      {currentStep > 3 ? <Check className="w-4 h-4" /> : "3"}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black mt-2 ${currentStep === 3 ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`}>
                      Hours
                    </span>
                  </div>

                  {/* Stepper Circle 4 */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep === 4 
                        ? "bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-md animate-pulse" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
                    }`}>
                      4
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black mt-2 ${currentStep === 4 ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"}`}>
                      Review
                    </span>
                  </div>

                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 sm:p-10 space-y-8">
                
                {/* STEP 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Building className="w-5.5 h-5.5 text-indigo-500" />
                      <span>Basic Business Information</span>
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shop / Business Name</label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Spice Garden Restaurant"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
                        <select
                          required
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubcategory("");
                          }}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200"
                        >
                          <option value="">Select Category</option>
                          {Object.keys(categories).map((key) => (
                            <option key={key} value={key}>{categories[key].name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subcategory</label>
                        <select
                          required
                          value={selectedSubcategory}
                          onChange={(e) => setSelectedSubcategory(e.target.value)}
                          disabled={!selectedCategory}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50"
                        >
                          <option value="">Select Subcategory</option>
                          {selectedCategory && categories[selectedCategory].subcategories.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="Tell clients about what services or products you provide..."
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 2: Contact Details */}
                {currentStep === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Phone className="w-5.5 h-5.5 text-indigo-500" />
                      <span>Contact & Location Details</span>
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Physical Address</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="e.g. Bazar Road, near Town Hall, Ghatal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Image URL (Optional)</label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="Link to shop photo (Unsplash, Imgur, etc.)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Google Maps Link (Optional)</label>
                      <input
                        type="url"
                        value={mapLink}
                        onChange={(e) => setMapLink(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        placeholder="Google Maps Share link"
                      />
                      {latitude && longitude && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-black mt-1.5 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Parsed coordinates: Lat {latitude}, Lng {longitude}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Opening Hours */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5.5 h-5.5 text-indigo-500" />
                      <span>Opening Hours</span>
                    </h3>

                    <div className="space-y-1.5 mb-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Hours Status</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="hoursType"
                            value="open_24_7"
                            checked={hoursType === "open_24_7"}
                            onChange={() => setHoursType("open_24_7")}
                            className="text-indigo-500 focus:ring-indigo-500"
                          />
                          <span>Open 24/7</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="hoursType"
                            value="custom"
                            checked={hoursType === "custom"}
                            onChange={() => setHoursType("custom")}
                            className="text-indigo-500 focus:ring-indigo-500"
                          />
                          <span>Custom Weekly Timetable</span>
                        </label>
                      </div>
                    </div>

                    {hoursType === "custom" && (
                      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/10 shadow-inner">
                        {Object.keys(customHours).map((day) => (
                          <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-200/50 dark:border-slate-800 last:border-0">
                            <span className="font-black text-slate-700 dark:text-slate-300 text-xs sm:text-sm uppercase w-24">{day}</span>
                            
                            <div className="flex items-center gap-3.5 flex-wrap">
                              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer font-bold">
                                <input
                                  type="checkbox"
                                  checked={customHours[day].closed}
                                  onChange={(e) => setCustomHours({
                                    ...customHours,
                                    [day]: { ...customHours[day], closed: e.target.checked }
                                  })}
                                />
                                <span>Closed</span>
                              </label>

                              {!customHours[day].closed && (
                                <div className="flex items-center gap-2.5 text-xs font-bold">
                                  <input
                                    type="time"
                                    value={customHours[day].open}
                                    onChange={(e) => setCustomHours({
                                      ...customHours,
                                      [day]: { ...customHours[day], open: e.target.value }
                                    })}
                                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                  />
                                  <span>to</span>
                                  <input
                                    type="time"
                                    value={customHours[day].close}
                                    onChange={(e) => setCustomHours({
                                      ...customHours,
                                      [day]: { ...customHours[day], close: e.target.value }
                                    })}
                                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Review & Submit */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-fade-in text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5.5 h-5.5 text-indigo-500" />
                      <span>Review Details</span>
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-900/10 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-inner">
                      <p><strong className="text-slate-400 font-black">Name:</strong> {shopName}</p>
                      <p><strong className="text-slate-400 font-black">Category:</strong> {selectedCategory ? categories[selectedCategory].name : ""}</p>
                      <p><strong className="text-slate-400 font-black">Subcategory:</strong> {selectedSubcategory}</p>
                      <p><strong className="text-slate-400 font-black">Phone:</strong> {phone}</p>
                      <p><strong className="text-slate-400 font-black">Address:</strong> {address}</p>
                      <p><strong className="text-slate-400 font-black">Hours:</strong> {hoursType === "open_24_7" ? "Open 24/7" : "Custom Hours Configured"}</p>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
                      By submitting, you confirm that these details are correct and legitimate. All submissions undergo administrative moderation verification before going live.
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-1.5 text-sm font-black text-slate-400 hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (!shopName || !selectedCategory || !selectedSubcategory)) ||
                        (currentStep === 2 && (!phone || !address))
                      }
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer animate-fade-in"
                    >
                      {formSubmitting ? "Submitting..." : "Submit Listing"}
                    </button>
                  )}
                </div>

              </form>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
