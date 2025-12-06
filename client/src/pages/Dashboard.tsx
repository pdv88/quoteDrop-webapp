import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Edit, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardApi, quotesApi } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { processChartData, type TimeRange } from '../utils/chartUtils';
import { formatQuoteNumber } from '../utils/formatters';


export default function Dashboard() {
  const { showAlert, showPrompt } = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await quotesApi.delete(quoteId);
      loadStats();
    } catch (error) {
      console.error('Error deleting quote:', error);
      showAlert('Failed to delete quote', 'error');
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: any) => {
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
      await quotesApi.updateStatus(quoteId, newStatus, paidAmount);
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const chartData = stats ? processChartData(stats.allQuotes, timeRange) : [];
  const statusData = stats ? Object.entries(stats.statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: getColorForStatus(name)
  })) : [];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            title="Quotes Sent" 
            value={stats?.totalQuotes.toString() || '0'} 
            change="Total quotes" 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Total Quoted" 
            value={`$${stats?.totalQuoted.toLocaleString() || '0'}`} 
            change="Total value" 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Total Paid" 
            value={`$${stats?.totalPaid.toLocaleString() || '0'}`} 
            change="Revenue collected" 
            color="bg-teal-500" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Revenue Over Time */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Revenue Overview</h2>
              <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
                {(['7d', '30d', '3m', '1y', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
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
            
            {chartData.length > 0 ? (
              <div className="w-full -mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
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
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="quoted" 
                      name="Quoted"
                      stroke="#14b8a6" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorQuoted)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="paid" 
                      name="Paid"
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPaid)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No data available for this period
              </div>
            )}
          </div>

          {/* Quote Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Quote Status</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Quotes</h2>
          <div className="space-y-3">
            {stats?.recentQuotes && stats.recentQuotes.length > 0 ? (
              stats.recentQuotes.map((quote: any) => (
                <ActivityItem 
                  key={quote.id}
                  quote={quote}
                  onDelete={() => handleDeleteQuote(quote.id)}
                  onStatusChange={(status) => handleStatusChange(quote.id, status)}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No recent quotes</div>
            )}
          </div>
        </div>
    </div>
  );
}

function StatCard({ title, value, change, color }: { title: string; value: string; change: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base text-gray-600 font-semibold">{title}</h3>
        <span className={`${color} w-10 h-10 sm:w-12 sm:h-12 rounded-full`}></span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">{change}</div>
    </div>
  );
}

function ActivityItem({ quote, onDelete, onStatusChange }: { quote: any; onDelete: () => void; onStatusChange: (status: any) => void }) {
  const statusColor = getColorForStatus(quote.status);
  const statusBg = getBgColorForStatus(quote.status);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
      <div className="w-full sm:w-auto">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="font-bold text-gray-800 text-sm sm:text-base">{formatQuoteNumber(quote.quote_number)}</span>
          <span className="text-gray-400">•</span>
          <span className="font-semibold text-gray-800 text-sm sm:text-base">{quote.clients?.name || 'Unknown Client'}</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 mt-1">
          ${quote.total_amount.toLocaleString()}
          {quote.status === 'partial' && quote.paid_amount !== undefined && (
            <span className="ml-2 text-green-600">(Paid: ${quote.paid_amount.toLocaleString()})</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
        <select
          value={quote.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border-none focus:ring-2 focus:ring-teal-500 cursor-pointer ${statusBg} ${statusColor}`}
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex space-x-1 sm:space-x-2">
          <button className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Send Email">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <Link 
            to={`/quotes/${quote.id}/edit`}
            className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Edit Quote"
          >
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
          <button 
            onClick={onDelete}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Quote"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getColorForStatus(status: string) {
  switch (status) {
    case 'paid': return '#10b981';
    case 'pending': return '#f59e0b';
    case 'draft': return '#6b7280';
    case 'sent': return '#3b82f6';
    case 'accepted': return '#14b8a6';
    case 'rejected': return '#ef4444';
    default: return '#6b7280';
  }
}

function getBgColorForStatus(status: string) {
  switch (status) {
    case 'paid': return 'bg-green-100';
    case 'pending': return 'bg-yellow-100';
    case 'draft': return 'bg-gray-200';
    case 'sent': return 'bg-blue-100';
    case 'accepted': return 'bg-teal-100';
    case 'rejected': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
}
