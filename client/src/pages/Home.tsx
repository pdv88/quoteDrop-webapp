import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Hero3D from '../components/Hero3D';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {

  return (
    <div className="min-h-screen bg-[#0b1120] text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <Header />


      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* 3D Scene Background */}
        <Hero3D />

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm mb-6">
              <span className="text-teal-400 font-semibold text-sm tracking-wider uppercase">Instant Estimates</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-8 leading-tight">
              Quotes that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-gradient-x">
                Stand Out
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              Create stunning, interactive quotes that win more clients. Track payments, manage projects, and look professional doing it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-lg font-bold rounded-full hover:shadow-lg hover:shadow-teal-500/30 transform hover:scale-105 transition flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <button className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white text-lg font-bold rounded-full hover:bg-white/10 transition">
                View Demo
              </button>
            </div>
          </motion.div>
          
          {/* Right side is left empty for the 3D elements to shine through */}
          <div className="hidden md:block"></div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Choose QuoteDrop?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to manage your freelance business or agency in one beautiful dashboard.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Zap className="w-10 h-10" />}
            title="Lightning Fast"
            description="Create and send quotes in under 60 seconds with smart templates."
            delay={0.1}
          />
          <FeatureCard 
            icon={<CheckCircle className="w-10 h-10" />}
            title="Track Everything"
            description="Real-time updates on quote views, acceptances, and payments."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Shield className="w-10 h-10" />}
            title="Bank-Grade Security"
            description="Your data is encrypted and backed up automatically."
            delay={0.3}
          />
          <FeatureCard 
            icon={<TrendingUp className="w-10 h-10" />}
            title="Business Insights"
            description="Powerful analytics to help you make data-driven decisions."
            delay={0.4}
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-8">Trusted by Modern Teams</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial 
                quote="QuoteDrop completely transformed how I handle client proposals. It's simply beautiful."
                author="Sarah Jenkins"
                role="Product Designer"
                delay={0.1}
              />
              <Testimonial 
                quote="My clients are impressed by the professional look. My close rate went up by 30%."
                author="Mike Thompson"
                role="Creative Director"
                delay={0.2}
              />
              <Testimonial 
                quote="The best investment I've made for my freelance business this year. Hands down."
                author="Lisa Chen"
                role="Marketing Consultant"
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400">No hidden fees. Cancel anytime.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard 
            tier="Starter"
            price="$0"
            features={['5 quotes per month', 'Basic templates', 'Email support', 'Basic Analytics']}
            cta="Get Started Free"
            delay={0.1}
          />
          <PricingCard 
            tier="Premium"
            price="$3"
            features={['Unlimited quotes', 'Custom branding', 'Priority support', 'Advanced analytics', 'Client Portal']}
            cta="Upgrade to Premium"
            featured
            delay={0.2}
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group"
    >
      <div className="bg-gradient-to-br from-teal-500/20 to-emerald-600/20 w-16 h-16 rounded-2xl flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Testimonial({ quote, author, role, delay }: { quote: string; author: string; role: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="bg-black/20 p-8 rounded-2xl text-left"
    >
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
      </div>
      <p className="text-gray-300 italic mb-6 text-lg">"{quote}"</p>
      <div>
        <p className="text-white font-bold">{author}</p>
        <p className="text-teal-400 text-sm">{role}</p>
      </div>
    </motion.div>
  );
}

function PricingCard({ tier, price, features, cta, featured, delay }: { tier: string; price: string; features: string[]; cta: string; featured?: boolean; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-3xl p-10 ${featured ? 'bg-gradient-to-b from-teal-900/80 to-emerald-900/80 border-teal-500/50' : 'bg-white/5 border-white/10'} backdrop-blur-xl border flex flex-col`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-extrabold text-white">{price}</span>
        <span className="text-gray-400 ml-2">/month</span>
      </div>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="text-gray-300 flex items-center">
            <CheckCircle className={`w-5 h-5 mr-3 ${featured ? 'text-teal-400' : 'text-gray-500'}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Link to="/register" className={`block w-full py-4 rounded-xl font-bold text-center transition transform hover:scale-105 ${featured ? 'bg-white text-teal-900 hover:bg-gray-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        {cta}
      </Link>
    </motion.div>
  );
}
