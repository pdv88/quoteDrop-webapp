// Login page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center text-[#0b1120] text-xl font-bold">Q</div>
            <span>QuoteDrop</span>
          </Link>
          <p className="text-gray-400 mt-2">Welcome back!</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-teal-400" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-teal-400 hover:text-teal-300 text-sm transition">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-400 font-semibold hover:text-teal-300 transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
