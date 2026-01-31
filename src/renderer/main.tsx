import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssVarsProvider } from '@mui/joy/styles';
import theme from './theme';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssVarsProvider theme={theme} defaultMode="dark">
      <App />
    </CssVarsProvider>
  </StrictMode>
);
