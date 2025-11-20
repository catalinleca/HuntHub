import { RouteObject, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { RootLayout } from './RootLayout';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
];