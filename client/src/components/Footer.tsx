import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg mt-auto pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
                <div className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center text-[#0b1120] font-bold">Q</div>
                    <span className="text-white">quotedrop</span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                    The professional quoting software for modern freelancers and agencies. Send beautiful quotes in seconds.
                </p>
            </div>

            {/* Product */}
            <div>
                <h3 className="text-white font-bold mb-4">Product</h3>
                <ul className="space-y-3 text-gray-400">
                    {/* Smooth scroll links mapped to HashRouter or Home sections */}
                    <li><a href="/#pricing" className="hover:text-teal-400 transition">Pricing</a></li>
                    <li><a href="/#testimonials" className="hover:text-teal-400 transition">Showcase</a></li>
                </ul>
            </div>

             {/* Company */}
             <div>
                <h3 className="text-white font-bold mb-4">Company</h3>
                <ul className="space-y-3 text-gray-400">
                    <li><Link to="/about" className="hover:text-teal-400 transition">About Us</Link></li>
                    <li><Link to="/contact" className="hover:text-teal-400 transition">Contact</Link></li>
                </ul>
            </div>

            {/* Legal */}
            <div>
                <h3 className="text-white font-bold mb-4">Legal</h3>
                <ul className="space-y-3 text-gray-400">
                    <li><Link to="/privacy" className="hover:text-teal-400 transition">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-teal-400 transition">Terms of Service</Link></li>
                    <li><Link to="/cookies" className="hover:text-teal-400 transition">Cookie Policy</Link></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} QuoteDrop. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition"><Twitter className="w-5 h-5"/></a>
                <a href="#" className="hover:text-white transition"><Github className="w-5 h-5"/></a>
                <a href="#" className="hover:text-white transition"><Linkedin className="w-5 h-5"/></a>
                <a href="#" className="hover:text-white transition"><Instagram className="w-5 h-5"/></a>
            </div>
        </div>
      </div>
    </footer>
  );
}
