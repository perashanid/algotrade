import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedText from '../components/AnimatedText';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: 'forever',
      description: 'Perfect for beginners exploring algorithmic trading',
      features: [
        'Up to 5 active constraints',
        'Basic analytics dashboard',
        'Paper trading mode',
        'Email support',
        'Community access',
      ],
      cta: 'Start Free',
      popular: false,
      gradient: 'from-slate-600 to-slate-700',
    },
    {
      name: 'Professional',
      price: '49',
      period: 'month',
      description: 'For serious traders who need advanced features',
      features: [
        'Unlimited constraints',
        'Advanced analytics & insights',
        'Live trading with real money',
        'Priority support',
        'Backtesting engine',
        'API access',
        'Custom indicators',
      ],
      cta: 'Start Trial',
      popular: true,
      gradient: 'from-primary-600 to-indigo-600',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for institutions and teams',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'SLA guarantee',
        'Advanced security',
        'Team collaboration',
      ],
      cta: 'Contact Sales',
      popular: false,
      gradient: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="inline-block px-4 py-2 bg-brand-light dark:bg-brand-darkest/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-semibold mb-4"
            >
              Pricing
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <div className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              <AnimatedText text="Start free and scale as you grow. No hidden fees, cancel anytime." />
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 0.15} direction="up">
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  plan.popular
                    ? 'border-brand-darkest dark:border-brand-light'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-brand-700 to-brand-600 text-white text-sm font-semibold rounded-full shadow-lg"
                  >
                    Most Popular
                  </motion.div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-700 dark:text-gray-300 text-2xl">$</span>
                    )}
                    <span className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-700 dark:text-gray-300">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-xl font-semibold mb-6 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: featureIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 text-sm">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
