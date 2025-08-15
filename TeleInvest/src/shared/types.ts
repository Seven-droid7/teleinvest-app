import z from "zod";

// Channel schemas
export const ChannelSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  avatar_url: z.string().nullable(),
  subscriber_count: z.number(),
  daily_reach: z.number(),
  cpm: z.number(),
  monthly_revenue: z.number(),
  growth_rate: z.number(),
  total_shares: z.number(),
  available_shares: z.number(),
  price_per_share: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateChannelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  avatar_url: z.string().url().optional(),
  subscriber_count: z.number().min(0),
  daily_reach: z.number().min(0),
  cpm: z.number().min(0),
  monthly_revenue: z.number().min(0),
  growth_rate: z.number(),
  total_shares: z.number().min(1),
  price_per_share: z.number().min(0),
});

// Investment schemas
export const InvestmentSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  channel_id: z.number(),
  shares_owned: z.number(),
  total_invested: z.number(),
  current_value: z.number(),
  total_earnings: z.number(),
  purchase_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateInvestmentSchema = z.object({
  channel_id: z.number(),
  shares_to_buy: z.number().min(1),
  amount: z.number().min(0.01),
});

// User profile schemas
export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  investor_level: z.number(),
  total_invested: z.number(),
  total_earnings: z.number(),
  portfolio_value: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Combined schemas for frontend
export const ChannelWithInvestmentSchema = ChannelSchema.extend({
  user_investment: InvestmentSchema.nullable(),
});

export const PortfolioItemSchema = z.object({
  investment: InvestmentSchema,
  channel: ChannelSchema,
  profit_loss: z.number(),
  profit_loss_percentage: z.number(),
});

// Types
export type Channel = z.infer<typeof ChannelSchema>;
export type CreateChannel = z.infer<typeof CreateChannelSchema>;
export type Investment = z.infer<typeof InvestmentSchema>;
export type CreateInvestment = z.infer<typeof CreateInvestmentSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ChannelWithInvestment = z.infer<typeof ChannelWithInvestmentSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

// Telegram Web App types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    chat?: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      photo_url?: string;
    };
    start_param?: string;
    auth_date: number;
    hash: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  expand: () => void;
  close: () => void;
  ready: () => void;
}
