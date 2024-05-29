import { AuthError, OAuthResponse, User, UserResponse } from '@supabase/supabase-js'
import { assert, describe, it, vi } from 'vitest'
import { authService } from './authService'
import { supabaseClient } from './supabaseClient'
import { beforeEach } from 'node:test'

describe('authservice tests', () => {

    beforeEach(() => {
        vi.mock('./supabaseClient', () => ({
            supabaseClient: {
                auth: {
                    getUser: vi.fn(),
                    signOut: vi.fn(),
                    signInWithOAuth: vi.fn()
                }
            }
        }))
    });

    it('getUser', async () => {
        const user = {} as User;
        const getUserSpy = vi.spyOn(supabaseClient.auth, 'getUser')
            .mockReturnValue(Promise.resolve({ data: { user: user }, error: null } as unknown as UserResponse));

        const actual = await authService.getUser()
        assert.equal(getUserSpy.mock.calls.length, 1)
        assert.equal(actual, user)
    })

    it('signOut', async () => {
        const signOutSpy = vi.spyOn(supabaseClient.auth, 'signOut')
            .mockReturnValue(Promise.resolve({ error: null }));

        await authService.signOut()
        assert.equal(signOutSpy.mock.calls.length, 1)
    })

    it('hasUser - pass', async () => {
        const data = { user: {} as User }
        const getUserSpy = vi.spyOn(supabaseClient.auth, 'getUser')
            .mockReturnValue(Promise.resolve({ data: data, error: null } as unknown as UserResponse));
        authService.hasUser()
            .then(hasUser => {
                assert.equal(getUserSpy.mock.calls.length, 1)
                assert.isTrue(hasUser)
            })
    })

    it('hasUser - fail', async () => {
        const data = { user: null }
        const getUserSpy = vi.spyOn(supabaseClient.auth, 'getUser')
            .mockReturnValue(Promise.resolve({ data: data, error: {} as AuthError } as unknown as UserResponse));
        authService.hasUser()
            .then(hasUser => {
                assert.equal(getUserSpy.mock.calls.length, 1)
                assert.isFalse(hasUser)
            })
    })

    it('signInWithGoogle - pass', async () => {
        const signInSpy = vi.spyOn(supabaseClient.auth, 'signInWithOAuth')
            .mockReturnValue(Promise.resolve({} as unknown as OAuthResponse));
        authService.signInWithGoogle()
            .then(_resp => {
                assert.equal(signInSpy.mock.calls.length, 1)
                assert.equal(signInSpy.mock.calls[0][0].provider, 'google')
            })
    })

})
