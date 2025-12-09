"use client";

import React from "react";
import { Users, Briefcase, Video, Star } from "lucide-react";

export default function TrainerProfileStats() {
  const stats = [
    {
      icon: Users,
      label: "Connections",
      value: "384",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Briefcase,
      label: "Clients",
      value: "43",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Video,
      label: "Sessions",
      value: "156",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Star,
      label: "Rating",
      value: "4.9",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
