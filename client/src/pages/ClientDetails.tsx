import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Send, Edit, Trash2, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { clientsApi, quotesApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { formatCurrency, formatDate, formatQuoteNumber } from '../utils/formatters';
import { processChartData, type TimeRange } from '../utils/chartUtils';
import type { ClientWithStats, Quote } from '../types';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert, showPrompt } = useAlert();
  
  const [client, setClient] = useState<ClientWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

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
      showAlert('Failed to load client data', 'error');
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
      showAlert('Failed to delete quote', 'error');
    }
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    let paidAmount: number | undefined;

    if (newStatus === 'partial') {
      const amountStr = await showPrompt('Enter the amount paid so far:', '', 'Partial Payment');
      if (amountStr === null) return;
      
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount < 0) {
        showAlert('Please enter a valid amount', 'warning');
        return;
      }
      paidAmount = amount;
    }

    try {
      const updatedQuote = await quotesApi.updateStatus(quoteId, newStatus as any, paidAmount);
      setQuotes(quotes.map(q => q.id === quoteId ? updatedQuote : q));
      // Reload client stats
      if (id) {
        const updatedClient = await clientsApi.get(id);
        setClient(updatedClient);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Failed to update status', 'error');
    }
  };

  const handleSendEmail = async (quoteId: string) => {
    if (!confirm('Send this quote via email?')) return;

    try {
      const response = await quotesApi.sendQuote(quoteId);
      showAlert('Email sent successfully!', 'success');
      
      if (response.previewUrl) {
        window.open(response.previewUrl, '_blank');
      }

      // Reload client data to update status
      if (id) {
        const updatedClient = await clientsApi.get(id);
        setClient(updatedClient);
        
        // Update local quotes state if needed
        if (updatedClient.quotes) {
          setQuotes(updatedClient.quotes);
        } else {
           // If quotes aren't in client response, we might need to fetch them or just update the single quote in the list
           // But for simplicity, let's just re-fetch all quotes for this client if needed
           // Or simpler: just update the local state for this quote to 'sent'
           setQuotes(prevQuotes => prevQuotes.map(q => q.id === quoteId ? { ...q, status: 'sent' } : q));
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showAlert('Failed to send email', 'error');
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

  const chartData = processChartData(quotes, timeRange);

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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
              <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
                {(['7d', '30d', '3m', '1y', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                      timeRange === range
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range === 'all' ? 'All' : range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), undefined]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="quoted" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorQuoted)" 
                      name="Quoted" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="paid" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPaid)" 
                      name="Paid" 
                    />
                  </AreaChart>
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
                    <p className="font-bold text-gray-800 mt-1 sm:hidden">
                      {formatCurrency(quote.total_amount)}
                      {quote.status === 'partial' && quote.paid_amount !== undefined && (
                        <span className="ml-2 text-green-600 font-normal">(Paid: {formatCurrency(quote.paid_amount)})</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="hidden sm:block">
                      <span className="font-bold text-gray-800">{formatCurrency(quote.total_amount)}</span>
                      {quote.status === 'partial' && quote.paid_amount !== undefined && (
                        <span className="ml-2 text-green-600">(Paid: {formatCurrency(quote.paid_amount)})</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={quote.status}
                        onChange={(e) => handleUpdateStatus(quote.id, e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer bg-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <button 
                        onClick={() => handleSendEmail(quote.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Send Email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      
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
