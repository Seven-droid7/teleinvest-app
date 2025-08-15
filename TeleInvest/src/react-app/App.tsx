import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import ChannelPage from "@/react-app/pages/Channel";
import PortfolioPage from "@/react-app/pages/Portfolio";
import ProfilePage from "@/react-app/pages/Profile";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import { TelegramProvider } from "@/react-app/hooks/useTelegram";

export default function App() {
  return (
    <TelegramProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/channel/:id" element={<ChannelPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </TelegramProvider>
  );
}
