"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhatsNew } from "@/components/WhatsNew";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import { TopItems } from "@/components/TopItems";
import { Categories } from "@/components/Categories";
import { useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";

interface Section {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

const sectionComponents: Record<string, React.FC> = {
  hero: Hero,
  whats_new: WhatsNew,
  featured_banner: FeaturedBanner,
  categories: Categories,
  top_items: TopItems,
};

const defaultSections: Section[] = [
  { id: 'hero', name: 'Hero Slider', enabled: true, order: 0 },
  { id: 'whats_new', name: "What's New", enabled: true, order: 1 },
  { id: 'featured_banner', name: 'Featured Banner', enabled: true, order: 2 },
  { id: 'categories', name: 'Categories', enabled: true, order: 3 },
  { id: 'top_items', name: 'Top Items', enabled: true, order: 4 },
];

export default function Home() {
  const [sections, setSections] = useState<Section[]>(defaultSections);

  useEffect(() => {
    fetch(getApiUrl("/api/homepage-sections"))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSections(data.sort((a: Section, b: Section) => a.order - b.order));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <Navbar />
      {sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order)
        .map(s => {
          const Component = sectionComponents[s.id];
          return Component ? <Component key={s.id} /> : null;
        })}
    </main>
  );
}
