"use client";

import React from "react";
import TrainerProfileHeader from "./sections/TrainerProfileHeader";
import TrainerAboutSection from "./sections/TrainerAboutSection";
import TrainerContactInfo from "./sections/TrainerContactInfo";
import TrainerWorkPreferences from "./sections/TrainerWorkPreferences";
import TrainerTrainingCalendar from "./sections/TrainerTrainingCalendar";
import TrainerTrainingCategories from "./sections/TrainerTrainingCategories";
import TrainerSkillsAssessment from "./sections/TrainerSkillsAssessment";
import TrainerExperience from "./sections/TrainerExperience";
import TrainerEducation from "./sections/TrainerEducation";
import TrainerCertifications from "./sections/TrainerCertifications";
import TrainerLanguages from "./sections/TrainerLanguages";
import TrainerIndustriesServed from "./sections/TrainerIndustriesServed";
import TrainerClientTypesServed from "./sections/TrainerClientTypesServed";

/**
 * Trainer Profile Content Component
 * Main component that renders all trainer profile sections
 */
export default function TrainerProfileContent() {
  return (
    <div className="w-full">
      {/* Header Section with Integrated Stats - Full Width */}
      <div className="mb-4 sm:mb-6">
        <TrainerProfileHeader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* About Section */}
          <TrainerAboutSection />

          {/* Availability & Work Preferences */}
          <TrainerWorkPreferences />

          {/* Training Categories & Expertise */}
          <TrainerTrainingCategories />

          {/* Trainer Skills Assessment */}
          <TrainerSkillsAssessment />

          {/* Work Experience */}
          <TrainerExperience />

          {/* Education */}
          <TrainerEducation />

          {/* Professional Certifications */}
          <TrainerCertifications />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Contact Info */}
          <TrainerContactInfo />

          {/* Training Calendar */}
          <TrainerTrainingCalendar />

          {/* Languages */}
          <TrainerLanguages />

          {/* Industries Served */}
          <TrainerIndustriesServed />

          {/* Client Types Served */}
          <TrainerClientTypesServed />
        </div>
      </div>
    </div>
  );
}
