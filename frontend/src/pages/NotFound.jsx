// src/pages/NotFound.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";
export function NotFound() {
  useEffect(() => {
    document.title = "You lost | Employify AI";
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8 text-center">
      <Ghost size={80} className="text-red-500 animate-bounce mb-6" />
      <h1 className="text-5xl font-extrabold tracking-wide mb-4">
        404 – Page Vanished 🔮
      </h1>
      <p className="text-lg text-gray-400 mb-8">
        Bruhhh... what you lookin' for ain't here. Maybe it never was. Maybe
        it’s hiding in the upside down. 👻
      </p>
      <div className="group">
          <Link
            to="/"
            className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 hover:from-green-400 hover:via-pink-500 hover:to-yellow-500 transition-all duration-500 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-pink-500/50 transform hover:scale-110 group-hover:animate-bounce"
          >
            <span className="mr-2">🏃‍♂️💨</span>
            GO HOME BEFORE IT'S TOO LATE
            <span className="ml-2">⚡🔥</span>
          </Link>
        </div>
      <p className="text-sm mt-10 text-gray-600 italic">
        Or keep wandering... risk is yours, legend.
      </p>
    </div>
  );
}
