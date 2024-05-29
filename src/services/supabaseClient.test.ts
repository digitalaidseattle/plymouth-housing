import { assert, describe, it } from 'vitest'
import { supabaseClient } from './supabaseClient'

describe('supabase tests', () => {

    it('create', () => {
        assert.isNotNull(supabaseClient)
    })

})
