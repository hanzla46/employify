import React, { useEffect } from "react";
import { Check } from "lucide-react";

export function Pricing() {
  useEffect(() => {
    document.title = "Pricing | Employify AI";
  }, []);
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: ["3 AI mock interviews per month", "Basic skills roadmap", "Limited job search", "Email support"],
    },
    {
      name: "Pro",
      price: "$29",
      description: "Best for active job seekers",
      features: [
        "Unlimited AI mock interviews",
        "Personalized skills roadmap",
        "Advanced job matching",
        "Priority support",
        "Interview analytics",
        "Resume review",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Custom interview scenarios",
        "Team management",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className='min-h-screen pt-16 bg-gray-50 dark:bg-gray-900'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-3xl font-bold mb-4 dark:text-white'>Simple, Transparent Pricing</h1>
            <p className='text-gray-600 dark:text-gray-300'>Choose the plan that's right for you</p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                  index === 1 ? "ring-2 ring-primary-600 dark:ring-primary-400" : ""
                }`}>
                <div className='p-6'>
                  <h2 className='text-2xl font-bold mb-2 dark:text-white'>{plan.name}</h2>
                  <div className='mb-4'>
                    <span className='text-4xl font-bold dark:text-white'>{plan.price}</span>
                    {plan.price !== "Custom" && <span className='text-gray-600 dark:text-gray-300'>/month</span>}
                  </div>
                  <p className='text-gray-600 dark:text-gray-300 mb-6'>{plan.description}</p>

                  <ul className='space-y-4 mb-6'>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className='flex items-center text-gray-600 dark:text-gray-300'>
                        <Check className='h-5 w-5 text-green-500 mr-2' />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='p-6 bg-gray-50 dark:bg-gray-700/50'>
                  <button
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      index === 1
                        ? "bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600"
                        : "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700"
                    }`}>
                    {index === 2 ? "Contact Sales" : "Get Started"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
