export interface DiscogsSettings {
    username: string;
    notesFolder: string;
    itemsPerPage: 25 | 50 | 75 | 100;
    lastSync: string | null;
}

export const DEFAULT_SETTINGS: DiscogsSettings = {
    username: '',
    notesFolder: 'Discogs/Albums',
    itemsPerPage: 50,
    lastSync: null
}

export interface DiscogsRelease {
    id: number;
    instance_id: number;
    date_added: string;
    rating: number;
    basic_information: {
        id: number;
        master_id: number;
        master_url: string | null;
        resource_url: string;
        thumb: string;
        cover_image: string;
        title: string;
        year: number;
        formats: {
            name: string;
            qty: string;
            descriptions: string[];
        }[];
        labels: {
            name: string;
            catno: string;
            entity_type: string;
            entity_type_name: string;
            id: number;
            resource_url: string;
        }[];
        artists: {
            name: string;
            anv: string;
            join: string;
            role: string;
            tracks: string;
            id: number;
            resource_url: string;
        }[];
        genres: string[];
        styles: string[];
    };
    folder_id: number;
}

export interface CachedAlbum {
    id: number;
    instance_id: number;
    title: string;
    artist: string;
    year: number;
    coverUrl: string;
    thumbUrl: string;
    dateAdded: string;
    genres: string[];
    styles: string[];
    format: string;
    label: string;
    catalogNumber: string;
    hasNote: boolean;
    notePath: string | null;
    isNew: boolean;
}

export interface CollectionMetadata {
    totalCount: number;
    discsWithNotes: number;
    lastSyncDuration: number; // in milliseconds
}

export interface DiscogsData {
    settings: DiscogsSettings;
    cache: CachedAlbum[];
    metadata: CollectionMetadata;
}
