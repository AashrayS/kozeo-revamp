"use client";

import React, { useState, useEffect } from "react";
import {
  FiX,
  FiCreditCard,
  FiUser,
  //   FiBuild,
  FiDollarSign,
} from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";
import { createWithdrawRequest } from "../../../utilities/kozeoApi.js";
import { useSelector } from "react-redux";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAmount: number;
  currency: string;
  getCurrencySymbol: (currency: string) => string;
  onWithdrawSuccess?: () => void; // Callback to refresh wallet data
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  walletAmount,
  currency,
  getCurrencySymbol,
  onWithdrawSuccess,
}) => {
  const { theme } = useTheme();
  const { user } = useSelector((state: any) => state.user);

  const [formData, setFormData] = useState({
    amount: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    upiId: "",
    email: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerificationStatus, setUpiVerificationStatus] = useState<
    "none" | "verified" | "failed"
  >("none");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"bank" | "upi">(
    "bank"
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Set user email when component mounts or user changes
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(formData.amount) <= 5) {
      newErrors.amount =
        "Minimum withdrawal amount is ₹6 (₹5 handling fee + ₹1 minimum)";
    } else if (parseFloat(formData.amount) > walletAmount) {
      newErrors.amount = "Amount cannot exceed wallet balance";
    }

    if (withdrawalMethod === "bank") {
      if (!formData.accountNumber) {
        newErrors.accountNumber = "Account number is required";
      } else if (
        formData.accountNumber.length < 9 ||
        formData.accountNumber.length > 18
      ) {
        newErrors.accountNumber = "Account number must be between 9-18 digits";
      }

      if (formData.accountNumber !== formData.confirmAccountNumber) {
        newErrors.confirmAccountNumber = "Account numbers do not match";
      }

      if (!formData.ifscCode) {
        newErrors.ifscCode = "IFSC code is required";
      } else if (
        !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())
      ) {
        newErrors.ifscCode = "Invalid IFSC code format";
      }

      if (!formData.accountHolderName.trim()) {
        newErrors.accountHolderName = "Account holder name is required";
      }

      if (!formData.bankName.trim()) {
        newErrors.bankName = "Bank name is required";
      }
    } else if (withdrawalMethod === "upi") {
      if (!formData.upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
      } else if (!/^[\w\.-]+@[\w\.-]+$/.test(formData.upiId.trim())) {
        newErrors.upiId =
          "Invalid UPI ID format (e.g., user@paytm, 9876543210@ybl)";
      }

      if (upiVerificationStatus !== "verified") {
        newErrors.upiId = "Please verify your UPI ID before proceeding";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Prepare withdrawal request data
      const withdrawalData = {
        email: formData.email,
        amount: parseFloat(formData.amount),
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        upi: withdrawalMethod === "upi" ? formData.upiId : "",
      };

      // Call the API to create withdraw request
      const result = (await createWithdrawRequest(withdrawalData)) as any;

      if (result && result.id) {
        // Success
        alert(
          `Withdrawal request submitted successfully! Your request ID is ${
            result.id
          }. 
          ${getCurrencySymbol(currency)}${
          (parseFloat(formData.amount) - 5)
          }  will be transferred to your ${
            withdrawalMethod === "upi" ? "UPI account" : "bank account"
          } after admin approval. You'll be notified once the request is processed.`
        );

        // Call success callback to refresh wallet data
        if (onWithdrawSuccess) {
          onWithdrawSuccess();
        }

        onClose();

        // Reset form
        setFormData({
          amount: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          accountHolderName: "",
          bankName: "",
          upiId: "",
          email: user?.email || "",
        });
        setWithdrawalMethod("bank");
        setUpiVerificationStatus("none");
      } else {
        throw new Error("Failed to create withdrawal request");
      }
    } catch (error: any) {
      console.error("Withdrawal request error:", error);

      // Handle specific error messages
      let errorMessage = "Failed to process withdrawal. Please try again.";

      if (error.message && error.message.includes("insufficient")) {
        errorMessage =
          "Insufficient wallet balance for this withdrawal amount.";
      } else if (error.message && error.message.includes("pending")) {
        errorMessage =
          "You already have a pending withdrawal request. Please wait for it to be processed.";
      } else if (error.message && error.message.includes("validation")) {
        errorMessage = "Please check your details and try again.";
      }

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Reset UPI verification status when UPI ID changes
    if (field === "upiId") {
      setUpiVerificationStatus("none");
    }
  };

  const verifyUpiId = async () => {
    if (!formData.upiId.trim()) {
      setErrors((prev) => ({ ...prev, upiId: "Please enter a UPI ID" }));
      return;
    }

    if (!/^[\w\.-]+@[\w\.-]+$/.test(formData.upiId.trim())) {
      setErrors((prev) => ({ ...prev, upiId: "Invalid UPI ID format" }));
      return;
    }

    setIsVerifyingUpi(true);
    setUpiVerificationStatus("none");

    try {
      // Simulate UPI verification API call
      // In a real implementation, this would call your backend API
      // which would then verify the UPI ID through banking APIs
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo
      const isValid = Math.random() > 0.3; // 70% success rate for demo

      if (isValid) {
        setUpiVerificationStatus("verified");
        setErrors((prev) => ({ ...prev, upiId: "" }));
      } else {
        setUpiVerificationStatus("failed");
        setErrors((prev) => ({
          ...prev,
          upiId: "UPI ID verification failed. Please check and try again.",
        }));
      }
    } catch (error) {
      setUpiVerificationStatus("failed");
      setErrors((prev) => ({
        ...prev,
        upiId: "Failed to verify UPI ID. Please try again.",
      }));
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl theme-transition ${
          theme === "light"
            ? "bg-white border border-gray-200"
            : "bg-neutral-900 border border-neutral-700"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between theme-transition ${
            theme === "light"
              ? "bg-white/95 border-gray-200 backdrop-blur-md"
              : "bg-neutral-900/95 border-neutral-700 backdrop-blur-md"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FiDollarSign className="text-lg text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2
                className={`text-xl font-semibold theme-transition ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Withdraw Funds
              </h2>
              <p
                className={`text-sm theme-transition ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Available:{" "}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {getCurrencySymbol(currency)}
                  {walletAmount}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`p-2 rounded-lg transition-colors ${
              theme === "light"
                ? "hover:bg-gray-100 text-gray-500"
                : "hover:bg-neutral-800 text-gray-400"
            }`}
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount and Method Selection Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Amount */}
              <div className="space-y-3">
                <label
                  className={`block text-sm font-medium theme-transition ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm theme-transition ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {getCurrencySymbol(currency)}
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                      errors.amount
                        ? "border-red-300 focus:border-red-500"
                        : theme === "light"
                        ? "border-gray-300 focus:border-emerald-500"
                        : "border-neutral-600 focus:border-emerald-400"
                    } ${
                      theme === "light"
                        ? "bg-white text-gray-900"
                        : "bg-neutral-800 text-white"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                    max={walletAmount}
                    min="6"
                    step="0.01"
                    disabled={isProcessing}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
              </div>

              {/* Withdrawal Method Selection */}
              <div className="space-y-3">
                <label
                  className={`block text-sm font-medium theme-transition ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalMethod("bank");
                      setUpiVerificationStatus("none");
                      setErrors((prev) => ({ ...prev, upiId: "" }));
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      withdrawalMethod === "bank"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : theme === "light"
                        ? "border-gray-200 hover:border-gray-300 text-gray-700"
                        : "border-neutral-600 hover:border-neutral-500 text-gray-300"
                    }`}
                    disabled={isProcessing}
                  >
                    <FiCreditCard className="text-lg mx-auto mb-1" />
                    <div className="text-xs font-medium">Bank</div>
                    <div className="text-xs opacity-75">1-2 days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawalMethod("upi");
                      setUpiVerificationStatus("none");
                    }}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      withdrawalMethod === "upi"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : theme === "light"
                        ? "border-gray-200 hover:border-gray-300 text-gray-700"
                        : "border-neutral-600 hover:border-neutral-500 text-gray-300"
                    }`}
                    disabled={isProcessing}
                  >
                    <FiUser className="text-lg mx-auto mb-1" />
                    <div className="text-xs font-medium">UPI</div>
                    <div className="text-xs opacity-75">24 hours</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction Fees Notice */}
            <div
              className={`p-3 rounded-lg border-l-4 border-orange-500 theme-transition ${
                theme === "light"
                  ? "bg-orange-50 text-orange-700"
                  : "bg-orange-950/30 text-orange-300"
              }`}
            >
              <p className="text-xs font-medium">
                💰 Transaction Fee: ₹5 handling charge per withdrawal
              </p>
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <p className="text-xs mt-1 opacity-75">
                  You'll receive:{" "}
                  <span className="font-semibold">
                    ₹{(parseFloat(formData.amount) - 5).toFixed(2)}
                  </span>
                  {parseFloat(formData.amount) <= 5 && (
                    <span className="text-red-500 font-medium ml-1">
                      (Insufficient)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label
                className={`block text-sm font-medium theme-transition ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500"
                    : theme === "light"
                    ? "border-gray-300 focus:border-emerald-500"
                    : "border-neutral-600 focus:border-emerald-400"
                } ${
                  theme === "light"
                    ? "bg-white text-gray-900 placeholder-gray-500"
                    : "bg-neutral-800 text-white placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                disabled={isProcessing}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* UPI Details Section */}
            {withdrawalMethod === "upi" && (
              <div
                className={`p-4 rounded-lg border theme-transition ${
                  theme === "light"
                    ? "bg-gray-50 border-gray-200"
                    : "bg-neutral-800/50 border-neutral-700"
                }`}
              >
                <h3
                  className={`text-lg font-medium mb-4 flex items-center gap-2 theme-transition ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  <FiUser className="text-emerald-500" />
                  UPI Details
                </h3>

                <div className="space-y-3">
                  <label
                    className={`block text-sm font-medium theme-transition ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    UPI ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) =>
                        handleInputChange("upiId", e.target.value.toLowerCase())
                      }
                      placeholder="yourname@paytm, 9876543210@ybl"
                      className={`flex-1 px-3 py-3 rounded-lg border transition-colors ${
                        errors.upiId
                          ? "border-red-300 focus:border-red-500"
                          : upiVerificationStatus === "verified"
                          ? "border-green-300 focus:border-green-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      disabled={isProcessing || isVerifyingUpi}
                    />
                    <button
                      type="button"
                      onClick={verifyUpiId}
                      disabled={
                        isProcessing || isVerifyingUpi || !formData.upiId.trim()
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                        upiVerificationStatus === "verified"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : upiVerificationStatus === "failed"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      } ${
                        isProcessing || isVerifyingUpi || !formData.upiId.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      } focus:outline-none min-w-[80px]`}
                    >
                      {isVerifyingUpi ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : upiVerificationStatus === "verified" ? (
                        "✓"
                      ) : upiVerificationStatus === "failed" ? (
                        "✗"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {errors.upiId && (
                    <p className="text-red-500 text-sm">{errors.upiId}</p>
                  )}
                  {upiVerificationStatus === "verified" && !errors.upiId && (
                    <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                      <span>✓</span> Verified
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bank Details Section */}
            {withdrawalMethod === "bank" && (
              <div
                className={`p-4 rounded-lg border theme-transition ${
                  theme === "light"
                    ? "bg-gray-50 border-gray-200"
                    : "bg-neutral-800/50 border-neutral-700"
                }`}
              >
                <h3
                  className={`text-lg font-medium mb-4 flex items-center gap-2 theme-transition ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  <FiCreditCard className="text-emerald-500" />
                  Bank Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account Holder Name */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 theme-transition ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        handleInputChange("accountHolderName", e.target.value)
                      }
                      placeholder="Full name as per bank"
                      className={`w-full px-3 py-3 rounded-lg border transition-colors ${
                        errors.accountHolderName
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      disabled={isProcessing}
                    />
                    {errors.accountHolderName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accountHolderName}
                      </p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 theme-transition ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        handleInputChange("bankName", e.target.value)
                      }
                      placeholder="e.g., State Bank of India"
                      className={`w-full px-3 py-3 rounded-lg border transition-colors ${
                        errors.bankName
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      disabled={isProcessing}
                    />
                    {errors.bankName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bankName}
                      </p>
                    )}
                  </div>

                  {/* Account Number */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 theme-transition ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "accountNumber",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Account number"
                      className={`w-full px-3 py-3 rounded-lg border transition-colors ${
                        errors.accountNumber
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      disabled={isProcessing}
                    />
                    {errors.accountNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accountNumber}
                      </p>
                    )}
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 theme-transition ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Confirm Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.confirmAccountNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "confirmAccountNumber",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="Re-enter account number"
                      className={`w-full px-3 py-3 rounded-lg border transition-colors ${
                        errors.confirmAccountNumber
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      disabled={isProcessing}
                    />
                    {errors.confirmAccountNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmAccountNumber}
                      </p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 theme-transition ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) =>
                        handleInputChange(
                          "ifscCode",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="e.g., SBIN0000001"
                      className={`w-full px-3 py-3 rounded-lg border transition-colors ${
                        errors.ifscCode
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-emerald-500"
                          : "border-neutral-600 focus:border-emerald-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      maxLength={11}
                      disabled={isProcessing}
                    />
                    {errors.ifscCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.ifscCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div
              className={`p-4 rounded-lg border-l-4 border-emerald-500 theme-transition ${
                theme === "light"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-emerald-950/30 text-emerald-300"
              }`}
            >
              <p className="text-sm">
                <strong>🔒 Secure Processing:</strong> Your{" "}
                {withdrawalMethod === "upi" ? "UPI ID" : "bank details"} will be
                encrypted and processed securely. Funds typically arrive in{" "}
                {withdrawalMethod === "upi" ? "minutes" : "1-2 business days"}.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className={`flex-1 px-6 py-3 rounded-lg border transition-colors ${
                  theme === "light"
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-neutral-600 text-gray-300 hover:bg-neutral-800"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium transition-all duration-200 ${
                  isProcessing
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
