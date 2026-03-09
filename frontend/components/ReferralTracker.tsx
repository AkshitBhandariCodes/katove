"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getApiUrl } from "@/utils/api";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Store referral code in localStorage for checkout attribution
      localStorage.setItem("referral_code", ref);

      // Record the click on the backend (fire and forget)
      fetch(getApiUrl("/api/affiliates/track-click"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref }),
      }).catch(() => {
        // Silently fail - click tracking is best-effort
      });
    }
  }, [searchParams]);

  return null;
}
