"use client";

import React from "react";
import { CheckCircle, Shield, Award, Sparkles } from "lucide-react";

export default function TrustSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#F7F5F2] to-[#F2F4F8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4 text-gray-900 tracking-tight">
            Built on Trust & Transparency
          </h2>
          <p className="text-lg text-gray-600">
            Our platform metrics and security features
          </p>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-5xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight font-bold">
              500+
            </div>
            <div className="text-sm text-gray-600">Verified Experts</div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight font-bold">
              60+
            </div>
            <div className="text-sm text-gray-600">Skill Categories</div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight font-bold">
              70%
            </div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight font-bold">
              1,000+
            </div>
            <div className="text-sm text-gray-600">Sessions Delivered</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-12 border border-gray-200 shadow-lg">
          <h3 className="text-xl text-center mb-10 text-gray-900">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-gray-900">Verified Experts</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-gray-900">Secure Escrow</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-gray-900">Enterprise Compliance</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-gray-900">AI-Powered Matching</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
