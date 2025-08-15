import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import {
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  CreateInvestmentSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("/*", cors({
  origin: (origin) => origin,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
  credentials: true,
}));

// Authentication endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Helper function to ensure user profile exists
async function ensureUserProfile(db: D1Database, userId: string) {
  const existing = await db.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(userId).first();

  if (!existing) {
    await db.prepare(`
      INSERT INTO user_profiles (user_id, investor_level, total_invested, total_earnings, portfolio_value)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, 1, 0, 0, 0).run();
  }
}

// Channels endpoints
app.get("/api/channels", authMiddleware, async (c) => {
  const user = c.get("user")!;
  
  const channels = await c.env.DB.prepare(`
    SELECT c.*, i.id as investment_id, i.shares_owned, i.total_invested, 
           i.current_value, i.total_earnings, i.purchase_date
    FROM channels c
    LEFT JOIN investments i ON c.id = i.channel_id AND i.user_id = ?
    WHERE c.is_active = 1
    ORDER BY c.subscriber_count DESC
  `).bind(user.id).all();

  const channelsWithInvestments = channels.results.map((row: any) => {
    const channel = {
      id: row.id,
      name: row.name,
      description: row.description,
      avatar_url: row.avatar_url,
      subscriber_count: row.subscriber_count,
      daily_reach: row.daily_reach,
      cpm: row.cpm,
      monthly_revenue: row.monthly_revenue,
      growth_rate: row.growth_rate,
      total_shares: row.total_shares,
      available_shares: row.available_shares,
      price_per_share: row.price_per_share,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    const investment = row.investment_id ? {
      id: row.investment_id,
      user_id: user.id,
      channel_id: row.id,
      shares_owned: row.shares_owned,
      total_invested: row.total_invested,
      current_value: row.current_value,
      total_earnings: row.total_earnings,
      purchase_date: row.purchase_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    } : null;

    return { ...channel, user_investment: investment };
  });

  return c.json(channelsWithInvestments);
});

app.get("/api/channels/:id", authMiddleware, async (c) => {
  const channelId = c.req.param("id");
  const user = c.get("user")!;

  const result = await c.env.DB.prepare(`
    SELECT c.*, i.id as investment_id, i.shares_owned, i.total_invested, 
           i.current_value, i.total_earnings, i.purchase_date
    FROM channels c
    LEFT JOIN investments i ON c.id = i.channel_id AND i.user_id = ?
    WHERE c.id = ? AND c.is_active = 1
  `).bind(user.id, channelId).first();

  if (!result) {
    return c.json({ error: "Channel not found" }, 404);
  }

  const channel = {
    id: result.id,
    name: result.name,
    description: result.description,
    avatar_url: result.avatar_url,
    subscriber_count: result.subscriber_count,
    daily_reach: result.daily_reach,
    cpm: result.cpm,
    monthly_revenue: result.monthly_revenue,
    growth_rate: result.growth_rate,
    total_shares: result.total_shares,
    available_shares: result.available_shares,
    price_per_share: result.price_per_share,
    is_active: Boolean(result.is_active),
    created_at: result.created_at,
    updated_at: result.updated_at,
  };

  const investment = result.investment_id ? {
    id: result.investment_id,
    user_id: user.id,
    channel_id: result.id,
    shares_owned: result.shares_owned,
    total_invested: result.total_invested,
    current_value: result.current_value,
    total_earnings: result.total_earnings,
    purchase_date: result.purchase_date,
    created_at: result.created_at,
    updated_at: result.updated_at,
  } : null;

  return c.json({ ...channel, user_investment: investment });
});

// Investment endpoints
app.post("/api/invest", authMiddleware, zValidator("json", CreateInvestmentSchema), async (c) => {
  const user = c.get("user")!;
  const { channel_id, shares_to_buy, amount } = c.req.valid("json");

  await ensureUserProfile(c.env.DB, user.id);

  // Get channel info
  const channel = await c.env.DB.prepare(
    "SELECT * FROM channels WHERE id = ? AND is_active = 1"
  ).bind(channel_id).first();

  if (!channel) {
    return c.json({ error: "Channel not found" }, 404);
  }

  if ((channel.available_shares as number) < shares_to_buy) {
    return c.json({ error: "Not enough shares available" }, 400);
  }

  const expectedAmount = shares_to_buy * (channel.price_per_share as number);
  if (Math.abs(amount - expectedAmount) > 0.01) {
    return c.json({ error: "Invalid amount" }, 400);
  }

  // Check if user already has investment in this channel
  const existingInvestment = await c.env.DB.prepare(
    "SELECT * FROM investments WHERE user_id = ? AND channel_id = ?"
  ).bind(user.id, channel_id).first();

  if (existingInvestment) {
    // Update existing investment
    await c.env.DB.prepare(`
      UPDATE investments 
      SET shares_owned = shares_owned + ?, 
          total_invested = total_invested + ?,
          current_value = (shares_owned + ?) * ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(shares_to_buy, amount, shares_to_buy, channel.price_per_share, existingInvestment.id).run();
  } else {
    // Create new investment
    await c.env.DB.prepare(`
      INSERT INTO investments (user_id, channel_id, shares_owned, total_invested, current_value)
      VALUES (?, ?, ?, ?, ?)
    `).bind(user.id, channel_id, shares_to_buy, amount, amount).run();
  }

  // Update channel available shares
  await c.env.DB.prepare(
    "UPDATE channels SET available_shares = available_shares - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(shares_to_buy, channel_id).run();

  // Update user profile
  await c.env.DB.prepare(`
    UPDATE user_profiles 
    SET total_invested = total_invested + ?,
        portfolio_value = portfolio_value + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(amount, amount, user.id).run();

  return c.json({ success: true });
});

// Portfolio endpoints
app.get("/api/portfolio", authMiddleware, async (c) => {
  const user = c.get("user")!;

  await ensureUserProfile(c.env.DB, user.id);

  const investments = await c.env.DB.prepare(`
    SELECT i.*, c.name, c.description, c.avatar_url, c.price_per_share,
           c.monthly_revenue, c.growth_rate
    FROM investments i
    JOIN channels c ON i.channel_id = c.id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `).bind(user.id).all();

  const portfolioItems = investments.results.map((row: any) => {
    const investment = {
      id: row.id,
      user_id: row.user_id,
      channel_id: row.channel_id,
      shares_owned: row.shares_owned,
      total_invested: row.total_invested,
      current_value: row.current_value,
      total_earnings: row.total_earnings,
      purchase_date: row.purchase_date,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    const channel = {
      id: row.channel_id,
      name: row.name,
      description: row.description,
      avatar_url: row.avatar_url,
      price_per_share: row.price_per_share,
      monthly_revenue: row.monthly_revenue,
      growth_rate: row.growth_rate,
    };

    const profit_loss = row.current_value - row.total_invested + row.total_earnings;
    const profit_loss_percentage = row.total_invested > 0 ? (profit_loss / row.total_invested) * 100 : 0;

    return {
      investment,
      channel,
      profit_loss,
      profit_loss_percentage,
    };
  });

  return c.json(portfolioItems);
});

app.get("/api/profile", authMiddleware, async (c) => {
  const user = c.get("user")!;

  await ensureUserProfile(c.env.DB, user.id);

  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  return c.json(profile);
});

// Seed data endpoint (for development)
app.post("/api/seed-channels", async (c) => {
  const channels = [
    {
      name: "Tech News Daily",
      description: "Ежедневные новости из мира технологий",
      avatar_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop&crop=face",
      subscriber_count: 125000,
      daily_reach: 85000,
      cpm: 45.0,
      monthly_revenue: 12500.0,
      growth_rate: 8.5,
      price_per_share: 125.0,
    },
    {
      name: "Crypto Analytics",
      description: "Аналитика и прогнозы криптовалют",
      avatar_url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=150&h=150&fit=crop&crop=face",
      subscriber_count: 89000,
      daily_reach: 62000,
      cpm: 38.0,
      monthly_revenue: 9800.0,
      growth_rate: 12.3,
      price_per_share: 98.0,
    },
    {
      name: "Business Insider",
      description: "Инсайды из мира бизнеса и стартапов",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      subscriber_count: 156000,
      daily_reach: 110000,
      cpm: 52.0,
      monthly_revenue: 18700.0,
      growth_rate: 6.8,
      price_per_share: 187.0,
    },
    {
      name: "Health & Wellness",
      description: "Советы по здоровью и здоровому образу жизни",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      subscriber_count: 73000,
      daily_reach: 45000,
      cpm: 28.0,
      monthly_revenue: 6300.0,
      growth_rate: 15.2,
      price_per_share: 63.0,
    },
  ];

  for (const channel of channels) {
    await c.env.DB.prepare(`
      INSERT INTO channels (name, description, avatar_url, subscriber_count, daily_reach, cpm, monthly_revenue, growth_rate, total_shares, available_shares, price_per_share)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      channel.name,
      channel.description,
      channel.avatar_url,
      channel.subscriber_count,
      channel.daily_reach,
      channel.cpm,
      channel.monthly_revenue,
      channel.growth_rate,
      100,
      100,
      channel.price_per_share
    ).run();
  }

  return c.json({ success: true, message: "Seed data created" });
});

export default app;
