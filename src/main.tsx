import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(26,34,56,0.95)',
          color: '#f1f5f9',
          border: '1px solid rgba(139,92,246,0.3)',
          backdropFilter: 'blur(8px)',
        },
      }}
    />
  </StrictMode>,
);
