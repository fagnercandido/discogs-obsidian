declare const jest: any;
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

import { DiscogsCache } from '../cache';
import { createDiscogsNote } from '../note-creator';
import { DiscogsData, DiscogsRelease } from '../types';

describe('DiscogsCache', () => {
    let mockData: DiscogsData;
    let cache: DiscogsCache;

    beforeEach(() => {
        mockData = {
            settings: {} as any,
            cache: [],
            metadata: { totalCount: 0, discsWithNotes: 0, lastSyncDuration: 0 }
        };
        cache = new DiscogsCache(mockData);
    });

    it('should identify new items correctly', () => {
        const releases: DiscogsRelease[] = [
            { id: 1, instance_id: 101, basic_information: { title: 'Album 1', artists: [{ name: 'Artist 1' }], year: 2020, formats: [], labels: [], genres: [], styles: [] }, date_added: '2024-01-01' } as any
        ];

        const result = cache.updateCache(releases);
        expect(result.newItems).toBe(1);
        expect(mockData.cache.length).toBe(1);
        expect(mockData.cache[0].isNew).toBe(true);
    });

    it('should identify existing items and preserve their state', () => {
        mockData.cache = [
            { id: 1, instance_id: 101, title: 'Album 1', artist: 'Artist 1', year: 2020, hasNote: true, notePath: 'path/to/note', isNew: false } as any
        ];

        const releases: DiscogsRelease[] = [
            { id: 1, instance_id: 101, basic_information: { title: 'Album 1', artists: [{ name: 'Artist 1' }], year: 2020, formats: [], labels: [], genres: [], styles: [] }, date_added: '2024-01-01' } as any
        ];

        const result = cache.updateCache(releases);
        expect(result.newItems).toBe(0);
        expect(mockData.cache[0].hasNote).toBe(true);
        expect(mockData.cache[0].isNew).toBe(false);
    });

    it('should calculate removed items correctly', () => {
        mockData.cache = [
            { id: 1, instance_id: 101 } as any,
            { id: 2, instance_id: 102 } as any
        ];

        const releases: DiscogsRelease[] = [
            { id: 2, instance_id: 102, basic_information: { title: 'Album 2', artists: [], year: 2020, formats: [], labels: [], genres: [], styles: [] } } as any
        ];

        const result = cache.updateCache(releases);
        expect(result.removedItems).toBe(1);
        expect(mockData.cache.length).toBe(1);
    });
});
