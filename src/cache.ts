import { CachedAlbum, DiscogsRelease, DiscogsData, DiscogsSettings } from './types';

export class DiscogsCache {
    data: DiscogsData;

    constructor(data: DiscogsData) {
        this.data = data;
    }

    updateCache(releases: DiscogsRelease[]): { newItems: number, removedItems: number } {
        const oldCacheMap = new Map(this.data.cache.map(item => [item.instance_id, item]));
        const newCache: CachedAlbum[] = [];
        let newItemsCount = 0;

        releases.forEach(release => {
            const existing = oldCacheMap.get(release.instance_id);
            const isNew = !existing; // If not in old cache, it's new

            if (isNew) {
                newItemsCount++;
            }

            const cachedItem: CachedAlbum = {
                id: release.id,
                instance_id: release.instance_id,
                title: release.basic_information.title,
                artist: release.basic_information.artists.map(a => a.name).join(', '),
                year: release.basic_information.year,
                coverUrl: release.basic_information.cover_image,
                thumbUrl: release.basic_information.thumb,
                dateAdded: release.date_added,
                genres: release.basic_information.genres,
                styles: release.basic_information.styles,
                format: release.basic_information.formats?.[0]?.name || 'Unknown',
                label: release.basic_information.labels?.[0]?.name || 'Unknown',
                catalogNumber: release.basic_information.labels?.[0]?.catno || '',
                hasNote: existing ? existing.hasNote : false,
                notePath: existing ? existing.notePath : null,
                isNew: isNew
            };
            newCache.push(cachedItem);
        });

        const removedItemsCount = this.data.cache.length - (newCache.length - newItemsCount);

        this.data.cache = newCache;
        this.data.metadata.totalCount = newCache.length;
        this.data.metadata.discsWithNotes = newCache.filter(i => i.hasNote).length;

        return { newItems: newItemsCount, removedItems: removedItemsCount };
    }

    getNewItems(days = 30): CachedAlbum[] {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        return this.data.cache.filter(item => {
            const added = new Date(item.dateAdded);
            return added >= threshold;
        });
    }

    getStats() {
        return this.data.metadata;
    }
}
