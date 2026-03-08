"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "/images/hero-pc.png",
    subtitle: "New Release",
    title: (
      <>
        Check Out <br />
        The New <br />
        Gaming PCs!
      </>
    ),
    description: "More than a processor—it's the engine behind your gameplay and performance.",
    discount: "-12%",
    accent: "#ccff00",
  },
  {
    id: 2,
    image: "/images/hero-chair.png",
    subtitle: "Ergonomic Design",
    title: (
      <>
        Level Up <br />
        Your Comfort <br />
        Zone
      </>
    ),
    description: "Experience the ultimate in gaming comfort with our new futuristic ergonomic chairs.",
    discount: "-15%",
    accent: "#00ffff", 
  },
  {
    id: 3,
    image: "/images/hero-headset.png",
    subtitle: "Immersive Audio",
    title: (
      <>
        Hear Every <br />
        Footstep <br />
        Clearly
      </>
    ),
    description: "Precision spatial audio that puts you right in the center of the action.",
    discount: "-10%",
    accent: "#ff00ff",
  },
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl("/api/heroes"))
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setDynamicSlides(data);
        } else {
          // If no heroes in DB, clear slides
          setDynamicSlides([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    if (dynamicSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % dynamicSlides.length);
  };

  const prevSlide = () => {
    if (dynamicSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length);
  };

  const getSlideIndex = (offset: number) => {
    if (dynamicSlides.length === 0) return 0;
    return (currentIndex + offset + dynamicSlides.length) % dynamicSlides.length;
  };

  if (loading || dynamicSlides.length === 0) {
    return (
      <section className="relative w-full h-screen pt-24 pb-12 overflow-hidden flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
          <div className="space-y-4">
            <div className="h-4 w-[250px] bg-gray-700 rounded"></div>
            <div className="h-4 w-[200px] bg-gray-700 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentSlide = dynamicSlides[currentIndex];
  // Calculate previous and next slides for previews
  const prevSlideData = dynamicSlides[getSlideIndex(-1)];
  const nextSlideData = dynamicSlides[getSlideIndex(1)];

  return (
    <section className="relative w-full h-screen pt-24 pb-12 overflow-hidden flex items-center justify-center bg-[#050505]">
      {/* Main Card Slider Container */}
      <div className="w-full max-w-[1400px] mx-auto px-4 h-[500px] md:h-[600px] relative z-10 flex gap-6">
        
        {/* Previous Slide Preview (Left) */}
        <div 
            onClick={prevSlide}
            className="hidden lg:block w-[120px] h-full rounded-[32px] overflow-hidden opacity-40 hover:opacity-60 transition-opacity bg-[#111] border border-white/5 relative shrink-0 cursor-pointer group"
        >
           <Image
            src={prevSlideData.image_url || prevSlideData.image}
            alt="Previous"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
           <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Active Slide (Center) */}
        <div className="flex-1 h-full rounded-[32px] md:rounded-[40px] overflow-hidden relative border border-white/10 group bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                 <Image
                  src={currentSlide.image_url || currentSlide.image}
                  alt="Hero Image"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 max-w-2xl z-20">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 font-medium tracking-wide mb-6 uppercase text-xs"
                  style={{ color: currentSlide.accent_color || currentSlide.accent }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSlide.accent_color || currentSlide.accent }} />
                  {currentSlide.subtitle}
                </motion.span>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
                >
                  {currentSlide.title}
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-sm md:text-lg mb-8 md:mb-10 max-w-md leading-relaxed"
                >
                  {currentSlide.description}
                </motion.p>

                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => window.location.href = '/collections'}
                    className="text-black font-bold py-3 px-8 md:py-4 md:px-10 rounded-full w-fit hover:bg-white transition-colors duration-300 flex items-center gap-2 group/btn border border-transparent"
                    style={{ backgroundColor: currentSlide.accent_color || currentSlide.accent }}
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Discount Pill */}
              <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-red-600 text-white font-bold px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-full transform -rotate-2 z-20 shadow-lg">
                {currentSlide.discount}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Slide Preview (Right) */}
         <div 
            onClick={nextSlide}
            className="hidden lg:block w-[120px] h-full rounded-[32px] overflow-hidden opacity-40 hover:opacity-60 transition-opacity bg-[#111] border border-white/5 relative shrink-0 cursor-pointer group"
        >
          <Image
            src={nextSlideData.image_url || nextSlideData.image}
            alt="Next"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            {nextSlideData.discount}
          </div>
          <div className="absolute inset-0 bg-black/30" />
          
           <div className="absolute bottom-20 left-4 right-4 z-10">
             <p className="text-xs font-medium mb-1" style={{ color: nextSlideData.accent_color || nextSlideData.accent }}>• {nextSlideData.subtitle}</p>
             <p className="text-white text-sm font-bold leading-tight line-clamp-2">Click to View</p>
           </div>
        </div>

        {/* Navigation Buttons (Absolute) */}
        <button 
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all z-30"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
        </button>
        <button 
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all z-30"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>

      </div>

      {/* Pagination Dots */}
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {dynamicSlides.map((_, index) => (
            <button 
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? "w-12" : "w-8 bg-white/20"}`}
                style={{ backgroundColor: index === currentIndex ? (dynamicSlides[index].accent_color || dynamicSlides[index].accent) : undefined }}
            />
        ))}
      </div>
    </section>
  );
}
