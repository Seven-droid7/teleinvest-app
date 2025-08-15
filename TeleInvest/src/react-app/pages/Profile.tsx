import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Award, 
  TrendingUp, 
  DollarSign, 
  LogOut,
  Star,
  Trophy,
  Target
} from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import { UserProfile } from '@/shared/types';
import { useTelegram } from '@/react-app/hooks/useTelegram';

export default function Profile() {
  const { user, logout } = useAuth();
  const { webApp } = useTelegram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      webApp?.HapticFeedback?.impactOccurred('light');
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInvestorLevelInfo = (level: number) => {
    const levels = [
      { name: 'Новичок', icon: Star, color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/20' },
      { name: 'Инвестор', icon: Award, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
      { name: 'Эксперт', icon: Trophy, color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20' },
      { name: 'Профи', icon: Target, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', borderColor: 'border-yellow-400/20' },
    ];
    
    const levelIndex = Math.min(level - 1, levels.length - 1);
    return levels[levelIndex];
  };

  if (loading || !profile) {
    return (
      <Layout title="Профиль">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  const levelInfo = getInvestorLevelInfo(profile.investor_level);
  const LevelIcon = levelInfo.icon;
  const profitability = profile.total_invested > 0 ? ((profile.total_earnings / profile.total_invested) * 100) : 0;

  return (
    <Layout title="Профиль">
      <div className="px-4 py-6">
        {/* User Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={user?.google_user_data?.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'}
                alt="Profile"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-600"
              />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${levelInfo.bgColor} ${levelInfo.borderColor} border rounded-lg flex items-center justify-center`}>
                <LevelIcon className={`w-3 h-3 ${levelInfo.color}`} />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">
                {user?.google_user_data?.name || user?.email || 'Пользователь'}
              </h1>
              <p className="text-gray-400 text-sm mb-2">
                {user?.email}
              </p>
              
              <div className={`inline-flex items-center space-x-2 px-3 py-1 ${levelInfo.bgColor} ${levelInfo.borderColor} border rounded-lg`}>
                <LevelIcon className={`w-4 h-4 ${levelInfo.color}`} />
                <span className={`text-sm font-medium ${levelInfo.color}`}>
                  {levelInfo.name} (Уровень {profile.investor_level})
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Дата регистрации:</span>
              <div className="font-medium text-white">
                {formatDate(user?.created_at || '')}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Последний вход:</span>
              <div className="font-medium text-white">
                {formatDate(user?.last_signed_in_at || '')}
              </div>
            </div>
          </div>
        </div>

        {/* Investment Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Всего инвестировано</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(profile.total_invested)}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Общий доход</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(profile.total_earnings)}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Стоимость портфеля</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(profile.portfolio_value)}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Доходность</span>
            </div>
            <div className={`text-xl font-bold ${profitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profitability >= 0 ? '+' : ''}{profitability.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-white mb-3">Прогресс инвестора</h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Уровень {profile.investor_level}</span>
            <span className="text-sm text-gray-400">Уровень {profile.investor_level + 1}</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              style={{ width: `${Math.min((profile.total_invested / (profile.investor_level * 10000)) * 100, 100)}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-gray-400">
            Инвестируйте еще {formatCurrency(Math.max(0, (profile.investor_level * 10000) - profile.total_invested))} для повышения уровня
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-gray-800/50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-white mb-3">Информация об аккаунте</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Имя:</span>
              <span className="text-white">
                {user?.google_user_data?.given_name || 'Не указано'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Фамилия:</span>
              <span className="text-white">
                {user?.google_user_data?.family_name || 'Не указано'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email подтвержден:</span>
              <span className={user?.google_user_data?.email_verified ? 'text-green-400' : 'text-red-400'}>
                {user?.google_user_data?.email_verified ? 'Да' : 'Нет'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </Layout>
  );
}
