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
  auth: {
    clientId: '298df75e-98a0-4fa1-bf81-cd5602f5758b', // This is the ONLY mandatory field that you need to supply.
    authority: 'https://TrialTenantmVxbixE4.ciamlogin.com/', // Replace the placeholder with your tenant subdomain
    redirectUri: 'http://localhost:3000/', // Points to window.location.origin. You must register this URI on Microsoft Entra admin center/App Registration.
    postLogoutRedirectUri: '/login',
  },
  system: {
    allowNativeBroker: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};
