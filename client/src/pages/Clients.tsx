import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { clientsApi } from '../services/api';
import type { Client } from '../types';


export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', address: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await clientsApi.create(newClient);
      setClients([created, ...clients]);
      setShowModal(false);
      setNewClient({ name: '', email: '', address: '', phone: '' });
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading clients...</div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Clients</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transform hover:scale-105 transition text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
          />
        </div>

        {/* Clients List */}
        <div className="grid gap-3 sm:gap-4">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transform hover:scale-[1.02] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">{client.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs sm:text-sm text-gray-500">Quotes</div>
                    <div className="text-lg sm:text-xl font-bold text-teal-600">
                      {(client as any).total_quotes || 0}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No clients found matching your search.' : 'No clients yet. Add your first client!'}
            </div>
          )}
      </div>
    </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add New Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24 text-sm sm:text-base"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 sm:py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
                >
                  {submitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
