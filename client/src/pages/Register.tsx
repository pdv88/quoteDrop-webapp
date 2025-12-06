import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';
import { useAlert } from '../context/AlertContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Register user
      const result = await authService.register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      // Check if email confirmation is required
      if (result.user && !result.user.email) {
        // Email confirmation required
        showAlert('Registration successful! Please check your email to confirm your account before logging in.', 'success');
        navigate('/login');
        return;
      }

      // Try to auto-login after registration
      try {
        await authService.login(formData.email, formData.password);
        navigate('/dashboard');
      } catch (loginErr: any) {
        // If login fails due to unconfirmed email, show message
        if (loginErr.message.includes('Email not confirmed') || loginErr.message.includes('Invalid')) {
          showAlert('Registration successful! Please check your email to confirm your account, then login.', 'success');
          navigate('/login');
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login');
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Create your account</h2>
          </div>


          {/* Register Form */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-teal-400" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-teal-500/20 transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
