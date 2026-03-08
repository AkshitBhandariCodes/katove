"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Store referral code in localStorage for checkout attribution
      localStorage.setItem("referral_code", ref);
    }
  }, [searchParams]);

  return null;
}
