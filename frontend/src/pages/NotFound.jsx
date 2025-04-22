// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';
export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8 text-center">
      <Ghost size={80} className="text-red-500 animate-bounce mb-6" />
      <h1 className="text-5xl font-extrabold tracking-wide mb-4">404 – Page Vanished 🔮</h1>
      <p className="text-lg text-gray-400 mb-8">
        Bruhhh... what you lookin' for ain't here. Maybe it never was. Maybe it’s hiding in the upside down. 👻
      </p>
      <Link
        to="/"
        className="bg-red-600 hover:bg-red-700 transition-all px-6 py-3 rounded-full text-white font-bold"
      >
        🏃‍♂️⬅️ Go Home Before It's Too Late
      </Link>
      <p className="text-sm mt-10 text-gray-600 italic">Or keep wandering... risk is yours, legend.</p>
    </div>
  );
}
