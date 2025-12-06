export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold flex items-center gap-2 mb-4 md:mb-0">
             <div className="w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center text-[#0b1120] text-xs font-bold">Q</div>
             <span className="text-white">quotedrop</span>
          </div>
          <div className="text-gray-400 text-sm">
            &copy; 2025 QuoteDrop. Crafted with ❤️ for creators.
          </div>
        </div>
      </div>
    </footer>
  );
}
