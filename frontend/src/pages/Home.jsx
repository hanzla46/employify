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
  BarChart2,
  FileText,
  Video,
  User,
  Mic,
  Monitor,
  ArrowUpRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

function EnhancedFeatureHighlight({ icon: Icon, title }) {
  return (
    <div className='flex items-center p-4 bg-white/80 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
      <div className='mr-4 mt-1 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg'>
        <Icon className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
      </div>
      <div>
        <h4 className='font-semibold text-gray-800 dark:text-white'>{title}</h4>
      </div>
    </div>
  );
}

function HowItWorksStep({ icon: Icon, title, description, step }) {
  return (
    <div className='flex flex-col items-center text-center'>
      <div className='relative mb-4'>
        <div className='h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mb-4'>
          <Icon className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
        </div>
        <span className='absolute -top-2 -right-2 bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center'>
          {step}
        </span>
      </div>
      <h3 className='text-lg font-semibold mb-2 dark:text-white'>{title}</h3>
      <p className='text-gray-600 dark:text-gray-300 text-sm'>{description}</p>
    </div>
  );
}

export function Home() {
  useEffect(() => {
    document.title = "Employify AI";
  }, []);
  const { user } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className='pt-8 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-700'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
        {/* Hero Section */}
        <header className='py-20 lg:py-28 relative'>
          {/* Background decorative elements */}
          <div className='absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none'>
            <div className='absolute -top-96 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-700/20 rounded-full blur-3xl'></div>
            <div className='absolute -bottom-96 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-700/20 rounded-full blur-3xl'></div>
          </div>

          <div className='max-w-6xl mx-auto relative'>
            <div className='text-center mb-16' data-aos='fade-up'>
              <div className='inline-flex items-center justify-center mb-6 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg'>
                <Brain className='h-10 w-10 text-indigo-600 dark:text-indigo-400' />
              </div>
              <h1 className='text-5xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-600 dark:from-indigo-400 dark:via-primary-400 dark:to-purple-400 leading-tight'>
                AI-Powered Career Success
              </h1>
              <p className='text-xl md:text-2xl text-gray-800 dark:text-gray-300 mb-10 max-w-3xl mx-auto font-light'>
                Master interviews, optimize your resume, and accelerate career growth with personalized AI guidance
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link
                  to={user ? "/profile" : "/signup"}
                  className='bg-gradient-to-r from-[var(--color-primary-700)] to-purple-600 dark:from-[var(--color-primary-300)] dark:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-indigo-500/25 inline-flex items-center justify-center text-lg'>
                  Get Started Free
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
                <button
                  onClick={() => document.getElementById("features").scrollIntoView()}
                  className='bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-md inline-flex items-center justify-center text-lg'>
                  Explore Features
                </button>
              </div>
            </div>

            <div className='relative rounded-3xl overflow-hidden shadow-2xl' data-aos='fade-up' data-aos-delay='200'>
              <div className='absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-sm pointer-events-none'></div>

              <img
                src='https://burst.shopifycdn.com/photos/person-using-laptop.jpg?exif=0&iptc=0'
                alt='AI Career Platform'
                className='rounded-3xl w-full transform transition-transform hover:scale-105 duration-700'
              />

              {/* Floating UI elements */}
              <div
                className='absolute top-10 right-10 bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 max-w-xs hidden lg:block'
                data-aos='fade-left'
                data-aos-delay='400'>
                <div className='flex items-center space-x-3 mb-2'>
                  <div className='h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                    <Target className='h-4 w-4 text-green-600 dark:text-green-400' />
                  </div>
                  <p className='font-semibold dark:text-white'>Interview Success Rate</p>
                </div>
                <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div className='h-full bg-green-500 rounded-full' style={{ width: "95%" }}></div>
                </div>
              </div>

              <div
                className='absolute bottom-10 left-10 bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 hidden lg:block'
                data-aos='fade-right'
                data-aos-delay='600'>
                <div className='flex items-center'>
                  <div className='mr-4'>
                    <p className='text-xl font-bold text-indigo-600 dark:text-indigo-400'>10,000+</p>
                    <p className='text-gray-600 dark:text-gray-300 text-sm'>Career Transitions</p>
                  </div>
                  <Briefcase className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Features Section */}
        <section id='features' className='py-24 relative' data-aos='fade-up'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-16'>
              <span className='inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4'>
                POWERFUL FEATURES
              </span>
              <h2 className='text-4xl font-bold mb-6 dark:text-white'>Your Complete Career Toolkit</h2>
              <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
                Everything you need to stand out in today's competitive job market
              </p>
            </div>

            {/* Feature Categories */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
              {/* Jobs Category */}
              <div className='bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center mb-6'>
                  <div className='mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl'>
                    <Briefcase className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h3 className='text-2xl font-bold dark:text-white'>Job Search</h3>
                </div>

                <div className='space-y-4'>
                  <EnhancedFeatureHighlight icon={BarChart2} title='Skills Gap Analysis' />
                  <EnhancedFeatureHighlight icon={FileText} title='Resume & Cover Letter Builder' />
                  <EnhancedFeatureHighlight icon={User} title='Company Contacts' />
                </div>
              </div>

              {/* Interview Category */}
              <div className='bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center mb-6'>
                  <div className='mr-4 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl'>
                    <MessageSquare className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                  </div>
                  <h3 className='text-2xl font-bold dark:text-white'>Interview Prep</h3>
                </div>

                <div className='space-y-4'>
                  <EnhancedFeatureHighlight icon={Video} title='Audio/Video Analysis' />
                  <EnhancedFeatureHighlight icon={Monitor} title='Performance Monitoring' />
                  <EnhancedFeatureHighlight icon={ArrowUpRight} title='Next Interview Suggestions' />
                </div>
              </div>

              {/* Roadmap Category */}
              <div className='bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center mb-6'>
                  <div className='mr-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-xl'>
                    <BookOpen className='h-8 w-8 text-green-600 dark:text-green-400' />
                  </div>
                  <h3 className='text-2xl font-bold dark:text-white'>Career Roadmap</h3>
                </div>

                <div className='space-y-4'>
                  <EnhancedFeatureHighlight icon={TrendingUp} title='Progress Tracking' />
                  <EnhancedFeatureHighlight icon={CheckCircle} title='Real-time Market Analysis' />
                  <EnhancedFeatureHighlight icon={Mic} title='Job-Specific Interviews' />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className='py-24' data-aos='fade-up'>
          <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-16'>
              <span className='inline-block py-1.5 px-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4 tracking-wide'>
                HOW IT WORKS
              </span>
              <h2 className='text-4xl font-bold mb-6 dark:text-white'>Your Path to Career Success</h2>
              <p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
                Transform your job search with AI-powered guidance at every step
              </p>
            </div>
            <div className='grid md:grid-cols-4 gap-10 md:gap-6 relative'>
              {/* Dashed lines connecting steps */}
              <div className='hidden md:block absolute top-8 left-0 right-0 h-1 w-full'>
                <svg width='100%' height='100%'>
                  <line
                    x1='12.5%'
                    y1='50%'
                    x2='87.5%'
                    y2='50%'
                    strokeDasharray='10, 10'
                    className='stroke-current text-gray-300 dark:text-gray-600'
                    strokeWidth='2'
                  />
                  <circle cx='12.5%' cy='50%' r='4' className='fill-current text-indigo-500 dark:text-indigo-400' />
                  <circle cx='37.5%' cy='50%' r='4' className='fill-current text-indigo-500 dark:text-indigo-400' />
                  <circle cx='62.5%' cy='50%' r='4' className='fill-current text-indigo-500 dark:text-indigo-400' />
                  <circle cx='87.5%' cy='50%' r='4' className='fill-current text-indigo-500 dark:text-indigo-400' />
                </svg>
              </div>

              <HowItWorksStep
                icon={BarChart2}
                title='Analyze & Plan'
                description='Complete skills assessment and get personalized career roadmap'
                step={1}
              />
              <HowItWorksStep
                icon={FileText}
                title='Prepare Materials'
                description='Generate tailored resumes and cover letters for target roles'
                step={2}
              />
              <HowItWorksStep
                icon={Video}
                title='Practice Interviews'
                description='Simulate real interviews with AI analysis and feedback'
                step={3}
              />
              <HowItWorksStep
                icon={Briefcase}
                title='Land Your Role'
                description='Get matched with opportunities and track applications'
                step={4}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-24 my-10 rounded-3xl relative overflow-hidden' data-aos='fade-up'>
          <div className='absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800'></div>
          <div className='absolute inset-0 opacity-20'>
            <div className='absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2'></div>
            <div className='absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2'></div>
          </div>

          <div className='max-w-4xl mx-auto px-4 text-center relative'>
            <h2 className='text-4xl md:text-5xl font-bold text-white mb-8'>Ready to Transform Your Career?</h2>
            <p className='text-xl text-white/80 mb-10 max-w-2xl mx-auto'>
              Join thousands of professionals who landed their dream roles with AI-powered guidance
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to={`${!user ? "/signup" : "/profile"}`}
                className='bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg text-lg'>
                Start Your Journey
                <Target className='ml-2 h-5 w-5 inline' />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
