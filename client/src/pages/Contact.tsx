import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        <p className="text-gray-400 text-lg mb-8">
          Have questions? We'd love to hear from you.
        </p>
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-lg">
          <p className="mb-4">
            <span className="font-bold text-white">Email:</span> <a href="mailto:support@quotedrop.com" className="text-teal-400">support@quotedrop.com</a>
          </p>
          <p>
            <span className="font-bold text-white">Address:</span> <span className="text-gray-400">123 Freemium Way, SaaS Valley, CA</span>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
