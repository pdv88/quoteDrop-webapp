import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-3xl">
          <p>By accessing the website at QuoteDrop, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
