"use client";

import React, { useState, Suspense } from "react";
import {
  ArrowLeft,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Edit2,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { TrainingCalendar } from "@/store/api/expertApi";
import { useExpertAuth } from "@/store/hooks/expertAuth";
import { useGetCurrentExpertQuery } from "@/store/api/expertApi";

interface AvailabilityItem {
  id: string;
  date: Date;
  price: string;
  priceType: string;
  mode: string;
  categories: string[];
  availability: string | null;
}

interface EditTrainingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TrainingCalendar) => void;
  initialData?: TrainingCalendar;
}

// Currency conversion rates (1 INR to other currencies)
const CURRENCY_RATES: Record<
  string,
  { code: string; symbol: string; rate: number; name: string }
> = {
  US: { code: "USD", symbol: "$", rate: 0.011, name: "US Dollar" },
  USA: { code: "USD", symbol: "$", rate: 0.011, name: "US Dollar" },
  "United States": { code: "USD", symbol: "$", rate: 0.011, name: "US Dollar" },
  "United States of America": {
    code: "USD",
    symbol: "$",
    rate: 0.011,
    name: "US Dollar",
  },
  UK: { code: "GBP", symbol: "£", rate: 0.0095, name: "British Pound" },
  "United Kingdom": {
    code: "GBP",
    symbol: "£",
    rate: 0.0095,
    name: "British Pound",
  },
  Canada: { code: "CAD", symbol: "C$", rate: 0.015, name: "Canadian Dollar" },
  Australia: {
    code: "AUD",
    symbol: "A$",
    rate: 0.017,
    name: "Australian Dollar",
  },
  Germany: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  France: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  Italy: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  Spain: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  Japan: { code: "JPY", symbol: "¥", rate: 1.7, name: "Japanese Yen" },
  China: { code: "CNY", symbol: "¥", rate: 0.08, name: "Chinese Yuan" },
  UAE: { code: "AED", symbol: "د.إ", rate: 0.041, name: "UAE Dirham" },
  "United Arab Emirates": {
    code: "AED",
    symbol: "د.إ",
    rate: 0.041,
    name: "UAE Dirham",
  },
  Singapore: {
    code: "SGD",
    symbol: "S$",
    rate: 0.015,
    name: "Singapore Dollar",
  },
  // Add more countries as needed
};

// Get currency info based on country
const getCurrencyInfo = (country?: string) => {
  if (!country) return null;

  // Normalize country name for lookup (case-insensitive)
  const normalizedCountry = country.trim();

  // Try exact match first
  let currencyInfo = CURRENCY_RATES[normalizedCountry];

  // If not found, try case-insensitive match
  if (!currencyInfo) {
    const countryKey = Object.keys(CURRENCY_RATES).find(
      (key) => key.toLowerCase() === normalizedCountry.toLowerCase()
    );
    if (countryKey) {
      currencyInfo = CURRENCY_RATES[countryKey];
    }
  }

  if (currencyInfo) {
    return currencyInfo;
  }

  // Default to INR if country not found
  return { code: "INR", symbol: "₹", rate: 1, name: "Indian Rupee" };
};

