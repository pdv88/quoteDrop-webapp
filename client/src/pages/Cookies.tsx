import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col">
      <Header />
      <div className="container mx-auto px-6 py-20 flex-grow">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-invert max-w-3xl">
          <p>We use cookies to help improve your experience of our website at QuoteDrop. This cookie policy is part of QuoteDrop's privacy policy, and covers the use of cookies between your device and our site.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
