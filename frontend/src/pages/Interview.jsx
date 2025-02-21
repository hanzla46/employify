import { MessageSquare, Video, Mic, Send } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
export function Interview() {
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">
            AI Mock Interview
          </h1>
          <ProtectedRoute>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold dark:text-white">
                    Interview Assistant
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Ready to help you practice
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-4 max-w-[80%]">
                    <p className="text-gray-800 dark:text-gray-200">
                      Hello! I'm your AI interview assistant. What type of
                      interview would you like to practice today?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <button className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <h3 className="font-semibold mb-2 dark:text-white">
                    Technical Interview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Practice coding and system design questions
                  </p>
                </button>
                <button className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <h3 className="font-semibold mb-2 dark:text-white">
                    Behavioral Interview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Practice situation-based questions
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  aria-label="Toggle microphone"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Mic className="h-6 w-6" />
                </button>
                <button
                  aria-label="Toggle video"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Video className="h-6 w-6" />
                </button>
                <input
                  type="text"
                  placeholder="Type your response..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  aria-label="Send message"
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500"
                >
                  <Send className="h-6 w-6" />
                </button>
              </div>
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
