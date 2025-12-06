import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
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
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-x-4"
      >
        <Link to="/login" className="px-6 py-2 text-gray-300 hover:text-white transition font-medium">
          Login
        </Link>
        <Link to="/register" className="px-6 py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-400 transition shadow-lg hover:shadow-teal-500/20">
          Get Started
        </Link>
      </motion.div>
    </nav>
  );
}
