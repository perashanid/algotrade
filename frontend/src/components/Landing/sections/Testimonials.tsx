import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedText from '../components/AnimatedText';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Trader',
      content: 'AlgoTrader has completely transformed my trading strategy. The automated constraints give me peace of mind while I sleep.',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Hedge Fund Manager',
      content: 'The backtesting engine is incredibly powerful. We validated our strategies before going live and saw immediate results.',
      rating: 5,
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Day Trader',
      content: 'Lightning-fast execution and real-time analytics have given me the edge I needed. Best trading platform I have used.',
      rating: 5,
      avatar: 'ER',
    },
  ];

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-2 bg-brand-light dark:bg-brand-darkest/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4"
            >
              Testimonials
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Trusted by Traders Worldwide
            </h2>
            <div className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              <AnimatedText text="Join thousands of successful traders who have transformed their trading with AlgoTrader." />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.15} direction="up">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <FiStar className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-800 dark:text-gray-200 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-br from-brand-700 to-brand-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
