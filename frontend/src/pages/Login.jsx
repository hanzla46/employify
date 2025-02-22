import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { AuthContext } from "../Context/AuthContext";
import FancyButton from "../components/Button";
export function Login() {
  const { login } = useContext(AuthContext);
  const { setUser } = useContext(AuthContext);
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
      const res = await login(email, password);
      if (res.success) {
        handleSuccess("Logged in Successfully");
        setTimeout(() => {
          navigate("/");
        }, 2500);
      } else {
        handleError(res.message);
      }
    } catch (error) {
      return handleError(error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 mt-0 md:mt-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pb-3">
        Login
        </h1>
      </div>
      <form className="w-4/5 md:w-1/3" onSubmit={handleLogin}>
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
          className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        <span className="pr-4"> Don't have an account? </span>
        <Link to={"/signup"}>
          <FancyButton text={"SignUp Here"} />
        </Link>
      </p>
      <ToastContainer />
    </div>
  );
}
