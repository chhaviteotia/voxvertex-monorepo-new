"use client";

import { useState } from "react";
import { FiSearch, FiFileText, FiCreditCard, FiTrendingUp, FiDollarSign, FiLock } from "react-icons/fi";
import { BsCreditCard2Front, BsBank } from "react-icons/bs";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdLocationOn, MdAccountBalanceWallet, MdPhoneAndroid, MdBusiness } from "react-icons/md";
import WithdrawModal from "./components/WithdrawModal";
import InvoiceModal from "./components/InvoiceModal";

/**
 * Payments Page
 * Displays payments, earnings, VoxCoins purchase, and transaction history
 */
export default function PaymentsPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Card");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Sample data - will be replaced with API calls
  const earningsData = {
    totalEarnings: 24500,
    escrowWallet: 3200,
    currentWallet: 21300,
    growth: "+15%",
  };

  const transactions = [
    {
      id: 1,
      date: "06 Dec 2025",
      description: "Session with John Doe - AI Fundamentals",
      invoice: "INV-2025-1206-001",
      type: "Earning",
      wallet: "Current",
      amount: 5000,
      voxCoins: 5000,
      status: "Completed",
    },
    {
      id: 2,
      date: "05 Dec 2025",
      description: "Purchased VoxCoins via Credit Card",
      invoice: "INV-2025-1205-001",
      type: "Credit",
      wallet: "Current",
      amount: 10000,
      voxCoins: 10000,
      status: "Completed",
    },
    {
      id: 3,
      date: "04 Dec 2025",
      description: "Session with Jane Smith - Machine Learning",
      invoice: "INV-2025-1204-001",
      type: "Earning",
      wallet: "Escrow",
      amount: 3200,
      voxCoins: 3200,
      status: "Pending",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.invoice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All Types" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "All Status" || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Earning":
        return "text-green-600";
      case "Credit":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600";
      case "Pending":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        {/* Payments & Earnings Section */}
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Main Title */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Payments & Earnings
          </h2>

          {/* Earnings Summary Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Earnings Summary
              </h3>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FiTrendingUp className="w-4 h-4" />
                <span>{earningsData.growth}</span>
              </div>
            </div>

            {/* Total Earnings - Full Width Row */}
            <div className="bg-orange-50 rounded-lg p-5 border border-orange-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                      ₹{earningsData.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-orange-500">
                      ({earningsData.totalEarnings.toLocaleString()} VoxCoins)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Wallet and Current Wallet - Side by Side Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Escrow Wallet */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FiLock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Escrow Wallet</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{earningsData.escrowWallet.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-500">
                    {earningsData.escrowWallet.toLocaleString()} VoxCoins
                  </p>
                </div>
              </div>

              {/* Current Wallet */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MdAccountBalanceWallet className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Current Wallet</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{earningsData.currentWallet.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-500">
                    {earningsData.currentWallet.toLocaleString()} VoxCoins
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Withdraw ₹{earningsData.currentWallet.toLocaleString()}
          </button>
        </section>

        {/* Buy VoxCoins Section */}
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Buy VoxCoins
          </h2>

          <div className="space-y-4">
            {/* Location and Amount Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location
                </label>
                <div className="relative">
                  <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white appearance-none">
                    <option>India (INR)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  1 INR = ₹1.00 = 1.00 VoxCoins
                </p>
              </div>

              {/* Amount in INR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount in INR
                </label>
                <div className="relative">
                  <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary of Conversion - Only show when amount is entered */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount in INR:</span>
                    <span className="text-sm font-medium text-gray-900">INR {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Converted to INR:</span>
                    <span className="text-sm font-medium text-gray-900">₹{parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">VoxCoins to receive:</span>
                    <span className="text-lg font-bold text-teal-600">{parseFloat(amount).toFixed(2)} VoxCoins</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedPaymentMethod("Card")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === "Card"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <BsCreditCard2Front className="w-6 h-6 text-gray-700" />
                  <span className="font-medium text-gray-900">Card</span>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod("UPI")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === "UPI"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <MdPhoneAndroid className="w-6 h-6 text-gray-700" />
                  <span className="font-medium text-gray-900">UPI</span>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod("Net Banking")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === "Net Banking"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <MdBusiness className="w-6 h-6 text-gray-700" />
                  <span className="font-medium text-gray-900">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Buy VoxCoins Button */}
            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
              Buy VoxCoins
            </button>
          </div>
        </section>

        {/* Transaction History Section */}
        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transaction History
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
              >
                <option>All Types</option>
                <option>Earning</option>
                <option>Credit</option>
                <option>Debit</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
              >
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Wallet
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount (INR)
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    VoxCoins
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {transaction.invoice}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-medium ${getTypeColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.wallet}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                      +₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                      +{transaction.voxCoins.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsInvoiceModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <FiFileText className="w-4 h-4" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No transactions found</p>
            </div>
          )}
        </section>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={earningsData.currentWallet}
        availableVoxCoins={earningsData.currentWallet}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}

