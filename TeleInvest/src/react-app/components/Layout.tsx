import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, TrendingUp, User, ArrowLeft } from 'lucide-react';
import { useTelegram } from '@/react-app/hooks/useTelegram';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'TeleInvest', 
  showBackButton = false,
  showBottomNav = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { webApp } = useTelegram();

  const handleBack = () => {
    if (webApp?.BackButton) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold truncate flex-1 text-center">
            {title}
          </h1>
          {showBackButton && <div className="w-10" />}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => navigate('/')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Главная</span>
            </button>

            <button
              onClick={() => navigate('/portfolio')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive('/portfolio') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Портфель</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                isActive('/profile') 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Профиль</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
