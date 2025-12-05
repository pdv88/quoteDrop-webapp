import { useEffect, memo } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, UserCircle } from 'lucide-react';
import { authService } from '../services/auth';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 hidden sm:block">
              QuoteDrop
            </span>
          </Link>
          
          <Link 
            to="/settings"
            className={`p-2 rounded-full transition ${
              isActive('/settings') 
                ? 'bg-teal-50 text-teal-600' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <UserCircle className="w-8 h-8" />
          </Link>
        </div>
      </header>

      {/* Main Content with top padding for header and bottom padding for nav */}
      <main className="w-full max-w-[1800px] mx-auto pt-16 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
        <div className="w-full px-2 sm:px-4 pb-2 sm:pb-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 max-w-md mx-auto">
            <div className="flex items-center justify-around py-2 sm:py-3 px-1 sm:px-2">
              <NavItem
                to="/dashboard"
                icon={<LayoutDashboard className="w-6 h-6" />}
                label="Dashboard"
                active={isActive('/dashboard')}
              />
              <NavItem
                to="/clients"
                icon={<Users className="w-6 h-6" />}
                label="Clients"
                active={isActive('/clients')}
              />
              <NavItem
                to="/quotes/new"
                icon={<FileText className="w-6 h-6" />}
                label="New Quote"
                active={isActive('/quotes/new')}
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

const NavItem = memo(function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition min-w-[80px] ${
        active
          ? 'text-teal-600 bg-teal-50'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </Link>
  );
});
