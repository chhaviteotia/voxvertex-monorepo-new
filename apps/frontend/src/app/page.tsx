"use client";

import React from "react";
import Header from "./home/components/Header";
import HeroSection from "./home/components/HeroSection";
import ChallengeSection from "./home/components/ChallengeSection";
import HowItWorksSection from "./home/components/HowItWorksSection";
import CompleteExpertBookingSection from "./home/components/CompleteExpertBookingSection";
import FeaturedExpertsSection from "./home/components/FeaturedExpertsSection";
import TrustSection from "./home/components/TrustSection";
import BuiltForSection from "./home/components/BuiltForSection";
import ResourcesSection from "./home/components/ResourcesSection";
import CTASection from "./home/components/CTASection";
import Footer from "./home/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      <Header />
      <HeroSection />
      <ChallengeSection />
      <HowItWorksSection />
      <CompleteExpertBookingSection />
      <FeaturedExpertsSection />
      <TrustSection />
      <BuiltForSection />
      <ResourcesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
