"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/common/PageLoader";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "../../../../store/hooks";
import { isAuthenticated } from "../../../../utilities/api";
import {
  getAllWithdrawRequests,
  updateWithdrawRequestStatus,
} from "../../../../utilities/kozeoApi";
import {
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiAlertTriangle,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiExternalLink,
} from "react-icons/fi";

// Types based on API documentation
interface WithdrawRequest {
  id: string;
  userId: string; // This is just an ID string, not an object
  email: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upi?: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processed" | "completed";
  remarks?: string;
  processedBy?: string; // This is just an ID string, not an object
  processedAt?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WithdrawRequestsAdminPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user: currentUser, isAuthenticated: userAuthenticated } = useUser();

  const [loading, setLoading] = useState(true);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(
    []
  );
  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedUPI, setSelectedUPI] = useState("");
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState<
    Set<string>
  >(new Set());

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated() || !userAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user is admin (you may need to adjust this based on your user role structure)
    if (currentUser?.role !== "admin") {
      router.push("/Atrium");
      return;
    }

    fetchWithdrawRequests();
  }, [userAuthenticated, currentUser, router]);

  const fetchWithdrawRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // Use the actual API call
      const requests = await getAllWithdrawRequests();
      setWithdrawRequests(requests || []);
    } catch (err: any) {
      console.error("Error fetching withdraw requests:", err);

      // For development/testing, fall back to mock data if API fails
      if (process.env.NODE_ENV === "development") {
        const mockData: WithdrawRequest[] = [
          {
            id: "1",
            userId: "user1",
            email: "john@example.com",
            accountHolderName: "John Doe",
            bankName: "State Bank of India",
            accountNumber: "1234567890",
            ifscCode: "SBIN0001234",
            upi: "john@paytm",
            amount: 5000,
            status: "pending",
            createdAt: "2025-01-15T10:30:00Z",
            updatedAt: "2025-01-15T10:30:00Z",
          },
          {
            id: "2",
            userId: "user2",
            email: "jane@example.com",
            accountHolderName: "Jane Smith",
            bankName: "HDFC Bank",
            accountNumber: "9876543210",
            ifscCode: "HDFC0001234",
            amount: 8500,
            status: "pending",
            createdAt: "2025-01-14T15:45:00Z",
            updatedAt: "2025-01-14T15:45:00Z",
          },
        ];
        setWithdrawRequests(mockData);
        setError("Using mock data - API endpoint not available");
      } else {
        setError("Failed to fetch withdraw requests. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    newStatus: "completed" | "approved" | "rejected",
    remarks?: string
  ) => {
    try {
      setUpdatingRequest(requestId);
      setError("");
      setSuccess("");

      const defaultRemarks = remarks || `Request ${newStatus} by admin`;

      // Use the actual API call
      const updatedRequest = await updateWithdrawRequestStatus(
        requestId,
        newStatus,
        defaultRemarks
      );

      // Update local state with the response
      if (updatedRequest) {
        setWithdrawRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: newStatus,
                  remarks: defaultRemarks,
                  processedBy:
                    (updatedRequest as any).processedBy ||
                    currentUser?.id ||
                    "",
                  processedAt:
                    (updatedRequest as any).processedAt ||
                    new Date().toISOString(),
                  updatedAt:
                    (updatedRequest as any).updatedAt ||
                    new Date().toISOString(),
                }
              : request
          )
        );
      }

      setSuccess(`Request ${newStatus} successfully!`);
    } catch (err: any) {
      console.error("Error updating withdraw request:", err);

      // For development/testing, simulate the update if API fails
      if (process.env.NODE_ENV === "development") {
        setWithdrawRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: newStatus,
                  remarks: remarks || `Request ${newStatus} by admin`,
                  processedBy: currentUser?.id || "",
                  processedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : request
          )
        );
        setSuccess(`Request ${newStatus} successfully! (Mock update)`);
        setError("Using mock data - API endpoint not available");
      } else {
        setError(
          err.message || "Failed to update request status. Please try again."
        );
      }
    } finally {
      setUpdatingRequest(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-forge-ember bg-yellow-500/10 border-yellow-500/20";
      case "approved":
        return "text-forge-ember bg-forge-ember-low border-forge-ember/20";
      case "completed":
        return "text-forge-ember bg-forge-ember-low/10 border-forge-ember/20";
      case "rejected":
        return "text-[forge-error bg-[forge-error-bg/10 border-[forge-error/20";
      case "processed":
        return "text-text-3 bg-forge-ember-low/10 border-forge-line/20";
      default:
        return "text-text-3 bg-forge-line/10 border-forge-line/20";
    }
  };

  const toggleAccountVisibility = (requestId: string) => {
    setVisibleAccountNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openUPIQR = (upiId: string) => {
    setSelectedUPI(upiId);
    setShowQRModal(true);
  };

  const generateUPIQRCode = (upiId: string) => {
    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=Payment&cu=INR`;

    // For simplicity, we'll use a QR code service API
    // In production, you might want to use a proper QR code library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      upiUrl
    )}`;
    return qrCodeUrl;
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>

      {/* Background glows */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
        </>
      )}

      <div
        className={`min-h-screen relative z-10 flex transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-text-1"
            : "bg-container-1    text-text-1"
        }`}
      >

        <main className="flex-1 p-6 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1
                  className={`text-3xl font-bold transition-colors duration-300 ${
                    theme === "dark" ? "text-text-1" : "text-text-1"
                  }`}
                >
                  Withdraw Requests Management
                </h1>
                <button
                  onClick={fetchWithdrawRequests}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-container-2 border-container-3 text-text-1 hover:bg-state-hover"
                      : "bg-container-1 border-container-3 text-text-1 hover:bg-state-hover"
                  }`}
                >
                  <FiRefreshCw
                    className={`text-sm ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              <p
                className={`transition-colors duration-300 ${
                  theme === "dark" ? "text-text-3" : "text-text-3"
                }`}
              >
                Manage and update withdrawal request statuses
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 bg-[forge-error-bg/10 border border-[forge-error/20 rounded-sm">
                <div className="flex items-center gap-3">
                  <FiAlertTriangle className="text-[forge-error" />
                  <p className="text-[forge-error">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-forge-ember-low/10 border border-forge-ember/20 rounded-sm">
                <div className="flex items-center gap-3">
                  <FiCheck className="text-forge-ember" />
                  <p className="text-forge-ember">{success}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Total Requests",
                  value: withdrawRequests.length,
                  icon: FiDollarSign,
                  color: "text-forge-ember",
                },
                {
                  label: "Pending",
                  value: withdrawRequests.filter((r) => r.status === "pending")
                    .length,
                  icon: FiClock,
                  color: "text-forge-ember",
                },
                {
                  label: "Completed",
                  value: withdrawRequests.filter(
                    (r) => r.status === "completed"
                  ).length,
                  icon: FiCheck,
                  color: "text-forge-ember",
                },
                {
                  label: "Total Amount",
                  value: formatCurrency(
                    withdrawRequests
                      .filter((r) => r.status === "pending")
                      .reduce((sum, r) => sum + r.amount, 0)
                  ),
                  icon: FiDollarSign,
                  color: "text-text-3",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-sm border transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-forge-bg-raised/50 border-container-3"
                      : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          theme === "dark" ? "text-text-3" : "text-text-3"
                        }`}
                      >
                        {stat.label}
                      </p>
                      <p
                        className={`text-xl font-semibold mt-1 transition-colors duration-300 ${
                          theme === "dark" ? "text-text-1" : "text-text-1"
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`text-2xl ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Requests Table */}
            <div
              className={`rounded-sm border overflow-hidden transition-all duration-300 ${
                theme === "dark"
                  ? "bg-forge-bg-raised/50 border-container-3"
                  : "bg-container-1 border-container-3 shadow-[0_4px_20px_rgba(21,18,13,0.5)]"
              }`}
            >
              {withdrawRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <FiDollarSign
                    className={`text-4xl mx-auto mb-4 transition-colors duration-300 ${
                      theme === "dark" ? "text-text-3" : "text-text-3"
                    }`}
                  />
                  <h3
                    className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                      theme === "dark" ? "text-text-1" : "text-text-1"
                    }`}
                  >
                    No Withdraw Requests
                  </h3>
                  <p
                    className={`transition-colors duration-300 ${
                      theme === "dark" ? "text-text-3" : "text-text-3"
                    }`}
                  >
                    There are currently no withdrawal requests to display.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b transition-colors duration-300 ${
                          theme === "dark"
                            ? "border-container-3 bg-forge-bg-raised/30"
                            : "border-container-3 bg-container-1"
                        }`}
                      >
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          User
                        </th>
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          Amount
                        </th>
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          Bank Details
                        </th>
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          Status
                        </th>
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          Created
                        </th>
                        <th
                          className={`px-6 py-4 text-left text-sm font-medium transition-colors duration-300 ${
                            theme === "dark" ? "text-text-1" : "text-text-1"
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawRequests.map((request) => (
                        <tr
                          key={request.id}
                          className={`border-b transition-colors duration-300 ${
                            theme === "dark"
                              ? "border-container-3 hover:bg-forge-bg-raised/30"
                              : "border-container-3 hover:bg-state-hover"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-container-1 bg-forge-ember rounded-full flex items-center justify-center">
                                <span className="text-text-1 text-sm font-bold">
                                  {request.accountHolderName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p
                                  className={`font-medium transition-colors duration-300 ${
                                    theme === "dark"
                                      ? "text-text-1"
                                      : "text-text-1"
                                  }`}
                                >
                                  {request.accountHolderName}
                                </p>
                                <p
                                  className={`text-sm transition-colors duration-300 ${
                                    theme === "dark"
                                      ? "text-text-3"
                                      : "text-text-3"
                                  }`}
                                >
                                  {request.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p
                              className={`font-semibold text-lg transition-colors duration-300 ${
                                theme === "dark"
                                  ? "text-forge-ember"
                                  : "text-forge-ember"
                              }`}
                            >
                              {formatCurrency(request.amount)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {/* Account Holder Name */}
                              <div className="flex items-center gap-2">
                                <FiUser className="text-sm text-forge-ember" />
                                <p
                                  className={`text-sm font-medium transition-colors duration-300 ${
                                    theme === "dark"
                                      ? "text-text-1"
                                      : "text-text-1"
                                  }`}
                                >
                                  {request.accountHolderName}
                                </p>
                              </div>

                              {/* Bank Details */}
                              <div className="bg-container-1 dark:bg-forge-bg-raised rounded-sm p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-text-3 dark:text-forge-ink-muted">
                                    Bank Name
                                  </span>
                                  <span className="text-sm text-text-1 dark:text-forge-ink">
                                    {request.bankName}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-text-3 dark:text-forge-ink-muted">
                                    Account Number
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-text-1 dark:text-forge-ink">
                                      {visibleAccountNumbers.has(request.id)
                                        ? request.accountNumber
                                        : request.accountNumber.replace(
                                            /\d(?=\d{4})/g,
                                            "*"
                                          )}
                                    </span>
                                    <button
                                      onClick={() =>
                                        toggleAccountVisibility(request.id)
                                      }
                                      className="text-text-3 hover:text-forge-ink-muted dark:hover:text-forge-ink"
                                    >
                                      {visibleAccountNumbers.has(request.id) ? (
                                        <FiEyeOff className="text-xs" />
                                      ) : (
                                        <FiEye className="text-xs" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(request.accountNumber)
                                      }
                                      className="text-text-3 hover:text-forge-ink-muted dark:hover:text-forge-ink"
                                    >
                                      <FiCopy className="text-xs" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-text-3 dark:text-forge-ink-muted">
                                    IFSC Code
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-text-1 dark:text-forge-ink">
                                      {request.ifscCode}
                                    </span>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(request.ifscCode)
                                      }
                                      className="text-text-3 hover:text-forge-ink-muted dark:hover:text-forge-ink"
                                    >
                                      <FiCopy className="text-xs" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* UPI Details (if available) */}
                              {request.upi && (
                                <div className="bg-container-1 bg-container-1 dark:from-purple-900/20 dark:to-blue-900/20 rounded-sm p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <FiSmartphone className="text-sm text-text-3" />
                                      <span className="text-xs font-medium text-text-3 dark:text-forge-ink-muted">
                                        UPI ID Available
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono text-text-1 dark:text-forge-ink">
                                      {request.upi}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          copyToClipboard(request.upi || "")
                                        }
                                        className="text-text-3 hover:text-forge-ink-muted dark:hover:text-forge-ink-muted"
                                      >
                                        <FiCopy className="text-xs" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          openUPIQR(request.upi || "")
                                        }
                                        className="flex items-center gap-1 px-2 py-1 bg-forge-ember-low hover:bg-forge-ember-low text-text-1 rounded text-xs transition-colors"
                                      >
                                        QR Code
                                        <FiExternalLink className="text-xs" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiCalendar
                                className={`text-sm transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-text-3"
                                    : "text-text-3"
                                }`}
                              />
                              <span
                                className={`text-sm transition-colors duration-300 ${
                                  theme === "dark"
                                    ? "text-text-3"
                                    : "text-text-3"
                                }`}
                              >
                                {formatDate(request.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {request.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateRequestStatus(
                                        request.id,
                                        "completed"
                                      )
                                    }
                                    disabled={updatingRequest === request.id}
                                    className="flex items-center gap-1 px-3 py-1 bg-forge-ember-low hover:bg-forge-ember-low disabled:bg-forge-ember-low/50 text-text-1 rounded-sm text-sm transition-all duration-200"
                                  >
                                    {updatingRequest === request.id ? (
                                      <FiRefreshCw className="text-xs animate-spin" />
                                    ) : (
                                      <FiCheck className="text-xs" />
                                    )}
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateRequestStatus(
                                        request.id,
                                        "rejected",
                                        "Rejected by admin"
                                      )
                                    }
                                    disabled={updatingRequest === request.id}
                                    className="flex items-center gap-1 px-3 py-1 bg-[forge-error-bg hover:bg-[forge-error-bg disabled:bg-[forge-error-bg/50 text-text-1 rounded-sm text-sm transition-all duration-200"
                                  >
                                    <FiX className="text-xs" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {request.status !== "pending" && (
                                <span
                                  className={`text-sm transition-colors duration-300 ${
                                    theme === "dark"
                                      ? "text-text-3"
                                      : "text-text-3"
                                  }`}
                                >
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* UPI QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-forge-bg/50 flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-md w-full rounded-sm border transition-all duration-300 ${
              theme === "dark"
                ? "bg-container-2 border-container-3"
                : "bg-container-1 border-container-3"
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    theme === "dark" ? "text-text-1" : "text-text-1"
                  }`}
                >
                  UPI QR Code
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className={`p-2 rounded-sm transition-colors duration-200 ${
                    theme === "dark"
                      ? "hover:bg-state-hover text-text-3"
                      : "hover:bg-state-hover text-text-3"
                  }`}
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="text-center space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-container-1 rounded-sm border-2 border-container-3">
                    <img
                      src={generateUPIQRCode(selectedUPI)}
                      alt="UPI QR Code"
                      className="w-64 h-64"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64," +
                          btoa(`<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
                            <rect width="256" height="256" fill="#f3f4f6"/>
                            <text x="128" y="128" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#6b7280">
                              QR Code not available
                            </text>
                          </svg>`);
                      }}
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div>
                  <p
                    className={`text-sm mb-2 transition-colors duration-300 ${
                      theme === "dark" ? "text-text-3" : "text-text-3"
                    }`}
                  >
                    UPI ID
                  </p>
                  <div
                    className={`p-3 rounded-sm border font-mono text-sm transition-colors duration-300 ${
                      theme === "dark"
                        ? "bg-container-2 border-container-3 text-text-1"
                        : "bg-container-1 border-container-3 text-text-1"
                    }`}
                  >
                    {selectedUPI}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => copyToClipboard(selectedUPI)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-forge-ember-low hover:bg-forge-ember-low text-text-1 rounded-sm transition-colors"
                  >
                    <FiCopy className="text-sm" />
                    Copy UPI ID
                  </button>
                  <button
                    onClick={() => {
                      const upiUrl = `upi://pay?pa=${selectedUPI}&pn=Payment&cu=INR`;
                      window.open(upiUrl, "_blank");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-forge-ember-low hover:bg-forge-ember-low text-text-1 rounded-sm transition-colors"
                  >
                    <FiSmartphone className="text-sm" />
                    Open UPI App
                  </button>
                </div>

                <p
                  className={`text-xs transition-colors duration-300 ${
                    theme === "dark" ? "text-text-3" : "text-text-3"
                  }`}
                >
                  Scan this QR code with any UPI app to make payment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
