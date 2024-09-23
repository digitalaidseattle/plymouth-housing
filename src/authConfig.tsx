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
    clientId: 'e636ccf0-bb03-4202-a0a7-e31790bf4392', // This is the ONLY mandatory field that you need to supply.
    authority: 'https://TrialTenantx6Z3SCax123.ciamlogin.com/', // Replace the placeholder with your tenant subdomain
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
