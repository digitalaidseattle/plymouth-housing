import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storageService } from './storageService';
import { supabaseClient } from './supabaseClient';

describe('storageService tests', () => {

    beforeEach(() => {
        vi.mock('./supabaseClient', () => ({
            supabaseClient: {
                storage: {
                    from: vi.fn()
                }
            }
        }))
    });

    it('downloadFile', async () => {
        const mockStorageApi = {
            download: vi.fn()
        };

        const blob = {};
        const fromSpy = vi.spyOn(supabaseClient.storage, 'from')
            .mockReturnValue(mockStorageApi as any)
        const downloadSpy = vi.spyOn(mockStorageApi, 'download')
            .mockReturnValue(Promise.resolve({ data: blob, error: null }) as any)

        const actual = await storageService.downloadFile('file')
        expect(fromSpy).toHaveBeenCalledWith('info');
        expect(downloadSpy).toHaveBeenCalledWith('file');
        expect(actual).toEqual(blob);
    })

    it('downloadFile - error', async () => {
        const mockStorageApi = {
            download: vi.fn()
        };

        const blob = {};
        const fromSpy = vi.spyOn(supabaseClient.storage, 'from')
            .mockReturnValue(mockStorageApi as any)
        const downloadSpy = vi.spyOn(mockStorageApi, 'download')
            .mockReturnValue(Promise.resolve({ data: blob, error: { resp: { message: 'boom' } } }) as any)

        try {
            await storageService.downloadFile('file')
        } catch (actual) {
            expect(fromSpy).toHaveBeenCalledWith('info');
            expect(downloadSpy).toHaveBeenCalledWith('file');
        }
    })

    it('removeFile', async () => {
        const mockStorageApi = {
            remove: vi.fn()
        };

        const data = {};
        const fromSpy = vi.spyOn(supabaseClient.storage, 'from')
            .mockReturnValue(mockStorageApi as any)
        const removeSpy = vi.spyOn(mockStorageApi, 'remove')
            .mockReturnValue(Promise.resolve({ data: data, error: null }) as any)

        const actual = await storageService.removeFile('fileName')
        expect(fromSpy).toHaveBeenCalledWith('info');
        expect(removeSpy).toHaveBeenCalledWith(['fileName']);
        expect(actual).toEqual(data);
    })

    it('uploadFile', async () => {
        const mockStorageApi = {
            upload: vi.fn()
        };

        const data = {};
        const fromSpy = vi.spyOn(supabaseClient.storage, 'from')
            .mockReturnValue(mockStorageApi as any)
        const uploadSpy = vi.spyOn(mockStorageApi, 'upload')
            .mockReturnValue(Promise.resolve({ data: data, error: null }) as any)

        const actual = await storageService.uploadFile(File)
        expect(fromSpy).toHaveBeenCalledWith('info');
        expect(uploadSpy).toHaveBeenCalledWith(File.name , File);
        expect(actual).toEqual(data);
    })

    it('listFiles', async () => {
        const mockStorageApi = {
            list: vi.fn()
        };

        const data = [{}];
        const fromSpy = vi.spyOn(supabaseClient.storage, 'from')
            .mockReturnValue(mockStorageApi as any)
        const listFilesSpy = vi.spyOn(mockStorageApi, 'list')
            .mockReturnValue(Promise.resolve({ data: data, error: null }) as any)

        const actual = await storageService.listFiles()
        expect(fromSpy).toHaveBeenCalledWith('info');
        expect(listFilesSpy).toHaveBeenCalled();
        expect(actual).toEqual(data);
    })


})
