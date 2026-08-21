import React from "react";
import { Search, User, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

function TopBar() {
  const links = ["Home", "Gift", "Order", "Pay", "Store", "Corporate Gifting"];

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white flex-wrap gap-4">
      <div className="flex items-center gap-10 flex-wrap">
        <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold">
          <img
            src="/logo of starbucks.png"
            alt="Starbucks Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <nav className="flex items-center gap-8 flex-wrap">
          {links.map((link, i) => (
            <a
              key={link}
              href="#"
              className={
                i === 0
                  ? "text-green-800 font-semibold border-b-2 border-green-800 pb-1"
                  : "text-gray-700 hover:text-green-800"
              }
            >
              {link}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 w-72">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Looking for something specific?"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
        <div className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center">
          <User size={18} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
}

function SignInStrip() {
  return (
    <div className="flex items-center justify-between px-8 py-3 bg-green-950 text-white flex-wrap gap-3">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles size={16} className="text-yellow-400" />
        <span>
          Sign in to <span className="text-yellow-400">Earn Stars</span> on every order
        </span>
      </div>
      <button className="bg-white text-green-950 text-sm font-medium px-4 py-2 rounded-full">
        Know More
      </button>
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="px-8 pt-8 pb-4 bg-[#f2ede3]">
      <div
        className="relative rounded-xl overflow-hidden px-10 py-14 bg-cover bg-center"
        style={{
          backgroundImage:
             "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow z-10">
          <ArrowLeft size={18} className="text-green-800" />
        </button>

        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow z-10">
          <ArrowRight size={18} className="text-green-800" />
        </button>

        <div className="relative z-10 ml-0 sm:ml-24 max-w-md">
          <h1 className="text-3xl font-bold text-white mb-3">
            New this season
          </h1>

          <p className="text-white/90 mb-6">
            Cozy up with new handcrafted beverages and protein treats
          </p>

          <button className="bg-green-900 text-white px-6 py-3 rounded-full font-medium hover:bg-green-800 transition">
            Buy Now
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <div className="w-16 h-1.5 bg-green-800 rounded-full" />
        <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

function Curations() {
  const categories = [
    {
      name: "New launch",
      color: "bg-pink-200",
      image: "/NewlyLaunchednew.webp",
    },
    {
      name: "Bestseller",
      color: "bg-orange-200",
      image: "/Bestseller01.webp",
    },
    {
      name: "Drinks",
      color: "bg-yellow-200",
      image: "/Drinks.webp",
    },
    {
      name: "Food",
      color: "bg-red-200",
      image: "/Foodnew.webp",
    },
    {
      name: "Merchandise",
      color: "bg-teal-200",
      image: "/Merchandisenew.webp",
    },
    {
      name: "Coffee At Home",
      color: "bg-amber-200",
      image: "/CoffeeAtHome.webp",
    },
    
  ];

  return (
    <div className="px-8 py-10 bg-[#f2ede3]">
      <h2 className="text-2xl font-bold text-green-950 mb-6">
        Handcrafted Curations
      </h2>

      <div className="flex gap-8 flex-wrap">
        {categories.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`w-28 h-28 rounded-full overflow-hidden ${item.color}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="font-semibold text-green-950 text-sm">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div clas