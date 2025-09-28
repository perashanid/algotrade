import React from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiSettings, FiPlay, FiTrendingUp } from 'react-icons/fi';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedText from '../components/AnimatedText';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: FiUserPlus,
      title: 'Create Your Account',
      description: 'Sign up in seconds and get instant access to our powerful trading platform.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiSettings,
      title: 'Configure Strategies',
      description: 'Set up your trading constraints, risk parameters, and automated rules.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiPlay,
      title: 'Start Trading',
      description: 'Activate your strategies and let our AI-powered system execute trades automatically.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiTrendingUp,
      title: 'Monitor & Optimize',
      description: 'Track performance in real-time and continuously improve your strategies.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-2 bg-brand-light dark:bg-brand-darkest/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4"
            >
              How It Works
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Get Started in Minutes
            </h2>
            <div className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              <AnimatedText text="Four simple steps to transform your trading experience and start generating consistent returns." />
            </div>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 transform -translate-y-1/2 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 0.15} direction="up">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 h-full">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>

                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
