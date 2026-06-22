import { enrichListingsWithReviewStats } from "@/lib/enrichListingsWithReviewStats";
import { supabase } from "@/lib/supabaseClient";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

// Cache approved listings for 5 minutes (300 seconds)
const getCachedListings = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database query failed:", error);
      throw error;
    }

    return enrichListingsWithReviewStats(supabase, data || []);
  },
  ["all-approved-listings-v2"],
  {
    tags: ["listings"],
    revalidate: 300 // 5 minutes
  }
);

export async function GET() {
  try {
    const listings = await getCachedListings();
    return NextResponse.json({ listings });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch listings", details: error.message },
      { status: 500 }
    );
  }
}
