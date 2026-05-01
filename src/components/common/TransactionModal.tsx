import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiX,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCalendar,
  FiHash,
  FiDollarSign,
} from "react-icons/fi";

interface WithdrawalTransaction {
  id: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_Picture?: string;
  };
  walletId: string;
  baseAmount: number;
  date: string;
  transactionNumber: string;
  transactionCharges: number;
  commission: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface GigTransaction {
  id: string;
  sender: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_Picture?: string;
  };
  receiver: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    profile_Picture?: string;
  };
  baseAmount: number;
  gigId: string;
  gigTitle: string;
  date: string;
  transactionNumber: string;
  transactionCharges: number;
  commission: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletData {
  userId: string;
  currency: string;
  amount: number;
  withdrawalTransactions: WithdrawalTransaction[];
  gigTransactions: GigTransaction[];
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletData: WalletData | null;
  currency?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  walletData,
  currency = "USD",
}) => {
  const { theme } = useTheme();
  const [displayedTransactions, setDisplayedTransactions] = useState(10);

  // Combine and sort all transactions by date
  const allTransactions = React.useMemo(() => {
    if (!walletData) return [];

    const withdrawal = walletData.withdrawalTransactions.map((tx) => ({
      ...tx,
      type: "withdrawal" as const,
      title: "Wallet Withdrawal",
      relatedUser: tx.user,
    }));

    const gig = walletData.gigTransactions.map((tx) => ({
      ...tx,
      type: "gig" as const,
      title: tx.gigTitle,
      relatedUser: tx.receiver,
    }));

    return [...withdrawal, ...gig].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [walletData]);

  const visibleTransactions = allTransactions.slice(0, displayedTransactions);
  const hasMore = displayedTransactions < allTransactions.length;

  const loadMoreTransactions = () => {
    setDisplayedTransactions((prev) => prev + 10);
  };

  // Currency conversion rates (you might want to fetch these from an API)
  const currencyRates: { [key: string]: number } = {
    USD: 83.0, // 1 USD = 83 INR (approximate)
    EUR: 90.0, // 1 EUR = 90 INR (approximate)
    GBP: 105.0, // 1 GBP = 105 INR (approximate)
    AUD: 55.0, // 1 AUD = 55 INR (approximate)
    CAD: 61.0, // 1 CAD = 61 INR (approximate)
    INR: 1.0, // Base currency
    // Add more currencies as needed
  };

  const convertToINR = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === "INR") return amount;
    const rate = currencyRates[fromCurrency] || 1;
    return amount * rate;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiClock className="text-yellow-500" />;
      case "failed":
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return theme === "light"
          ? "text-green-600 bg-green-50"
          : "text-green-400 bg-green-900/30";
      case "pending":
        return theme === "light"
          ? "text-yellow-600 bg-yellow-50"
          : "text-yellow-400 bg-yellow-900/30";
      case "failed":
      case "cancelled":
        return theme === "light"
          ? "text-red-600 bg-red-50"
          : "text-red-400 bg-red-900/30";
      default:
        return theme === "light"
          ? "text-gray-600 bg-gray-50"
          : "text-gray-400 bg-gray-900/30";
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

  const formatAmount = (amount: number, fromCurrency?: string) => {
    // Determine the source currency
    const sourceCurrency = fromCurrency || walletData?.currency || currency;

    // Convert to INR if needed
    const amountInINR = convertToINR(amount, sourceCurrency);

    // Always format in INR
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amountInINR);

    // Add conversion note if currency was converted
    if (sourceCurrency !== "INR") {
      return `${formatted} (from ${amount.toFixed(2)} ${sourceCurrency})`;
    }

    return formatted;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border-0 relative drop-shadow-glow backdrop-blur-md overflow-hidden theme-transition ${
            theme === "light"
              ? "bg-white/95 border-gray-200"
              : "bg-neutral-900/95 border-neutral-800"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2
              className={`text-2xl font-light tracking-tight ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Transaction History
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all duration-200 ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
              }`}
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {visibleTransactions.length === 0 && (
              <div
                className={`text-center py-12 ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <FiDollarSign className="mx-auto mb-4 text-4xl opacity-50" />
                <p className="text-lg mb-2">No transactions found</p>
                <p className="text-sm">
                  Your transaction history will appear here once you start
                  making transactions.
                </p>
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-4">
              {visibleTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`p-4 md:p-6 rounded-xl border backdrop-blur-sm theme-transition ${
                    theme === "light"
                      ? "bg-white/60 border-gray-200/50 hover:bg-white/80"
                      : "bg-neutral-800/30 border-neutral-700/50 hover:bg-neutral-800/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left side - Transaction info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(transaction.status)}
                        <h3
                          className={`text-lg font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          {transaction.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            transaction.type === "withdrawal"
                              ? theme === "light"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-blue-900/30 text-blue-300"
                              : theme === "light"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-purple-900/30 text-purple-300"
                          }`}
                        >
                          {transaction.type === "withdrawal"
                            ? "Withdrawal"
                            : "Gig Payment"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <FiHash className="text-cyan-400" />
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {transaction.transactionNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-cyan-400" />
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiUser className="text-purple-400" />
                          <span
                            className={`${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-gray-400"
                            }`}
                          >
                            {transaction.type === "withdrawal" ? "User" : "To"}:
                            @{transaction.relatedUser.username}
                          </span>
                        </div>

                        {transaction.type === "gig" && (
                          <div className="flex items-center gap-2">
                            <FiUser className="text-green-400" />
                            <span
                              className={`${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              From: @
                              {(transaction as GigTransaction).sender.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Amount */}
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold mb-1 ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {formatAmount(
                          transaction.baseAmount,
                          walletData?.currency || "INR"
                        )}
                      </div>
                      {transaction.transactionCharges > 0 && (
                        <div
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Charges:{" "}
                          {formatAmount(
                            transaction.transactionCharges,
                            walletData?.currency || "INR"
                          )}
                        </div>
                      )}
                      {transaction.commission > 0 && (
                        <div
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Commission:{" "}
                          {formatAmount(
                            transaction.commission,
                            walletData?.currency || "INR"
                          )}
                        </div>
                      )}
                      <div
                        className={`text-sm font-medium ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Total:{" "}
                        {formatAmount(
                          transaction.total,
                          walletData?.currency || "INR"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMoreTransactions}
                  className={`px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    theme === "light"
                      ? "bg-white/60 border-gray-200/50 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-300"
                      : "bg-neutral-800/50 border-neutral-700/50 text-cyan-400 hover:bg-cyan-950/30 hover:border-cyan-600/50"
                  }`}
                >
                  Load More (
                  {allTransactions.length - visibleTransactions.length}{" "}
                  remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
