import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-teal-400">Terms of Service</h1>
        <div className="prose prose-invert max-w-4xl space-y-8 text-gray-300">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using QuoteDrop ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all visitors, users, and others who access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              QuoteDrop is a software-as-a-service (SaaS) platform that allows freelancers and agencies to create, manage, and send price quotes to their clients. The Service includes features such as PDF generation, client management, and email functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to update such information to keep it accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscriptions and Payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free Tier:</strong> We offer a free tier with limited features (e.g., limited number of quotes per month).</li>
              <li><strong>Premium Subscription:</strong> Optional features are available via a paid subscription (currently $3.00 USD/month). By subscribing, you authorize us to charge your payment method on a recurring monthly basis.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Your premium access will continue until the end of the current billing period.</li>
              <li><strong>Refunds:</strong> Payments are generally non-refundable, except as required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of QuoteDrop and its licensors. You retain all rights to the data and content (e.g., logos, client information) that you upload to the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall QuoteDrop, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
             <p>
               We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
             </p>
          </section>

          <div className="border-t border-white/10 pt-8 mt-12">
             <p className="text-sm text-gray-500">Last updated: December 6, 2025</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
