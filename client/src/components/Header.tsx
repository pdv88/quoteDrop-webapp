import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="container mx-auto px-6 py-6 relative z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold flex items-center gap-2"
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-[#0b1120] font-bold">Q</div>
            <span className="text-white">quotedrop</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex space-x-4 items-center"
        >
          <Link to="/login" className="px-6 py-2 text-gray-300 hover:text-white transition font-medium">
            Login
          </Link>
          <Link to="/register" className="px-6 py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-400 transition shadow-lg hover:shadow-teal-500/20">
            Get Started
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 focus:outline-none"
          >
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-[#0b1120]/95 backdrop-blur-lg border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-6 items-center">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-6 py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-400 transition shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
