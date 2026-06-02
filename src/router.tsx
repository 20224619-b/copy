import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ListadoPage } from '@/features/ejercicios/ListadoPage';
import { ResolverPage } from '@/features/resolver/ResolverPage';
import { ModulosListPage } from '@/features/modulos/ModulosListPage';
import { ModuloDetailPage } from '@/features/modulos/ModuloDetailPage';
import { InventarioPage } from '@/features/inventario/InventarioPage';
import { RankingPage } from '@/features/ranking/RankingPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/ejercicios', element: <ListadoPage /> },
      { path: '/ejercicios/:id', element: <ResolverPage /> },
      { path: '/modulos', element: <ModulosListPage /> },
      { path: '/modulos/:id', element: <ModuloDetailPage /> },
      { path: '/inventario', element: <InventarioPage /> },
      { path: '/ranking', element: <RankingPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
