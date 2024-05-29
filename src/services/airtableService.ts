import Airtable, { FieldSet, Records } from 'airtable';
import { airtableClient } from './airtableClient';

class AirtableService {

    async getTableRecords(
        tableId: string,
        maxRecords?: number,
        filterByFormula?: string
    ): Promise<Records<FieldSet>> {
        const base: Airtable.Base = airtableClient.base(import.meta.env.VITE_AIRTABLE_BASE_ID_DAS);
        const table = base(tableId);
        try {
            const records = await table
                .select({
                    maxRecords: maxRecords || 100, // default max records is 100, more than that and we will need to start using pagination
                    filterByFormula: filterByFormula || '',
                })
                .all()
            return records
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

const airtableService = new AirtableService();

export { airtableService } 