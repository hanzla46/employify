import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Brain, BookOpen, Briefcase, MessageSquare, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export function Home() {
  const {user} = useContext(AuthContext);
  useEffect(() => {
    AOS.init({
      duration: 1500, // Animation duration in milliseconds
    });
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 w-full">
        {/* Hero Section */}
        <header className="py-16 lg:py-24" data-aos="fade-right">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6"  data-aos="fade-left">
                <Brain className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Your AI-Powered Career Coach
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Master interviews, discover perfect job matches, and accelerate your career growth with personalized AI guidance
              </p>
              <Link  data-aos="fade-up"
                to={user ? "/interview" : "/signup"}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors inline-flex items-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>

            <div className="relative" data-aos="fade-down">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80"
                alt="AI Interview Platform"
                className="rounded-2xl shadow-2xl max-w-full"
              />
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50" data-aos="fade-left">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Transform Your Career Journey</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Link to="/interview">
                <FeatureCard data-aos="fade-down"
                  icon={MessageSquare}
                  title="AI Mock Interviews"
                  description="Practice with our AI interviewer that adapts to your responses and provides real-time feedback"
                />
              </Link>
              <Link to="/jobs">
                <FeatureCard data-aos="fade-up"
                  icon={Briefcase}
                  title="Smart Job Matching"
                  description="Discover opportunities that perfectly align with your skills and career aspirations"
                />
              </Link>
              <Link to="/skills">
                <FeatureCard data-aos="fade-down"
                  icon={BookOpen}
                  title="Personalized Learning"
                  description="Get customized learning paths to acquire the skills needed for your dream role"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 dark:bg-gray-800/50" data-aos="fade-right">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div data-aos="fade-up">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">95%</div>
                <p className="text-gray-600 dark:text-gray-300">Interview Success Rate</p>
              </div>
              <div data-aos="fade-down">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">10k+</div>
                <p className="text-gray-600 dark:text-gray-300">Career Transitions</p>
              </div>
              <div data-aos="fade-up">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">500+</div>
                <p className="text-gray-600 dark:text-gray-300">Skills Paths</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 dark:bg-indigo-900" data-aos="fade-left">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Ready to Accelerate Your Career?</h2>
            <Link data-aos="fade-right"
              to="/pricing"
              className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
            >
              Start Your Journey
              <Target className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
