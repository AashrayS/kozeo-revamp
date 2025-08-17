"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import storeItems from "../../../data/store.json";
import { FiSearch, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getUserWallet } from "../../../utilities/kozeoApi";
import { useSelector } from "react-redux";

export interface StoreItem {
  id: number;
  title: string;
  description: string;
  displayPicture: string;
  type: string; // e.g., "tshirt", "mug", etc.
  amount: number;
}

export default function StorePage() {
  const { theme } = useTheme();
  const { user } = useSelector((state: any) => state.user);
  const [cart, setCart] = useState<number[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(true);

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (user?.id) {
        try {
          setIsLoadingWallet(true);
          const walletData = await getUserWallet(user.id, "INR");
          setWalletBalance((walletData as any)?.amount || 0);
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          setWalletBalance(0);
        } finally {
          setIsLoadingWallet(false);
        }
      } else {
        setIsLoadingWallet(false);
      }
    };

    fetchWalletBalance();
  }, [user?.id]);

  const toggleCartItem = (item: any) => {
    setCart((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  return (
    <>
      <Header logoText="Kozeo" />

      {/* Glow Effects */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />
        </>
      )}

      {/* Main Layout */}
      <div
        className={`min-h-screen relative z-10 flex flex-row transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white"
            : "bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 text-gray-900"
        }`}
      >
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Search Bar */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search items..."
                className={`w-full py-2 pl-4 pr-10 rounded-md border focus:outline-none focus:ring-2 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-700 placeholder-gray-400 focus:ring-neutral-600 text-white"
                    : "bg-white border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                }`}
              />
              <button
                className={`absolute top-1/2 right-2 -translate-y-1/2 transition-colors duration-300 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiSearch className="text-xl" />
              </button>
            </div>
          </div>

          {/* Store Closed Banner */}
          <div
            className={`w-full mb-8 p-6 rounded-xl border transition-all duration-300 ${
              theme === "dark"
                ? "border-neutral-700 bg-gradient-to-r from-neutral-900/50 to-neutral-800/50 text-gray-300"
                : "border-gray-200 bg-gradient-to-r from-gray-50 to-white text-gray-700 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  theme === "dark" ? "bg-cyan-400" : "bg-blue-500"
                }`}
              ></div>
              <h3
                className={`text-xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Store Coming Soon
              </h3>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  theme === "dark" ? "bg-cyan-400" : "bg-blue-500"
                }`}
              ></div>
            </div>
            <p
              className={`text-center leading-relaxed ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              We're curating an exclusive collection of premium developer
              merchandise and tools. Stay tuned for the official launch of the
              Kozeo Store. You can still checkout our existing products in the
              meantime and add them to cart!
            </p>
          </div>

          {/* Store Heading */}
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-2xl font-bold transition-colors duration-300 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Kozeo Store
            </h2>
            <span className="text-emerald-400 font-semibold text-lg">
              Available: ₹{isLoadingWallet ? "..." : walletBalance.toFixed(2)}
            </span>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-lg p-4 shadow-md hover:scale-[1.02] transition-all duration-300 text-sm ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#111] to-[#1a1a1a] hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_rgba(168,85,247,0.08))]"
                    : "bg-white/90 hover:bg-white border border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                <img
                  src={item.displayPicture}
                  alt={item.title}
                  className="w-full h-80 object-cover rounded-md mb-3"
                />

                <div className="mb-2">
                  <h3
                    className={`text-base font-semibold transition-colors duration-300 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {item.type.toLowerCase() === "tshirt" && (
                  <select
                    className={`w-full mb-2 border text-xs p-1 rounded-md transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-neutral-800 border-neutral-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                  </select>
                )}

                <div className="flex justify-between items-center mt-1">
                  <span className="text-emerald-400 font-semibold text-sm">
                    ₹{item.creditsAmount}
                  </span>
                  <button
                    onClick={() => toggleCartItem(item)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      cart.includes(item.id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-emerald-400 text-black hover:bg-emerald-500"
                    }`}
                  >
                    {cart.includes(item.id) ? "Remove" : <FiPlus size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Button */}
          {cart.length > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                className={`border font-semibold tracking-wide shadow-lg py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  theme === "dark"
                    ? "border-neutral-700 hover:from-fuchsia-600 hover:to-cyan-500 text-white"
                    : "border-gray-300 bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <FaShoppingCart className="text-lg" />
                Items added to cart ({cart.length}{" "}
                {cart.length === 1 ? "item" : "items"})
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
