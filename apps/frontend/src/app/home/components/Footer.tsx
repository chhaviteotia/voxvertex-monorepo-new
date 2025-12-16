"use client";

import React from "react";
import {
  Linkedin,
  Twitter,
  ArrowRight,
  MapPin,
  Mail,
  Instagram,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A202C] text-white">
      {/* Main Footer Content */}
      <div className="w-full px-8 py-12 lg:px-12 lg:py-16">
        {/* Company Info Section */}
        <div className="mb-8">
          <div className="max-w-sm">
            {/* Logo */}
            <div className="flex items-center mb-4">
              <div
                className="overflow-hidden"
                style={{ background: "transparent" }}
              >
                <img
                  src="/voxvertex-logo.jpeg"
                  alt="VoxVertex Logo"
                  className="h-16 w-auto object-contain block"
                  style={{ background: "transparent", padding: 0, margin: 0 }}
                  onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".logo-text-fallback")) {
                  const textFallback = document.createElement("span");
                  textFallback.className = "logo-text-fallback text-2xl font-bold text-[#FF6B35]";
                  textFallback.textContent = "VV";
                  parent.appendChild(textFallback);
                }
              }}
                />
              </div>
            </div>

            <p className="text-white/90 text-lg leading-relaxed mb-6">
              Creating a world where every great event begins with a trusted
              partnership.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#FF6B35] mt-1 shrink-0" />
                <p className="text-white/90 text-lg">
                  C-182, Swarn Jayanti Puram, Ghaziabad (201013)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#FF6B35] shrink-0" />
                <a
                  href="mailto:info@voxvertex.com"
                  className="text-white/90 text-lg hover:text-white transition-colors"
                >
                  info@voxvertex.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections - 2x2 Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {/* Platform Column */}
          <div className="space-y-4">
            <h3 className="text-[#FF6B35] font-bold text-lg uppercase tracking-wide">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/marketplace", label: "Browse Events" },
                { href: "/marketplace", label: "Browse Speakers" },
                { href: "#", label: "Pricing Plans" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white hover:font-bold text-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-[#FF6B35] font-bold text-lg uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Blog" },
                { href: "#", label: "Case Studies" },
                { href: "#", label: "Event Guides" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white hover:font-bold text-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-[#FF6B35] font-bold text-lg uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "About Us" },
                { href: "#", label: "Careers" },
                { href: "#", label: "Contact" },
                { href: "#", label: "Partners" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white hover:font-bold text-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support Column */}
          <div className="space-y-4">
            <h3 className="text-[#FF6B35] font-bold text-lg uppercase tracking-wide">
              Legal & Support
            </h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Terms and Conditions" },
                { href: "#", label: "Privacy" },
                { href: "#", label: "Help Centre" },
                { href: "#", label: "FAQ" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/90 hover:text-white hover:font-bold text-lg transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stay Connected Section */}
        <div className="mt-12 pt-12 pb-12 border-t border-white/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="flex-1 max-w-2xl">
              <h3 className="text-white font-bold text-xl mb-4">
                Stay Connected
              </h3>
              <p className="text-white/90 text-lg leading-relaxed">
                Get the latest updates on event trends, platform features, and
                exclusive partnership
                <br />
                opportunities.
              </p>
            </div>
            <div className="flex flex-row gap-3 lg:ml-8">
              <input
                type="email"
                placeholder="Enter your email to Subscribe Newsletter"
                className="w-full sm:w-[36rem] lg:w-[40rem] px-8 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-[#FF6B35] transition-colors text-lg"
              />
              <button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-10 py-4 rounded-lg font-medium flex items-center justify-center transition-colors whitespace-nowrap text-lg">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#0F1419] border-t border-white/20 py-16">
        <div className="w-full px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <p className="text-white/90 text-lg">
              © 2025 Voxvertex Solutions. All rights reserved.
            </p>

            {/* Social Media and Policy Links */}
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-12">
              {/* Social Media */}
              <div className="flex items-center space-x-4">
                <span className="text-white/90 text-lg">Follow Us:</span>
                <div className="flex space-x-4">
                  {[
                    {
                      icon: Instagram,
                      href: "https://www.instagram.com/vox_vertex/",
                    },
                    {
                      icon: Linkedin,
                      href: "https://www.linkedin.com/company/voxvertex/",
                    },
                    { icon: Twitter, href: "https://x.com/voxvertex" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 hover:bg-[#FF6B35] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <social.icon className="w-5 h-5 text-white" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Policy Links */}
              <div className="flex space-x-6">
                <Link
                  href="#"
                  className="text-white/90 hover:text-white hover:font-bold text-lg transition-all duration-300"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
