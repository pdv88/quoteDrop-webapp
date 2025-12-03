import { Link } from 'react-router-dom';
import { CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-3xl font-bold text-white">QuoteDrop</div>
        <div className="space-x-4">
          <Link to="/login" className="px-6 py-2 text-white hover:text-purple-200 transition">
            Login
          </Link>
          <Link to="/register" className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition shadow-lg">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-extrabold text-white mb-6 leading-tight">
          Professional Quotes,<br />Sent in Seconds
        </h1>
        <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
          Create stunning quotes, track payments, and manage clients with ease. 
          Perfect for freelancers and small businesses.
        </p>
        <Link to="/register" className="inline-block px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition">
          Start Free Trial
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Why QuoteDrop?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Zap className="w-12 h-12" />}
            title="Lightning Fast"
            description="Create and send quotes in under 60 seconds"
          />
          <FeatureCard 
            icon={<CheckCircle className="w-12 h-12" />}
            title="Track Everything"
            description="Monitor quote status and payment progress"
          />
          <FeatureCard 
            icon={<Shield className="w-12 h-12" />}
            title="Secure & Reliable"
            description="Your data is encrypted and backed up"
          />
          <FeatureCard 
            icon={<TrendingUp className="w-12 h-12" />}
            title="Grow Your Business"
            description="Analytics to help you make better decisions"
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-8">Trusted by Professionals</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Testimonial 
            quote="QuoteDrop saved me hours every week!"
            author="Sarah J., Designer"
          />
          <Testimonial 
            quote="My clients love the professional PDFs"
            author="Mike T., Contractor"
          />
          <Testimonial 
            quote="Best investment for my business"
            author="Lisa K., Consultant"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard 
            tier="Free"
            price="$0"
            features={['5 quotes per month', 'Basic templates', 'Email support']}
            cta="Get Started"
          />
          <PricingCard 
            tier="Premium"
            price="$2"
            features={['Unlimited quotes', 'Custom branding', 'Priority support', 'Advanced analytics']}
            cta="Upgrade Now"
            featured
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-10 text-center text-purple-200">
        <p>&copy; 2025 QuoteDrop. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center hover:bg-white/20 transition">
      <div className="text-pink-400 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-purple-200">{description}</p>
    </div>
  );
}

function Testimonial({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <p className="text-white italic mb-4">"{quote}"</p>
      <p className="text-purple-300 font-semibold">- {author}</p>
    </div>
  );
}

function PricingCard({ tier, price, features, cta, featured }: { tier: string; price: string; features: string[]; cta: string; featured?: boolean }) {
  return (
    <div className={`rounded-2xl p-8 ${featured ? 'bg-gradient-to-br from-pink-500 to-purple-600 transform scale-105' : 'bg-white/10 backdrop-blur-lg'}`}>
      <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
      <div className="text-5xl font-extrabold text-white mb-6">
        {price}<span className="text-xl">/mo</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
            {feature}
          </li>
        ))}
      </ul>
      <Link to="/register" className={`block w-full py-3 rounded-lg font-semibold text-center transition ${featured ? 'bg-white text-purple-900 hover:bg-purple-100' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
        {cta}
      </Link>
    </div>
  );
}
