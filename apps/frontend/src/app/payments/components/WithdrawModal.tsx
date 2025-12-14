"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { BsBank } from "react-icons/bs";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdPhoneAndroid } from "react-icons/md";
import { Download } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  availableVoxCoins: number;
}

/**
 * Withdraw Funds Modal
 * Matches the exact UI from the screenshot
 */
export default function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  availableVoxCoins,
}: WithdrawModalProps) {
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("Bank Transfer");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const withdrawalFee = withdrawalAmount
    ? (parseFloat(withdrawalAmount) * 0.02).toFixed(2)
    : "0.00";

  const handleWithdraw = () => {
    // TODO: Implement withdrawal logic
    console.log("Withdrawing:", {
      amount: withdrawalAmount,
      method: withdrawalMethod,
      accountNumber,
      ifscCode,
    });
    // Close modal after successful withdrawal
    onClose();
  };

  if (!isOpen) return null;

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Withdraw Funds
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Information Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">
                        Available Balance: ₹{availableBalance.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} ({availableVoxCoins.toLocaleString()} VoxCoins)
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Withdrawal fee: 2% of amount.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount (INR)
                  </label>
                  <div className="relative">
                    <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      max={availableBalance}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  {withdrawalAmount && parseFloat(withdrawalAmount) > availableBalance && (
                    <p className="text-xs text-red-600 mt-1">
                      Amount cannot exceed available balance
                    </p>
                  )}
                </div>

                {/* Withdrawal Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Withdrawal Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Bank Transfer */}
                    <button
                      onClick={() => setWithdrawalMethod("Bank Transfer")}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        withdrawalMethod === "Bank Transfer"
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <BsBank className="w-5 h-5 text-gray-700" />
                      <span className="font-medium text-gray-900">
                        Bank Transfer
                      </span>
                    </button>

                    {/* UPI */}
                    <button
                      onClick={() => setWithdrawalMethod("UPI")}
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        withdrawalMethod === "UPI"
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <MdPhoneAndroid className="w-5 h-5 text-gray-700" />
                      <span className="font-medium text-gray-900">UPI</span>
                    </button>
                  </div>
                </div>

                {/* Bank Account Details (shown when Bank Transfer is selected) */}
                {withdrawalMethod === "Bank Transfer" && (
                  <div className="space-y-4 pt-2">
                    {/* Bank Account Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter IFSC code"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none uppercase"
                        maxLength={11}
                      />
                    </div>
                  </div>
                )}

                {/* UPI Details (shown when UPI is selected) */}
                {withdrawalMethod === "UPI" && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g., yourname@paytm)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawalAmount ||
                      parseFloat(withdrawalAmount) <= 0 ||
                      parseFloat(withdrawalAmount) > availableBalance ||
                      (withdrawalMethod === "Bank Transfer" &&
                        (!accountNumber || !ifscCode))
                    }
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

