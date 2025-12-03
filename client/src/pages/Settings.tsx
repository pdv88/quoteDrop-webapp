import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings as SettingsIcon, LogOut, Plus, Edit, Trash2 } from 'lucide-react';

const mockServices = [
  { id: '1', name: 'Web Design', cost: 100, unit: 'hour', description: 'Custom website design' },
  { id: '2', name: 'Development', cost: 150, unit: 'hour', description: 'Full-stack development' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'user' | 'services'>('user');
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    companyName: 'My Company',
    logo: ''
  });
  const [subscription, setSubscription] = useState('free');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-6">
        <div className="text-2xl font-bold mb-10">QuoteDrop</div>
        <nav className="space-y-2">
          <NavLink to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          <NavLink to="/clients" icon={<Users />} label="Clients" />
          <NavLink to="/quotes/new" icon={<FileText />} label="New Quote" />
          <NavLink to="/settings" icon={<SettingsIcon />} label="Settings" active />
        </nav>
        <button className="absolute bottom-6 left-6 flex items-center space-x-2 text-purple-200 hover:text-white transition">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'user'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            User Settings
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Services
          </button>
        </div>

        {/* User Settings Tab */}
        {activeTab === 'user' && (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Company Name</label>
                  <input
                    type="text"
                    value={userInfo.companyName}
                    onChange={(e) => setUserInfo({ ...userInfo, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition">
                Save Changes
              </button>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscription Plan</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  onClick={() => setSubscription('free')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    subscription === 'free' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Free</h3>
                  <div className="text-3xl font-bold text-gray-800 mb-4">$0<span className="text-lg">/mo</span></div>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ 5 quotes per month</li>
                    <li>✓ Basic templates</li>
                    <li>✓ Email support</li>
                  </ul>
                </div>
                <div
                  onClick={() => setSubscription('premium')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    subscription === 'premium' ? 'border-purple-600 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Premium</h3>
                  <div className="text-3xl font-bold text-gray-800 mb-4">$2<span className="text-lg">/mo</span></div>
                  <ul className="space-y-2 text-gray-600">
                    <li>✓ Unlimited quotes</li>
                    <li>✓ Custom branding</li>
                    <li>✓ Priority support</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>
              </div>
              {subscription === 'premium' && (
                <button className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition">
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Services</h2>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition">
                <Plus className="w-5 h-5" />
                <span>Add Service</span>
              </button>
            </div>
            <div className="space-y-4">
              {mockServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-gray-800">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      ${service.cost} per {service.unit}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
