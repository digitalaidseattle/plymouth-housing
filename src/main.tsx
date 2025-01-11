/**
 *  main.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig'; // see authConfig.ts code bellow

import App from './App';

export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }
});

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
//    <MsalProvider instance={msalInstance}>
      <App />
//    </MsalProvider>
  </React.StrictMode>,
);
