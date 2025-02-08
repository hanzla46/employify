import React from "react";
import { Link } from 'react-router-dom'

export function Login() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div>
        {" "}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login
        </h2>
      </div>
      <form>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Don't have an account?
        <Link to={"/signup"}>Signup</Link>
      </p>
    </div>
  );
}
