"use client";

import React, { useState } from "react";
import {
  FiX,
  FiCreditCard,
  FiUser,
  //   FiBuild,
  FiDollarSign,
} from "react-icons/fi";
import { useTheme } from "@/contexts/ThemeContext";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAmount: number;
  currency: string;
  getCurrencySymbol: (currency: string) => string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  walletAmount,
  currency,
  getCurrencySymbol,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    amount: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    upiId: "",
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

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
      // Simulate API call to Razorpay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would call your backend API
      // which would then call Razorpay's payout API

      alert(
        `Withdrawal request submitted successfully! ${getCurrencySymbol(
          currency
        )}${(parseFloat(formData.amount) - 5).toFixed(
          2
        )} will be transferred to your ${
          withdrawalMethod === "upi" ? "UPI account" : "bank account"
        } within ${
          withdrawalMethod === "upi" ? "a few minutes" : "1-2 business days"
        }. (₹5 handling fee deducted)`
      );
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
      });
      setWithdrawalMethod("bank");
      setUpiVerificationStatus("none");
    } catch (error) {
      alert("Failed to process withdrawal. Please try again.");
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
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border theme-transition ${
          theme === "light"
            ? "bg-white border-gray-200"
            : "bg-neutral-900 border-neutral-700"
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
              <FiDollarSign className="text-lg text-emerald-600" />
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
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Available Balance: {getCurrencySymbol(currency)}
                {walletAmount}
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 theme-transition ${
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
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border transition-colors ${
                    errors.amount
                      ? "border-red-300 focus:border-red-500"
                      : theme === "light"
                      ? "border-gray-300 focus:border-cyan-500"
                      : "border-neutral-600 focus:border-cyan-400"
                  } ${
                    theme === "light"
                      ? "bg-white text-gray-900"
                      : "bg-neutral-800 text-white"
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                  max={walletAmount}
                  min="6"
                  step="0.01"
                  disabled={isProcessing}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}

              {/* Transaction Fees Notice */}
              <div
                className={`p-3 rounded-lg border-l-4 border-orange-500 mt-3 theme-transition ${
                  theme === "light"
                    ? "bg-orange-50 text-orange-700"
                    : "bg-orange-950/30 text-orange-300"
                }`}
              >
                <p className="text-sm flex items-center gap-2">
                  <span className="font-medium">💰 Transaction Fee:</span>
                  <span>
                    ₹5 will be deducted as handling charges per withdrawal
                  </span>
                </p>
                {formData.amount && parseFloat(formData.amount) > 0 && (
                  <p className="text-xs mt-1 opacity-75">
                    You will receive: ₹
                    {(parseFloat(formData.amount) - 5).toFixed(2)}
                    {parseFloat(formData.amount) <= 5 && (
                      <span className="text-red-500 font-medium">
                        {" "}
                        (Insufficient amount after fees)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Withdrawal Method Selection */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 theme-transition ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Choose Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawalMethod("bank");
                    setUpiVerificationStatus("none");
                    setErrors((prev) => ({ ...prev, upiId: "" }));
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    withdrawalMethod === "bank"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : theme === "light"
                      ? "border-gray-200 hover:border-gray-300 text-gray-700"
                      : "border-neutral-600 hover:border-neutral-500 text-gray-300"
                  } ${
                    theme === "dark" && withdrawalMethod === "bank"
                      ? "bg-cyan-950/30 text-cyan-300"
                      : ""
                  }`}
                  disabled={isProcessing}
                >
                  <FiCreditCard className="text-2xl mx-auto mb-2" />
                  <div className="text-sm font-medium">Bank Account</div>
                  <div className="text-xs opacity-75 mt-1">
                    Traditional bank transfer
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWithdrawalMethod("upi");
                    setUpiVerificationStatus("none");
                  }}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    withdrawalMethod === "upi"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : theme === "light"
                      ? "border-gray-200 hover:border-gray-300 text-gray-700"
                      : "border-neutral-600 hover:border-neutral-500 text-gray-300"
                  } ${
                    theme === "dark" && withdrawalMethod === "upi"
                      ? "bg-cyan-950/30 text-cyan-300"
                      : ""
                  }`}
                  disabled={isProcessing}
                >
                  <FiUser className="text-2xl mx-auto mb-2" />
                  <div className="text-sm font-medium">UPI</div>
                  <div className="text-xs opacity-75 mt-1">
                    Instant UPI transfer
                  </div>
                </button>
              </div>
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
                  <FiUser className="text-cyan-500" />
                  UPI Details
                </h3>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 theme-transition ${
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
                      placeholder="e.g., yourname@paytm, 9876543210@ybl"
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        errors.upiId
                          ? "border-red-300 focus:border-red-500"
                          : upiVerificationStatus === "verified"
                          ? "border-green-300 focus:border-green-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
                      disabled={isProcessing || isVerifyingUpi}
                    />
                    <button
                      type="button"
                      onClick={verifyUpiId}
                      disabled={
                        isProcessing || isVerifyingUpi || !formData.upiId.trim()
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        upiVerificationStatus === "verified"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : upiVerificationStatus === "failed"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-cyan-600 hover:bg-cyan-700 text-white"
                      } ${
                        isProcessing || isVerifyingUpi || !formData.upiId.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-[1.02]"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-w-[100px]`}
                    >
                      {isVerifyingUpi ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : upiVerificationStatus === "verified" ? (
                        "✓ Verified"
                      ) : upiVerificationStatus === "failed" ? (
                        "✗ Failed"
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                  {errors.upiId && (
                    <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                  )}
                  {upiVerificationStatus === "verified" && !errors.upiId && (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                      <span>✓</span> UPI ID verified successfully
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
                  <FiCreditCard className="text-cyan-500" />
                  Bank Account Details
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
                      placeholder="Full name as per bank records"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.accountHolderName
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
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
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.bankName
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
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
                      placeholder="Enter account number"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.accountNumber
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
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
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.confirmAccountNumber
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
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
                      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                        errors.ifscCode
                          ? "border-red-300 focus:border-red-500"
                          : theme === "light"
                          ? "border-gray-300 focus:border-cyan-500"
                          : "border-neutral-600 focus:border-cyan-400"
                      } ${
                        theme === "light"
                          ? "bg-white text-gray-900"
                          : "bg-neutral-800 text-white"
                      } focus:outline-none focus:ring-2 focus:ring-cyan-500/20`}
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
              className={`p-4 rounded-lg border-l-4 border-cyan-500 theme-transition ${
                theme === "light"
                  ? "bg-cyan-50 text-cyan-700"
                  : "bg-cyan-950/30 text-cyan-300"
              }`}
            >
              <p className="text-sm">
                <strong>Security Note:</strong> Your{" "}
                {withdrawalMethod === "upi" ? "UPI ID" : "bank details"}{" "}
                {withdrawalMethod === "upi" ? "is" : "are"} encrypted and
                securely processed through our in-house system. Withdrawals
                typically take{" "}
                {withdrawalMethod === "upi"
                  ? "a few minutes"
                  : "1-2 business days"}{" "}
                to reflect in your account.
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
                    : "hover:scale-[1.02] hover:shadow-lg"
                } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Submit Withdrawal Request"
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
