import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../Context/AuthContext";
import { handleError, handleSuccess } from "../utils";
import FancyButton from "../components/Button";
export function Signup() {
  const { setUser } = useContext(AuthContext);
  const { signup } = useContext(AuthContext);
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((oldInfo) => ({
      ...oldInfo,
      [name]: value,
    }));
  };

  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("All fields are required!");
    }
    if(password.length < 8){
      return handleError("Password must be atleast 8 characters long");
    }
    if(name.length < 3){
      return handleError("Name must be atleast 3 characters long");
    }
    if(name.length > 20){ 
      return handleError("Name must be less than 20 characters long");
    }
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        handleSuccess("SignedUp Successfuly");
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
      <h1 className="text-4xl md:text-6xl font-bold mb-6 mt-0 md:mt-5 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 pb-3">
        SignUp
        </h1>
      </div>
      <form className="w-4/5 md:w-1/3" onSubmit={handleSignup}>
        <label
          className="text-xl text-gray-500 text-center mt-6"
          htmlFor="name"
        >
          Name:
        </label>
        <input
          onChange={handleChange}
          type="text"
          name="name"
          required
          placeholder="Full Name"
          className="w-full p-3 mb-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
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
          className="w-full bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 transition"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
       <span className="pr-4"> Already have an account? </span>
        <Link to={"/login"}><FancyButton text={"Login Here"} /></Link>
      </p>
      <ToastContainer />
    </div>
  );
}
