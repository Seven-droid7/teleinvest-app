import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Layout from '@/react-app/components/Layout';
import { PortfolioItem } from '@/shared/types';

export default function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      finishLoading();
    }
  };

  const finishLoading = () => {
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Layout title="Портфель">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </Layout>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.investment.current_value, 0);
  const totalInvested = portfolio.reduce((sum, item) => sum + item.investment.total_invested, 0);
  const totalEarnings = portfolio.reduce((sum, item) => sum + item.investment.total_earnings, 0);
  const totalProfitLoss = totalValue - totalInvested + totalEarnings;
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return (
    <Layout title="Мой портфель">
      <div className="px-4 py-6">
        {/* Portfolio Summary */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Общая статистика</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Стоимость портфеля</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Общий доход</div>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalProfitLoss)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
            <span className="text-sm text-gray-400">Доходность</span>
            <div className="flex items-center space-x-2">
              {totalProfitLoss >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-semibold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(totalProfitLossPercentage)}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-white">
              {formatCurrency(totalInvested)}
            </div>
            <div className="text-xs text-gray-400">Инвестировано</div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm font-bold text-white">
              {formatCurrency(totalEarnings)}
            </div>
            <div className="text-xs text-gray-400">Заработано</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white">{portfolio.length}</div>
            <div className="text-xs text-gray-400">Каналов</div>
          </div>
        </div>

        {/* Portfolio Items */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Мои инвестиции</h3>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Пока нет инвестиций
            </h3>
            <p className="text-gray-400 mb-6">
              Начните инвестировать в каналы, чтобы увидеть здесь свой портфель
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Найти каналы
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolio.map((item) => (
              <div
                key={item.investment.id}
                onClick={() => navigate(`/channel/${item.investment.channel_id}`)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={item.channel.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face'}
                    alt={item.channel.name}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-600"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {item.channel.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {item.investment.shares_owned} долей
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${item.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(item.profit_loss)}
                    </div>
                    <div className={`text-sm ${item.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(item.profit_loss_percentage)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Инвестировано:</span>
                    <div className="font-medium text-white">
                      {formatCurrency(item.investment.total_invested)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Текущая стоимость:</span>
                    <div className="font-medium text-white">
                      {formatCurrency(item.investment.current_value)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Заработано:</span>
                    <div className="font-medium text-green-400">
                      {formatCurrency(item.investment.total_earnings)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
