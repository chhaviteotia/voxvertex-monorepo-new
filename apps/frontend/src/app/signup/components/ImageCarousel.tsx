"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  image: string;
  tagline: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tagline: "Earn More, Stress Less",
    subtitle: "Focus on what you do best while we handle the logistics",
  },
  {
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tagline: "Manage Everything in One Place",
    subtitle:
      "Streamline bookings, sessions, and payments with our all-in-one platform",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tagline: "Build Your Professional Brand",
    subtitle:
      "Showcase your expertise and grow your influence in your industry",
  },
  {
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    tagline: "Connect with Industry Leaders",
    subtitle: "Join thousands of professionals in our vibrant community",
  },
];

export default function ImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Bottom Text Overlay */}
      <div className="absolute inset-0 flex items-end justify-start p-8 z-10">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white max-w-lg"
        >
          <h2 className="text-2xl font-bold mb-2">
            {slides[currentSlide].tagline}
          </h2>
          <p className="text-base opacity-90">
            {slides[currentSlide].subtitle}
          </p>
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-8 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


