import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './routes/RequireAuth';
import { PublicOnly } from './routes/PublicOnly';
import LoginPage from './pages/LoginPage';
import Layout from './layouts/Layout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CCTVPage from './pages/CCTVPage';
import ParkingPage from './pages/ParkingPage';
import IntercomPage from './pages/IntercomPage';
import LogsPage from './pages/LogsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: '/login',
        element: (
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        ),
      },
      {
        element: (
          <RequireAuth>
            <Layout />
          </RequireAuth>
        ),
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/cctv', element: <CCTVPage /> },
          { path: '/parking', element: <ParkingPage /> },
          // { path: '/gate-control', element: <GateControlPage /> },
          { path: '/intercom', element: <IntercomPage /> },
          { path: '/logs', element: <LogsPage /> },
          // { path: '/settings', element: <SettingsPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
