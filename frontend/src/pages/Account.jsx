import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { handleSuccess } from "../utils";
import FancyButton from "../components/Button";
import { User, LogOut, Settings, CreditCard, Shield, History, Moon, Sun, CircleUserRound } from "lucide-react";
import { SkillsContext } from "../Context/SkillsContext";
export function Account() {
  useEffect(() => {
    document.title = "Account | Employify AI";
  }, []);
  const { setRoadmap } = useContext(SkillsContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.success) {
        handleSuccess("Logged out successfully");
        setRoadmap([]);
        localStorage.removeItem("roadmap");
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Add dark mode toggle logic here
    document.documentElement.classList.toggle("dark");
  };
  let uemail = "";
  if (user) {
    if (user.email.length > 22) {
      uemail = user.email.slice(0, 7) + "..." + user.email.slice(-6);
    } else {
      uemail = user.email;
    }
  }
  const userData = user
    ? {
        name: user.name.slice(0, 19) || "John Doe",
        email: uemail || "john.doe@example.com",
        avatar: user.avatar || "404",
        memberSince: user.memberSince || "January 2023",
      }
    : null;

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200'>
      <div className='container mx-auto px-4 py-12'>
        {user ? (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* Sidebar */}
            <div className='lg:col-span-3'>
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                <div className='flex flex-col items-center pb-6'>
                  {userData.avatar === "404" ? (
                    <CircleUserRound className='w-32 h-32 rounded-full mb-4 p-2 border-4 border-primary-500' />
                  ) : (
                    <img src={userData.avatar} alt='Profile' className='w-32 h-32 rounded-full mb-4 border-4 border-primary-500' />
                  )}
                  <h2 className='text-2xl font-bold text-primary-600 dark:text-primary-400'>{userData.name}</h2>
                  <p className='text-gray-600 dark:text-gray-400'>{userData.email}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>Member since {userData.memberSince}</p>
                </div>

                <div className='space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
                  <Link to='/profile'>
                    {" "}
                    <button className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                      <User size={18} className='mr-3 text-primary-500' />
                      Profile
                    </button>
                  </Link>
                  <button className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                    <Settings size={18} className='mr-3 text-primary-500' />
                    Settings
                  </button>
                  <button className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                    <CreditCard size={18} className='mr-3 text-primary-500' />
                    Billing
                  </button>
                  <button className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                    <Shield size={18} className='mr-3 text-primary-500' />
                    Security
                  </button>
                  <button className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                    <History size={18} className='mr-3 text-primary-500' />
                    Activity
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className='w-full flex items-center p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 font-medium'>
                    {darkMode ? <Sun size={18} className='mr-3 text-primary-500' /> : <Moon size={18} className='mr-3 text-primary-500' />}
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center p-3 text-left rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium mt-4'>
                    <LogOut size={18} className='mr-3' />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='lg:col-span-9'>
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6'>
                <h1 className='text-3xl font-bold mb-6 text-primary-600 dark:text-primary-400'>Account Dashboard</h1>

                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {/* Summary Cards */}
                  <div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600'>
                    <h3 className='font-semibold text-lg mb-2'>Subscription</h3>
                    <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>Pro Plan</div>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Renews on April 15, 2025</p>
                    <button className='mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'>
                      Manage Subscription
                    </button>
                  </div>

                  <div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600'>
                    <h3 className='font-semibold text-lg mb-2'>Usage</h3>
                    <div className='text-2xl font-bold text-primary-600 dark:text-primary-400'>68%</div>
                    <div className='w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full mt-2 mb-2'>
                      <div className='bg-primary-500 h-2 rounded-full' style={{ width: "68%" }}></div>
                    </div>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>680 of 1,000 credits used</p>
                  </div>

                  <div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600'>
                    <h3 className='font-semibold text-lg mb-2'>Security</h3>
                    <div className='text-2xl font-bold text-green-600 dark:text-green-400'>Protected</div>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>2FA is enabled</p>
                    <button className='mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'>
                      Review Security Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
                <h2 className='text-xl font-semibold mb-4'>Recent Activity</h2>
                <div className='space-y-4'>
                  {[
                    {
                      action: "Password Changed",
                      date: "March 10, 2025",
                      icon: Shield,
                    },
                    {
                      action: "Logged in from new device",
                      date: "March 8, 2025",
                      icon: User,
                    },
                    {
                      action: "Subscription renewed",
                      date: "March 1, 2025",
                      icon: CreditCard,
                    },
                  ].map((item, index) => (
                    <div key={index} className='flex items-start p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700'>
                      <div className='p-2 bg-primary-50 dark:bg-primary-900/20 rounded-full mr-4'>
                        <item.icon size={20} className='text-primary-600 dark:text-primary-400' />
                      </div>
                      <div>
                        <p className='font-medium'>{item.action}</p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className='mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'>
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center min-h-[60vh] text-center'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400'>
              Join Our Community
            </h1>
            <p className='text-xl max-w-lg mx-auto mb-8 text-gray-600 dark:text-gray-400'>
              Sign up to access your account dashboard and unlock all the features we have to offer.
            </p>
            <div className='flex gap-4'>
              <Link to='/login'>
                <button className='px-8 py-3 rounded-lg bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-medium border border-primary-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition'>
                  Log In
                </button>
              </Link>
              <Link to='/signup'>
                <FancyButton text='Sign Up' />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
