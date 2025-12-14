"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer } from "lucide-react";
import { useGetCurrentUserQuery } from "@/store/hooks";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: number;
    date: string;
    description: string;
    invoice: string;
    type: string;
    wallet: string;
    amount: number;
    voxCoins: number;
    status: string;
  } | null;
}

// Currency conversion rates (1 INR to other currencies)
// Same as used in EditTrainingCalendarModal
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

/**
 * Invoice Modal
 * Displays invoice details matching the exact UI from the screenshot
 */
export default function InvoiceModal({
  isOpen,
  onClose,
  transaction,
}: InvoiceModalProps) {
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [conversionText, setConversionText] = useState<string>("1 VoxCoin = ₹1 INR");

  // Get user's country for currency conversion
  useEffect(() => {
    const userCountry = currentUserData?.user?.country || "";
    const currencyInfo = getCurrencyInfo(userCountry);

    if (currencyInfo && currencyInfo.code !== "INR") {
      setConversionText(
        `1 VoxCoin = ${currencyInfo.rate.toFixed(4)} ${currencyInfo.name}`
      );
    } else {
      setConversionText("1 VoxCoin = ₹1 INR");
    }
  }, [currentUserData]);

  if (!isOpen || !transaction) return null;

  // Calculate GST (18%)
  const subtotal = transaction.amount;
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // Format date - Parse the date string format "06 Dec 2025"
  const formatDate = (dateString: string) => {
    // Handle format like "06 Dec 2025"
    const months: { [key: string]: string } = {
      "Jan": "January",
      "Feb": "February",
      "Mar": "March",
      "Apr": "April",
      "May": "May",
      "Jun": "June",
      "Jul": "July",
      "Aug": "August",
      "Sep": "September",
      "Oct": "October",
      "Nov": "November",
      "Dec": "December",
    };
    
    const parts = dateString.split(" ");
    if (parts.length === 3) {
      const day = parts[0];
      const month = months[parts[1]] || parts[1];
      const year = parts[2];
      return `${day} ${month} ${year}`;
    }
    
    // Fallback to parsing as Date
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Downloading invoice:", transaction.invoice);
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
                <h2 className="text-2xl font-semibold text-gray-900">Invoice</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)', minHeight: '400px' }}>
                {/* Company Info and Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Left: Company Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Voxvertex
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Global Training Platform
                    </p>
                    <p className="text-sm text-gray-600">
                      support@voxvertex.com
                    </p>
                  </div>

                  {/* Right: Invoice Details */}
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      INVOICE
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {transaction.invoice}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                {/* Bill To and Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Bill To */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Bill To:
                    </h4>
                    <p className="text-sm text-gray-700 mb-1">Demo Trainer</p>
                    <p className="text-sm text-gray-700 mb-1">Expert Trainer</p>
                    <p className="text-sm text-gray-700">demo@trainer.com</p>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Payment Details:
                    </h4>
                    <p className="text-sm text-gray-700 mb-1">
                      Wallet: {transaction.wallet}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      Status: <span className="capitalize">{transaction.status.toLowerCase()}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Type: <span className="capitalize">{transaction.type.toLowerCase()}</span>
                    </p>
                  </div>
                </div>

                {/* Description Table */}
                <div className="mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Description
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                          VoxCoins
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                          Amount (INR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {transaction.voxCoins.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-full md:w-80 space-y-2">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>GST (18%):</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-teal-600 pt-2">
                      <span>VoxCoins Equivalent:</span>
                      <span>{transaction.voxCoins.toLocaleString()} VoxCoins</span>
                    </div>
                  </div>
                </div>

                {/* Thank You Message */}
                <div className="border-t border-gray-200 pt-6 pb-4 text-center">
                  <p className="text-sm text-gray-700 mb-2">
                    Thank you for being a valued trainer on Voxvertex!
                  </p>
                  <p className="text-xs text-gray-500">
                    For any queries, please contact support@voxvertex.com
                  </p>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Terms & Conditions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Terms & Conditions:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• {conversionText}</li>
                    <li>• Currency conversion rates are applied based on trainer location</li>
                    <li>• Escrow funds are released after session completion and verification</li>
                    <li>• Withdrawal requests are processed within 3-5 business days</li>
                  </ul>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pb-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

