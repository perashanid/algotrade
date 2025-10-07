import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiZap, FiBarChart2, FiLock, FiCpu } from 'react-icons/fi';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedText from '../components/AnimatedText';

const Features: React.FC = () => {
  const features = [
    {
      icon: FiTrendingUp,
      title: 'Smart Trading Algorithms',
      description: 'Advanced AI-powered algorithms that adapt to market conditions and optimize your trading strategies in real-time.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiShield,
      title: 'Risk Management',
      description: 'Comprehensive constraint system to protect your portfolio with customizable risk parameters and automated safeguards.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiZap,
      title: 'Lightning Fast Execution',
      description: 'Execute trades in milliseconds with our high-performance infrastructure and direct market access.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: FiBarChart2,
      title: 'Real-Time Analytics',
      description: 'Comprehensive dashboards with live market data, performance metrics, and actionable insights.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiLock,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption and security protocols to keep your data and assets safe.',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: FiCpu,
      title: 'Backtesting Engine',
      description: 'Test your strategies against historical data to validate performance before going live.',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-2 bg-brand-light dark:bg-brand-darkest/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4"
            >
              Features
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <div className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              <AnimatedText text="Powerful tools and features designed to give you the competitive edge in algorithmic trading." />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-darkest/5 to-brand-darker/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl`}
                />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
