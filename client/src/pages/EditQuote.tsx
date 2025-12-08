import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { quotesApi, servicesApi, userApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { generateQuotePDF } from '../utils/pdfGenerator';

import type { Quote, Service } from '../types';

import { formatQuoteNumber } from '../utils/formatters';
import { ArrowLeft, Plus, Save, Trash2, FileText, Send } from 'lucide-react';
import SendQuoteModal from '../components/SendQuoteModal';

export default function EditQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [termsConditions, setTermsConditions] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [template, setTemplate] = useState<'standard' | 'modern' | 'minimal'>('standard');
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      if (!id) return;
      if (!id) return;
      const [quoteData, servicesData, userData] = await Promise.all([
        quotesApi.get(id),
        servicesApi.list(),
        userApi.getProfile()
      ]);
      setQuote(quoteData);
      setServices(servicesData);
      setUserProfile(userData);
      setItems(quoteData.items || []);
      
      // Load quote tax, terms, and expiration
      setTaxRate(quoteData.tax_rate || 0);
      setTermsConditions(quoteData.terms_conditions || '');
      setExpirationDate(quoteData.expiration_date || '');
      setTemplate(quoteData.template || 'standard');
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Failed to load quote data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { service_id: '', quantity: 1, unit_cost: 0, description: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'service_id') {
      const service = services.find(s => s.id === value);
      newItems[index] = {
        ...newItems[index],
        service_id: value,
        unit_cost: service ? service.unit_cost : 0,
        description: service ? service.description || service.name : ''
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = async () => {
    if (!quote || !id) return;

    // Validate items
    if (items.length === 0) {
      showAlert('Please add at least one item', 'warning');
      return;
    }

    for (const item of items) {
      if (!item.service_id) {
        showAlert('Please select a service for all items', 'warning');
        return;
      }
      if (item.quantity <= 0) {
        showAlert('Quantity must be greater than 0', 'warning');
        return;
      }
    }


    setSaving(true);
    try {
      await quotesApi.update(id, {
        client_id: quote.client_id,
        items: items.map(item => ({
          service_id: item.service_id,
          description: item.description || '',
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost)
        })),
        tax_rate: taxRate,
        terms_conditions: termsConditions,
        expiration_date: expirationDate || undefined,
        valid_until: quote.valid_until,
        template
      });
      navigate(`/clients/${quote.client_id}`);
    } catch (error) {
      console.error('Error updating quote:', error);
      showAlert('Failed to update quote', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async (subject: string, message: string) => {
    if (!id) return;
    
    try {
      await quotesApi.sendQuote(id, { subject, message });
      showAlert('Quote sent successfully!', 'success');
      setShowSendModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
      showAlert('Failed to send email', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading quote...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Quote not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to={`/clients/${quote.client_id}`} className="p-2 hover:bg-gray-200 rounded-full transition">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Edit Quote {formatQuoteNumber(quote.quote_number)}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (quote && userProfile) {
                    generateQuotePDF({
                      quote: { ...quote, items, template },
                      user: userProfile,
                      items: items
                    });
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <Send className="w-4 h-4" />
                <span>Send Quote</span>
              </button>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                quote.status === 'paid' ? 'bg-green-100 text-green-800' :
                quote.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                quote.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                {quote.status === 'partial' && quote.paid_amount !== undefined && (
                  <span className="ml-1">(${quote.paid_amount.toLocaleString()})</span>
                )}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Client Info */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Client</h2>
              <div className="text-xl font-bold text-gray-800">{quote.clients?.name}</div>
              <div className="text-gray-600">{quote.clients?.email}</div>
            </div>

            {/* Items */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Items</h2>
                <button
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <select
                      value={item.service_id}
                      onChange={(e) => handleItemChange(index, 'service_id', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} (${service.unit_cost})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unit_cost}
                      onChange={(e) => handleItemChange(index, 'unit_cost', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quote Settings */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quote Settings</h3>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Quote Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['standard', 'modern', 'minimal'].map((t) => {
                    const isPremium = t !== 'standard';
                    const isLocked = isPremium && userProfile?.subscription_tier !== 'premium';
                    
                    return (
                      <div
                        key={t}
                        onClick={() => !isLocked && setTemplate(t as any)}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition
                          ${template === t 
                            ? 'border-teal-500 bg-teal-50' 
                            : isLocked 
                              ? 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed' 
                              : 'border-gray-200 hover:border-teal-200'
                          }
                        `}
                      >
                        <div className="font-bold text-gray-800 capitalize mb-1">{t}</div>
                        <div className="text-xs text-gray-500">
                          {t === 'standard' ? 'Classic layout' : t === 'modern' ? 'Bold & colorful' : 'Clean & simple'}
                        </div>
                        {isLocked && (
                          <div className="absolute top-2 right-2 text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {userProfile?.subscription_tier !== 'premium' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Upgrade to <span className="font-bold text-teal-600">Premium</span> to unlock more templates.
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Terms & Conditions</label>
                <textarea
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="Enter terms and conditions for this quote..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-6 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-lg text-gray-700">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toLocaleString()}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between items-center text-lg text-gray-700">
                    <span>Tax ({taxRate}%):</span>
                    <span>${calculateTax().toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-2xl font-bold text-gray-800 pt-2 border-t">
                  <span>Total:</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8">
              <Link
                to={`/clients/${quote.client_id}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
        {/* Send Quote Modal */}
        <SendQuoteModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendEmail}
          defaultSubject={`Quote #${quote.quote_number} from ${userProfile?.company_name || userProfile?.full_name}`}
          defaultMessage={`Dear ${quote.clients?.name},\n\nPlease find attached the quote #${quote.quote_number}.\n\nBest regards,\n${userProfile?.full_name}`}
          clientName={quote.clients?.name || ''}
        />
      </div>
  );
}
