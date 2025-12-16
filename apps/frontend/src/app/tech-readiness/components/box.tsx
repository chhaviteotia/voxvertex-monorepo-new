import React from "react";

const Box = ({
  title,
  subtitle,
  percentage,
  barWidth = "w-[80%]",
  iconBg = "bg-[#E98B6A]",
  barColor = "bg-[#4A9B8E]", // default progress bar color
}) => {
  return (
    <div className="w-full rounded-2xl border border-[#e7ddd3] bg-[#fffdfa] p-6">
      
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 18h16M6 6v12M18 6v12" />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {title}
            </p>
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Percentage */}
        <p className={`text-xl font-semibold text-black`}>
          {percentage}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-3 w-full bg-[#dfeeea] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barWidth} ${barColor}`} />
      </div>
    </div>
  );
};

export default Box;
