/**
 *  loggingService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 * 
 * <ul>
 * <li>Logging service currently writes to console.</li>
 * <li>Production services could write to a remote service. Include severity as part of payload.</li>
 * <li>An enhancement would be to enable various severities.</li>
 * </ul>
 *
 */
import { User } from '@supabase/supabase-js'
import { describe, expect, it, vitest } from 'vitest'
import { loggingService } from './loggingService'

describe('loggingService tests', () => {


    it('info', async () => {
        const user = { email: 'test@test.com' } as User;
        const consoleSpy = vitest.spyOn(global.console, 'info')

        loggingService.info('message', user)
        expect(consoleSpy).toBeCalledWith('test@test.com', expect.any(Date), 'message')
    })


    it('info - no user', async () => {
        const consoleSpy = vitest.spyOn(global.console, 'info')

        loggingService.info('message')
        expect(consoleSpy).toBeCalledWith('<no user>', expect.any(Date), 'message')
    })

    it('warn', async () => {
        const user = { email: 'test@test.com' } as User;
        const consoleSpy = vitest.spyOn(global.console, 'warn')

        loggingService.warn('message', user)
        expect(consoleSpy).toBeCalledWith('test@test.com', expect.any(Date), 'message')
    })

    it('warn - no user', async () => {
        const consoleSpy = vitest.spyOn(global.console, 'warn')

        loggingService.warn('message')
        expect(consoleSpy).toBeCalledWith('<no user>', expect.any(Date), 'message')
    })

    it('error', async () => {
        const user = { email: 'test@test.com' } as User;
        const consoleSpy = vitest.spyOn(global.console, 'error')

        loggingService.error('message', user)
        expect(consoleSpy).toBeCalledWith('test@test.com', expect.any(Date), 'message')
    })


    it('error - no user', async () => {
        const consoleSpy = vitest.spyOn(global.console, 'error')

        loggingService.error('message')
        expect(consoleSpy).toBeCalledWith('<no user>', expect.any(Date), 'message')
    })


    it('disabled', async () => {

        const user = { email: 'test@test.com' } as User;
        const consoleSpy = vitest.spyOn(global.console, 'error')

        loggingService.enabled = false;
        loggingService.error('message', user)
        expect(consoleSpy).toBeCalledTimes(0)
        loggingService.enabled = true;

    })

})
