import React from 'react';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8" />
              <span className="ml-2 text-xl font-semibold">CareerAI</span>
            </div>
            <p className="text-sm">Empowering careers through AI-driven guidance and opportunities.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/interview" className="hover:text-indigo-400">AI Interview</Link></li>
              <li><Link to="/skills" className="hover:text-indigo-400">Skills Roadmap</Link></li>
              <li><Link to="/jobs" className="hover:text-indigo-400">Job Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-indigo-400">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-400">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>support@careerai.com</li>
              <li>1-800-CAREER-AI</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-gray-800">
          <p>&copy; {new Date().getFullYear()} CareerAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}