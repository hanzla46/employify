import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Interview } from "./pages/Interview";
import { Roadmap } from "./pages/Roadmap";
import { Jobs } from "./pages/Jobs";
import { Pricing } from "./pages/Pricing";
import { About } from "./pages/About";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup";
import { Account } from "./pages/Account.jsx";
import Dashboard from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { SkillsProvider } from "./Context/SkillsContext.jsx";
import { ToastContainer } from "./utils.jsx";
import { ScrollToTop } from "./components/ScrollToTop";
import { JobsProvider } from "./Context/JobsContext.jsx";
import Profile from "./pages/Profile";
import FeedbackPage from "./pages/Feedbacks.jsx";
function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      <ToastContainer darkMode={darkMode} />
      <AuthProvider>
        <SkillsProvider>
          <JobsProvider>
            <Router>
              <div className='min-h-screen w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200'>
                <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
                <ScrollToTop />
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/account' element={<Account />} />
                  <Route path='/home' element={<Home />} />
                  <Route path='/login' element={<Login />} />
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/interview' element={<Interview />} />
                  <Route path='/roadmap' element={<Roadmap />} />
                  <Route path='/profile/*' element={<Profile />} />
                  <Route path='/jobs' element={<Jobs />} />
                  <Route path='/pricing' element={<Pricing />} />
                  <Route path='/about' element={<About />} />
                  <Route path='/feedbacks' element={<FeedbackPage />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </JobsProvider>
        </SkillsProvider>
      </AuthProvider>
    </>
  );
}

export default App;
