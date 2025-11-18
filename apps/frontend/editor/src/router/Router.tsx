import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
  },
});

export const Router = () => {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
};