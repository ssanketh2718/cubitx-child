import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { ChildProvider } from './core/auth/ChildContext';
import App from './core/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChildProvider>
          <App />
        </ChildProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