export default function EditTrainingCalendarModal({
  isOpen,
  onClose,
  onSave,
  initialData = [],
}: EditTrainingCalendarModalProps) {
  const router = useRouter();
  const { user } = useExpertAuth();
  const { data: currentUserData } = useGetCurrentExpertQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get user's country for currency conversion
  const trainerUser = user || currentUserData?.user;
  const userCountry = trainerUser?.country || "";
  const currencyInfo = getCurrencyInfo(userCountry);

  // Get today's date
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Convert initialData (ISO strings) to AvailabilityItem format (Date objects)
  const convertToAvailabilityItems = (
    data: TrainingCalendar
  ): AvailabilityItem[] => {
    return data.map((item, index) => ({
      id: item._id || `temp-${index}`,
      date: new Date(item.date),
      price: item.price,
      priceType: item.priceType,
      mode: item.mode,
      categories: item.categories || [],
      availability: item.availability || null,
    }));
  };

  // Convert AvailabilityItem format (Date objects) back to TrainingCalendar (ISO strings)
  const convertToTrainingCalendar = (
    items: AvailabilityItem[]
  ): TrainingCalendar => {
    return items.map((item) => ({
      _id:
        item.id.startsWith("temp-") || item.id.startsWith("new-")
          ? undefined
          : item.id,
      date: item.date.toISOString(),
      price: item.price,
      priceType: item.priceType,
      mode: item.mode,
      categories: item.categories,
      availability: item.availability || undefined,
    }));
  };

  const [scheduledAvailabilities, setScheduledAvailabilities] = useState<
    AvailabilityItem[]
  >(convertToAvailabilityItems(initialData));
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [editingAvailability, setEditingAvailability] = useState<{
    id: string;
    date: Date;
    categories: string[];
    priceType: string;
    price: string;
    mode: string;
    availability: string;
  } | null>(null);
  const [editFormData, setEditFormData] = useState<{
    categories: string[];
    pricingModel: string;
    price: string;
    deliveryMode: string;
    notes: string;
  } | null>(null);

  // Update scheduledAvailabilities when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setScheduledAvailabilities(convertToAvailabilityItems(initialData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, JSON.stringify(initialData)]);

  const ALL_TRAINING_CATEGORIES = [
    "Soft Skills & Behavioral Training",
    "Technical & Hard Skills Training",
    "Compliance & Regulatory Training",
    "Sales & Customer Service Training",
    "Leadership & Executive Development",
    "HR & People Management Training",
    "Diversity, Equity & Inclusion (DEI) Training",
    "Well-being & Mental Health Training",
    "Onboarding & Orientation Training",
    "Industry-Specific Training",
    "Sustainability & CSR Training",
    "Language & Communication Training",
    "Functional/Department-Specific Training",
    "Certification & Accreditation Training",
    "AI & Emerging Technology Training",
    "Immersive Learning & Simulation Training",
    "Microlearning & Learning Experience Design",
    "Data & Analytics Training",
    "Remote & Hybrid Work Training",
    "Coaching & Mentoring Training",
    "Creativity & Innovation Training",
    "Financial Literacy & Business Acumen Training",
    "Crisis Management & Resilience Training",
    "Train-the-Trainer Programs",
    "Digital Transformation & AI Training",
  ];

  const PRICING_MODELS = [
    "Per Session (VoxCoins/hour)",
    "Per Day Rate (VoxCoins/day)",
    "Per Week Rate (VoxCoins/week)",
    "Monthly Retainer (VoxCoins/month)",
    "Project-Based (VoxCoins/project)",
    "Custom Pricing",
  ];

  const DELIVERY_MODES = [
    "In-person only",
    "Virtual only",
    "Hybrid (flexible)",
  ];

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    router.push("/profile/trainer");
  };

  const handleSave = () => {
    const calendarData = convertToTrainingCalendar(scheduledAvailabilities);
    onSave(calendarData);
    setUnsavedChanges(0);
    onClose();
  };

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(clickedDate);

    // Check if this date has an existing availability
    const existingAvailability = scheduledAvailabilities.find(
      (av) =>
        av.date.getDate() === clickedDate.getDate() &&
        av.date.getMonth() === clickedDate.getMonth() &&
        av.date.getFullYear() === clickedDate.getFullYear()
    );

    if (existingAvailability) {
      // If availability exists, pre-fill the form with existing data
      setEditingAvailability({
        id: existingAvailability.id,
        date: clickedDate,
        categories: existingAvailability.categories,
        priceType: existingAvailability.priceType,
        price: existingAvailability.price,
        mode: existingAvailability.mode,
        availability: existingAvailability.availability || "",
      });
      setEditFormData({
        categories: existingAvailability.categories,
        pricingModel: existingAvailability.priceType,
        price: existingAvailability.price,
        deliveryMode: existingAvailability.mode,
        notes: existingAvailability.availability || "",
      });
    } else {
      // If new date, open empty form
      setEditingAvailability({
        id: `new-${clickedDate.getTime()}`,
        date: clickedDate,
        categories: [],
        priceType: "Per Day Rate (VoxCoins/day)",
        price: "",
        mode: "Hybrid (flexible)",
        availability: "",
      });
      setEditFormData({
        categories: [],
        pricingModel: "Per Day Rate (VoxCoins/day)",
        price: "",
        deliveryMode: "Hybrid (flexible)",
        notes: "",
      });
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const formatFullDate = (date: Date) => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${dayNames[date.getDay()]}, ${
      monthNames[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatShortDate = (date: Date) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${
      monthNames[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fffbf5] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 bg-teal-700 z-50 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Trainer Sidebar - Fixed on left, hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <Suspense
            fallback={
              <div className="w-64 h-screen bg-teal-700 animate-pulse" />
            }
          >
            <Sidebar />
          </Suspense>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="fixed top-0 left-0 lg:left-64 right-0 z-30 shrink-0">
            <Header
              title="Profile"
              showMobileMenu={showMobileSidebar}
              onMobileMenuToggle={() => setShowMobileSidebar(true)}
            />
          </div>

          {/* Header Banner */}
          <div className="bg-teal-600 px-6 py-4 shrink-0 mt-16">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Profile</span>
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-xl font-semibold text-white">
                  Training Availability & Pricing Calendar
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  Manage your training schedule and pricing.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <Check className="w-5 h-5" />
                Save Calendar ({unsavedChanges})
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6 min-h-0">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Calendar and Scheduled Availability */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Calendar */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-5">
                      <button
                        onClick={() => navigateMonth("prev")}
                        className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-purple-700" />
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]}{" "}
                        {currentDate.getFullYear()}
                      </h3>
                      <button
                        onClick={() => navigateMonth("next")}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                      {dayNames.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-bold text-gray-700 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: firstDayOfMonth }).map(
                        (_, index) => (
                          <div key={`empty-${index}`} className="h-14" />
                        )
                      )}

                      {/* Days of the month */}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const isSelected = isDateSelected(day);
                        const isTodayDate = isToday(day);
                        const hasAvailability = scheduledAvailabilities.some(
                          (av) =>
                            av.date.getDate() === day &&
                            av.date.getMonth() === currentDate.getMonth() &&
                            av.date.getFullYear() === currentDate.getFullYear()
                        );
                        return (
                          <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`h-16 w-full rounded-lg border-2 transition-all flex items-center justify-center text-sm font-medium relative ${
                              isSelected
                                ? "bg-green-50 border-green-400 text-gray-900 shadow-sm"
                                : isTodayDate
                                ? "bg-orange-50 border-orange-400 text-gray-900 shadow-sm"
                                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {day}
                            {hasAvailability && !isSelected && !isTodayDate && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-600 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-400"></div>
                        <span className="text-xs text-gray-600">Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border-2 border-gray-200 relative">
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </div>
                        <span className="text-xs text-gray-600">
                          Has availability
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
                        <span className="text-xs text-gray-600">Selected</span>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Availability Section */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Scheduled Availability ({scheduledAvailabilities.length})
                    </h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {scheduledAvailabilities.map((availability) => (
                        <div
                          key={availability.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              {/* Date */}
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatFullDate(availability.date)}
                                </span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                                <span className="text-sm text-gray-700">
                                  {availability.price} VoxCoins (
                                  {availability.priceType})
                                </span>
                              </div>

                              {/* Mode and Categories */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
                                  {availability.mode}
                                </span>
                                {availability.categories.map(
                                  (category, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                                    >
                                      {category}
                                    </span>
                                  )
                                )}
                              </div>

                              {/* Availability Time */}
                              {availability.availability && (
                                <div className="text-sm text-gray-600">
                                  {availability.availability}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingAvailability({
                                    id: availability.id,
                                    date: availability.date,
                                    categories: availability.categories,
                                    priceType: availability.priceType,
                                    price: availability.price,
                                    mode: availability.mode,
                                    availability:
                                      availability.availability || "",
                                  });
                                  setEditFormData({
                                    categories: availability.categories,
                                    pricingModel: availability.priceType,
                                    price: availability.price,
                                    deliveryMode: availability.mode,
                                    notes: availability.availability || "",
                                  });
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  // Handle delete
                                  setScheduledAvailabilities((prev) =>
                                    prev.filter(
                                      (av) => av.id !== availability.id
                                    )
                                  );
                                  setUnsavedChanges((prev) => prev + 1);
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Select a Date Panel or Edit Form */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-fit">
                  {editingAvailability && editFormData ? (
                    /* Edit Form */
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatShortDate(editingAvailability.date)}
                        </h3>
                        <button
                          onClick={() => {
                            setEditingAvailability(null);
                            setEditFormData(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Scrollable Form Content */}
                      <div className="flex-1 overflow-y-auto space-y-6 max-h-[calc(100vh-400px)]">
                        {/* Training Categories */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Training Categories{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="bg-[#fef9e7] border border-yellow-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="space-y-2">
                              {ALL_TRAINING_CATEGORIES.map((category) => (
                                <label
                                  key={category}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editFormData.categories.includes(
                                      category
                                    )}
                                    onChange={() => {
                                      setEditFormData((prev) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          categories: prev.categories.includes(
                                            category
                                          )
                                            ? prev.categories.filter(
                                                (c) => c !== category
                                              )
                                            : [...prev.categories, category],
                                        };
                                      });
                                    }}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {category}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {editFormData.categories.length} categories
                            selected.
                          </p>
                        </div>

                        {/* Pricing Model */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Pricing Model{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {PRICING_MODELS.map((model) => (
                              <label
                                key={model}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                              >
                                <input
                                  type="radio"
                                  name="pricingModel"
                                  value={model}
                                  checked={editFormData.pricingModel === model}
                                  onChange={(e) =>
                                    setEditFormData((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            pricingModel: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">
                                  {model}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Price in VoxCoins */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Price in VoxCoins{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                            <input
                              type="number"
                              value={editFormData.price}
                              onChange={(e) =>
                                setEditFormData((prev) =>
                                  prev
                                    ? { ...prev, price: e.target.value }
                                    : null
                                )
                              }
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                              placeholder="Enter price"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {currencyInfo && currencyInfo.code !== "INR" ? (
                              <>
                                1 VoxCoin = {currencyInfo.rate.toFixed(4)}{" "}
                                {currencyInfo.name}
                              </>
                            ) : (
                              <>1 VoxCoin = ₹1 INR</>
                            )}
                          </p>
                        </div>

                        {/* Delivery Mode */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Delivery Mode{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            {DELIVERY_MODES.map((mode) => (
                              <label
                                key={mode}
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                              >
                                <input
                                  type="radio"
                                  name="deliveryMode"
                                  value={mode}
                                  checked={editFormData.deliveryMode === mode}
                                  onChange={(e) =>
                                    setEditFormData((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            deliveryMode: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700">
                                  {mode}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Additional Notes{" "}
                            <span className="text-gray-400 font-normal">
                              (Optional)
                            </span>
                          </label>
                          <textarea
                            value={editFormData.notes}
                            onChange={(e) =>
                              setEditFormData((prev) =>
                                prev ? { ...prev, notes: e.target.value } : null
                              )
                            }
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                            placeholder="Enter any additional notes..."
                          />
                        </div>
                      </div>

                      {/* Footer Button */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            if (!editingAvailability || !editFormData) return;

                            // Update or add availability
                            setScheduledAvailabilities((prev) => {
                              const existingIndex = prev.findIndex(
                                (av) => av.id === editingAvailability.id
                              );

                              const updatedAvailability: AvailabilityItem = {
                                id: editingAvailability.id,
                                date: editingAvailability.date,
                                price: editFormData.price,
                                priceType: editFormData.pricingModel,
                                mode: editFormData.deliveryMode,
                                categories: editFormData.categories,
                                availability: editFormData.notes || null,
                              };

                              if (existingIndex >= 0) {
                                // Update existing
                                const updated = [...prev];
                                updated[existingIndex] = updatedAvailability;
                                return updated;
                              } else {
                                // Add new
                                return [...prev, updatedAvailability];
                              }
                            });

                            setEditingAvailability(null);
                            setEditFormData(null);
                            setUnsavedChanges((prev) => prev + 1);
                          }}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Update Availability
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Select a Date Panel */
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <div className="mb-4">
                        <CalendarIcon className="w-14 h-14 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Select a Date
                      </h3>
                      <p className="text-xs text-gray-600 max-w-xs leading-relaxed px-2">
                        Click on any date in the calendar to configure your
                        availability, pricing, and training categories.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
