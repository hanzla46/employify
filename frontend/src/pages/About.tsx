import { Users, Target, Shield, Award } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Users,
      title: 'User-Centric',
      description: 'We put our users first in everything we do, ensuring the best possible experience.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge AI technology.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your data and privacy are our top priorities.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality career development tools.'
    }
  ];


  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">About Employify</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're on a mission to revolutionize career development through artificial intelligence,
              making professional growth accessible and personalized for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Founded in 2024, Employify emerged from a simple observation: traditional career
                development methods weren't keeping pace with rapidly evolving industries and job markets.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We combined advanced AI technology with expert career guidance to create a platform
                that adapts to each individual's unique career journey, providing personalized
                support at every step.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Join Our Team</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
              We're always looking for talented individuals who share our passion for
              revolutionizing career development. Check out our open positions.
            </p>
            <div className="text-center">
              <button className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                View Open Positions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}