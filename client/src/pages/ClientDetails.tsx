import { useParams, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Mail, Send, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockQuotes = [
  { id: '1', number: 'Q-001', total: 2500, status: 'Paid', date: '2025-11-15' },
  { id: '2', number: 'Q-002', total: 1800, status: 'Pending', date: '2025-11-20' },
  { id: '3', number: 'Q-003', total: 3200, status: 'Paid', date: '2025-11-25' },
];

const chartData = [
  { month: 'Jan', quoted: 4500, paid: 3200 },
  { month: 'Feb', quoted: 5200, paid: 4100 },
  { month: 'Mar', quoted: 6100, paid: 5500 },
];

export default function ClientDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-6">
        <div className="text-2xl font-bold mb-10">QuoteDrop</div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          <NavLink to="/clients" icon={<Users />} label="Clients" active />
          <NavLink to="/quotes/new" icon={<FileText />} label="New Quote" />
          <NavLink to="/settings" icon={<Settings />} label="Settings" />
        </nav>
        <button className="absolute bottom-6 left-6 flex items-center space-x-2 text-purple-200 hover:text-white transition">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Link to="/clients" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
          ← Back to Clients
        </Link>

        {/* Client Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                A
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Acme Corp</h1>
                <p className="text-gray-600 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@acme.com</span>
                </p>
                <p className="text-gray-500 text-sm">123 Main St</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Invoices Sent" value="12" />
          <StatCard title="Total Quoted" value="$15,500" />
          <StatCard title="Total Paid" value="$9,900" />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quoted" fill="#8b5cf6" name="Quoted" radius={[8, 8, 0, 0]} />
              <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quotes List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quotes</h2>
          <div className="space-y-3">
            {mockQuotes.map((quote) => (
              <QuoteItem key={quote.id} quote={quote} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        active ? 'bg-white/20 text-white' : 'text-purple-200 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-gray-600 font-semibold mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function QuoteItem({ quote }: { quote: any }) {
  const statusColor = quote.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="font-semibold text-gray-800">{quote.number}</div>
        <div className="text-sm text-gray-500">{quote.date}</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-lg font-bold text-gray-800">${quote.total.toLocaleString()}</div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
          {quote.status}
        </span>
        <div className="flex space-x-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
            <Send className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
