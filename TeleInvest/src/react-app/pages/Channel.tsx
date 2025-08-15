import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Calendar,
  Target,
  ArrowUpRight,
  Loader2,
  CheckCircle
} from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import { ChannelWithInvestment } from '@/shared/types';
import { useTelegram } from '@/react-app/hooks/useTelegram';

export default function Channel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { webApp } = useTelegram();
  const [channel, setChannel] = useState<ChannelWithInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [shares, setShares] = useState(1);

  useEffect(() => {
    if (id && user) {
      loadChannel();
    }
  }, [id, user]);

  const loadChannel = async () => {
    try {
      const response = await fetch(`/api/channels/${id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setChannel(data);
      } else if (response.status === 404) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!channel || investing) return;

    setInvesting(true);
    
    try {
      webApp?.HapticFeedback?.impactOccurred('light');
      
      const amount = shares * channel.price_per_share;
      const response = await fetch('/api/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          channel_id: channel.id,
          shares_to_buy: shares,
          amount,
        }),
      });

      if (response.ok) {
        webApp?.HapticFeedback?.notificationOccurred('success');
        await loadChannel(); // Reload to update investment status
        setShares(1); // Reset shares input
      } else {
        const error = await response.json();
        webApp?.HapticFeedback?.notificationOccurred('error');
        alert(error.error || 'Ошибка при инвестировании');
      }
    } catch (error) {
      console.error('Investment failed:', error);
      webApp?.HapticFeedback?.notificationOccurred('error');
      alert('Произошла ошибка при инвестировании');
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Layout title="Загрузка..." showBackButton>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (!channel) {
    return (
      <Layout title="Канал не найден" showBackButton>
        <div className="text-center py-12 px-4">
          <p className="text-gray-400">Канал не найден</p>
        </div>
      </Layout>
    );
  }

  const totalInvestment = shares * channel.price_per_share;
  const expectedMonthlyReturn = totalInvestment * (channel.growth_rate / 100);
  const isInvested = !!channel.user_investment;
  const availabilityPercentage = (channel.available_shares / channel.total_shares) * 100;

  return (
    <Layout title={channel.name} showBackButton>
      <div className="px-4 py-6">
        {/* Channel Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-700/50">
          <div className="flex items-start space-x-4 mb-4">
            <img
              src={channel.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'}
              alt={channel.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-600"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-2">
                {channel.name}
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                {channel.description}
              </p>
              {isInvested && (
                <div className="inline-flex items-center space-x-2 mt-3 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    Инвестировано: {channel.user_investment!.shares_owned} долей
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Подписчики</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(channel.subscriber_count)}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Охват/день</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatNumber(channel.daily_reach)}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Рост</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              +{channel.growth_rate}%
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">CPM</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(channel.cpm)}
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Финансовые показатели</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-400">Месячный доход:</span>
              <div className="text-lg font-bold text-white">
                {formatCurrency(channel.monthly_revenue)}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Цена за долю:</span>
              <div className="text-lg font-bold text-white">
                {formatCurrency(channel.price_per_share)}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Всего долей:</span>
              <div className="text-lg font-bold text-white">
                {channel.total_shares}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Доступно:</span>
              <div className="text-lg font-bold text-white">
                {channel.available_shares}
              </div>
            </div>
          </div>

          {/* Availability Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Доступность долей</span>
              <span className="text-sm text-gray-400">{availabilityPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                style={{ width: `${availabilityPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Investment Section */}
        {channel.available_shares > 0 ? (
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Инвестирование</span>
            </h3>

            <div className="space-y-4">
              {/* Shares Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Количество долей (макс: {channel.available_shares})
                </label>
                <input
                  type="number"
                  min="1"
                  max={channel.available_shares}
                  value={shares}
                  onChange={(e) => setShares(Math.min(parseInt(e.target.value) || 1, channel.available_shares))}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Investment Summary */}
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Сумма инвестиций:</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(totalInvestment)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Прогноз дохода/мес:</span>
                  <span className="font-semibold text-green-400">
                    {formatCurrency(expectedMonthlyReturn)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Годовая доходность:</span>
                  <span className="font-semibold text-green-400">
                    +{(channel.growth_rate * 12).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Invest Button */}
              <button
                onClick={handleInvest}
                disabled={investing || shares <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {investing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Инвестирование...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5" />
                    <span>Инвестировать {formatCurrency(totalInvestment)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Доли недоступны
            </h3>
            <p className="text-gray-400">
              Все доли в этом канале уже проданы. Следите за новыми возможностями!
            </p>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Исторические показатели</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Средний рост аудитории:</span>
                <span className="text-green-400 font-semibold">+{channel.growth_rate}% в месяц</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Эффективность рекламы:</span>
                <span className="text-blue-400 font-semibold">Высокая</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Стабильность дохода:</span>
                <span className="text-purple-400 font-semibold">Стабильная</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
