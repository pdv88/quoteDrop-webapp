import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-3xl">
          <p>Last updated: December 6, 2025</p>
          <p>Your privacy is important to us. It is QuoteDrop's policy to respect your privacy regarding any information we may collect from you across our website.</p>
          <h3>1. Information We Collect</h3>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
