import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

export default function AlertModal() {
  const { alertState, hideAlert, submitPrompt } = useAlert();
  const { isOpen, message, type, title, defaultValue } = alertState;
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen && type === 'prompt') {
      setInputValue(defaultValue || '');
    }
  }, [isOpen, type, defaultValue]);

  // Prevent scroll when modal is open
  if (isOpen && typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  } else if (typeof document !== 'undefined') {
    document.body.style.overflow = 'unset';
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'prompt':
        return <MessageSquare className="w-12 h-12 text-blue-500" />;
      case 'info':
      default:
        return <Info className="w-12 h-12 text-teal-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'prompt':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'info':
      default:
        return 'bg-teal-600 hover:bg-teal-700';
    }
  };

  const handleConfirm = () => {
    if (type === 'prompt') {
      submitPrompt(inputValue);
    } else {
      hideAlert();
    }
  };

  const handleCancel = () => {
    if (type === 'prompt') {
      submitPrompt(null);
    } else {
      hideAlert();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 overflow-hidden"
          >
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-gray-50 border-2 border-white shadow-sm">
                {getIcon()}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {title}
              </h3>

              <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                {message}
              </p>

              {type === 'prompt' && (
                <div className="w-full mb-6">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirm();
                      }
                    }}
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter value..."
                  />
                </div>
              )}

              <div className="flex gap-3 w-full">
                {type === 'prompt' && (
                   <button
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 rounded-xl text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold shadow-lg shadow-gray-200 transition transform hover:scale-[1.02] active:scale-[0.98] ${getButtonColor()}`}
                >
                  {type === 'prompt' ? 'Confirm' : 'Okay, got it'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
