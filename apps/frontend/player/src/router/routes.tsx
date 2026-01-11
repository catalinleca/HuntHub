import { RouteObject } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { PlayPage } from '@/pages/PlayPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/play/:huntId',
        element: <PlayPage />,
      },
      {
        path: '/preview',
        element: <PreviewPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
