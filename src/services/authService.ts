/**
 *  authService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import {
  // AuthError,
  OAuthResponse,
  User,
  //  UserResponse,
} from '@supabase/supabase-js';
import { supabaseClient } from './supabaseClient';

class AuthService {
  signOut = async (): Promise<void> => {};

  hasUser = async (): Promise<void> => {};

  getUser = async (): Promise<User | null> => {
    return null; //TODO return user from azure
    // return supabaseClient.auth
    //   .getUser()
    //   .then((response: UserResponse) => response.data.user);
  };

  signInWithGoogle = async (): Promise<OAuthResponse> => {
    return supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  signInWithAzure = async (): Promise<OAuthResponse> => {
    return supabaseClient.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        redirectTo: window.location.origin,
      },
    });
  };
}

const authService = new AuthService();
export { authService };
