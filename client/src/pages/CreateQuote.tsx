import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2 } from 'lucide-react';

import { clientsApi, servicesApi, quotesApi, userApi } from '../services/api';
import { generateQuotePDF } from '../utils/pdfGenerator';

import type { Client, Service } from '../types';


export default function CreateQuote() {
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [termsConditions, setTermsConditions] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, servicesData, userProfile] = await Promise.all([
        clientsApi.list(),
        servicesApi.list(),
        userApi.getProfile()
      ]);
      setClients(clientsData);
      setServices(servicesData);
      setUserProfile(userProfile);
      
      // Set default tax rate and terms from user profile
      setTaxRate(userProfile.tax_rate || 0);
      setTermsConditions(userProfile.terms_conditions || '');
      
      // Set default expiration date to 30 days from now
      const defaultExpiration = new Date();
      defaultExpiration.setDate(defaultExpiration.getDate() + 30);
      setExpirationDate(defaultExpiration.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { service_id: '', description: '', quantity: 1, unitCost: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      alert('Please select a client');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const quoteData = {
        client_id: selectedClient,
        items: items.map(item => ({
          service_id: item.service_id || undefined,
          description: item.description,
          quantity: item.quantity,
          unit_cost: item.unitCost
        })),
        tax_rate: taxRate,
        terms_conditions: termsConditions,
        expiration_date: expirationDate,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await quotesApi.create(quoteData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
    } finally {
      setSubmitting(false);
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading data...</div>
      </div>
    );
  }

  return (
    <>
    <main className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create Quote</h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Client Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Services</h2>
              <button
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <label className="block text-gray-700 font-semibold mb-2">Service</label>
                    <select
                      value={item.service_id}
                      onChange={(e) => {
                        const service = services.find((s) => s.id === e.target.value);
                        updateItem(index, 'service_id', e.target.value);
                        if (service) {
                          updateItem(index, 'description', service.name);
                          updateItem(index, 'unitCost', service.unit_cost);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select...</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-gray-700 font-semibold mb-2">Unit Cost</label>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => removeItem(index)}
                      className="w-full py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between items-center text-lg text-gray-700">
                  <span>Tax ({taxRate}%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-2xl font-bold text-gray-800 pt-2 border-t">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition"
            >
              <Eye className="w-5 h-5" />
              <span>Preview PDF</span>
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transform hover:scale-105 transition disabled:opacity-50 disabled:transform-none"
            >
              {submitting ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quote Preview</h2>
            <div className="border rounded-lg p-6 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-[#0b1120]">QuoteDrop</h3>
                <p className="text-gray-600">Professional Quote</p>
              </div>
              <div className="mb-6">
                <p className="text-gray-600">Client: <span className="font-semibold">{clients.find((c) => c.id === selectedClient)?.name}</span></p>
              </div>
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">${item.unitCost}</td>
                      <td className="text-right">${(item.quantity * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right text-2xl font-bold">
                <div className="text-lg font-normal text-gray-600">Subtotal: ${calculateSubtotal().toLocaleString()}</div>
                {taxRate > 0 && <div className="text-lg font-normal text-gray-600">Tax ({taxRate}%): ${calculateTax().toLocaleString()}</div>}
                <div className="mt-2 pt-2 border-t">Total: ${calculateTotal().toLocaleString()}</div>
              </div>
              
              {(termsConditions || expirationDate) && (
                <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                  {expirationDate && <p className="mb-2"><strong>Expires:</strong> {expirationDate}</p>}
                  {termsConditions && (
                    <div>
                      <strong>Terms & Conditions:</strong>
                      <p className="whitespace-pre-wrap mt-1">{termsConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (userProfile && selectedClient) {
                    const client = clients.find(c => c.id === selectedClient);
                    generateQuotePDF({
                      quote: {
                        quote_number: 'DRAFT',
                        created_at: new Date().toISOString(),
                        expiration_date: expirationDate,
                        tax_rate: taxRate,
                        terms_conditions: termsConditions,
                        clients: client
                      } as any,
                      user: userProfile,
                      items: items.map(item => ({
                        ...item,
                        unit_cost: item.unitCost
                      }))
                    });
                  }
                }}
                className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


