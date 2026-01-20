import { RouteObject } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { PlayPage } from '@/pages/PlayPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const devOnlyRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/hunts',
        lazy: async () => {
          const { HuntPicker } = await import('@/pages/PreviewPage/components/HuntPicker');
          return { Component: HuntPicker };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/play/:playSlug',
        element: <PlayPage />,
      },
      {
        path: '/preview',
        lazy: async () => {
          const { PreviewPage } = await import('@/pages/PreviewPage');
          return { Component: PreviewPage };
        },
      },
      {
        path: '/play/preview',
        lazy: async () => {
          const { AuthorPreviewPage } = await import('@/pages/AuthorPreviewPage');
          return { Component: AuthorPreviewPage };
        },
      },
      ...devOnlyRoutes,
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
