"use client";

import { useEffect } from "react";
import { getApiUrl } from "@/utils/api";

export function ThemeInitializer() {
  useEffect(() => {
    fetch(getApiUrl("/api/settings"))
      .then((res) => res.json())
      .then((data) => {
        if (data.font_family) {
          document.body.style.fontFamily = data.font_family;
        }
        if (data.primary_color) {
          document.documentElement.style.setProperty("--primary-color", data.primary_color);
        }
      })
      .catch((err) => console.error("Failed to load global theme settings", err));
  }, []);

  return null;
}
