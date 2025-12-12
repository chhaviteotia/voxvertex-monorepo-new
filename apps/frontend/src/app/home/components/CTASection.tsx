"use client";

import React from "react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 bg-orange-500">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to streamline your expert booking?
        </h2>
        <p className="text-lg text-white/90 mb-8">
          Join 200+ organizations who've eliminated coordination chaos and saved
          70% of their time
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/marketplace"
            className="rounded-lg bg-white px-6 py-3 text-base font-medium text-orange-500 transition-colors hover:bg-gray-100"
          >
            Get Started →
          </Link>
          <Link
            href="#"
            className="rounded-lg border-2 border-white bg-transparent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            Schedule Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
