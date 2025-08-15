import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { TrendingUp, DollarSign, Users, LogIn } from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import ChannelCard from '@/react-app/components/ChannelCard';
import { ChannelWithInvestment } from '@/shared/types';
import { useTelegram } from '@/react-app/hooks/useTelegram';

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const { isReady } = useTelegram();
  const [channels, setChannels] = useState<ChannelWithInvestment[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!seeded && isReady) {
      // Seed data on first load
      fetch('/api/seed-channels', { method: 'POST' })
        .then(() => setSeeded(true))
        .catch(console.error);
    }
  }, [isReady, seeded]);

  useEffect(() => {
    if (user && seeded) {
      loadChannels();
    }
  }, [user, seeded]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/channels', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalMarketCap = channels.reduce((sum, channel) => 
    sum + (channel.total_shares * channel.price_per_share), 0
  );
  
  const totalChannels = channels.length;
  const totalInvestors = Math.floor(Math.random() * 500) + 100; // Mock data

  if (isPending || !isReady) {
    return (
      <Layout showBottomNav={false}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout showBottomNav={false}>
        <div className="px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TeleInvest</h1>
            <p className="text-gray-400 text-lg">
              Инвестируйте в Telegram-каналы и получайте прибыль от рекламы
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">Реальный доход</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Получайте прибыль от рекламы в популярных Telegram-каналах
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Рост капитала</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Инвестируйте в растущие каналы и увеличивайте свой доход
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Сообщество</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Присоединяйтесь к сообществу умных инвесторов
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={redirectToLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            <span>Войти через Google</span>
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="TeleInvest">
      <div className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Добро пожаловать!
          </h2>
          <p className="text-gray-400">
            Выберите канал для инвестиций и начните зарабатывать
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">
              {formatCurrency(totalMarketCap)}
            </div>
            <div className="text-xs text-gray-400">Капитализация</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{totalChannels}</div>
            <div className="text-xs text-gray-400">Каналов</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{totalInvestors}</div>
            <div className="text-xs text-gray-400">Инвесторов</div>
          </div>
        </div>

        {/* Channels List */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            Доступные каналы
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
            
            {channels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Каналы загружаются...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
