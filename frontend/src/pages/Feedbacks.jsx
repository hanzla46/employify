import React, { useState, useEffect } from "react";
import axios from "axios";
import { handleError, handleSuccess } from "../utils";
axios.defaults.withCredentials = true;
const url = import.meta.env.VITE_API_URL;

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", comment: "", rating: 5 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form"); // 'form' or 'feedbacks'

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(url + "/feedbacks/get");
      setFeedbacks(res.data.feedbacks);
    } catch (err) {
      handleError("Failed to fetch feedbacks", err);
    }
  };

  const submitFeedback = async () => {
    if (!form.name || !form.email || !form.comment) {
      return handleError("Please fill all required fields");
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return handleError("Please enter a valid email address");
    }

    setLoading(true);
    try {
      const res = await axios.post(url + "/feedbacks/add", form);
      if (res.status === 201) {
        setForm({ name: "", email: "", comment: "", rating: 5 });
        handleSuccess("Thank you for your feedback!");
        fetchFeedbacks();
        setActiveTab("feedbacks"); // Switch to feedbacks view after submission
      }
    } catch (err) {
      handleError("Failed to submit feedback", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen p-4 md:p-8 md:pt-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 font-sans'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-10'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2'>Share Your Feedback</h1>
          <p className='text-gray-600 dark:text-gray-300 max-w-lg mx-auto'>
            We value your opinion! Let us know what you think about our service.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className='flex border-b border-gray-200 dark:border-gray-700 mb-8'>
          <button
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 font-medium ${
              activeTab === "form"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab("feedbacks")}
            className={`px-4 py-2 font-medium ${
              activeTab === "feedbacks"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            View Feedback ({feedbacks.length})
          </button>
        </div>

        {/* Feedback Form */}
        {activeTab === "form" && (
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg'>
            <div className='space-y-5'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  id='name'
                  type='text'
                  placeholder='Your name'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className='w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                />
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  id='email'
                  type='email'
                  placeholder='your.email@example.com'
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className='w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                />
              </div>

              <div>
                <label htmlFor='comment' className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>
                  Feedback <span className='text-red-500'>*</span>
                </label>
                <textarea
                  id='comment'
                  placeholder='Share your thoughts with us...'
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={4}
                  className='w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2'>Rating</label>
                <div className='flex items-center space-x-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setForm({ ...form, rating: star })}
                      className={`p-1 rounded-full ${form.rating >= star ? "text-yellow-400" : "text-gray-300 dark:text-gray-700"}`}>
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8' viewBox='0 0 20 20' fill='currentColor'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={submitFeedback}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}>
                {loading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        {activeTab === "feedbacks" && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>Community Feedback</h2>
              <button
                onClick={() => setActiveTab("form")}
                className='text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'>
                Add your feedback
              </button>
            </div>

            {feedbacks.length === 0 ? (
              <div className='bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 text-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-12 w-12 mx-auto text-gray-400 dark:text-gray-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
                <h3 className='mt-4 text-lg font-medium text-gray-900 dark:text-gray-100'>No feedback yet</h3>
                <p className='mt-1 text-gray-500 dark:text-gray-400'>Be the first to share your thoughts!</p>
                <button
                  onClick={() => setActiveTab("form")}
                  className='mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  Share Feedback
                </button>
              </div>
            ) : (
              feedbacks.map((fb, idx) => (
                <div
                  key={idx}
                  className='bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full h-10 w-10 flex items-center justify-center font-medium'>
                      {fb.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='ml-4 flex-1'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>{fb.name}</h3>
                        <div className='flex items-center'>
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${i < fb.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-700"}`}
                              xmlns='http://www.w3.org/2000/svg'
                              viewBox='0 0 20 20'
                              fill='currentColor'>
                              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className='text-gray-600 dark:text-gray-300 mt-1'>{fb.comment}</p>
                      <div className='mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-600'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          />
                        </svg>
                        {fb.email}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
