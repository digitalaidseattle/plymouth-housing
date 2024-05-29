/**
 *  airtableClient.ts
 * 
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import Airtable from 'airtable';

const airtableClient = new Airtable({ apiKey: import.meta.env.VITE_AIRTABLE_ANON_KEY })

export { airtableClient };