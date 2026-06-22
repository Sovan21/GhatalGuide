export function computeAverageRating(reviews) {
  if (!reviews?.length) return 0;
  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

/**
 * Attach reviewCount and computed average rating from approved reviews.
 */
export async function enrichListingsWithReviewStats(supabase, listings) {
  if (!listings?.length) return listings || [];

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("listing_id, rating")
    .eq("status", "approved");

  if (error) {
    console.warn("Failed to fetch review stats:", error.message);
    return listings.map((listing) => ({
      ...listing,
      reviewCount: listing.reviewCount ?? listing.review_count ?? 0,
      rating: Number(listing.rating) || 0,
    }));
  }

  const statsByListing = {};
  for (const review of reviews || []) {
    const listingId = String(review.listing_id);
    if (!statsByListing[listingId]) {
      statsByListing[listingId] = { count: 0, totalRating: 0 };
    }
    statsByListing[listingId].count += 1;
    statsByListing[listingId].totalRating += Number(review.rating) || 0;
  }

  return listings.map((listing) => {
    const stats = statsByListing[String(listing.id)];
    const reviewCount =
      stats?.count ?? listing.reviewCount ?? listing.review_count ?? 0;
    const rating =
      reviewCount > 0 && stats
        ? Math.round((stats.totalRating / reviewCount) * 10) / 10
        : Number(listing.rating) || 0;

    return { ...listing, reviewCount, rating };
  });
}
