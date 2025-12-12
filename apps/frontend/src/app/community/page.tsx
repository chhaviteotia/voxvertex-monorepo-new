"use client";

import React from "react";
import Header from "../home/components/Header";
import { Commentbox } from "./component/commentbox";
import Box from "./component/box";

const Community = () => {
  return (
    <div className="bg-[#F8F6F3] min-h-screen">
      <Header />
      <div className="flex items-center justify-center py-8">
        <div className="w-[90vw] md:w-[60vw] lg:w-[60vw]">
          <Commentbox />
          <Box
            name="Sarah Johnson"
            role="Leadership Coach & Mentor"
            verifiedstatus="Verified"
            text={`Just wrapped up an incredible 3-day leadership workshop with tech executives from 5 different countries.
The energy, insights, and transformative conversations were simply amazing! 🚀
Key takeaway: Authentic leadership is not a position, it's a practice.`}
          />
          <Box
            name="Sarah Johnson"
            role="Leadership Coach & Mentor"
            verifiedstatus={true}
            text="Just wrapped up an incredible 3-day leadership workshop with tech executives from 5 different countries. The energy, insights, and transformative conversations were simply amazing! 🚀 Key takeaway: Authentic leadership is not a skill — it's a practice."
          />
          <Box
            name="Sarah Johnson"
            role="Leadership Coach & Mentor"
            verifiedstatus={true}
            text="Just wrapped up an incredible 3-day leadership workshop with tech executives from 5 different countries. The energy, insights, and transformative conversations were simply amazing! 🚀 Key takeaway: Authentic leadership is not a skill — it's a practice."
          />
        </div>
      </div>
    </div>
  );
};

export default Community;
