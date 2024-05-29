
/**
 *  storageService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { supabaseClient } from "./supabaseClient";

export type File = {
    created_at: string,
    id: string,
    name: string,
    metadata: {
        size: number,
        mimetype: string
    },
};

const BUCKET_NAME = 'info';

class StorageService {
    downloadFile = async (filepath: string): Promise<Blob | null> => {
        return supabaseClient
            .storage
            .from(BUCKET_NAME)
            .download(filepath)
            .then(resp => {
                if (resp.error) {
                    throw new Error(resp.error.message)
                }
                return resp.data
            })
    }

    // FIXME Should by FileObject, 
    listFiles = async (): Promise<any[]> => {
        return supabaseClient
            .storage
            .from(BUCKET_NAME)
            .list()
            .then(resp => {
                if (resp.error) {
                    throw new Error(resp.error.message)
                }
                return resp.data?.filter(f => f.name != '.emptyFolderPlaceholder')
            })
    }

    removeFile = async (fileName: string): Promise<any> => {
        return supabaseClient
            .storage
            .from(BUCKET_NAME)
            .remove([fileName])
            .then(resp => {
                if (resp.error) {
                    throw new Error(resp.error.message)
                }
                return resp.data
            })
    }

    uploadFile = async (file: any): Promise<any> => {
        return supabaseClient
            .storage
            .from(BUCKET_NAME)
            .upload(file.name, file)
            .then(resp => {
                if (resp.error) {
                    throw new Error(resp.error.message)
                }
                return resp.data
            })
    }

}
const storageService = new StorageService()
export { storageService }