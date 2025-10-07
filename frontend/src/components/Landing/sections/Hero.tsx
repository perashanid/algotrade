import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';
import AnimatedText from '../components/AnimatedText';
import ScrollReveal from '../components/ScrollReveal';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const floatingIcons = [
    { Icon: FiTrendingUp, delay: 0, x: -20, y: -30 },
    { Icon: FiShield, delay: 0.2, x: 20, y: -20 },
    { Icon: FiZap, delay: 0.4, x: -15, y: 20 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-medium/30 dark:bg-brand-darkest/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-dark/30 dark:bg-brand-darker/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Floating Icons */}
          <div className="relative inline-block mb-8">
            {floatingIcons.map(({ Icon, delay, x, y }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, y, 0],
                }}
                transition={{
                  delay,
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                  <Icon className="w-6 h-6 text-brand-700" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 bg-brand-200 dark:bg-brand-800/30 text-gray-800 dark:text-brand-200 rounded-full text-sm font-semibold">
              Next-Gen Trading Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Trade Smarter with AI
          </motion.h1>

          <div className="mb-8 text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            <AnimatedText
              text="Harness the power of algorithmic trading with advanced constraints, real-time analytics, and intelligent automation to maximize your portfolio performance."
              className="leading-relaxed"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-xl shadow-xl font-semibold text-lg flex items-center gap-2"
            >
              Start Trading Free
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiArrowRight />
              </motion.span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-lg font-semibold text-lg border border-slate-200 dark:border-slate-700"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Stats */}
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { value: '10K+', label: 'Active Traders' },
                { value: '$2B+', label: 'Trading Volume' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-600 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
