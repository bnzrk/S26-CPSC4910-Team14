import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "./api/queryClient";
import { ToastProvider } from './components/Toast/ToastContext';
import ThemeProvider from './contexts/ThemeContext';
import App from './App.jsx'
import './index.scss'
import ToastHost from './components/Toast/ToastHost';
import HelpProvider from './contexts/HelpContext';

function ScrollRestore()
{
  const { pathname } = useLocation();

  useEffect(() =>
  {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ThemeProvider>
            <HelpProvider>
              <ToastHost />
              <App />
            </HelpProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
