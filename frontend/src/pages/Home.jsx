import React, { useEffect, useState, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Brain,
  BookOpen,
  Briefcase,
  MessageSquare,
  Target,
  ArrowRight,
  UserCheck,
  Zap,
  Search,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

function FeatureCard({ icon: Icon, title, description, color = "indigo" }) {
  return (
    <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] border border-gray-100 dark:border-gray-700 backdrop-blur-sm h-auto">
      <div
        className={`h-14 w-14 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center mb-6`}
      >
        <Icon className={`h-7 w-7 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-auto">
        {description}
      </p>
    </div>
  );
}
function HowItWorksStep({ icon: Icon, title, description, step }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="absolute -top-2 -right-2 bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
}
function Testimonial({ quote, author, role, avatar }) {
  return (
    <div className="bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
      <p className="text-gray-700 dark:text-gray-200 italic mb-6 leading-relaxed">
        "{quote}"
      </p>
      <div className="flex items-center">
        <img
          src={avatar}
          alt={author}
          className="h-12 w-12 rounded-full mr-4 object-cover"
        />
        <div>
          <p className="font-semibold dark:text-white">{author}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { user } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  return (
    <div className="pt-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero Section with 3D elements and gradient backgrounds */}
        <header className="py-20 lg:py-28 relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-96 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-96 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-700/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16" data-aos="fade-up">
              <div className="inline-flex items-center justify-center mb-6 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <Brain className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-600 dark:from-indigo-400 dark:via-primary-400 dark:to-purple-400 leading-tight">
                Your AI-Powered
                <br />
                Career Coach
              </h1>
              <p className="text-xl md:text-xl text-gray-800 dark:text-gray-300 mb-10 max-w-3xl mx-auto font-light">
                Master interviews, discover perfect job matches, and accelerate
                your career growth with personalized AI guidance
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={user ? "/interview" : "/signup"}
                  className="bg-gradient-to-r from-[var(--color-primary-700)] to-purple-600 dark:from-[var(--color-primary-300)] dark:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-indigo-500/25 inline-flex items-center justify-center text-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-md inline-flex items-center justify-center text-lg"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {/* Modern glass-morphism effect with border */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-sm pointer-events-none"></div>

              <img
                src="https://burst.shopifycdn.com/photos/person-using-laptop.jpg?exif=0&iptc=0"
                alt="AI Interview Platform"
                className="rounded-3xl w-full transform transition-transform hover:scale-105 duration-700"
              />

              {/* Floating UI elements */}
              <div
                className="absolute top-10 right-10 bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 max-w-xs hidden lg:block"
                data-aos="fade-left"
                data-aos-delay="400"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-semibold dark:text-white">
                    Interview Success Rate
                  </p>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "95%" }}
                  ></div>
                </div>
              </div>

              <div
                className="absolute bottom-10 left-10 bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hidden lg:block"
                data-aos="fade-right"
                data-aos-delay="600"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      10,000+
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Career Transitions
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section with better visual hierarchy */}
        <section className="py-24 relative" data-aos="fade-up">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
                FEATURES
              </span>
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                Transform Your Career Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Powerful tools designed to help you succeed in today's
                competitive job market
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link
                to="/interview"
                className="transition-all duration-300 hover:scale-105"
              >
                <FeatureCard
                  icon={MessageSquare}
                  title="AI Mock Interviews"
                  description="Practice with our AI interviewer that adapts to your responses and provides real-time feedback to improve your performance"
                  color="indigo"
                />
              </Link>
              <Link
                to="/jobs"
                className="transition-all duration-300 hover:scale-105"
              >
                <FeatureCard
                  icon={Briefcase}
                  title="Smart Job Matching"
                  description="Discover opportunities that perfectly align with your skills and career aspirations using our advanced AI matching algorithm"
                  color="purple"
                />
              </Link>
              <Link
                to="/roadmap"
                className="transition-all duration-300 hover:scale-105"
              >
                <FeatureCard
                  icon={BookOpen}
                  title="Personalized Learning"
                  description="Get customized learning paths to acquire the skills needed for your dream role with progress tracking and recommendations"
                  color="blue"
                />
              </Link>
            </div>
          </div>
        </section>
        {/* How It Works Section */}
        <section className="py-24" data-aos="fade-up">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block py-1.5 px-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4 tracking-wide">
                HOW IT WORKS
              </span>
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                Your Path to Career Success in 3 Steps
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simple steps to leverage AI for your job search and skill
                development.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10 md:gap-6 relative">
              {/* Dashed lines connecting steps - for larger screens */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-1 w-full">
                <svg width="100%" height="100%">
                  <line
                    x1="16.66%"
                    y1="50%"
                    x2="83.33%"
                    y2="50%"
                    strokeDasharray="10, 10"
                    className="stroke-current text-gray-300 dark:text-gray-600"
                    strokeWidth="2"
                  />
                  <circle
                    cx="16.66%"
                    cy="50%"
                    r="4"
                    className="fill-current text-indigo-500 dark:text-indigo-400"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="4"
                    className="fill-current text-indigo-500 dark:text-indigo-400"
                  />
                  <circle
                    cx="83.33%"
                    cy="50%"
                    r="4"
                    className="fill-current text-indigo-500 dark:text-indigo-400"
                  />
                </svg>
              </div>

              <HowItWorksStep
                icon={UserCheck}
                title="Practice & Assess"
                description="Engage in AI mock interviews and assess your current skill level."
                step={1}
              />
              <HowItWorksStep
                icon={Zap}
                title="Get Personalized Feedback"
                description="Receive instant, actionable insights and tailored learning roadmaps."
                step={2}
              />
              <HowItWorksStep
                icon={Search}
                title="Find & Apply"
                description="Discover perfectly matched jobs and apply with confidence."
                step={3}
              />
            </div>
          </div>
        </section>
        {/* Testimonials Section - New! */}
        <section
          className="py-24 bg-gray-50 dark:bg-gray-800/20 rounded-3xl my-10"
          data-aos="fade-up"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                TESTIMONIALS
              </span>
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                See how our platform has helped professionals advance their
                careers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Testimonial
                quote="The AI interview practice transformed my confidence. I landed a job at a top tech company after just two weeks of training."
                author="Alex Johnson"
                role="Software Engineer"
                avatar="https://randomuser.me/api/portraits/men/32.jpg"
              />
              <Testimonial
                quote="The personalized skill recommendations helped me identify exactly what I needed to learn to transition into data science."
                author="Sarah Chen"
                role="Data Scientist"
                avatar="https://randomuser.me/api/portraits/women/44.jpg"
              />
            </div>
          </div>
        </section>

        {/* Stats Section with improved visuals */}
        <section className="py-24 relative overflow-hidden" data-aos="fade-up">
          <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl"></div>
          <div className="max-w-6xl mx-auto px-4 relative">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                IMPACT
              </span>
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                Our Results Speak Volumes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="text-center bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center justify-center mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                  95%
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Interview Success Rate
                </p>
              </div>
              <div className="text-center bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center justify-center mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  10k+
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Career Transitions
                </p>
              </div>
              <div className="text-center bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="inline-flex items-center justify-center mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  500+
                </div>
                <p className="text-gray-600 dark:text-gray-300">Skills Paths</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview - New! */}
        <section className="py-24" data-aos="fade-up">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                PRICING
              </span>
              <h2 className="text-4xl font-bold mb-6 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose the plan that works best for your career goals
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    Free Trial
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Perfect for exploring our platform
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold dark:text-white">$0</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />3 AI
                    Interview Sessions
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Basic Job Recommendations
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />1
                    Skill Assessment
                  </li>
                </ul>
                <Link
                  to="/signup"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-center"
                >
                  Start Free
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-xl border-2 border-indigo-500 dark:border-indigo-400 flex flex-col relative">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    Pro
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    For serious job seekers
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    $29
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited AI Interviews
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Advanced Job Matching
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Full Skills Library
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Resume Analysis
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25 text-center"
                >
                  Get Pro
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-800/40 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 dark:text-white">
                    Enterprise
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    For teams and organizations
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold dark:text-white">
                    Custom
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Team Management
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Custom Integrations
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    Dedicated Support
                  </li>
                </ul>
                <Link
                  to="/about#contact"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-center"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with better visual appeal */}
        <section
          className="py-24 my-10 rounded-3xl relative overflow-hidden"
          data-aos="fade-up"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers
              with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg text-lg"
              >
                Start Your Journey
                <Target className="ml-2 h-5 w-5 inline" />
              </Link>
              <Link
                to="/demo"
                className="bg-transparent text-white border-2 border-white/30 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all shadow-lg text-lg"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
