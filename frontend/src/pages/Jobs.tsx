import React from 'react';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

export function Jobs() {
  const jobs = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      type: 'Full-time',
      posted: '2 days ago',
      skills: ['React', 'TypeScript', 'GraphQL']
    },
    {
      title: 'Backend Engineer',
      company: 'DataFlow Systems',
      location: 'Remote',
      salary: '$100k - $150k',
      type: 'Full-time',
      posted: '1 week ago',
      skills: ['Node.js', 'Python', 'PostgreSQL']
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudScale',
      location: 'New York, NY',
      salary: '$130k - $190k',
      type: 'Full-time',
      posted: '3 days ago',
      skills: ['AWS', 'Kubernetes', 'Terraform']
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Job Portal</h1>
          
          <div className="grid gap-6">
            {jobs.map((job, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2 dark:text-white">{job.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
                  </div>
                  <button className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                    Apply Now
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-5 w-5 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <DollarSign className="h-5 w-5 mr-2" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Briefcase className="h-5 w-5 mr-2" />
                    {job.type}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="h-5 w-5 mr-2" />
                    {job.posted}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}