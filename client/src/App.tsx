import { useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router';
import { setUnauthorizedHandler } from './api/client';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useTradesSocket } from './hooks/useTradesSocket';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NewsPage from './pages/NewsPage';

function Layout() {
  useTradesSocket();
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <Header />
      <Outlet />
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => navigate('/login', { replace: true }));
    return () => setUnauthorizedHandler(() => {});
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="news" element={<NewsPage />} />
      </Route>
    </Routes>
  );
}
