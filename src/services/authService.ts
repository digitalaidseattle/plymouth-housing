/**
 *  authService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { AuthError, OAuthResponse, User, UserResponse } from '@supabase/supabase-js'
import { supabaseClient } from './supabaseClient'

class AuthService {

  signOut = async (): Promise<{ error: AuthError | null }> => {
    return supabaseClient.auth.signOut()
  }

  hasUser = async (): Promise<boolean> => {
    return this.getUser().
      then(user => user != null)
  }

  getUser = async (): Promise<User | null> => {
    return supabaseClient.auth.getUser()
      .then((response: UserResponse) => response.data.user)
  }

  signInWithGoogle = async (): Promise<OAuthResponse> => {
    return supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  signInWithAzure = async (): Promise<OAuthResponse> => {
    return supabaseClient.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email',
        redirectTo: window.location.origin,
      },
    })
  }
}

const authService = new AuthService()
export { authService }
