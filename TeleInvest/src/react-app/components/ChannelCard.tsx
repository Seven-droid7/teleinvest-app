import React from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  CheckCircle 
} from 'lucide-react';
import { ChannelWithInvestment } from '@/shared/types';

interface ChannelCardProps {
  channel: ChannelWithInvestment;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const navigate = useNavigate();

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

  const expectedMonthlyReturn = channel.price_per_share * (channel.growth_rate / 100);
  const isInvested = !!channel.user_investment;

  return (
    <div
      onClick={() => navigate(`/channel/${channel.id}`)}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <img
          src={channel.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face'}
          alt={channel.name}
          className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-600"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate mb-1">
            {channel.name}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {channel.description}
          </p>
        </div>
        {isInvested && (
          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-gray-400">Подписчики</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatNumber(channel.subscriber_count)}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <BarChart3 className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-gray-400">Охват/день</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatNumber(channel.daily_reach)}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-gray-400">Рост</span>
          </div>
          <div className="text-sm font-semibold text-green-400">
            +{channel.growth_rate}%
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-2">
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-gray-400">CPM</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(channel.cpm)}
          </div>
        </div>
      </div>

      {/* Investment Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Цена за долю:</span>
          <span className="text-sm font-semibold text-white">
            {formatCurrency(channel.price_per_share)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Доступно долей:</span>
          <span className="text-sm font-semibold text-white">
            {channel.available_shares}/{channel.total_shares}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Прогноз дохода:</span>
          <span className="text-sm font-semibold text-green-400">
            {formatCurrency(expectedMonthlyReturn)}/мес
          </span>
        </div>
      </div>

      {/* Investment Status */}
      {isInvested && (
        <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">Ваших долей:</span>
            <span className="font-semibold text-green-400">
              {channel.user_investment!.shares_owned}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;
