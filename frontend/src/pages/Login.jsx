import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
export function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((oldInfo) => ({
      ...oldInfo,
      [name]: value,
    }));
  };

  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("All fields are required!");
    }
    try {
      const url = "http://localhost:8000/auth/login";
      console.log(url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { success, message, error, name, jwtToken } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedIn", name);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else if (error) {
        const details = error.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
    } catch (error) {
      return handleError(error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login{" "}
        </h2>
      </div>
      <form onSubmit={handleLogin}>
        <label
          className="text-xl text-gray-500 text-center mt-6"
          htmlFor="email"
        >
          Email:
        </label>
        <input
          onChange={handleChange}
          type="email"
          name="email"
          required
          placeholder="Email"
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <label
          className="text-xl text-gray-500 text-center mt-6"
          htmlFor="password"
        >
          Password:
        </label>
        <input
          onChange={handleChange}
          type="password"
          name="password"
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
        <Link to={"/signup"}>Signup Here</Link>
      </p>
      <ToastContainer />
    </div>
  );
}
