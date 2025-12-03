import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const quotesData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 25 },
  { month: 'May', count: 22 },
  { month: 'Jun', count: 30 },
];

const statusData = [
  { name: 'Paid', value: 45, color: '#10b981' },
  { name: 'Pending', value: 30, color: '#f59e0b' },
  { name: 'Draft', value: 25, color: '#6366f1' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-6">
        <div className="text-2xl font-bold mb-10">QuoteDrop</div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" active />
          <NavLink to="/clients" icon={<Users />} label="Clients" />
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Quotes Sent" value="142" change="+12%" color="bg-blue-500" />
          <StatCard title="Total Quoted" value="$45,230" change="+8%" color="bg-green-500" />
          <StatCard title="Total Paid" value="$32,150" change="+15%" color="bg-purple-500" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quotes Over Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quotes Sent (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quotesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quote Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quote Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Quotes</h2>
          <div className="space-y-3">
            <ActivityItem client="Acme Corp" amount="$2,500" status="Paid" />
            <ActivityItem client="Tech Solutions" amount="$1,800" status="Pending" />
            <ActivityItem client="Design Studio" amount="$3,200" status="Paid" />
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

function StatCard({ title, value, change, color }: { title: string; value: string; change: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-semibold">{title}</h3>
        <span className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white`}>
          <LayoutDashboard className="w-6 h-6" />
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-green-500 text-sm font-semibold mt-2">{change} from last month</div>
    </div>
  );
}

function ActivityItem({ client, amount, status }: { client: string; amount: string; status: string }) {
  const statusColor = status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="font-semibold text-gray-800">{client}</div>
        <div className="text-sm text-gray-500">{amount}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
        {status}
      </span>
    </div>
  );
}
