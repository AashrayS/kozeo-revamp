"use client";

import storeItems from "../../../data/store.json";
import { FiSearch, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getUserWallet } from "../../../utilities/kozeoApi";
import { useSelector } from "react-redux";
import { Spotlight } from "@/components/core/spotlight";

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

      {/* Glow Effects */}
      {theme === "dark" && (
        <>
          <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
          <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90  pointer-events-none z-0" />
        </>
      )}

      {/* Main Layout */}
      <div className="min-h-screen relative z-10 flex flex-row theme-transition">

        <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-20 lg:pb-6">
          {/* Search Bar */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search items..."
                className="kozeo-input !rounded-full pl-5 pr-11 py-3 text-sm shadow-xs"
              />
              <button className="absolute top-1/2 right-3.5 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                <FiSearch className="text-lg" />
              </button>
            </div>
          </div>

          {/* Store Closed Banner */}
          <div className="w-full mb-8 p-6 md:p-8 kozeo-card text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Store Coming Soon
              </h3>
            </div>
            <p className="text-sm text-text-3 max-w-2xl mx-auto leading-relaxed">
              We're curating an exclusive collection of premium developer
              merchandise and tools. Stay tuned for the official launch of the
              Kozeo Store. You can still check out our existing products in the
              meantime and add them to cart!
            </p>
          </div>

          {/* Store Heading */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Kozeo Store
            </h2>
            <div className="kozeo-badge text-xs px-3 py-1 font-semibold">
              Available: ₹{isLoadingWallet ? "..." : walletBalance.toFixed(2)}
            </div>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col justify-between kozeo-card p-5 group overflow-hidden"
              >
                <Spotlight className="bg-zinc-500/15 dark:bg-zinc-200/10 blur-2xl" size={140} />
                <img
                  src={item.displayPicture}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-2xl mb-4 border border-black/5 dark:border-white/10"
                />

                <div className="mb-3">
                  <h3 className="text-base font-bold tracking-tight text-black dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-3 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.type.toLowerCase() === "tshirt" && (
                  <select className="kozeo-input !py-1.5 !px-3 text-xs mb-3">
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                  </select>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10">
                  <span className="text-base font-bold tracking-tight text-black dark:text-white">
                    ₹{item.creditsAmount}
                  </span>
                  <button
                    onClick={() => toggleCartItem(item)}
                    className={
                      cart.includes(item.id)
                        ? "kozeo-btn-secondary !px-3 !py-1.5 !text-xs !bg-red-500/10 !text-red-500 !border-red-500/20"
                        : "kozeo-btn-primary !px-3 !py-1.5 !text-xs"
                    }
                  >
                    {cart.includes(item.id) ? "Remove" : <><FiPlus size={14} /> Add</>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Button */}
          {cart.length > 0 && (
            <div className="mt-10 flex justify-center">
              <button className="kozeo-btn-primary !py-3.5 !px-8 shadow-xl text-base">
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
