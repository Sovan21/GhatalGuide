"use client";
import { Activity, Utensils, ShoppingBag, Wrench, GraduationCap, ShieldAlert, LayoutGrid } from "lucide-react";

/** Maps each category key to a Lucide icon component */
export const categoryIconMap = {
  health: Activity,
  food: Utensils,
  shopping: ShoppingBag,
  services: Wrench,
  education: GraduationCap,
  emergency: ShieldAlert,
};

/**
 * Renders the correct Lucide icon for a given category key.
 * Falls back to LayoutGrid if the key is unknown.
 */
export function CategoryIcon({ category, className = "w-5 h-5" }) {
  const Icon = categoryIconMap[category] || LayoutGrid;
  return <Icon className={className} />;
}
