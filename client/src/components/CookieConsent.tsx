import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consented = localStorage.getItem('cookieConsent');
    if (!consented) {
      // Small delay for better UX on initial load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-[#0b1120]/90 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-gray-300 text-sm md:text-base">
                <p>
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. 
                  <Link to="/cookies" className="text-teal-400 hover:text-teal-300 ml-1 underline transition">
                    Learn more
                  </Link>
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-6 py-2.5 text-gray-400 hover:text-white font-medium transition"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-8 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transform hover:scale-105 transition"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
