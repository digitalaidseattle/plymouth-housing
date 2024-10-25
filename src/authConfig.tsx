/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */
// export const silentRequest = {
//     scopes: ["openid", "profile"],
//     loginHint: "example@domain.net"
// };
import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  //This is the configuration for Azure Entra ID authentication
  //The Azure App Registration must be configured with the redirectUri
  auth: {
    //see the .env.example file for explanation and examples
    clientId: import.meta.env.VITE_AUTH_CLIENT_ID, 
    authority: import.meta.env.VITE_AUTH_AUTHORITY, 
    redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI, 
    postLogoutRedirectUri: '/login',
  },
  system: {
    allowNativeBroker: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};
