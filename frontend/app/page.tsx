import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhatsNew } from "@/components/WhatsNew";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import { TopItems } from "@/components/TopItems";

import { Categories } from "@/components/Categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhatsNew />
      <FeaturedBanner />

      <Categories />
      <TopItems />
    </main>
  );
}
