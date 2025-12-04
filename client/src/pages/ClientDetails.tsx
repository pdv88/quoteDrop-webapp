import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Send, Edit, Trash2, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { clientsApi, quotesApi } from '../services/api';
import { formatCurrency, formatDate, formatQuoteNumber } from '../utils/formatters';
import type { ClientWithStats, Quote } from '../types';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<ClientWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    try {
      if (!id) return;
      const clientData = await clientsApi.get(id);
      setClient(clientData);
      
      // If clientData.quotes is available, use it, otherwise fetch quotes
      if (clientData.quotes) {
        setQuotes(clientData.quotes);
      } else {
        // Fallback if quotes are not included in client response
        const allQuotes = await quotesApi.list();
        setQuotes(allQuotes.filter(q => q.client_id === id));
      }
    } catch (error) {
      console.error('Error loading client:', error);
      alert('Failed to load client data');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await quotesApi.delete(quoteId);
      setQuotes(quotes.filter(q => q.id !== quoteId));
      // Reload client stats
      if (id) {
        const updatedClient = await clientsApi.get(id);
        setClient(updatedClient);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Failed to delete quote');
    }
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      const updatedQuote = await quotesApi.updateStatus(quoteId, newStatus);
      setQuotes(quotes.map(q => q.id === quoteId ? updatedQuote : q));
      // Reload client stats
      if (id) {
        const updatedClient = await clientsApi.get(id);
        setClient(updatedClient);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading client data...</div>
      </div>
    );
  }

  if (!client) return null;

  // Prepare chart data from quotes
  // Group by month
  const chartDataMap = new Map<string, { month: string; quoted: number; paid: number }>();
  
  quotes.forEach(quote => {
    const date = new Date(quote.created_at);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    
    if (!chartDataMap.has(monthKey)) {
      chartDataMap.set(monthKey, { month: monthKey, quoted: 0, paid: 0 });
    }
    
    const data = chartDataMap.get(monthKey)!;
    data.quoted += quote.total_amount;
    if (quote.status === 'paid') {
      data.paid += quote.total_amount;
    }
  });

  const chartData = Array.from(chartDataMap.values());

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <Link to="/clients" className="text-purple-600 hover:text-purple-800 mb-4 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>

        {/* Client Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {client.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
                {client.address && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {client.address}
                  </p>
                )}
              </div>
            </div>
            <Link 
              to={`/clients/${client.id}/edit`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Client
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Quotes" value={client.stats.total_quotes.toString()} />
          <StatCard title="Total Quoted" value={formatCurrency(client.stats.total_quoted)} />
          <StatCard title="Total Paid" value={formatCurrency(client.stats.total_paid)} />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Overview</h2>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="quoted" fill="#8b5cf6" name="Quoted" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Quotes List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quotes</h2>
            <Link 
              to="/quotes/new" 
              className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              + New Quote
            </Link>
          </div>
          
          <div className="space-y-3">
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{formatQuoteNumber(quote.quote_number)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        quote.status === 'paid' ? 'bg-green-100 text-green-700' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        quote.status === 'accepted' ? 'bg-purple-100 text-purple-700' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{formatDate(quote.created_at)}</p>
                    <p className="font-bold text-gray-800 mt-1 sm:hidden">{formatCurrency(quote.total_amount)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <span className="font-bold text-gray-800 hidden sm:block">{formatCurrency(quote.total_amount)}</span>
                    
                    <div className="flex items-center gap-2">
                      {quote.status === 'draft' && (
                        <button 
                          onClick={() => handleUpdateStatus(quote.id, 'sent')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Mark as Sent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      
                      <Link 
                        to={`/quotes/${quote.id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      
                      <button 
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No quotes found for this client.</div>
            )}
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-gray-600 font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
