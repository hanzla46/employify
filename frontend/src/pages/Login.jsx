import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { AuthContext } from "../Context/AuthContext";
import FancyButton from "../components/Button";

export function Login() {
  const { login } = useContext(AuthContext);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  if(user){
    handleSuccess("You are already logged in \n redirecting to account page...");
    setTimeout(() => {
      navigate("/account");
    }, 3500);
  }
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((oldInfo) => ({
      ...oldInfo,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, loginInfo[name]);
  };

  const validateField = (name, value) => {
    let error = "";
    
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Email is invalid";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const emailValid = validateField("email", loginInfo.email);
    const passwordValid = validateField("password", loginInfo.password);
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });
    
    return emailValid && passwordValid;
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    const { email, password } = loginInfo;
    
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
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-4/5 md:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
          Welcome Back
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Sign in to your account</p>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              type="email"
              name="email"
              value={loginInfo.email}
              placeholder="you@example.com"
              className={`w-full p-3 border ${
                errors.email && touched.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400">
                Forgot password?
              </Link>
            </div>
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
              name="password"
              value={loginInfo.password}
              placeholder="••••••••"
              className={`w-full p-3 border ${
                errors.password && touched.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 transition focus:ring-4 focus:ring-primary-300 focus:outline-none font-medium text-center flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-600 hover:text-primary-500 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}