import { createContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  let dev_env = false;
  const url = dev_env
    ? "http://localhost:8000"
    : "https://employify-backend.vercel.app";
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(url + "/auth/me", {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed69:", error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        url + "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data);
      console.log(res);
      return { success: true, message: res.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post(
        url + "/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );
      console.log(res);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  // Logout function
  const logout = async () => {
    await axios.post(url + "/auth/logout", {}, { withCredentials: true });
    setUser(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
