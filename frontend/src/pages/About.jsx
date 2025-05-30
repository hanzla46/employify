import React, { useState, useEffect } from "react";
import {
  Users,
  Target,
  Shield,
  Award,
  ChevronRight,
  MapPin,
  Calendar,
  Mail,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  CircleUserRound,
} from "lucide-react";
import { motion } from "framer-motion";

export function About() {
  const [activeTab, setActiveTab] = useState("story");
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    document.title = "About | Employify AI";
  }, []);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: Users,
      title: "User-Centric",
      description: "We put our users first in everything we do, ensuring the best possible experience.",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Constantly pushing boundaries with cutting-edge AI technology.",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data and privacy are our top priorities.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality career development tools.",
    },
  ];

  const teamMembers = [
    {
      name: "Hanzla",
      role: "Founder & CEO",
      image: "placeholder",
      bio: "Visionary leader with expertise in AI and career development",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Hina",
      role: "CTO",
      image: "placeholder",
      bio: "Technology expert with deep experience in machine learning",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
      name: "Izhar",
      role: "Head of Product",
      image: "placeholder",
      bio: "Product specialist focused on user experience and solutions",
      social: { linkedin: "#", twitter: "#", github: "#" },
    },
  ];

  const metrics = [
    { label: "Users", value: "10K+" },
    { label: "Career Paths", value: "500+" },
    { label: "Success Rate", value: "94%" },
    { label: "Countries", value: "32" },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Founded",
      description: "Employify was established with a vision to transform career development.",
    },
    {
      year: "2024",
      title: "First 1,000 Users",
      description: "Reached our first milestone of 1,000 active users.",
    },
    {
      year: "2024",
      title: "AI Engine v1",
      description: "Launched our proprietary career matching algorithm.",
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanded our services to 30+ countries worldwide.",
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700'>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className='relative overflow-hidden pt-20 pb-16'>
        <div className='absolute inset-0 bg-indigo-50 dark:bg-indigo-950/20 overflow-hidden'>
          <div className='absolute -right-80 -top-80 w-96 h-96 rounded-full bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-900/30 dark:to-indigo-900/30 blur-3xl'></div>
          <div className='absolute -left-80 bottom-0 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-200 to-blue-200 dark:from-indigo-900/30 dark:to-blue-900/30 blur-3xl'></div>
        </div>

        <div className='container relative mx-auto px-4 py-12 text-center'>
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-primary-700)] to-purple-600 dark:from-[var(--color-primary-600)] dark:to-purple-400 inline-block text-transparent bg-clip-text'>
            About Employify
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            We're on a mission to revolutionize career development through artificial intelligence, making professional
            growth accessible and personalized for everyone.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className='flex flex-wrap justify-center gap-4 mt-8'>
            <a
              onClick={() => {
                setActiveTab("team");
                document.getElementById("sections").scrollIntoView();
              }}
              className='bg-white dark:bg-gray-800 text-[var(--color-primary-900)] dark:text-[var(--color-primary-500)] px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer'>
              Meet our team <ChevronRight size={16} />
            </a>
            <a
              href='#contact'
              className='bg-[var(--color-primary-700)] dark:bg-[var(--color-primary-500)] text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all'>
              Get in touch
            </a>
          </motion.div>

          <div className='flex justify-center mt-16 gap-12 flex-wrap'>
            {metrics.map((metric, index) => (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                key={index}
                className='text-center'>
                <p className='text-4xl font-bold text-indigo-600 dark:text-indigo-400'>{metric.value}</p>
                <p className='text-gray-600 dark:text-gray-400'>{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        <div id='sections' className='max-w-6xl mx-auto'>
          {/* Tabs Navigation */}
          <div className='flex overflow-x-auto mb-8 pb-2 scrollbar-hide'>
            <div className='flex gap-2 mx-auto border border-gray-200 dark:border-gray-700 rounded-full p-1 bg-white dark:bg-gray-800 shadow-sm'>
              <button
                onClick={() => setActiveTab("story")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "story"
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                Our Story
              </button>
              <button
                onClick={() => setActiveTab("values")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "values"
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                Our Values
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "team"
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                Our Team
              </button>
              <button
                onClick={() => setActiveTab("journey")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "journey"
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                Our Journey
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className='mb-16'>
            {/* Our Story */}
            {activeTab === "story" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className='grid md:grid-cols-5 gap-12'>
                <div className='md:col-span-3 order-2 md:order-1'>
                  <h2 className='text-3xl font-bold mb-6 dark:text-white'>Our Story</h2>
                  <div className='space-y-4'>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                      Founded in 2024, Employify emerged from a simple observation: traditional career development
                      methods weren't keeping pace with rapidly evolving industries and job markets.
                    </p>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                      We combined advanced AI technology with expert career guidance to create a platform that adapts to
                      each individual's unique career journey, providing personalized support at every step.
                    </p>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                      Our AI-driven tools analyze job market trends, individual skills, and career aspirations to
                      provide actionable insights that help users make informed decisions about their professional
                      development.
                    </p>
                    <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                      Today, Employify is helping thousands of professionals worldwide navigate their career paths with
                      confidence, powered by our founding team of Hanzla, Hina, and Izhar!
                    </p>
                  </div>

                  <div className='mt-8'>
                    <a
                      href='#contact'
                      className='inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline'>
                      Learn how we can help your career <ArrowRight size={16} className='ml-2' />
                    </a>
                  </div>
                </div>
                <div className='md:col-span-2 order-1 md:order-2'>
                  <div className='relative h-full'>
                    <div className='absolute top-0 left-0 w-full h-full bg-indigo-100 dark:bg-indigo-900/20 rounded-lg transform -rotate-3'></div>
                    <img
                      src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80'
                      alt='Team collaboration'
                      className='rounded-lg shadow-lg w-full h-full object-cover relative z-10 transform rotate-3 transition-transform hover:rotate-0 duration-300'
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Our Values */}
            {activeTab === "values" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <h2 className='text-3xl font-bold mb-8 text-center dark:text-white'>Our Core Values</h2>
                <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                  {values.map((value, index) => (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      key={index}
                      className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1'>
                      <div className='w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mb-6'>
                        <value.icon className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
                      </div>
                      <h3 className='text-xl font-semibold mb-3 dark:text-white'>{value.title}</h3>
                      <p className='text-gray-600 dark:text-gray-300'>{value.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Our Team */}
            {activeTab === "team" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} id='team'>
                <h2 id='team' className='text-3xl font-bold mb-8 text-center dark:text-white'>
                  Meet Our Team
                </h2>
                <div className='grid md:grid-cols-3 gap-8'>
                  {teamMembers.map((member, index) => (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      key={index}
                      className='bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all'>
                      <div className='relative'>
                        {member.image === "placeholder" ? (
                          <CircleUserRound className='w-full h-64 object-cover dark:text-white' />
                        ) : (
                          <img src={member.image} alt={member.name} className='w-full h-64 object-cover' />
                        )}
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end'>
                          <div className='p-6'>
                            <h3 className='text-xl font-semibold text-white'>{member.name}</h3>
                            <p className='text-indigo-200'>{member.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className='p-6'>
                        <p className='text-gray-600 dark:text-gray-300 mb-4'>{member.bio}</p>
                        <div className='flex space-x-3'>
                          <a
                            href={member.social.linkedin}
                            className='text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'>
                            <Linkedin size={20} />
                          </a>
                          <a
                            href={member.social.twitter}
                            className='text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'>
                            <Twitter size={20} />
                          </a>
                          <a
                            href={member.social.github}
                            className='text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'>
                            <Github size={20} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Our Journey */}
            {activeTab === "journey" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <h2 className='text-3xl font-bold mb-8 text-center dark:text-white'>Our Journey</h2>
                <div className='relative'>
                  <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200 dark:bg-indigo-900/50'></div>
                  <div className='space-y-12'>
                    {milestones.map((milestone, index) => (
                      <motion.div
                        initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        key={index}
                        className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                        <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12"}`}>
                          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all'>
                            <div className='inline-block text-xs font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-full px-3 py-1 mb-3'>
                              {milestone.year}
                            </div>
                            <h3 className='text-xl font-semibold mb-2 dark:text-white'>{milestone.title}</h3>
                            <p className='text-gray-600 dark:text-gray-300'>{milestone.description}</p>
                          </div>
                        </div>
                        <div className='relative z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-400 dark:border-indigo-600 flex items-center justify-center'>
                          <div className='w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400'></div>
                        </div>
                        <div className='w-1/2'></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Join Our Team Section */}
          <div className='relative mb-16 overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-600 to-[var(--color-primary-700)] dark:from-indigo-800 dark:to-[var(--color-primary-500)] opacity-95 rounded-2xl'></div>
            <div className='relative p-10 text-center text-white'>
              <h2 className='text-3xl font-bold mb-6'>Join Our Team</h2>
              <p className='text-indigo-100 max-w-2xl mx-auto mb-8 text-lg'>
                We're always looking for talented individuals who share our passion for revolutionizing career
                development. Join us in building the future of work.
              </p>
              <div className='flex flex-wrap justify-center gap-4'>
                <button className='bg-white text-[var(--color-primary-700)] px-8 py-3 rounded-full font-medium hover:bg-indigo-50 transition-colors'>
                  View Open Positions
                </button>
                <button className='bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors'>
                  Learn About Benefits
                </button>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div id='contact' className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 mb-16'>
            <div className='grid md:grid-cols-2 gap-10'>
              <div>
                <h2 className='text-3xl font-bold mb-6 dark:text-white'>Get In Touch</h2>
                <p className='text-gray-600 dark:text-gray-300 mb-6'>
                  Have questions about our platform or interested in a partnership? We'd love to hear from you!
                </p>
                <div className='space-y-4'>
                  <div className='flex items-start'>
                    <MapPin className='text-indigo-600 dark:text-indigo-400 mt-1 mr-3' size={20} />
                    <div>
                      <p className='font-medium dark:text-white'>Our Location</p>
                      <p className='text-gray-600 dark:text-gray-300'>Arid Institute of Sciences MandiBahauddin</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <Mail className='text-indigo-600 dark:text-indigo-400 mt-1 mr-3' size={20} />
                    <div>
                      <p className='font-medium dark:text-white'>Email Us</p>
                      <a
                        href='mailto:hello@employify.com'
                        className='text-indigo-600 dark:text-indigo-400 hover:underline'>
                        hello@employify.com
                      </a>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <Calendar className='text-indigo-600 dark:text-indigo-400 mt-1 mr-3' size={20} />
                    <div>
                      <p className='font-medium dark:text-white'>Operating Hours</p>
                      <p className='text-gray-600 dark:text-gray-300'>Monday - Friday: 9am - 6pm PST</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <form className='space-y-4'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                        Name
                      </label>
                      <input
                        type='text'
                        id='name'
                        className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                        placeholder='Your name'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                        Email
                      </label>
                      <input
                        type='email'
                        id='email'
                        className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                        placeholder='Your email'
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor='subject'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Subject
                    </label>
                    <input
                      type='text'
                      id='subject'
                      className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                      placeholder='How can we help?'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='message'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Message
                    </label>
                    <textarea
                      id='message'
                      rows={4}
                      className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'
                      placeholder='Your message...'
                    />
                  </div>
                  <button
                    type='submit'
                    className='w-full bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors'>
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className='mb-16'>
            <h2 className='text-3xl font-bold mb-8 text-center dark:text-white'>Frequently Asked Questions</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md'>
                <h3 className='text-lg font-semibold mb-3 dark:text-white'>How does Employify work?</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Employify uses advanced AI to analyze your skills, experience, and career goals, then provides
                  personalized recommendations for career development paths and opportunities.
                </p>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md'>
                <h3 className='text-lg font-semibold mb-3 dark:text-white'>Is my data secure?</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  We take data security seriously. All user data is encrypted and never shared with third parties
                  without explicit permission.
                </p>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md'>
                <h3 className='text-lg font-semibold mb-3 dark:text-white'>
                  Do you offer custom enterprise solutions?
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Yes, we offer tailored solutions for organizations looking to enhance their talent development
                  programs.
                </p>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md'>
                <h3 className='text-lg font-semibold mb-3 dark:text-white'>How often is your data updated?</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Our job market data and industry trends are updated weekly to ensure you receive the most current
                  information for your career planning.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className='bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-16'>
            <div className='text-center max-w-2xl mx-auto'>
              <h2 className='text-2xl font-bold mb-4 dark:text-white'>Stay Updated</h2>
              <p className='text-gray-600 dark:text-gray-300 mb-6'>
                Subscribe to our newsletter to receive the latest updates, career tips, and industry insights.
              </p>
              <div className='flex flex-col sm:flex-row gap-2'>
                <input
                  type='email'
                  className='flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  placeholder='Your email address'
                />
                <button className='bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors whitespace-nowrap'>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
