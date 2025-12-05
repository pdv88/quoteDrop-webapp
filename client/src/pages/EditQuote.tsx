import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { quotesApi, servicesApi, userApi } from '../services/api';
import { generateQuotePDF } from '../utils/pdfGenerator';

import type { Quote, Service } from '../types';

import { formatQuoteNumber } from '../utils/formatters';
import { ArrowLeft, Plus, Save, Trash2, FileText } from 'lucide-react';

export default function EditQuote() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [termsConditions, setTermsConditions] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

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
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load quote data');
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
      alert('Please add at least one item');
      return;
    }

    for (const item of items) {
      if (!item.service_id) {
        alert('Please select a service for all items');
        return;
      }
      if (item.quantity <= 0) {
        alert('Quantity must be greater than 0');
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
        valid_until: quote.valid_until
      });
      navigate(`/clients/${quote.client_id}`);
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Failed to update quote');
    } finally {
      setSaving(false);
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
    <main className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
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
                      quote: { ...quote, items },
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
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                quote.status === 'paid' ? 'bg-green-100 text-green-800' :
                quote.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
      </main>
  );
}
