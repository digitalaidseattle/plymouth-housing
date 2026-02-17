/**
 *  main.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeAppInsights } from './utils/appInsights';

initializeAppInsights();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
