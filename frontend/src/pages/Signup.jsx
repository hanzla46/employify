import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { handleError, handleSuccess } from "../utils";
import FancyButton from "../components/Button";

export function Signup() {
  const { user, loading, setUser } = useContext(AuthContext);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      handleSuccess("Already loggedin \n Redirecting to account page...");
      setTimeout(() => {
        navigate("/account");
      }, 3500);
    }
  }, []);
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((oldInfo) => ({
      ...oldInfo,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Check password strength on change
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, signupInfo[name]);
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }

    let score = 0;
    let message = "";

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message based on score
    if (score <= 2) message = "Weak";
    else if (score <= 3) message = "Moderate";
    else if (score <= 4) message = "Strong";
    else message = "Very strong";

    setPasswordStrength({ score, message });
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value) {
        error = "Name is required";
      } else if (value.length < 3) {
        error = "Name must be at least 3 characters long";
      } else if (value.length > 20) {
        error = "Name must be less than 20 characters long";
      }
    } else if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Email is invalid";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters long";
      } else if (passwordStrength.score < 3) {
        error = "Password is too weak";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== signupInfo.password) {
        error = "Passwords don't match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const nameValid = validateField("name", signupInfo.name);
    const emailValid = validateField("email", signupInfo.email);
    const passwordValid = validateField("password", signupInfo.password);
    const confirmPasswordValid = validateField(
      "confirmPassword",
      signupInfo.confirmPassword
    );

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return nameValid && emailValid && passwordValid && confirmPasswordValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const { name, email, password } = signupInfo;

    try {
      const res = await signup(name, email, password);
      if (res.success) {
        handleSuccess("Signed up successfully");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        handleError(res.message);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-green-500";
    return "bg-green-600";
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-4/5 md:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 mt-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
          Create Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
          Join our community today
        </p>

        <form className="space-y-3" onSubmit={handleSignup}>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0.5"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              name="name"
              value={signupInfo.name}
              placeholder="John Doe"
              className={`w-full p-3 border ${
                errors.name && touched.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.name && touched.name && (
              <p className="mt-0.5 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

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
              value={signupInfo.email}
              placeholder="you@example.com"
              className={`w-full p-3 border ${
                errors.email && touched.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
              name="password"
              value={signupInfo.password}
              placeholder="••••••••"
              className={`w-full p-3 border ${
                errors.password && touched.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {signupInfo.password && (
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <div className="flex space-x-1 w-full">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        className={`h-1 w-full rounded-full ${
                          index <= passwordStrength.score
                            ? getStrengthColor()
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      ></div>
                    ))}
                  </div>
                  {passwordStrength.message && (
                    <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                      {passwordStrength.message}
                    </span>
                  )}
                </div>
              </div>
            )}
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              onChange={handleChange}
              onBlur={handleBlur}
              type="password"
              name="confirmPassword"
              value={signupInfo.confirmPassword}
              placeholder="••••••••"
              className={`w-full p-3 border ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition bg-white dark:bg-gray-700 dark:text-white`}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 transition focus:ring-4 focus:ring-primary-300 focus:outline-none font-medium text-center flex items-center justify-center mt-6"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
