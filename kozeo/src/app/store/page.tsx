"use client";

import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import storeItems from "../../../data/store.json";
import { FiSearch, FiPlus } from "react-icons/fi";
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

export interface StoreItem {
  id: number;
  title: string;
  description: string;
  displayPicture: string;
  type: string; // e.g., "tshirt", "mug", etc.
  creditsAmount: number;
}

export default function StorePage() {
  //   const [cart, setCart] = useState([]);
  const [cart, setCart] = useState<number[]>([]);

  const toggleCartItem = (item: StoreItem) => {
    setCart((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };
  let availableCredits = 100;

  return (
    <>
      <Header logoText="Kozeo" />

      {/* Glow Effects */}
      <div className="fixed top-56 right-4 w-2 h-0 rounded-full opacity-90 bg-purple-500 shadow-[0_0_250px_100px_rgba(168,85,247,0.35)] pointer-events-none z-0" />
      <div className="fixed bottom-4 left-4 w-2 h-0 rounded-full opacity-90 bg-cyan-400 shadow-[0_0_250px_100px_rgba(34,211,238,0.35)] pointer-events-none z-0" />

      {/* Main Layout */}
      <div className="min-h-screen relative z-10 flex flex-row bg-[radial-gradient(circle_at_center,_rgba(17,17,17,0.8),_rgba(0,0,0,0.6))] text-white">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Search Bar */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full py-2 pl-4 pr-10 rounded-md bg-neutral-900 border border-neutral-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <button className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-white">
                <FiSearch className="text-xl" />
              </button>
            </div>
          </div>

          {/* Store Heading */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Kozeo Store</h2>
            <span className="text-emerald-400 font-semibold text-lg">
              Available : {availableCredits} Credits
            </span>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="hover:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_rgba(168,85,247,0.08))] 
             relative flex flex-col justify-between 
             bg-gradient-to-br from-[#111] to-[#1a1a1a] 
             rounded-lg p-4 shadow-md hover:scale-[1.02] 
             transition-transform text-sm"
              >
                <img
                  src={item.displayPicture}
                  alt={item.title}
                  className="w-full h-80 object-cover rounded-md mb-3"
                />

                <div className="mb-2">
                  <h3 className="text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-base text-gray-100">{item.description}</p>
                </div>

                {item.type.toLowerCase() === "tshirt" && (
                  <select className="w-full mb-2 bg-neutral-800 border border-neutral-600 text-xs text-white p-1 rounded-md">
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                  </select>
                )}

                <div className="flex justify-between items-center mt-1">
                  <span className="text-emerald-400 font-semibold text-sm">
                    {item.creditsAmount} Credits
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
                className=" border border-neutral-700
             hover:from-fuchsia-600 hover:to-cyan-500 
             text-white font-semibold tracking-wide shadow-lg 
             py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <FaShoppingCart className="text-lg" />
                Proceed to Checkout ({cart.length}{" "}
                {cart.length === 1 ? "item" : "items"})
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
