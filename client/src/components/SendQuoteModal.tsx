import { useState, useEffect } from 'react';
import { X, Send, FileText } from 'lucide-react';

interface SendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (subject: string, message: string) => Promise<void>;
  defaultSubject: string;
  defaultMessage: string;
  clientName: string;
}

export default function SendQuoteModal({
  isOpen,
  onClose,
  onSend,
  defaultSubject,
  defaultMessage,
  clientName
}: SendQuoteModalProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultSubject, defaultMessage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await onSend(subject, message);
    } catch (error) {
      console.error('Error sending quote:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Send Quote via Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">To</label>
            <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
              {clientName}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <FileText className="w-4 h-4" />
            <span>PDF Quote will be attached automatically.</span>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
