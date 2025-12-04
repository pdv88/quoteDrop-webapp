import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Loader, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { userApi, servicesApi } from '../services/api';
import { authService } from '../services/auth';
import type { Service } from '../types';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'user' | 'services'>('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User State
  const [userInfo, setUserInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    logo_url: '',
    subscription_tier: 'free'
  });

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    unit_cost: 0,
    unit_type: 'hour'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profile, servicesList] = await Promise.all([
        userApi.getProfile(),
        servicesApi.list()
      ]);
      
      setUserInfo({
        full_name: profile.full_name || '',
        email: profile.email,
        phone: profile.phone || '',
        company_name: profile.company_name || '',
        logo_url: profile.logo_url || '',
        subscription_tier: profile.subscription_tier
      });
      
      setServices(servicesList);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await authService.logout();
      navigate('/login');
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({
        full_name: userInfo.full_name,
        phone: userInfo.phone,
        company_name: userInfo.company_name,
        logo_url: userInfo.logo_url
      });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubscription = async (tier: 'free' | 'premium') => {
    if (tier === userInfo.subscription_tier) return;
    
    if (!confirm(`Are you sure you want to switch to the ${tier} plan?`)) return;

    try {
      await userApi.updateSubscription(tier);
      setUserInfo({ ...userInfo, subscription_tier: tier });
      alert(`Subscription updated to ${tier} plan`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await servicesApi.create(newService);
      setServices([...services, created]);
      setShowServiceModal(false);
      setNewService({ name: '', description: '', unit_cost: 0, unit_type: 'hour' });
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Failed to create service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await servicesApi.delete(id);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600 flex items-center gap-2">
          <Loader className="animate-spin" /> Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden pb-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-6 py-3 font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'user'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            User Settings
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
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
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userInfo.full_name}
                    onChange={(e) => setUserInfo({ ...userInfo, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Company Name</label>
                  <input
                    type="text"
                    value={userInfo.company_name}
                    onChange={(e) => setUserInfo({ ...userInfo, company_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 font-semibold mb-2">Company Logo URL</label>
                <input
                  type="text"
                  value={userInfo.logo_url}
                  onChange={(e) => setUserInfo({ ...userInfo, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={saving}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscription Plan</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div
                  onClick={() => handleUpdateSubscription('free')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    userInfo.subscription_tier === 'free' ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
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
                  onClick={() => handleUpdateSubscription('premium')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    userInfo.subscription_tier === 'premium' ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
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
            </div>
            
            {/* Danger Zone - Mobile Only Logout */}
            <div className="sm:hidden mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Services</h2>
              <button 
                onClick={() => setShowServiceModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add Service</span>
              </button>
            </div>
            <div className="space-y-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-bold text-gray-800">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        ${service.unit_cost} per {service.unit_type}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No services added yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Service</h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Unit Cost</label>
                    <input
                      type="number"
                      value={newService.unit_cost}
                      onChange={(e) => setNewService({ ...newService, unit_cost: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Unit Type</label>
                    <select
                      value={newService.unit_type}
                      onChange={(e) => setNewService({ ...newService, unit_type: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="hour">Per Hour</option>
                      <option value="item">Per Item</option>
                      <option value="project">Per Project</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
